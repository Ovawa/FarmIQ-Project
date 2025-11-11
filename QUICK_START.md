# Quick Start Guide - Model Integration

## What Was Done

Your `final_model.joblib` has been successfully integrated into the FarmQ Dashboard. The model now powers the yield prediction feature.

## Required Setup

### Step 1: Verify Model File
```
Location: c:\Users\vange\Downloads\FarmQ-Dashboard\app\models\final_model.joblib
Status: ✓ Must exist at this path
```

### Step 2: Start Model Service
```bash
# Open PowerShell in the project directory
cd c:\Users\vange\Downloads\FarmQ-Dashboard\services\model-service

# Install dependencies (if not done)
pip install -r requirements.txt

# Start the service
python main.py
```

Expected output:
```
INFO:     Application startup complete [uvicorn]
Model loaded successfully from ...
```

The service will run on `http://localhost:8000`

### Step 3: Run Your Next.js App
```bash
# In another terminal
npm run dev
```

### Step 4: Test the Integration
1. Go to: `http://localhost:3000/dashboard/predictions/generate`
2. Select a crop (must be from the trained crops list)
3. Enter:
   - Annual Rainfall (mm) - e.g., 650
   - Average Temperature (°C) - e.g., 24.5
   - Soil pH - e.g., 6.5
4. NDVI will auto-fill from your region
5. Click "Generate Prediction"
6. You should see the yield prediction

## How the Model Works

### Input Parameters
| Parameter | Type | Range | Notes |
|-----------|------|-------|-------|
| Crop | Selector | 46 options | One of the trained crops |
| Rainfall | Number | 0-3000 mm | Annual precipitation |
| Temperature | Number | Any °C | Average temperature |
| Soil pH | Number | 3-10 | Soil acidity/basicity |
| NDVI | Auto | 0-1 | Vegetation health (from region) |

### Output
- **Predicted Yield**: In tons (or crop-specific units)
- **Confidence Score**: 0-1 (higher = more reliable prediction)
- **Timestamp**: When prediction was made

### Confidence Calculation
The model gives higher confidence when:
- Soil pH: 6.0-7.5 (optimal) → +15%
- NDVI: 0.3-0.8 (healthy vegetation) → +15%
- Rainfall: 500-1500mm (adequate) → +15%
- Temperature: 20-30°C (moderate) → +5%
- Base: 50%
- Maximum: 95%

## Files Modified

### Created
- `lib/constants/crop-mapping.ts` - Crop name to number mapping

### Updated
- `services/model-service/main.py` - Loads and uses final_model.joblib
- `app/api/predict-yield/route.ts` - API endpoint for predictions
- `components/generate-prediction-form.tsx` - Form submission logic

## 46 Trained Crops

```
Pearl Millet, Banana, Barley, Bean, Blackgram, Egg Plant, 
Castor seed, Chillies, Coriander, Cotton, Cowpea, Drum Stick, 
Garlic, Gram, Grapes, Groundnut, Guar seed, Horse-gram, 
Sorghum, Golden Fiber, Grass Pea, Lady Finger, Lentil, Linseed, 
Maize, Fiber, Green Gram, Moth, Onion, Orange, 
Peas & beans (Pulses), Potato, Raddish, Finger Millet, Rice, 
Safflower, Sannhamp, Sesamum, Soyabean, Sugarcane, Sunflower, 
Sweet potato, Tapioca, Tomato, Black Gram, Wheat
```

## Troubleshooting

### Model Service Won't Start
```
Error: FileNotFoundError: Model not found
Solution: Ensure final_model.joblib is at app/models/final_model.joblib
```

### Crop Not in Dropdown
```
Only trained crops appear in the form
Solution: Add more crops by updating the trainedCrops list
```

### "Failed to generate prediction"
```
Check:
1. Is model service running? (should see "Model loaded successfully")
2. Are inputs valid? (rainfall, temp, pH in expected ranges)
3. Check browser console for detailed error
```

### Connection Refused
```
Error: Connection refused to http://localhost:8000
Solution: Start model service in separate terminal
```

## Architecture Overview

```
┌─────────────────────────────────┐
│   FarmQ Dashboard (Next.js)    │
│  /dashboard/predictions/generate│
└────────────────┬────────────────┘
                 │ POST /api/predict-yield
                 ↓
         ┌──────────────────┐
         │   Backend API    │
         │ (app/api/...)    │
         └────────┬─────────┘
                  │ Crop name → encoding
                  │ POST /predict
                  ↓
         ┌──────────────────┐
         │  Model Service   │
         │  (FastAPI)       │
         │  Port 8000       │
         └────────┬─────────┘
                  │
                  ↓
         ┌──────────────────┐
         │  final_model     │
         │  .joblib         │
         └────────┬─────────┘
                  │
                  ↓ Predicted Yield + Confidence
         ┌──────────────────┐
         │  Save to DB      │
         │  (Supabase)      │
         └──────────────────┘
```

## Example Request/Response

### Request
```json
{
  "crop_type": "Maize",
  "field_id": "field-123",
  "crop_id": "crop-123",
  "field_size": 2.5,
  "rainfall": 750,
  "temperature": 25,
  "soil_pH": 6.8,
  "ndvi": 0.65,
  "planting_date": "2024-03-15",
  "expected_harvest_date": "2024-06-14"
}
```

### Response
```json
{
  "predicted_yield": 4850.45,
  "confidence": 0.85,
  "timestamp": "2024-11-10T12:34:56.789Z",
  "factors": {
    "crop_type": "Maize",
    "rainfall": 750,
    "temperature": 25,
    "soil_pH": 6.8,
    "ndvi": 0.65,
    "field_size": 2.5
  }
}
```

## Notes

✓ No UI changes made - form looks the same
✓ NDVI is auto-populated from user's region
✓ All predictions saved to database with full audit trail
✓ Supports all 46 trained crops
✓ Real machine learning model, not mock predictions

## Support

For issues:
1. Check model service logs
2. Check browser console for client-side errors
3. Check Next.js server logs for API errors
4. Verify all required files exist and are accessible
