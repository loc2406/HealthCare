'use client'
import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Menubar from '@/app/components/layout/menubar'
import ChartPage from '@/app/components/chart/page'
import AssignPage from '@/app/components/assign/page'
import LoginPage from '@/app/components/login/page'
import FormPage from '@/app/formList/page'
import FormPageAnswer from '@/app/formList/formListAnswer/page'
import Profile from '@/app/components/profile/page'
export default function Home() {
  const { data: session } = useSession()
  // Trạng thái xác định trang hiện tại
  const [activeView, setActiveView] = useState<string>('chart')

  const auth = session?.user
    ? {
        isAuth: true,
        id: session.user.id ?? null,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : { isAuth: false, name: null, email: null, image: null, id: null }

  // Nếu chưa đăng nhập, hiển thị LoginPage
  if (!auth.isAuth) {
    return <LoginPage />
  }

  // Render nội dung tương ứng với trạng thái activeView
  const renderActiveView = () => {
    switch (activeView) {
      case 'chart':
        return <ChartPage />
      case 'assign':
        return <AssignPage />
      case 'form':
        return <FormPage />
      case 'formanswer':
        return <FormPageAnswer />
      case 'profile':
        return <Profile />
      default:
        return <ChartPage />
    }
  }
  // Fetch Protected Data and generate random code
  const fetchProtectedData = async () => {
    if (!accessToken) {
      setLoginMsg('You must be logged in to access this data.')
      openModal()
      return
    }

    try {
      const response = await fetch('/data.json', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 401 && refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken)
        if (newAccessToken) {
          const retryResponse = await fetch('/data.json', {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          })
          if (retryResponse.ok) {
            const randomData = Math.random().toString(36).substring(2, 15)
            setRandomCode(randomData)
          } else {
            setLoginMsg('Không thể lấy dữ liệu ngay cả sau khi làm mới token.')
          }
        } else {
          setLoginMsg('Làm mới token thất bại, vui lòng đăng nhập lại.')
          signOut()
        }
      } else if (response.ok) {
        const randomData = Math.random().toString(36).substring(2, 15)
        setRandomCode(randomData)
      } else {
        setLoginMsg('Không thể truy cập dữ liệu bảo vệ.')
      }

      // Generate and show a random code
      const randomData = Math.random().toString(36).substring(2, 15)
      setRandomCode(randomData) // Lưu mã ngẫu nhiên vào state
    } catch (error) {
      console.error('Failed to fetch protected data:', error)
      setLoginMsg('Failed to fetch protected data.')
    }
  }

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.accessToken
      } else {
        console.error('Không thể làm mới token.')
        return null
      }
    } catch (error) {
      console.error('Lỗi khi làm mới token:', error)
      return null
    }
  }
  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <div className="dashboard-container-wrapp">
          {/* Menubar */}
          <Menubar
            auth={auth}
            signOut={signOut}
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* Nội dung chính */}
          <main className="main-dashboard-content col-md-9 ms-sm-auto col-lg-10 px-md-4">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  )
}
