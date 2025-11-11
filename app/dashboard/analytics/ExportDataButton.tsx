'use client'

import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'

type YieldRecordRow = {
  id: string
  harvest_date: string
  yield_amount: number
  field: string | null
  crop: string | null
  field_size?: number | null
  region?: string | null
  season?: string | null
  notes?: string | null
  unit?: string
  yield_per_hectare?: number
}

type CropPerfRow = {
  crop: string
  avgYield: number
  totalYield: number
  revenue: number
  cost: number
  profit: number
  count: number
  totalAcres: number
  avgYieldPerHectare: number
  profitMargin: number
  revenuePerHectare: number
  costPerHectare: number
  profitPerHectare: number
}

type ExportDataButtonProps = {
  yieldRecords: YieldRecordRow[]
  cropPerformance: CropPerfRow[]
  revenueByCrop: Record<string, { revenue: number; cost: number; profit: number }>
}

export default function ExportDataButton({ yieldRecords, cropPerformance, revenueByCrop }: ExportDataButtonProps) {
  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new()

      // Yield Records sheet with additional fields
      const yrSheet = XLSX.utils.json_to_sheet(yieldRecords.map(r => ({
        'Record ID': r.id,
        'Harvest Date': r.harvest_date,
        'Crop': r.crop,
        'Field': r.field,
        'Field Size (ha)': r.field_size || 'N/A',
        'Region': r.region || 'N/A',
        'Season': r.season || 'N/A',
        'Yield (kg)': r.yield_amount,
        'Yield Unit': r.unit || 'kg',
        'Yield per Hectare (kg/ha)': r.yield_per_hectare || 'N/A',
        'Notes': r.notes || ''
      })))
      XLSX.utils.book_append_sheet(wb, yrSheet, 'YieldRecords')

      // Enhanced Crop Performance sheet
      const cpSheet = XLSX.utils.json_to_sheet(cropPerformance.map(c => ({
        'Crop': c.crop,
        'Harvest Count': c.count,
        'Total Area (ha)': c.totalAcres,
        'Average Yield (kg)': c.avgYield,
        'Total Yield (kg)': c.totalYield,
        'Average Yield per Hectare (kg/ha)': c.avgYieldPerHectare,
        'Total Revenue (ZAR)': c.revenue,
        'Total Cost (ZAR)': c.cost,
        'Total Profit (ZAR)': c.profit,
        'Profit Margin (%)': c.profitMargin,
        'Revenue per Hectare (ZAR/ha)': c.revenuePerHectare,
        'Cost per Hectare (ZAR/ha)': c.costPerHectare,
        'Profit per Hectare (ZAR/ha)': c.profitPerHectare
      })))
      XLSX.utils.book_append_sheet(wb, cpSheet, 'CropPerformance')

      // Enhanced Revenue by Crop sheet with calculations
      const currentYear = new Date().getFullYear()
      const rbcRows = Object.entries(revenueByCrop).map(([crop, vals]) => ({
        'Crop': crop,
        'Year': currentYear,
        'Total Revenue (ZAR)': vals.revenue,
        'Total Cost (ZAR)': vals.cost,
        'Total Profit (ZAR)': vals.profit,
        'Profit Margin (%)': vals.revenue > 0 ? ((vals.profit / vals.revenue) * 100).toFixed(2) : 0,
        'Revenue per Ton (ZAR/t)': vals.revenue > 0 ? (vals.revenue / (vals.revenue / 1000)).toFixed(2) : 0, // Assuming average price per ton
        'Cost per Ton (ZAR/t)': vals.cost > 0 ? (vals.cost / (vals.revenue / 1000)).toFixed(2) : 0,
        'Profit per Ton (ZAR/t)': vals.profit > 0 ? (vals.profit / (vals.revenue / 1000)).toFixed(2) : 0
      }))
      const rbcSheet = XLSX.utils.json_to_sheet(rbcRows)
      XLSX.utils.book_append_sheet(wb, rbcSheet, 'RevenueByCrop')

      // Generate buffer and save file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `farmq_export_${new Date().toISOString().slice(0,10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Export failed', e)
      alert('Export failed — check console for details')
    }
  }

  return (
    <Button 
      onClick={handleExport} 
      className="ml-4 bg-green-600 hover:bg-green-700 flex items-center gap-2"
      title="Export all analytics data to Excel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export Full Report
    </Button>
  )
}
