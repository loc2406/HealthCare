export interface RestingHeartRateValue {
  date: string | null
  value: number
  error: number
}

export interface RestingHeartRateData {
  dateTime: string
  value: RestingHeartRateValue
}
