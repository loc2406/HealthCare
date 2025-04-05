'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const SuccessPage = () => {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Form Submitted Successfully!</h1>
      <p>Thank you for your response. We have received your submission.</p>
      <button
        onClick={() => router.push(`/`)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Back to Home
      </button>
    </div>
  )
}

export default SuccessPage
