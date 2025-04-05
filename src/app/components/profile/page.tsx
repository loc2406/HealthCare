'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import '@/styles/profile.scss'
const Profile = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    email: '',
    role: '',
  })

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Lấy thông tin cá nhân từ server
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/profile')
        setUser(response.data)
        setFormData({
          name: response.data.name,
          phone: response.data.phone,
          avatar: response.data.avatar,
          email: response.data.email,
          role: response.data.role,
        })
        setAvatarPreview(response.data.avatar)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Xử lý thay đổi file ảnh đại diện
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file)) // Hiển thị ảnh trước
    }
  }

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const uploadData = {
      ...formData,
      avatarFile: avatarFile ? await toBase64(avatarFile) : null,
    }

    try {
      const response = await axios.put('/api/profile', uploadData)
      alert(response.data.message)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // Chuyển file sang Base64
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = error => reject(error)
    })

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return <p>User not found or unauthorized</p>
  }

  return (
    <form className="custom-form" id="profile-form" onSubmit={handleSubmit}>
      <h1>Profile</h1>
      <div className="form-group">
        <label className="form-label" htmlFor="name">
          Name:
        </label>
        <input
          type="text"
          id="name"
          className="form-input"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">
          Phone:
        </label>
        <input
          type="tel"
          id="phone"
          className="form-input"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          name="email"
          value={formData.email}
          readOnly
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="role">
          Role:
        </label>
        <input
          type="text"
          id="role"
          className="form-input"
          name="role"
          value={formData.role}
          readOnly
        />
      </div>
      <div className="form-group avatar-section">
        <label className="form-label" htmlFor="avatar">
          Avatar:
        </label>
        <input
          type="file"
          id="avatar"
          className="form-input"
          accept="image/*"
          onChange={handleFileChange}
        />
        {avatarPreview && (
          <div className="avatar-preview">
            <img src={avatarPreview} alt="Avatar Preview" className="avatar-image" />
          </div>
        )}
      </div>
      <button type="submit" className="submit-btn">
        Save
      </button>
    </form>
  )
}

export default Profile
