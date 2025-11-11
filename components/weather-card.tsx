"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: Array<{
    day: string
    icon: "sun" | "cloud" | "rain"
    temp: number
  }>
}

export function WeatherCard({ region }: { region?: string }) {
  const weatherData: WeatherData = {
    temperature: 22,
    condition: "Broken Clouds",
    humidity: 29,
    windSpeed: 6.96,
    forecast: [
      { day: "Mon", icon: "sun", temp: 22 },
      { day: "Tue", icon: "cloud", temp: 24 },
      { day: "Wed", icon: "rain", temp: 20 },
      { day: "Thu", icon: "cloud", temp: 18 },
      { day: "Fri", icon: "sun", temp: 21 },
    ],
  }

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-800">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-4xl font-semibold text-gray-900">{weatherData.temperature}°C</div>
            <p className="text-sm text-gray-600">{weatherData.condition}</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-500" />
              {weatherData.humidity}%
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-gray-500" />
              {weatherData.windSpeed} km/h
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-600">{day.day}</span>
                {getWeatherIcon(day.icon)}
                <span className="text-sm font-medium text-gray-800">{day.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
          <div className="text-green-600">
            <span className="font-medium">Humidity:</span> {weatherData.humidity}%
          </div>
          <div className="text-green-600">
            <span className="font-medium">Wind:</span> {weatherData.windSpeed} m/s
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
