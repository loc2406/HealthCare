export interface ActivityLevel {
  minutes: number
  name: string
}

interface HeartRateZone {
  name: string
  min: number
  max: number
  minutes: number
  caloriesOut: number
}

interface MinutesInHeartRateZone {
  minutes: number
  zoneName: string
  order: number
  type: string
  minuteMultiplier: number
}

interface ActiveZoneMinutes {
  totalMinutes: number
  minutesInHeartRateZones: MinutesInHeartRateZone[]
}

interface ManualValuesSpecified {
  calories: boolean
  distance: boolean
  steps: boolean
}

export interface ExerciseData {
  logId: number
  activityName: string
  activityTypeId: number
  activityLevel: ActivityLevel[]
  averageHeartRate: number
  calories: number
  duration: number
  activeDuration: number
  logType: string
  manualValuesSpecified: ManualValuesSpecified
  heartRateZones: HeartRateZone[]
  activeZoneMinutes: ActiveZoneMinutes
  lastModified: string
  startTime: string
  originalStartTime: string
  originalDuration: number
  hasGps: boolean
  shouldFetchDetails: boolean
  hasActiveZoneMinutes: boolean
}
