'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/assign.scss'
import { Patient } from '@/types/patient'
import { signOut, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { Auth } from '@/types/Auth'
export default function AssignPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Auth[]>([])
  const [editingPatient, setEditingPatient] = useState<Auth | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [formData, setFormData] = useState<Auth>({
    id: '', // ID ban đầu rỗng
    email: '',
    gender: 'Nam', // Giá trị mặc định là 'male'
    name: '',
    age: 0,
    phone: '',
    role: 'patient',
    password: '',
    createdBy: '', // ID bác sĩ tạo hồ sơ (sẽ gán từ người dùng đang đăng nhập)
  })
  const { data: session, status } = useSession() as { data: Session | null; status: string }
  const auth: Auth = session?.user
    ? {
        isAuth: true,
        id: session.user.id ?? '',
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? '',
        role: session.user.role ?? '',
      }
    : { isAuth: false, name: '', email: '', image: '', id: '', role: '' }
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/assign')
        if (!res.ok) throw new Error('Failed to fetch patients')
        const data = await res.json()
        setPatients(data)
      } catch (error) {
        console.error('Error fetching patients:', error)
      }
    }

    if (auth.isAuth) {
      fetchPatients()
    }
  }, [auth.isAuth])

  useEffect(() => {
    if (auth.role !== 'admin' && auth.role !== 'doctor') {
      // alert('Bạn không có quyền truy cập vào trang này.');
      router.push('/')
    }
  }, [auth.role, router])

  // Thêm hoặc sửa bệnh nhân
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingPatient ? 'PUT' : 'POST'
    const url = '/api/assign'
    const { id, ...dataToSend } = formData
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dataToSend,
        createdBy: auth.id,
      }),
    })

    if (res.ok) {
      setEditingPatient(null)
      setFormData({
        id: '',
        email: '',
        gender: '',
        name: '',
        age: 0,
        phone: '',
        role: '',
        password: '',
        createdBy: '',
      })
      const updatedPatients = await fetch('/api/assign').then(res => res.json())
      setPatients(updatedPatients)
    } else {
      const error = await res.json()
      alert(error.message)
    }
  }

  // Xóa bệnh nhân
  const handleDelete = async (id: string) => {
    const res = await fetch('/api/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setPatients(patients.filter(patient => patient.id !== id))
    } else {
      const error = await res.json()
      alert(error.message)
    }
  }

  // Hiển thị form chỉnh sửa
  const handleEdit = (patient: Auth) => {
    setEditingPatient(patient)
    setFormData(patient)
  }

  return (
    <div className="assign-container">
      <button
        onClick={() => {
          setIsFormVisible(!isFormVisible)
          if (!isFormVisible) {
            // Đặt lại trạng thái form và chỉnh sửa
            setEditingPatient(null)
            setFormData({
              id: '',
              email: '',
              gender: 'Nam', // Giá trị mặc định là Nam
              name: '',
              age: 0,
              phone: '',
              role: 'patient',
              password: '',
              createdBy: '',
            })
          }
        }}
        className="btn btn-success add-patient-btn"
      >
        {isFormVisible ? 'Đóng form' : 'Thêm bệnh nhân'}
      </button>
      <div className="patient-list-container">
        <h1 className="patient-list-title">Danh sách bệnh nhân</h1>
        <table className="patient-table">
          <thead>
            <tr>
              <th className="patient_tilte_name">Tên</th>
              <th className="patient_tilte_age">Tuổi</th>
              <th className="patient_tilte_gender">Giới tính</th>
              <th className="patient_tilte_email">Email</th>
              <th className="patient_tilte_phone">Số điện thoại</th>
              <th className="patient_tilte_adjust">Tùy chỉnh</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td className="patient_name">{patient.name}</td>
                <td className="patient_age">{patient.age}</td>
                <td className="patient_gender">{patient.gender}</td>
                <td className="patient_email">{patient.email}</td>
                <td className="patient_phone">{patient.phone}</td>
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => {
                      handleEdit(patient)
                      setIsFormVisible(true)
                    }}
                  >
                    Sửa
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(patient.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormVisible && (
        <div className="overlay" onClick={() => setIsFormVisible(false)}>
          <div className="registerform_wrapp" onClick={e => e.stopPropagation()}>
            <h2 className="RegisterTitle">
              {editingPatient ? 'Sửa thông tin' : 'Thêm người dùng'}
            </h2>
            <form onSubmit={handleSubmit} className="form-wrapper">
              <div className="form-group">
                <label htmlFor="name">Tên:</label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Tuổi:</label>
                <input
                  id="age"
                  type="number"
                  className="form-control"
                  placeholder="Nhập tuổi"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Giới tính:</label>
                <select
                  id="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingPatient}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại:</label>
                <input
                  id="phone"
                  type="text"
                  className="form-control"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Vị trí</label>
                <select
                  id="role"
                  className="form-control"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="Patient">Bệnh nhân</option>
                  <option value="Doctor">Bác sĩ</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="password">Mật khẩu:</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingPatient ? 'Cập nhật' : 'Thêm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
