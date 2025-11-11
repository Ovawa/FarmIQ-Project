# Model Integration Guide

## Overview
The `final_model.joblib` has been successfully integrated into your FarmQ Dashboard. The model takes 5 input parameters and returns yield predictions with confidence scores.

## Architecture

### 1. **Model Input Parameters**
The model expects the following features in this exact order:
```
[crop_encoded, ndvi, rainfall, soil_pH, temperature]
```

Where:
- **crop_encoded** (int): 0-45, representing one of 46 crop types
- **ndvi** (float): 0.0-1.0, normalized vegetation index (auto-filled from user's region)
- **rainfall** (float): Annual rainfall in millimeters
- **soil_pH** (float): Soil pH value (3.0-10.0)
- **temperature** (float): Average temperature in degrees Celsius

### 2. **Crop Mapping (0-45 Encoding)**
Created in `/lib/constants/crop-mapping.ts`:
```
0: Pearl Millet
1: Banana
2: Barley
... (46 crops total)
45: Wheat
```

## File Changes

### Backend Changes

#### 1. **`/services/model-service/main.py`**
- Updated to load `final_model.joblib` from `app/models/` directory
- Accepts proper input format: `crop_encoded`, `ndvi`, `rainfall`, `soil_ph`, `temperature`
- Calculates confidence score based on optimal condition ranges:
  - Soil pH: 6.0-7.5 (+0.15)
  - NDVI: 0.3-0.8 (+0.15)
  - Rainfall: 500-1500mm (+0.15)
  - Temperature: 20-30°C (+0.05)
  - Base confidence: 0.5 (capped at 0.95)

#### 2. **`/app/api/predict-yield/route.ts`**
- Maps crop name to numeric encoding using `getCropEncoding()`
- Validates all input parameters
- Sends properly formatted request to model service
- Receives prediction and saves to database with factors

#### 3. **`/lib/constants/crop-mapping.ts`** (NEW)
- Created crop mapping constants for all 46 crop types
- Functions:
  - `getCropEncoding(cropName)`: Convert crop name → number (0-45)
  - `getCropName(encoding)`: Convert number → crop name

### Frontend Changes

#### **`/components/generate-prediction-form.tsx`**
- Updated `handleSubmit` to send correct parameters:
  - `crop_type` (string): Selected crop name
  - `field_id`, `crop_id`: Field identifiers
  - `rainfall` (number): From form input (mm)
  - `temperature` (number): From form input (°C)
  - `soil_pH` (number): From form input
  - `ndvi` (number): Auto-filled from region
  - `planting_date` (string): From crop data
  - `expected_harvest_date` (string): Calculated
- Removed old mock prediction function
- Removed obsolete helper functions (kept only `getExpectedHarvestDate`)

## Data Flow

```
User Form (Generate Prediction Page)
        ↓
Collect: crop, rainfall, temperature, soil_pH
Auto-fill: ndvi (from region)
        ↓
POST /api/predict-yield
        ↓
Backend API Route
  - Map crop name → encoding
  - Validate all inputs
        ↓
POST to Model Service
  - /predict endpoint
  - Input: [crop_encoded, ndvi, rainfall, soil_ph, temperature]
        ↓
Machine Learning Model (final_model.joblib)
  - Predicts yield
        ↓
Return prediction + confidence
        ↓
Save to Database
  - predictions table
  - Includes: predicted_yield, confidence, factors
        ↓
Redirect to /dashboard/predictions
```

## Model Service Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```
Response: `{"status": "healthy"}`

### Prediction
```bash
POST http://localhost:8000/predict
Content-Type: application/json

{
  "crop_encoded": 24,        # Maize (0-45)
  "ndvi": 0.65,              # Between 0 and 1
  "rainfall": 700,           # mm
  "soil_ph": 6.5,            # Between 3 and 10
  "temperature": 24.5        # °C
}
```

Response:
```json
{
  "predicted_yield": 4850.45,
  "confidence": 0.85,
  "timestamp": "2024-11-10T12:34:56.789Z"
}
```

## Setup Instructions

### 1. Ensure Model File Exists
```bash
# Model should be at:
# c:\Users\vange\Downloads\FarmQ-Dashboard\app\models\final_model.joblib
```

### 2. Install Python Dependencies
```bash
cd services/model-service
pip install -r requirements.txt
```

### 3. Run Model Service
```bash
cd services/model-service
python main.py
# Server runs on http://localhost:8000
```

### 4. Set Environment Variable (Optional)
```bash
# In your .env.local file:
MODEL_SERVICE_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`

## Input Validation

The system validates:
- **Crop Encoding**: Must be 0-45
- **NDVI**: Must be 0-1
- **Rainfall**: Any non-negative number (mm)
- **Soil pH**: Must be 3-10
- **Temperature**: Any reasonable temperature (°C)

## Error Handling

### Crop Not Supported
If user selects a crop not in the trained model, the form won't allow prediction (filtered in dropdown).

### Model Service Unavailable
If model service is down, user gets clear error: "Failed to generate prediction"

### Invalid Inputs
Form validates before submission. Invalid ranges are rejected by model service with specific error messages.

## Testing the Integration

### 1. Via Form UI
1. Go to Dashboard → Predictions → Generate Prediction
2. Select a supported crop
3. Enter rainfall, temperature, soil pH
4. NDVI auto-fills from your region
5. Click "Generate Prediction"

### 2. Via API (curl example)
```bash
curl -X POST http://localhost:3000/api/predict-yield \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "Maize",
    "field_id": "field-123",
    "crop_id": "crop-123",
    "field_size": 2.5,
    "rainfall": 750,
    "temperature": 25.5,
    "soil_pH": 6.8,
    "ndvi": 0.65,
    "planting_date": "2024-03-15",
    "expected_harvest_date": "2024-06-14"
  }'
```

## Future Enhancements

1. **Model Retraining**: Update `final_model.joblib` with new data
2. **Crop Mapping Updates**: Add new crops to mapping file as model is updated
3. **Advanced Confidence Calculation**: Fine-tune confidence ranges based on actual model performance
4. **Historical Comparisons**: Compare predictions to previous years' actual yields
5. **Region-Specific Models**: Create different models for different regions

## Notes

- The model expects data in a specific order: `[crop_encoded, ndvi, rainfall, soil_pH, temperature]`
- NDVI is automatically populated from the user's region (stored in profiles table)
- All predictions include a confidence score (0-1) based on condition optimality
- Predictions are stored with all input factors for audit trail and analysis
- The form UI remains unchanged - integration is backend/API focused
