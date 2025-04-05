export interface SwimLengthsValue {
  lapDurationSec: number
  strokeCount: number
  swimStrokeType: string
  swimAlgorithmType: string
}

export interface SwimLengthsData {
  dateTime: string
  value: SwimLengthsValue
}
