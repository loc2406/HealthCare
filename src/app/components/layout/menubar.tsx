'use client'
import React, { useState, useEffect } from 'react'
import '@/styles/menubar.scss'
import { Auth } from '@/types/Auth'
import axios from 'axios'
interface MenubarProps {
  // auth: {
  //   isAuth: boolean
  //   id: string | null
  //   name: string | null
  //   email: string | null
  //   image: string | null
  // }
  auth: Auth
  signOut: () => void
  activeView: string
  setActiveView: (view: string) => void
}
export default function Menubar({ auth, signOut, activeView, setActiveView }: MenubarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/profile')
        setUser(response.data) // Lưu dữ liệu người dùng
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
      }
    }

    fetchUser()
  }, [])

  // Xử lý đóng sidebar khi nhấn ngoài vùng sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        !(event.target as HTMLElement).closest('.form-sidebar') &&
        !(event.target as HTMLElement).closest('.opensidebarmenu')
      ) {
        setIsSidebarOpen(false) // Đóng sidebar
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside) // Cleanup event
  }, [isSidebarOpen])

  return (
    <div className="sidebarmenucontainer">
      {/* Nút mở menu */}
      <button className="opensidebarmenu btn btn-primary" onClick={toggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Sidebar */}
      <nav
        className={`col-md-3 col-lg-2 d-md-flex sidebar position-fixed h-100 ${
          isSidebarOpen ? 'open' : ''
        }`}
      >
        <div className="sidebar-sticky w-100">
          <div className="logo-container text-center py-4">
            <h2 className="text-white">NEXMIND</h2>
          </div>

          <div className="user-profile mb-4 px-3">
            <div className="d-flex align-items-center">
              <div className="profile-image">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt="Profile"
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                ) : (
                  <div className="default-avatar rounded-circle">{auth.name?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div className="profile-info ms-3">
                <h6 className="mb-1 text-white">{auth.name || 'User'}</h6>
                <small className="profile-info__user-email">{auth.email}</small>
              </div>
            </div>
            <button className="btn btn-outline-danger w-100 mt-3" onClick={signOut}>
              Đăng xuất
            </button>
          </div>

          <div className="chart-type px-3">
            <div className="chart-type__options">
              <button
                className={`chart-type__option ${
                  activeView === 'chart' ? 'chart-type__option--active' : ''
                }`}
                onClick={() => setActiveView('chart')}
              >
                <i className="fas fa-chart-line"></i>
                Chart View
              </button>
              <button
                className={`chart-type__option ${
                  activeView === 'form' ? 'chart-type__option--active' : ''
                }`}
                onClick={() => setActiveView('form')}
              >
                <i className="fas fa-table-list"></i>
                Form Home
              </button>
              <button
                className={`chart-type__option ${
                  activeView === 'formanswer' ? 'chart-type__option--active' : ''
                }`}
                onClick={() => setActiveView('formanswer')}
              >
                <i className="fas fa-table-list"></i>
                Form Answer
              </button>
              {user?.role === 'admin' || user?.role === 'doctor' ? (
                <button
                  className={`chart-type__option ${
                    activeView === 'assign' ? 'chart-type__option--active' : ''
                  }`}
                  onClick={() => setActiveView('assign')}
                >
                  <i className="fa-solid fa-plus"></i>
                  Assign
                </button>
              ) : null}
              {/* <button
                className={`chart-type__option ${
                  activeView === 'assign' ? 'chart-type__option--active' : ''
                }`}
                onClick={() => setActiveView('assign')}
              >
                <i className="fa-solid fa-plus"></i>
                Assign
              </button> */}
              <button
                className={`chart-type__option ${
                  activeView === 'profile' ? 'chart-type__option--active' : ''
                }`}
                onClick={() => setActiveView('profile')}
              >
                <i className="fa-solid fa-user"></i>
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
