export interface HeartRateData {
  dateTime: string
  value: {
    bpm: number
    confidence: number
  }
}
