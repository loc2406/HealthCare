import jwt from 'jsonwebtoken'
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string
export function generateAccessToken(payload: object) {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' })
}
export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' })
}
export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, accessTokenSecret)
  } catch (error) {
    return console.error(error)
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, refreshTokenSecret)
  } catch (error) {
    return console.error(error)
  }
}
