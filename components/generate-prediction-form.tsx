"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Brain, Loader2, MapPin, Thermometer, CloudRain, TestTube } from "lucide-react"
import Link from "next/link"
import { getNDVIForRegion } from "@/lib/constants/regions"

interface Crop {
  id: string
  name: string
  variety: string | null
  planting_date: string | null
  fields: {
    id: string
    name: string
    size_hectares: number
    soil_type: string | null
    location: string | null
  } | null
}

interface GeneratePredictionFormProps {
  userId: string
  activeCrops: Crop[]
}

export function GeneratePredictionForm({ userId, activeCrops }: GeneratePredictionFormProps) {
  const [selectedCropId, setSelectedCropId] = useState("")
  const [rainfall, setRainfall] = useState("")
  const [temperature, setTemperature] = useState("")
  const [soilPH, setSoilPH] = useState("")
  const [userRegion, setUserRegion] = useState("")
  const [ndviValue, setNdviValue] = useState(0)
  const [additionalFactors, setAdditionalFactors] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const selectedCrop = activeCrops.find((crop) => crop.id === selectedCropId)

  useEffect(() => {
    const fetchUserRegion = async () => {
      const supabase = createClient()
      const { data: profile } = await supabase.from("profiles").select("region").eq("id", userId).single()

      if (profile?.region) {
        setUserRegion(profile.region)
        setNdviValue(getNDVIForRegion(profile.region))
      }
    }

    fetchUserRegion()
  }, [userId])

  const trainedCrops = [
    "Pearl Millet",
    "Banana",
    "Barley",
    "Bean",
    "Blackgram",
    "Egg Plant",
    "Castor seed",
    "Chillies",
    "Coriander",
    "Cotton",
    "Cowpea",
    "Drum Stick",
    "Garlic",
    "Gram",
    "Grapes",
    "Groundnut",
    "Guar seed",
    "Horse-gram",
    "Sorghum",
    "Golden Fiber",
    "Grass Pea",
    "Lady Finger",
    "Lentil",
    "Linseed",
    "Maize",
    "Fiber",
    "Green Gram",
    "Moth",
    "Onion",
    "Orange",
    "Peas & beans (Pulses)",
    "Potato",
    "Raddish",
    "Finger Millet",
    "Rice",
    "Safflower",
    "Sannhamp",
    "Sesamum",
    "Soyabean",
    "Sugarcane",
    "Sunflower",
    "Sweet potato",
    "Tapioca",
    "Tomato",
    "Black Gram",
    "Wheat",
  ]

  const validActiveCrops = activeCrops.filter((crop) => trainedCrops.includes(crop.name))

  // Helper function to calculate expected harvest date
  const getExpectedHarvestDate = (plantingDate: string | null, cropName: string): string => {
    const cropGrowthDays: Record<string, number> = {
      'Wheat': 120,
      'Maize': 90,
      'Rice': 150,
      'Pearl Millet': 90,
      'Banana': 270,
      'Barley': 130,
      'Bean': 70,
      'Blackgram': 90,
      'Egg Plant': 120,
      'Castor seed': 150,
      'Chillies': 150,
      'Coriander': 120,
      'Cotton': 180,
      'Cowpea': 80,
      'Drum Stick': 200,
      'Garlic': 150,
      'Gram': 100,
      'Grapes': 200,
      'Groundnut': 120,
      'Guar seed': 90,
      'Horse-gram': 90,
      'Sorghum': 100,
      'Golden Fiber': 150,
      'Grass Pea': 100,
      'Lady Finger': 90,
      'Lentil': 100,
      'Linseed': 100,
      'Fiber': 100,
      'Green Gram': 60,
      'Moth': 90,
      'Onion': 150,
      'Orange': 250,
      'Peas & beans (Pulses)': 70,
      'Potato': 90,
      'Raddish': 50,
      'Finger Millet': 100,
      'Safflower': 120,
      'Sannhamp': 120,
      'Sesamum': 100,
      'Soyabean': 100,
      'Sugarcane': 365,
      'Sunflower': 120,
      'Sweet potato': 120,
      'Tapioca': 180,
      'Tomato': 70,
      'Black Gram': 100,
    };
    
    const growthDays = cropGrowthDays[cropName] || 100; // Default to 100 days
    const baseDate = plantingDate ? new Date(plantingDate) : new Date();
    baseDate.setDate(baseDate.getDate() + growthDays);
    
    return baseDate.toISOString().split('T')[0];
  };

  // Function to calculate a heuristic-based yield prediction
  const calculateHeuristicYield = (cropName: string, rainfall: number, temperature: number, soilPH: number, ndvi: number): number => {
    // Base yields for different crop categories (in kg/hectare, will be multiplied by 10)
    const baseYields: Record<string, number> = {
      'Wheat': 30,
      'Maize': 50,
      'Rice': 40,
      'Pearl Millet': 25,
      'Barley': 35,
      'Bean': 15,
      'Soyabean': 20,
      'Potato': 300,
      'Tomato': 400,
      'Sunflower': 20,
    };

    // Get base yield or use a default
    const baseYield = baseYields[cropName] || 30;

    // Adjust for rainfall (optimal around 600mm)
    const rainfallFactor = 0.8 + (Math.min(Math.max(rainfall, 200), 1000) / 1000) * 0.4;
    
    // Adjust for temperature (optimal around 25°C)
    const tempFactor = 1 - Math.abs((temperature - 25) / 25);
    
    // Adjust for soil pH (optimal around 6.5)
    const phFactor = 1 - Math.abs((soilPH - 6.5) / 3.5);
    
    // Adjust for NDVI (normalized difference vegetation index)
    const ndviFactor = 0.5 + ndvi * 0.5;

    // Calculate final yield with all factors
    const finalYield = baseYield * rainfallFactor * tempFactor * phFactor * ndviFactor;
    
    // Ensure the value is between 5 and 95 (after multiplying by 10, this gives 50-950 kg/ha)
    const clampedYield = Math.min(Math.max(finalYield, 5), 95);
    
    // Round to 2 decimal places
    return Math.round(clampedYield * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get the selected crop with proper null check
    const selectedCrop = activeCrops.find((crop) => crop.id === selectedCropId);
    
    // Validate all required fields
    const missingFields = []
    if (!selectedCrop) missingFields.push('crop')
    if (!rainfall) missingFields.push('rainfall')
    if (!temperature) missingFields.push('temperature')
    if (!soilPH) missingFields.push('soil pH')
    if (!userRegion) missingFields.push('region')
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    // Ensure NDVI value is properly set
    const currentNdviValue = (ndviValue === undefined || ndviValue === null) ? 0.5 : ndviValue;
    if (ndviValue === undefined || ndviValue === null) {
      console.warn('NDVI value not set, using default value of 0.5')
      setNdviValue(currentNdviValue) // Default to neutral NDVI if not set
    }

    setIsLoading(true)
    setError(null)

    try {
      // Type guard: ensure selectedCrop is not undefined at this point
      if (!selectedCrop) {
        throw new Error('No crop selected');
      }

      // Ensure all numeric values are valid numbers
      const payload = {
        crop_type: selectedCrop.name,
        field_id: selectedCrop.fields?.id,
        crop_id: selectedCrop.id,
        field_size: selectedCrop.fields?.size_hectares || 1,
        rainfall: Number.parseFloat(rainfall),
        temperature: Number.parseFloat(temperature),
        soil_pH: Number.parseFloat(soilPH),
        ndvi: currentNdviValue,
        planting_date: selectedCrop.planting_date || new Date().toISOString().split('T')[0],
        expected_harvest_date: getExpectedHarvestDate(selectedCrop.planting_date, selectedCrop.name),
      };
      
      console.log('Form submission payload:', JSON.stringify(payload, null, 2));

      // TEMP LOG: Inspect outgoing payload in browser console
      // Remove or guard this in production
      // eslint-disable-next-line no-console
      console.log('Sending prediction payload:', payload);

      // Call the model service via API
      let prediction;
      let isFallbackPrediction = false;
      
      try {
        // First try the model API
        const response = await fetch('/api/predict-yield', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Failed to generate prediction');
        }
        
        prediction = await response.json();
      } catch (modelError) {
        console.warn('Model prediction failed, using fallback heuristic', modelError);
        isFallbackPrediction = true;
        
        // Calculate yield using heuristic
        const heuristicYield = calculateHeuristicYield(
          payload.crop_type,
          payload.rainfall,
          payload.temperature,
          payload.soil_pH,
          currentNdviValue
        );
        
        // Format the prediction to match the API response structure
        prediction = {
          predicted_yield: heuristicYield,
          yield_unit: 'kg/hectare',
          outcome_quality: 0.7, // Medium confidence for heuristic prediction
          timestamp: new Date().toISOString(),
          is_fallback: true
        };
        
        // Save the fallback prediction to the database
        try {
          const supabase = createClient();
          const { data: savedPrediction, error: dbError } = await supabase
            .from('predictions')
            .insert([
              {
                user_id: userId,
                field_id: payload.field_id,
                crop_id: payload.crop_id,
                predicted_yield: heuristicYield,
                yield_unit: 'kg/hectare',
                confidence_score: 0.7,
                prediction_date: new Date().toISOString(),
                factors: {
                  ...payload,
                  is_fallback_prediction: true,
                  fallback_reason: 'Model service unavailable'
                },
              },
            ])
            .select('*')
            .single();

          if (dbError) throw dbError;
          
          // Add the saved ID to the prediction
          prediction.id = savedPrediction.id;
          
        } catch (dbError) {
          console.error('Error saving fallback prediction:', dbError);
          // Continue with the prediction even if save fails
        }
      }

      // Show a success message with the prediction
      router.push(`/dashboard/predictions?prediction=${encodeURIComponent(JSON.stringify({
        ...prediction,
        is_fallback: isFallbackPrediction,
        message: isFallbackPrediction ? 
          'Prediction generated using fallback method (model service unavailable)' : 
          'Prediction generated successfully'
      }))}`);
    } catch (error: unknown) {
      console.error('Prediction error:', error);
      setError(error instanceof Error ? error.message : "An error occurred while generating prediction");
    } finally {
      setIsLoading(false);
    }
  }

  if (validActiveCrops.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="h-16 w-16 text-green-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">No Supported Crops Found</h3>
        <p className="text-green-600 mb-4">
          You need to have active crops from our trained model to generate predictions.
        </p>
        <p className="text-sm text-green-500 mb-4">
          Supported crops: {trainedCrops.slice(0, 5).join(", ")} and {trainedCrops.length - 5} more.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/fields">Add Supported Crops</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button variant="ghost" asChild className="text-green-600 hover:text-green-700 p-0">
        <Link href="/dashboard/predictions">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Predictions
        </Link>
      </Button>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="crop" className="text-green-700">
            Select Crop *
          </Label>
          <Select value={selectedCropId} onValueChange={setSelectedCropId} required>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue placeholder="Choose a supported crop to predict" />
            </SelectTrigger>
            <SelectContent>
              {validActiveCrops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.name} - {crop.fields?.name} ({crop.fields?.size_hectares} hectares)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="rainfall" className="text-green-700 flex items-center gap-2">
              <CloudRain className="h-4 w-4" />
              Annual Rainfall (mm) *
            </Label>
            <Input
              id="rainfall"
              type="number"
              min="0"
              max="3000"
              step="0.1"
              placeholder="e.g., 650"
              required
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="temperature" className="text-green-700 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Average Temperature (°C) *
            </Label>
            <Input
              id="temperature"
              type="number"
              min="-10"
              max="50"
              step="0.1"
              placeholder="e.g., 24.5"
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="soilPH" className="text-green-700 flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Soil pH *
            </Label>
            <Input
              id="soilPH"
              type="number"
              min="3"
              max="10"
              step="0.1"
              placeholder="e.g., 6.5"
              required
              value={soilPH}
              onChange={(e) => setSoilPH(e.target.value)}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ndvi" className="text-green-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              NDVI Value (Auto-filled)
            </Label>
            <Input
              id="ndvi"
              type="text"
              value={`${ndviValue.toFixed(4)} (${userRegion})`}
              disabled
              className="border-green-200 bg-gray-50"
            />
            <p className="text-xs text-gray-500">Based on your region: {userRegion}</p>
          </div>
        </div>

        {selectedCrop && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Selected Crop Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Field:</span>
                <span className="ml-2 text-green-800">{selectedCrop.fields?.name}</span>
              </div>
              <div>
                <span className="text-green-600">Size:</span>
                <span className="ml-2 text-green-800">{selectedCrop.fields?.size_hectares} hectares</span>
              </div>
              <div>
                <span className="text-green-600">Soil Type:</span>
                <span className="ml-2 text-green-800">{selectedCrop.fields?.soil_type || "Not specified"}</span>
              </div>
              <div>
                <span className="text-green-600">Variety:</span>
                <span className="ml-2 text-green-800">{selectedCrop.variety || "Not specified"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="factors" className="text-green-700">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="factors"
            placeholder="Enter any additional information (irrigation, fertilizer use, pest management, etc.)"
            value={additionalFactors}
            onChange={(e) => setAdditionalFactors(e.target.value)}
            className="border-green-200 focus:border-green-400 min-h-[80px]"
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Namibian Agricultural AI Model</h4>
              <p className="text-sm text-blue-700">
                This model is trained on 40 crop types specific to Namibian conditions. It uses rainfall, temperature,
                soil pH, and regional NDVI data from Google Earth Engine to predict yields with high accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 border-green-200 text-green-700"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !selectedCropId || !rainfall || !temperature || !soilPH || !userRegion}
          title={!selectedCropId || !rainfall || !temperature || !soilPH || !userRegion ? 
            'Please fill in all required fields' : 'Generate prediction'}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Prediction
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
