'use client'
import React, { useEffect, useState } from 'react'
import '../../formList/formList.scss'
import { FormValues } from '../../../types/formTypes'
import { useRouter, useSearchParams } from 'next/navigation'
import { v4 } from 'uuid'
import { AiOutlineSearch } from 'react-icons/ai'
import { useSession } from 'next-auth/react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/formlist.scss'
const FormList: React.FC = () => {
  const [forms, setForms] = useState<FormValues[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [, setIsDeleting] = useState<string | null>(null)
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
  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/forms/getFormList?userId=${session?.user.id}`)

      const data = await response.json()
      if (Array.isArray(data)) {
        setForms(data)
      } else {
        setForms([])
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    }
  }

  useEffect(() => {
    if (session?.user.id && forms.length === 0) {
      fetchForms()
    } else {
      console.error('Missing user_id in URL parameters.')
    }
  }, [session?.user.id])
  // Tạo form mới
  const createNewForm = async () => {
    if (isCreating) return
    setIsCreating(true)

    const newForm: FormValues = {
      id: session?.user.id || '',
      user_id: ['Unassigned'],
      formId: v4(),
      title: '',
      description: '',
      add: [
        {
          question_id: 'Q1',
          question: '',
          featureType: '',
          shortAnswer: '',
          paragraph: '',
          multipleChoice: [],
          checkboxGroup: [],
          is_done: false,
          isRequired: false,
        },
      ],
      start_time: new Date(),
      end_time: null,
      progress: [
        {
          lessons_completed: 0,
          questions_answered: 0,
        },
      ],
      score: [
        {
          stress_level: 0,
          anxiety_level: 0,
          depression_level: 0,
        },
      ],
    }
    console.log('Form Data to Save:', newForm)

    try {
      await fetch('/api/forms/saveFormData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })

      router.push(`/form?formId=${newForm.formId}&userId=${session?.user.id}`)
    } catch (error) {
      console.error('Error creating form:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Đổi tên form
  const renameForm = async (form: FormValues, event: React.MouseEvent) => {
    event.stopPropagation()
    const newTitle = window.prompt('Nhập tên mới cho biểu mẫu:', form.title || '')
    if (newTitle) {
      try {
        await fetch(`/api/forms/${form.formId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        })
        setForms(prevForms =>
          prevForms.map(f => (f.formId === form.formId ? { ...f, title: newTitle } : f))
        )
      } catch (error) {
        console.error('Error renaming form:', error)
      }
    }
  }

  // Xóa form
  const deleteForm = async (form: FormValues, event: React.MouseEvent) => {
    event.stopPropagation()
    if (window.confirm(`Bạn có chắc chắn muốn xóa biểu mẫu "${form.title || 'Untitled Form'}"?`)) {
      setIsDeleting(form.formId)
      try {
        await fetch(`/api/forms/${form.formId}`, {
          method: 'DELETE',
        })
        setForms(prevForms => prevForms.filter(f => f.formId !== form.formId))
      } catch (error) {
        console.error('Xóa biểu mẫu thất bại:', error)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const openTab = (form: FormValues) => () => {
    // Điều hướng đến DisplayForm với formId từ form
    router.push(`/form?formId=${form.formId}&userId=${session?.user.id}`)
  }
  const handleNavigation = () => {
    router.push('/') // Chuyển hướng đến trang formList
  }

  const [searchTerm, setSearchTerm] = useState('')
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const formmat = (forms: FormValues): string => {
    if (!forms.start_time) return '' // Kiểm tra null hoặc undefined
    const startTime = new Date(forms.start_time) // Chuyển đổi nếu cần
    return startTime instanceof Date && !isNaN(startTime.getTime())
      ? startTime.toLocaleString()
      : ''
  }

  return (
    <>
      <div className="form_create">
        <header className="header form_create_header">
          <div className="header__menu" onClick={handleNavigation}>
            <img src={`/thumbnails/form-icon.jpg`} alt="Logo" className="header__logo" />
            <h1 className="header__title">NEXMIND Form Create</h1>
          </div>
          <div className="header__search-container">
            <AiOutlineSearch className="header_search-icon" />
            <input
              type="text"
              placeholder="Search Form"
              className="header__search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>
        <div className="form-header">
          <h1>Form</h1>
          <button
            className="form-header__create-button"
            onClick={createNewForm}
            disabled={isCreating}
          >
            {isCreating ? 'Đang tạo...' : '+ Biểu mẫu trống'}
          </button>
        </div>
        <div className="form-list">
          <h2>Form Recent</h2>
          {Array.isArray(filteredForms) && filteredForms.length > 0 ? (
            <div className="form-list__grid">
              {filteredForms.map(form => (
                <div key={form.formId} className="form-list__item" onClick={openTab(form)}>
                  <div className="form-list__thumbnail">
                    <img
                      src={`/thumbnails/thumbnail.png`}
                      alt="Thumbnail"
                      onError={e => ((e.target as HTMLImageElement).src = '/placeholder.png')}
                    />
                  </div>
                  <div className="form-list__content">
                    <h3>{form.title || 'Untitled Form'}</h3>
                    <p>
                      <i className="bi bi-people-fill"></i> {formmat(form)}
                    </p>
                  </div>
                  <div className="form-list__menu">
                    <button className="form-list__menu-button">⋮</button>
                    <div className="form-list__menu-options">
                      <button onClick={e => renameForm(form, e)}>Rename</button>
                      <button onClick={e => deleteForm(form, e)}>Delete</button>
                      <button onClick={() => window.open(`/form?formId=${form.formId}`, '_blank')}>
                        Open New Tab
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No form has been created yet.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default FormList
