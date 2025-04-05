'use client'
import React, { useState } from 'react'
import FormHeader from './formHeader'
import Form from './form'
import AnswerForm from './answerForm'
import '../../form/formPage.scss'

const FormPage: React.FC = () => {
  // State để theo dõi tab hiện tại
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions')

  // Hàm xử lý khi nhấn vào tab
  const handleTabChange = (tab: 'questions' | 'answers') => {
    setActiveTab(tab)
  }

  return (
    <div>
      {/* Phần Header */}
      <FormHeader activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Nội dung hiển thị dựa trên tab hiện tại */}
      <div className="content-design">
        {activeTab === 'questions' && <Form />}
        {activeTab === 'answers' && <AnswerForm />}
      </div>
    </div>
  )
}

export default FormPage
