import jwt from 'jsonwebtoken'
// import User  from 'next-auth';
interface User {
  id: number
  name: string
  email: string
  password: string
  user_name: string
  full_name: string
  address: {
    city: string
    ward: string
    street: string
  }
  phone: string
  date_of_birth: Date
  age: number
  role: string
  preferences: {
    noti_enabled: boolean
    languages: string
  }
  avatar_url: string
  apporval_policy: boolean
}

export function generateAccessToken(user: User) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  )
}
export function generateRefreshToken(user: User) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
}
