interface SleepSummaryLevel {
  count: number
  minutes: number
  thirtyDayAvgMinutes?: number
}

interface SleepLevelSummary {
  deep?: SleepSummaryLevel
  wake?: SleepSummaryLevel
  light?: SleepSummaryLevel
  rem?: SleepSummaryLevel
  restless?: SleepSummaryLevel
  asleep?: SleepSummaryLevel
  awake?: SleepSummaryLevel
}

interface SleepLevelData {
  dateTime: string
  level: 'deep' | 'wake' | 'light' | 'rem' | 'restless' | 'asleep' | 'awake'
  seconds: number
}

interface SleepLevels {
  summary: SleepLevelSummary
  data: SleepLevelData[]
  shortData?: SleepLevelData[]
}

export interface SleepData {
  logId: number
  dateOfSleep: string
  startTime: string
  endTime: string
  duration: number
  minutesToFallAsleep: number
  minutesAsleep: number
  minutesAwake: number
  minutesAfterWakeup: number
  timeInBed: number
  efficiency: number
  type: 'classic' | 'stages'
  infoCode: number
  logType: string
  levels: SleepLevels
  mainSleep: boolean
}
