export interface ValuesInZones {
  BELOW_DEFAULT_ZONE_1: number
  IN_DEFAULT_ZONE_1: number
  IN_DEFAULT_ZONE_2: number
  IN_DEFAULT_ZONE_3: number
}

export interface TimeInHeartRateZonesValue {
  valuesInZones: ValuesInZones
}

export interface TimeInHeartRateZonesData {
  dateTime: string
  value: TimeInHeartRateZonesValue
}
