export interface CommonData {
  dateTime: string
  value: string
}

export const isCommonDataArray = (data: any): data is CommonData[] => {
  if (!Array.isArray(data)) return false

  return data.every(
    item =>
      typeof item === 'object' &&
      item !== null &&
      'dateTime' in item &&
      'value' in item &&
      typeof item.dateTime === 'string' &&
      typeof item.value === 'string'
  )
}

export const sampleTimeSeriesData = (data: CommonData[], targetPoints: number = 50) => {
  if (data.length <= targetPoints) return data

  const interval = Math.ceil(data.length / targetPoints)
  const sampledData: CommonData[] = []

  for (let i = 0; i < data.length; i += interval) {
    // Lấy giá trị trung bình của khoảng
    const slice = data.slice(i, Math.min(i + interval, data.length))
    const avgValue =
      slice.reduce((sum, item) => {
        return sum + (typeof item.value === 'string' ? parseFloat(item.value) : item.value)
      }, 0) / slice.length

    sampledData.push({
      dateTime: data[i].dateTime,
      value: avgValue.toFixed(2),
    })
  }

  return sampledData
}
