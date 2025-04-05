'use client'
import React, { useState } from 'react'
import '../../form/formHeader.scss'
import { useRouter, useSearchParams } from 'next/navigation'
import Modal from 'react-modal'

if (typeof window !== 'undefined') {
  // Ngăn chặn lỗi trong môi trường server
  Modal.setAppElement(document.body)
}
interface FormHeaderProps {
  activeTab: 'questions' | 'answers'
  onTabChange: (tab: 'questions' | 'answers') => void
}

const FormHeader: React.FC<FormHeaderProps> = ({ activeTab, onTabChange }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const goToDisplayForm = () => {
    if (formId) {
      const newTab = window.open(`/form/viewForm?formId=${formId}`, '_blank')
      if (newTab) newTab.focus()
    } else {
      alert('Form ID không hợp lệ!')
    }
  }

  const handleNavigation = () => {
    router.push(`/`)
  }

  const handleSendEmail = async () => {
    if (!email) {
      alert('Please type the email!')
      return
    }

    try {
      const formLink = window.location.origin + `/form/viewForm?formId=${formId}`

      const response = await fetch('/api/forms/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, formLink }),
      })

      if (response.ok) {
        alert('Email sent successfully!')
        setModalIsOpen(false)
      } else {
        const errorData = await response.json()
        alert(`Lỗi: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Email sent erorr!')
    }
  }

  return (
    <div className="header-Container header-design">
      <div className="header-Container__leftSection" onClick={handleNavigation} title="HomePage">
        <img src={`/thumbnails/form-icon.jpg`} alt="Logo" className="logo" />
        <span className="header-Container__formTitle">NEXMIND Form Page</span>
      </div>

      <div className="header-Container__middleSection">
        <button
          className={`tabButton ${activeTab === 'questions' ? 'activeTab' : ''}`}
          onClick={() => onTabChange('questions')}
        >
          Question
        </button>
        <button
          className={`tabButton ${activeTab === 'answers' ? 'activeTab' : ''}`}
          onClick={() => onTabChange('answers')}
        >
          Answer
        </button>
      </div>
      <div className="header-Container__rightSection">
        <button type="button" onClick={goToDisplayForm} className="rightSection__previewButton">
          <i className="bi bi-eye" style={{ fontSize: '30px' }} title="Preview"></i>
        </button>
        <button className="rightSection__submitButton" onClick={() => setModalIsOpen(true)}>
          Send
        </button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Send Form"
      >
        <button className="closeButton" onClick={() => setModalIsOpen(false)}>
          &times; {/* Biểu tượng "X" */}
        </button>
        <h2>Send Form</h2>
        <form
          onSubmit={e => {
            e.preventDefault() // Ngăn chặn reload trang
            handleSendEmail() // Gọi hàm gửi email
          }}
        >
          <div>
            <label htmlFor="email">To:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="subject">Title:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="message">Content:</label>
            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          <button type="submit">Send</button>
        </form>
      </Modal>
    </div>
  )
}

export default FormHeader
