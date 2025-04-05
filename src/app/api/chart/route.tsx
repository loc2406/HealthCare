import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { BadgeData } from '@/types/chart/badge/interface'
import { DemographicVO2MaxData } from '@/types/chart/vo2-max/interface'
import { ExerciseData } from '@/types/chart/exercise/interface'
import { HeartRateData } from '@/types/chart/heart-rate/interface'
import { TimeInHeartRateZonesData } from '@/types/chart/time-in-heart-rate-zones/interface'
import { RestingHeartRateData } from '@/types/chart/resting-heart-rate/interface'
import { SleepData } from '@/types/chart/sleep/interface'
import { WeightData } from '@/types/chart/weight/interface'
import { SwimLengthsData } from '@/types/chart/swim-lengths/interface'
import { CommonData, isCommonDataArray } from '@/types/chart/common/interface'

// Thêm hàm helper để giới hạn số lượng dữ liệu
const limitDataPoints = (labels: string[], values: any[], limit: number = 50) => {
  const totalPoints = labels.length
  const isLimited = totalPoints > limit

  if (!isLimited)
    return {
      labels,
      values,
      metadata: {
        isLimited: false,
        totalPoints,
      },
    }

  return {
    labels: labels.slice(0, limit),
    values: Array.isArray(values[0])
      ? values.map(arr => arr.slice(0, limit))
      : values.slice(0, limit),
    metadata: {
      isLimited: true,
      totalPoints,
    },
  }
}

// Xử lý CSV file
const processCsvFile = (csvData: any) => {
  const dataValues = csvData.data.map((row: any) => {
    const value = Number(row['Infrared to Red Signal Ratio'])
    return isNaN(value) ? 0 : value
  })
  const dataLabels = csvData.data.map((row: any) => row['timestamp'])

  return setChartDataFormat(dataLabels, dataValues, 'Infrared to Red Signal Ratio')
}

// Xử lý JSON file
const processJsonFile = (jsonData: any, fileName: string) => {
  if (fileName.includes('badge')) {
    try {
      // Sắp xếp dữ liệu theo thời gian
      const sortedData = [...jsonData].sort(
        (a: BadgeData, b: BadgeData) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )

      const dataLabels = sortedData.map((item: BadgeData) => {
        const date = new Date(item.dateTime)
        return date.toLocaleDateString()
      })

      const dataValues = sortedData.map((item: BadgeData) => Number(item.value))

      // Log để kiểm tra
      // console.log('Processing badge data:')
      // console.log('Labels:', dataLabels)
      // console.log('Values:', dataValues)

      return setChartDataFormat(dataLabels, dataValues, 'Badge')
    } catch (error) {
      console.error('Error processing badge data:', error)
      throw error
    }
  } else if (fileName.includes('demographic_vo2_max')) {
    const dataLabels = jsonData.map((item: DemographicVO2MaxData) => item.dateTime)
    const dataValues = jsonData.map(
      (item: DemographicVO2MaxData) => item.value.filteredDemographicVO2Max
    )
    return setChartDataFormat(dataLabels, dataValues, 'VO2 Max')
  } else if (fileName.includes('exercise')) {
    const uniqueLabels = ['sedentary', 'lightly', 'fairly', 'very']

    const dataLabels = jsonData.map((item: ExerciseData) => item.startTime)
    const dataValues = uniqueLabels.map(label =>
      jsonData.map((item: ExerciseData) => {
        const activity = item.activityLevel.find(a => a.name === label)
        return activity ? activity.minutes : 0
      })
    )
    return setChartDataFormat(dataLabels, dataValues, 'Activity Minutes')
  } else if (fileName.includes('resting_heart_rate')) {
    const dataLabels = jsonData.map((item: RestingHeartRateData) => item.dateTime)
    const dataValues = jsonData.map((item: RestingHeartRateData) => item.value.value)
    return setChartDataFormat(dataLabels, dataValues, 'Time in Heart Rate Zones')
  } else if (fileName.includes('heart_rate')) {
    const dataLabels = jsonData.map((item: HeartRateData) => item.dateTime)
    const dataValues = jsonData.map((item: HeartRateData) => item.value.bpm)
    return setChartDataFormat(dataLabels, dataValues, 'Heart Rate (BPM)')
  } else if (fileName.includes('sleep')) {
    const dataLabels = jsonData.map((item: SleepData) => item.startTime)
    const dataValues = jsonData.map((item: SleepData) => item.efficiency)
    return setChartDataFormat(dataLabels, dataValues, 'Sleep Score')
  } else if (fileName.includes('swim_lengths')) {
    const dataLabels = jsonData.map((item: SwimLengthsData) => item.dateTime)
    const dataValues = jsonData.map((item: SwimLengthsData) => item.value.lapDurationSec)
    return setChartDataFormat(dataLabels, dataValues, 'Swim Lengths')
  } else if (fileName.includes('time_in_heart_rate_zones')) {
    const dataLabels = jsonData.map((item: TimeInHeartRateZonesData) => item.dateTime)
    const dataValues = jsonData.map(
      (item: TimeInHeartRateZonesData) => item.value.valuesInZones.BELOW_DEFAULT_ZONE_1
    )
    return setChartDataFormat(dataLabels, dataValues, 'Time in Heart Rate Zones')
  } else if (fileName.includes('weight')) {
    const dataLabels = jsonData.map((item: WeightData) => item.date + '-' + item.time)
    const dataValues = jsonData.map((item: WeightData) => item.weight)
    return setChartDataFormat(dataLabels, dataValues, 'Weight')
  } else if (isCommonDataArray(jsonData)) {
    // Định dạng dữ liệu chung
    const dataLabels = jsonData.map((item: CommonData) => item.dateTime)
    const dataValues = jsonData.map((item: CommonData) => Number(item.value))
    const chartTitle = fileName.split('.')[0].replace(/-\d{4}-\d{2}-\d{2}$/, '')
    return setChartDataFormat(dataLabels, dataValues, chartTitle)
  } else {
    throw new Error('Unsupported JSON file format')
  }
}

// Format dữ liệu chart
const setChartDataFormat = (dataLabels: string[], dataValues: number[], label: string) => {
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return `rgba(${r}, ${g}, ${b}`
  }

  const backgroundColors = dataValues.map(() => `${generateRandomColor()}, 0.2)`)
  const borderColors = dataValues.map(() => `${generateRandomColor()}, 1)`)

  const result = limitDataPoints(dataLabels, dataValues)

  return {
    labels: result.labels,
    datasets: [
      {
        label,
        data: result.values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
    metadata: {
      isLimited: result.values.length === 100,
      totalPoints: dataValues.length,
    },
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = file.name.split('.').pop()?.toLowerCase()

    if (fileType === 'csv') {
      const text = await file.text()
      const csvData = await new Promise(resolve => {
        Papa.parse(text, {
          header: true,
          complete: resolve,
        })
      })
      return NextResponse.json(processCsvFile(csvData))
    } else if (fileType === 'json') {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      return NextResponse.json(processJsonFile(jsonData, file.name))
    }

    throw new Error('Unsupported file type')
  } catch (error) {
    return NextResponse.json({ errors: 'Failed to process file', error }, { status: 400 })
  }
}

export async function GET() {
  try {
    const response = await fetch('http://localhost:3000/chart-example-data.json')
    const data = await response.json()

    return NextResponse.json({
      labels: data.heartRateData.map((item: any) => item.dateTime),
      datasets: [
        {
          label: 'API Data',
          data: data.heartRateData.map((item: any) => Number(item.value.bpm)),
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        },
      ],
    })
  } catch (error) {
    return NextResponse.json({ errors: 'Failed to fetch data', error }, { status: 500 })
  }
}
