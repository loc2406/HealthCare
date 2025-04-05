'use client'
import React, { useEffect, useState } from 'react'
import '@/app/formList/formList.scss'
import { FormValues } from '../../../types/formTypes'
import { useRouter } from 'next/navigation'
import { AiOutlineSearch } from 'react-icons/ai'
import { useSession } from 'next-auth/react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/formlist.scss'
const FormList: React.FC = () => {
  const [forms, setForms] = useState<FormValues[]>([])
  const router = useRouter()

  const { data: session } = useSession()

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

  // Fetch danh sách form
  const [isFetching, setIsFetching] = useState(false)

  const fetchForms = async () => {
    if (isFetching) return // Nếu đang fetch thì không làm gì cả
    setIsFetching(true)
    try {
      const response = await fetch(`/api/forms/getFormAnswer?userId=${session?.user.id}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setForms(data)
      } else {
        setForms([])
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setIsFetching(false) // Đặt lại trạng thái fetching
    }
  }

  useEffect(() => {
    if (session?.user.id) {
      fetchForms()
    } else {
      console.error('Missing user_id in URL parameters.')
    }
  }, [session?.user.id])

  const openTab = (form: FormValues) => () => {
    // Điều hướng đến DisplayForm với formId từ form
    router.push(`/form/viewForm?formId=${form.formId}&userId=${session?.user.id}`)
  }

  const handleNavigation = () => {
    router.push('/') // Chuyển hướng đến trang formList
  }
  const [searchTerm, setSearchTerm] = useState('')
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formmat = (forms: FormValues): string => {
    if (!forms.end_time) return '' // Kiểm tra null hoặc undefined
    const endTime = new Date(forms.end_time) // Chuyển đổi nếu cần
    return endTime instanceof Date && !isNaN(endTime.getTime()) ? endTime.toLocaleString() : ''
  }

  return (
    <>
      <div className="form_answer">
        <header className="header form_answer_header">
          <div className="header__menu" onClick={handleNavigation}>
            <img src={`/thumbnails/form-icon.jpg`} alt="Logo" className="header__logo" />
            <h1 className="header__title">NEXMIND Form Answer</h1>
          </div>
          <div className="header__search-container">
            <AiOutlineSearch className="header_search-icon" />
            <input
              type="text"
              placeholder="Search Form Answer"
              className="header__search-input"
              value={searchTerm} // Liên kết giá trị với state
              onChange={e => setSearchTerm(e.target.value)} // Cập nhật state khi gõ
            />
          </div>
        </header>
        <div className="form-header">
          <h2>Form Assign</h2>
        </div>
        <div className="form-list">
          {Array.isArray(filteredForms) && filteredForms.length > 0 ? (
            <div className="form-list__grid">
              {filteredForms.map(form => (
                <div key={form.formId} className="form-list__item" onClick={openTab(form)}>
                  {/* Thumbnail */}
                  <div className="form-list__thumbnail">
                    <img
                      src={`/thumbnails/thumbnail.png`}
                      alt="Thumbnail"
                      onError={e => ((e.target as HTMLImageElement).src = '/placeholder.png')}
                    />
                  </div>
                  {/* Thông tin biểu mẫu */}
                  <div className="form-list__content">
                    <h3>{form.title || 'Untitled Form'}</h3>

                    <p>
                      <i className="bi bi-people-fill"></i> {formmat(form)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No form Answer has been assign to you yet.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default FormList
