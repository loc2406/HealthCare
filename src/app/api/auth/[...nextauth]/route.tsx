import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('No credentials provided')
          throw new Error('No credentials provided')
        }
        const { email, password } = credentials
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/user.json`)
          const users = await response.json()
          const userArray = Array.isArray(users) ? users : Object.values(users)
          const matchedUser = userArray.find(
            (user: any) => user.email === email && user.password === password
          )

          if (!matchedUser) {
            throw new Error('Invalid email or password')
          }
          const userPayload = {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            phone: matchedUser.phone,
            role: matchedUser.role,
            accessToken: matchedUser.ACCESS_TOKEN_SECRET,
            refreshToken: matchedUser.REFRESH_TOKEN_SECRET,
          }

          return userPayload
        } catch (error) {
          console.error('Error fetching or processing JSON file:', error)
          throw new Error('Unable to fetch user data')
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { authOptions }
export { handler as GET, handler as POST }
