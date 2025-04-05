export interface Auth {
  isAuth?: boolean
  id: string
  name: string
  email: string
  image?: string
  age?: number
  phone?: string
  gender?: string
  role: string
  password?: string
  address?: {
    city: string | null
    ward: string | null
    street: string | null
  }
  preferences?: {
    noti_enabled: boolean
    languages: string | null
  }
  apporval_policy?: boolean
  createdBy?: string | null
}
