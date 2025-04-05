// app/displayform/page.tsx hoặc pages/displayform.tsx
'use client'
import React from 'react'
import DisplayForm from '@/app/components/form/ViewForm' // Đảm bảo đúng đường dẫn đến file DisplayForm
const DisplayFormPage: React.FC = () => {
  return (
    <div>
      <DisplayForm />
    </div>
  )
}

export default DisplayFormPage
