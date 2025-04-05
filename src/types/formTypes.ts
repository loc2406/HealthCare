export interface FormValues {
  id: string
  user_id: string[]
  formId: string
  title: string
  description: string
  add: question[]
  start_time: Date
  end_time: Date | null
  progress: progress[]
  score: score[]
}
export interface question {
  question_id: string
  question: string
  featureType: string
  shortAnswer?: string
  paragraph?: string
  multipleChoice?: string[]
  checkboxGroup?: string[]
  is_done: boolean
  isRequired: boolean
}
export interface progress {
  lessons_completed: number
  questions_answered: number
}
export interface score {
  stress_level: number
  anxiety_level: number
  depression_level: number
}
export enum featureType {
  ShortAnswer = 'Short Answer',
  Paragraph = 'Paragraph',
  MultipleChoice = 'Multiple Choice',
  Checkboxes = 'Checkboxes',
}
export interface User {
  email: string
  id: string
  name: string
  phone: string
  password: string
  role: string
  avatar: string
}
