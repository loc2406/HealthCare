export interface DemographicVO2MaxData {
  dateTime: string
  value: {
    demographicVO2Max: number
    demographicVO2MaxError: number
    filteredDemographicVO2Max: number
    filteredDemographicVO2MaxError: number
  }
}
