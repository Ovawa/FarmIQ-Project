# ⚡ Quick Reference Card

## 📍 Key Files Locations

```
Crop Mapping:
  lib/constants/crop-mapping.ts

Model Service:
  services/model-service/main.py
  app/models/final_model.joblib          ← Your model file

API Endpoint:
  app/api/predict-yield/route.ts         ← POST endpoint

Form Component:
  components/generate-prediction-form.tsx ← Frontend form
```

## 🎯 Data Input Format

**Form sends to API:**
```json
{
  "crop_type": "Maize",              // String: crop name
  "rainfall": 750,                   // Number: mm/year
  "temperature": 25,                 // Number: °C
  "soil_pH": 6.8,                    // Number: 3-10
  "ndvi": 0.65,                      // Number: 0-1 (auto-filled)
  "field_id": "uuid",
  "crop_id": "uuid",
  "field_size": 2.5,
  "planting_date": "2024-03-15",
  "expected_harvest_date": "2024-06-14"
}
```

**API sends to Model Service:**
```json
{
  "crop_encoded": 24,                // Number: 0-45 (from mapping)
  "ndvi": 0.65,                      // Number: 0-1
  "rainfall": 750,                   // Number: mm
  "soil_ph": 6.8,                    // Number: 3-10
  "temperature": 25                  // Number: °C
}
```

**Model returns:**
```json
{
  "predicted_yield": 4850.45,
  "confidence": 0.85,
  "timestamp": "2024-11-10T12:34:56.789Z"
}
```

## 🚀 Commands to Get Started

```bash
# 1. Start Model Service
cd services/model-service
pip install -r requirements.txt
python main.py

# 2. (In another terminal) Start Dashboard
npm run dev

# 3. Open browser
# http://localhost:3000/dashboard/predictions/generate
```

## 🌾 Crop Codes (Sample)

```
0: Pearl Millet      24: Maize           45: Wheat
1: Banana            28: Onion           31: Potato
2: Barley            34: Rice            39: Sugarcane
9: Cotton            ...and 32 more      43: Tomato
```

See `lib/constants/crop-mapping.ts` for complete list.

## ✅ Checklist Before Testing

- [ ] `app/models/final_model.joblib` exists
- [ ] Model service dependencies installed
- [ ] Model service started and shows "Model loaded successfully"
- [ ] Next.js app started without errors
- [ ] Can access http://localhost:3000
- [ ] Can navigate to /dashboard/predictions/generate

## 🔧 Testing Steps

1. **Open form:** http://localhost:3000/dashboard/predictions/generate
2. **Select crop** from dropdown
3. **Enter rainfall:** e.g., 650
4. **Enter temperature:** e.g., 24.5
5. **Enter soil pH:** e.g., 6.5
6. **NDVI auto-fills** from region
7. **Click "Generate Prediction"**
8. **Verify redirect** to predictions page
9. **Check predictions page** for new prediction

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Model not found" | Check `app/models/final_model.joblib` exists |
| "Connection refused" | Start model service: `python main.py` |
| Crop not in dropdown | Only 46 trained crops supported |
| No prediction result | Check model service logs for errors |
| Form won't submit | Check browser console (F12) for errors |

## 📊 Model Performance Confidence

```
Low confidence (< 0.60):  Non-optimal conditions
Good confidence (0.60-0.80): Most conditions adequate  
High confidence (> 0.80):  Near-optimal conditions
```

## 🔗 Important Imports

If you need to use crop mapping elsewhere:
```typescript
import { getCropEncoding, getCropName } from '@/lib/constants/crop-mapping'
```

## 📱 API Health Check

```bash
curl http://localhost:8000/health
# Response: {"status": "healthy"}
```

## 🎯 Model Input Order (CRITICAL)

The model MUST receive features in this exact order:
```
[crop_encoded, ndvi, rainfall, soil_pH, temperature]
```

Position matters! This is already handled in the code, but important to know.

## 💾 Database Structure

Predictions saved with:
```json
{
  "user_id": "auth_user_id",
  "field_id": "field_uuid",
  "crop_id": "crop_uuid",
  "predicted_yield": 4850.45,
  "yield_unit": "tons",
  "confidence_score": 0.85,
  "prediction_date": "2024-11-10T12:34:56Z",
  "factors": {
    "crop_type": "Maize",
    "rainfall": 750,
    "temperature": 25,
    "soil_pH": 6.8,
    "ndvi": 0.65,
    ...
  }
}
```

## 🌐 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/predict` | POST | Make prediction |

## 📞 Contact/Support

Check these files for more info:
- `QUICK_START.md` - Setup guide
- `MODEL_INTEGRATION.md` - Architecture
- `INTEGRATION_CHECKLIST.md` - Testing checklist

---

**Ready?** Run the commands above and start predicting! 🎉
