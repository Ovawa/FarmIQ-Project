# FarmQ Yield Prediction Model Service

[![Tests](https://img.shields.io/badge/tests-14%20passing-brightgreen)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-86%25-green)](tests/)

This service provides machine learning-based yield predictions for the FarmQ Dashboard.

## Setup

1. **Prerequisites**
   - Python 3.9+
   - pip
   - (Optional) Docker

2. **Install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   # Server configuration
   PORT=8000
   HOST=0.0.0.0
   
   # Model configuration
   MODEL_VERSION=1.0.0
   ```

## Running the Service

### Development
```bash
uvicorn main:app --reload
```

### Production (with Docker)
```bash
docker build -t farmq-model-service .
docker run -p 8000:8000 farmq-model-service
```

## Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
python -m pytest tests/

# Run tests with coverage report
python -m pytest tests/ --cov=main --cov-report=term-missing

# Run the test demonstration
python demo_tests.py
```

### Test Coverage

Current test coverage is at 86%, with tests for:
- Model initialization and prediction
- API endpoints
- Input validation
- Error handling

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Get yield prediction
- `POST /train` - (Admin) Train the model with new data

## Example Prediction Request

```json
{
  "crop_type": "wheat",
  "field_size": 2.5,
  "soil_quality": 0.8,
  "weather_condition": "good",
  "historical_yield": 12.5,
  "planting_date": "2023-10-01",
  "expected_harvest_date": "2024-03-15"
}
```

## Development Notes

- The model currently uses a simple RandomForestRegressor for demonstration
- In production, you'll want to train the model on real historical data
- The service includes synthetic data generation for testing purposes
