import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCropEncoding } from '@/lib/constants/crop-mapping';

interface PredictionData {
  crop_type: string;
  field_id: string;
  crop_id: string;
  field_size: number;
  rainfall: number;
  temperature: number;
  soil_pH: number;
  ndvi: number;
  planting_date: string;
  expected_harvest_date: string;
}

export async function POST(request: Request) {
  console.log('Received prediction request');
  
  try {
    // Initialize Supabase client
    const supabase = await createClient();
    console.log('Supabase client created');
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check complete', { user: !!user, authError: !!authError });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const rawBody = await request.json();
    console.log('Raw prediction data received:', JSON.stringify(rawBody, null, 2));

    // Basic required fields check (IDs and crop name)
    const predictionData: Partial<PredictionData> = rawBody;
    if (!predictionData.crop_type || !predictionData.field_id || !predictionData.crop_id) {
      return NextResponse.json(
        { error: 'Missing required fields (crop_type, field_id, crop_id)' },
        { status: 400 }
      );
    }

    // Helper to coerce numeric-like values (strings or numbers) into numbers
    const parseNumber = (v: unknown): number | undefined => {
      if (v === null || v === undefined) return undefined
      if (typeof v === 'number') {
        if (Number.isNaN(v)) return undefined
        return v
      }
      if (typeof v === 'string') {
        // trim and replace comma decimal separators
        const cleaned = v.trim().replace(',', '.')
        const n = Number.parseFloat(cleaned)
        if (Number.isFinite(n)) return n
        return undefined
      }
      return undefined
    }

    // Normalize various possible incoming key names for model inputs and coerce to numbers
    const normalized = {
      rainfall:
        parseNumber(rawBody.rainfall) ??
        parseNumber(rawBody.rain) ??
        parseNumber(rawBody.rainfall_mm) ??
        parseNumber(rawBody.weather?.rainfall) ??
        undefined,
      temperature:
        parseNumber(rawBody.temperature) ??
        parseNumber(rawBody.temp) ??
        parseNumber(rawBody.weather?.temperature) ??
        undefined,
      soil_pH:
        parseNumber(rawBody.soil_pH) ??
        parseNumber(rawBody.soilPH) ??
        parseNumber(rawBody.soil_ph) ??
        parseNumber(rawBody.soil_quality) ??
        undefined,
      ndvi:
        parseNumber(rawBody.ndvi) ??
        parseNumber(rawBody.ndvi_value) ??
        parseNumber(rawBody.NDVI) ??
        parseNumber(rawBody.ndviValue) ??
        undefined,
    } as { rainfall?: number; temperature?: number; soil_pH?: number; ndvi?: number };

    console.log('Normalized model inputs:', JSON.stringify(normalized, null, 2));

    const missingFields = [] as string[];
    if (normalized.rainfall === undefined) missingFields.push('rainfall');
    if (normalized.temperature === undefined) missingFields.push('temperature');
    if (normalized.soil_pH === undefined) missingFields.push('soil_pH');
    if (normalized.ndvi === undefined) missingFields.push('ndvi');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing model input fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Get crop encoding
    let cropEncoded: number;
    try {
      cropEncoded = getCropEncoding(predictionData.crop_type);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid crop type: ${predictionData.crop_type}` },
        { status: 400 }
      );
    }
    
    // Call the model service
    const modelServiceUrl = process.env.MODEL_SERVICE_URL || 'http://localhost:8000';
    const modelUrl = `${modelServiceUrl}/predict`;
    console.log('Calling model service at:', modelUrl);
    
    const modelRequestBody = {
      crop_encoded: cropEncoded,
      ndvi: normalized.ndvi,
      rainfall: normalized.rainfall,
      soil_ph: normalized.soil_pH,
      temperature: normalized.temperature,
    };
    
    console.log('Sending to model service:', JSON.stringify(modelRequestBody, null, 2));
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Model service error:', response.status, errorText);
      throw new Error(`Model service error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('Received prediction:', JSON.stringify(prediction, null, 2));

    // Model returns a decimal value; multiply by 10 to get the actual yield
    const yieldValue = prediction.predicted_yield * 10;
    // Round yield to 1 decimal place
    const yieldRounded = Math.round(yieldValue * 10) / 10;
    
    console.log(`Model output: ${prediction.predicted_yield} → Multiplied by 10: ${yieldValue} → Rounded: ${yieldRounded}`);
    
    // Prepare factors to save
    const factors = {
      crop_type: predictionData.crop_type,
      rainfall: predictionData.rainfall,
      temperature: predictionData.temperature,
      soil_pH: predictionData.soil_pH,
      ndvi: predictionData.ndvi,
      field_size: predictionData.field_size,
      planting_date: predictionData.planting_date,
      expected_harvest_date: predictionData.expected_harvest_date,
    };

    // Save prediction to database
    const { data: savedPrediction, error: dbError } = await supabase
      .from('predictions')
      .insert([
        {
          user_id: user.id,
          field_id: predictionData.field_id,
          crop_id: predictionData.crop_id,
          predicted_yield: yieldRounded,
          yield_unit: 'kg/hectare',
          confidence_score: prediction.outcome_quality,
          prediction_date: new Date().toISOString(),
          factors: factors,
        },
      ])
      .select('*')
      .single();

    if (dbError) {
      console.error('Error saving prediction to database:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Prediction saved successfully:', savedPrediction.id);
    return NextResponse.json({
      predicted_yield: yieldRounded,
      yield_unit: 'kg/hectare',
      outcome_quality: prediction.outcome_quality,
      timestamp: prediction.timestamp,
      id: savedPrediction.id,
      factors: factors,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prediction error:', errorMessage);
    console.error('Full error object:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate prediction',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}
