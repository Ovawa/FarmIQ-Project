import sys
import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from main import app, PredictionModel

@pytest.fixture
def test_client():
    """Fixture for FastAPI test client"""
    with TestClient(app) as client:
        yield client

@pytest.fixture
def mock_model():
    """Fixture for a mock prediction model"""
    class MockModel:
        def predict(self, features):
            # Return a fixed prediction for testing
            return np.array([100.0])
    
    # Create a test instance of PredictionModel with the mock model
    model = PredictionModel()
    model.model = MockModel()
    return model

@pytest.fixture
def sample_input_data():
    """Sample input data for testing"""
    return {
        "crop_encoded": 5,
        "ndvi": 0.7,
        "rainfall": 800.0,
        "soil_ph": 6.5,
        "temperature": 25.0
    }
