// Crop mapping for model (0-45 encoding)
export const CROP_TO_ENCODING: Record<string, number> = {
  "Pearl Millet": 0,
  "Banana": 1,
  "Barley": 2,
  "Bean": 3,
  "Blackgram": 4,
  "Egg Plant": 5,
  "Castor seed": 6,
  "Chillies": 7,
  "Coriander": 8,
  "Cotton": 9,
  "Cowpea": 10,
  "Drum Stick": 11,
  "Garlic": 12,
  "Gram": 13,
  "Grapes": 14,
  "Groundnut": 15,
  "Guar seed": 16,
  "Horse-gram": 17,
  "Sorghum": 18,
  "Golden Fiber": 19,
  "Grass Pea": 20,
  "Lady Finger": 21,
  "Lentil": 22,
  "Linseed": 23,
  "Maize": 24,
  "Fiber": 25,
  "Green Gram": 26,
  "Moth": 27,
  "Onion": 28,
  "Orange": 29,
  "Peas & beans (Pulses)": 30,
  "Potato": 31,
  "Raddish": 32,
  "Finger Millet": 33,
  "Rice": 34,
  "Safflower": 35,
  "Sannhamp": 36,
  "Sesamum": 37,
  "Soyabean": 38,
  "Sugarcane": 39,
  "Sunflower": 40,
  "Sweet potato": 41,
  "Tapioca": 42,
  "Tomato": 43,
  "Black Gram": 44,
  "Wheat": 45,
};

export const ENCODING_TO_CROP: Record<number, string> = Object.fromEntries(
  Object.entries(CROP_TO_ENCODING).map(([crop, encoding]) => [encoding, crop])
);

export function getCropEncoding(cropName: string): number {
  const encoding = CROP_TO_ENCODING[cropName];
  if (encoding === undefined) {
    throw new Error(`Unknown crop: ${cropName}`);
  }
  return encoding;
}

export function getCropName(encoding: number): string {
  const name = ENCODING_TO_CROP[encoding];
  if (!name) {
    throw new Error(`Unknown crop encoding: ${encoding}`);
  }
  return name;
}
