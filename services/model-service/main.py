from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
import joblib
from datetime import datetime
import os

# Initialize FastAPI app
app = FastAPI(title="FarmQ Yield Prediction API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained model
class PredictionModel:
    def __init__(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'app', 'models', 'final_model.joblib')
            if not os.path.exists(model_path):
                # Try alternative path
                model_path = os.path.join(os.path.dirname(__file__), 'final_model.joblib')
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                print(f"Model loaded successfully from {model_path}")
            else:
                raise FileNotFoundError(f"Model not found at {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
        
    def predict(self, features: np.ndarray) -> float:
        """
        Make prediction using the loaded model
        features should be array of [crop_encoded, ndvi, rainfall, soil_pH, temperature]
        """
        try:
            prediction = self.model.predict(features)[0]
            return float(prediction)
        except Exception as e:
            print(f"Error making prediction: {e}")
            raise

model = PredictionModel()

# Pydantic model for request
class ModelInput(BaseModel):
    crop_encoded: int  # 0-45 (mapped crop)
    ndvi: float  # 0-1 scale
    rainfall: float  # mm
    soil_ph: float  # pH value
    temperature: float  # °C

# Pydantic model for response
class ModelOutput(BaseModel):
    predicted_yield: float
    outcome_quality: float
    timestamp: str

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Prediction endpoint
@app.post("/predict", response_model=ModelOutput)
async def predict_yield(input_data: ModelInput):
    try:
        # Validate input ranges
        if not (0 <= input_data.crop_encoded <= 45):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Crop encoded must be between 0 and 45"
            )
        
        if not (0 <= input_data.ndvi <= 1):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="NDVI must be between 0 and 1"
            )
        
        if not (3 <= input_data.soil_ph <= 10):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Soil pH must be between 3 and 10"
            )
        
        # Prepare features for the model in the correct order
        # [crop_encoded, ndvi, rainfall, soil_pH, temperature]
        features = np.array([[
            input_data.crop_encoded,
            input_data.ndvi,
            input_data.rainfall,
            input_data.soil_ph,
            input_data.temperature
        ]])
        
        # Get prediction
        predicted_yield = model.predict(features)
        
        # Calculate outcome quality (0-1 scale, based on how favorable conditions are)
        # This reflects how good the growing conditions are, not model confidence
        outcome_quality = 0.5
        
        # Adjust outcome quality based on optimal ranges
        if 6.0 <= input_data.soil_ph <= 7.5:
            outcome_quality += 0.15
        if 0.3 <= input_data.ndvi <= 0.8:
            outcome_quality += 0.15
        if 500 <= input_data.rainfall <= 1500:
            outcome_quality += 0.15
        if 20 <= input_data.temperature <= 30:
            outcome_quality += 0.05
        
        outcome_quality = min(0.95, outcome_quality)
        
        return {
            "predicted_yield": round(predicted_yield, 2),
            "outcome_quality": round(outcome_quality, 2),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making prediction: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)