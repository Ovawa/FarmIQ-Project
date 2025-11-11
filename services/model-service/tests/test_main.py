import pytest
import numpy as np
from fastapi import status
from main import PredictionModel, app

class TestPredictionModel:
    def test_model_initialization(self):
        """Test that the model initializes correctly"""
        try:
            model = PredictionModel()
            assert hasattr(model, 'model')
            # If we get here, the model loaded successfully
            # Now test prediction with a sample input
            test_input = np.array([[5, 0.7, 800.0, 6.5, 25.0]])
            prediction = model.predict(test_input)
            assert isinstance(prediction, float)
        except FileNotFoundError:
            # Skip the test if model file is not found
            pytest.skip("Model file not found, skipping test")

    @pytest.mark.parametrize("invalid_input", [
        np.array([5, 0.7, 800.0]),  # Too few features
        np.array([5, 0.7, 800.0, 6.5, 25.0, 10.0]),  # Too many features
        "not_an_array",  # Wrong type
        np.array([["a", 0.7, 800.0, 6.5, 25.0]]),  # Invalid type in array
    ])
    def test_predict_invalid_input(self, invalid_input, mock_model):
        """Test that predict handles invalid input gracefully"""
        with pytest.raises(Exception):
            mock_model.predict(invalid_input)

class TestAPIEndpoints:
    def test_health_endpoint(self, test_client):
        """Test the health check endpoint"""
        response = test_client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"status": "healthy"}

    def test_predict_endpoint_valid_input(self, test_client, sample_input_data):
        """Test the predict endpoint with valid input"""
        response = test_client.post("/predict", json=sample_input_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "predicted_yield" in data
        assert "outcome_quality" in data
        assert "timestamp" in data
        assert 0 <= data["outcome_quality"] <= 1

    @pytest.mark.parametrize("field,value,error_message", [
        ("crop_encoded", -1, "Crop encoded must be between 0 and 45"),
        ("crop_encoded", 50, "Crop encoded must be between 0 and 45"),
        ("ndvi", -0.1, "NDVI must be between 0 and 1"),
        ("ndvi", 1.1, "NDVI must be between 0 and 1"),
        ("soil_ph", 2.9, "Soil pH must be between 3 and 10"),
        ("soil_ph", 10.1, "Soil pH must be between 3 and 10"),
    ])
    def test_predict_endpoint_invalid_input(self, test_client, sample_input_data, field, value, error_message):
        """Test the predict endpoint with various invalid inputs"""
        test_data = sample_input_data.copy()
        test_data[field] = value
        
        response = test_client.post("/predict", json=test_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert error_message in response.json()["detail"]

    def test_outcome_quality_calculation(self, test_client, sample_input_data):
        """Test that outcome quality is calculated correctly"""
        # Test with optimal conditions
        optimal_data = sample_input_data.copy()
        optimal_data.update({
            "ndvi": 0.5,  # Good NDVI
            "soil_ph": 7.0,  # Good pH
            "rainfall": 1000,  # Good rainfall
            "temperature": 25  # Good temperature
        })
        
        response = test_client.post("/predict", json=optimal_data)
        optimal_quality = response.json()["outcome_quality"]
        
        # Test with suboptimal conditions
        suboptimal_data = sample_input_data.copy()
        suboptimal_data.update({
            "ndvi": 0.1,  # Low NDVI
            "soil_ph": 4.0,  # Acidic soil
            "rainfall": 200,  # Low rainfall
            "temperature": 35  # High temperature
        })
        
        response = test_client.post("/predict", json=suboptimal_data)
        suboptimal_quality = response.json()["outcome_quality"]
        
        # Optimal conditions should have higher quality
        assert optimal_quality > suboptimal_quality
