export const NAMIBIAN_REGIONS = [
  "Erongo",
  "Hardap",
  "Kavango East",
  "Kavango West",
  "Khomas",
  "Kunene",
  "Ohangwena",
  "Omaheke",
  "Omusati",
  "Oshana",
  "Oshikoto",
  "Otjozondjupa",
  "ǁKaras",
  "Zambezi",
] as const

export type NamibianRegion = (typeof NAMIBIAN_REGIONS)[number]

export const REGION_NDVI: Record<string, number> = {
  Erongo: 0.0762,
  Hardap: 0.1779,
  ǁKaras: 0.1734,
  "Kavango East": 0.7458,
  "Kavango West": 0.6957,
  Khomas: 0.1991,
  Kunene: 0.0956,
  Ohangwena: 0.3118,
  Omaheke: 0.5002,
  Omusati: 0.2909,
  Oshana: 0.283,
  Oshikoto: 0.3062,
  Otjozondjupa: 0.5021,
  Zambezi: 0.8261,
}

export function getNDVIForRegion(region: string): number {
  return REGION_NDVI[region] || 0.5
}

export function getNDVIStatus(ndvi: number): {
  status: string
  color: string
  description: string
} {
  if (ndvi >= 0.6) {
    return {
      status: "Healthy",
      color: "text-green-600",
      description: "Excellent vegetation health",
    }
  } else if (ndvi >= 0.4) {
    return {
      status: "Moderate Stress",
      color: "text-yellow-600",
      description: "Fair vegetation condition",
    }
  } else {
    return {
      status: "Poor",
      color: "text-red-600",
      description: "Vegetation stress detected",
    }
  }
}
