'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { HeartbeatPage } from '../hearbeat/page'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import '@/styles/login.scss'
export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession() as { data: Session | null; status: string }
  const [loginMsg, setLoginMsg] = useState<string | null>(null)
  const auth = session?.user
    ? {
        isAuth: true,
        id: session.user.id ?? null,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : { isAuth: false, name: null, email: null, image: null, id: null }
  useEffect(() => {
    if (!auth.isAuth) {
      router.push('/')
    }
  }, [auth.isAuth, router])
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res && !res.error) {
        // Đăng nhập thành công
        setLoginMsg('Đăng nhập thành công!')
        router.push('/')
      } else {
        // Đăng nhập thất bại
        setLoginMsg('Thông tin đăng nhập không chính xác.')
      }
    } catch (error) {
      console.error('Login Error:', error)
      setLoginMsg('Có lỗi xảy ra.')
    }
  }

  return (
    <div className="container-fluid">
      <div className="login-page-wrapp row">
        <div className="login-page-container">
          <div className="background-gradient"></div>
          {/* Tiêu đề */}
          <div className="title-section">
            <h1 className="title">NEXTMIND</h1>
            <h1 className="subtitle">DASHBOARD</h1>
          </div>

          {/* Nội dung chính */}
          <div className="content-section">
            <div className="login-container">
              {!session && (
                <div className="login-card">
                  {/* Title */}
                  <h2 className="login-title">Đăng Nhập</h2>

                  {/* Login Message */}
                  {loginMsg && <div className="login-msg">{loginMsg}</div>}

                  {/* Login Form */}
                  <form className="login-form" onSubmit={handleSignIn}>
                    <div className="form-group">
                      <label htmlFor="Email">Địa chỉ Email</label>
                      <input type="email" id="Email" name="email" className="form-control" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="Password">Mật khẩu</label>
                      <input
                        type="password"
                        id="Password"
                        name="password"
                        className="form-control"
                      />
                    </div>

                    <button type="submit" className="btn-submit">
                      Đăng Nhập
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="login-divider">hoặc đăng nhập bằng</div>

                  {/* Social Login Buttons */}
                  <div className="social-login">
                    <button
                      className="btn-social github"
                      onClick={() => signIn('github', { callbackUrl: '/' })}
                    >
                      <FaGithub className="icon" />
                      Github
                    </button>
                    <button
                      className="btn-social google"
                      onClick={() => signIn('google', { callbackUrl: '/' })}
                    >
                      <FaGoogle className="icon" />
                      Google
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="heartbeat-section">
              <HeartbeatPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
