'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import '../../form/answerForm.scss'
import { FormValues, question, featureType } from '../../../types/formTypes'

Chart.register(...registerables)

const AnswerForm: React.FC = () => {
  const [responses, setResponses] = useState<FormValues[]>([])
  const [groupedAnswers, setGroupedAnswers] = useState<
    Record<string, { question: string; answers: question[] }>
  >({})
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch(`/api/forms/getAnswer?formId=${formId}`)

        const data: FormValues[] = await response.json()

        setResponses(data)

        const filteredResponses = data.filter(res => res.formId === formId)
        const grouped: Record<string, { question: string; answers: question[] }> = {}

        filteredResponses.forEach(res => {
          res.add.forEach(q => {
            if (!grouped[q.question_id]) {
              grouped[q.question_id] = { question: q.question, answers: [] }
            }
            grouped[q.question_id].answers.push(q)
          })
        })

        setGroupedAnswers(grouped)
      } catch (error) {
        console.error('Failed to fetch responses:', error)
      }
    }

    fetchResponses()
  }, [formId])

  const renderChart = (answers: question[], feature: featureType) => {
    const isMultipleChoice = feature === featureType.MultipleChoice
    const isCheckboxes = feature === featureType.Checkboxes

    const choices = answers
      .map(a => (isMultipleChoice ? a.multipleChoice : a.checkboxGroup) || [])
      .flat()
    const counts = choices.reduce((acc: Record<string, number>, choice: string) => {
      acc[choice] = (acc[choice] || 0) + 1
      return acc
    }, {})

    const labels = Object.keys(counts)
    const data = Object.values(counts)

    if (isMultipleChoice) {
      return (
        <Pie
          data={{
            labels,
            datasets: [
              {
                label: 'Responses',
                data,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
              },
            ],
          }}
        />
      )
    }

    if (isCheckboxes) {
      return (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Selections',
                data,
                backgroundColor: '#36a2eb',
              },
            ],
          }}
        />
      )
    }

    return null
  }

  return (
    <div className="answer-form">
      <h1 className="answer-form__title">Response Received {responses.length || '0'} Answers</h1>
      {responses.length > 0 && (
        <h2 className="answer-form__form-name">{responses[0].title || 'No Title Provided'}</h2>
      )}
      {Object.entries(groupedAnswers).map(([questionId, { question, answers }]) => (
        <div key={questionId} className="answer-form__question">
          <h3>{question}</h3>
          <p className="answer-form__total-answers">
            {answers.length} <span>Answer</span>
          </p>
          {answers.length === 0 ? (
            <p>No answers have been provided.</p>
          ) : (
            <>
              {/* Short Answer */}
              {answers[0]?.featureType === featureType.ShortAnswer &&
                answers.map((a, idx) => (
                  <p key={idx}>
                    <strong></strong> {a.shortAnswer || 'No answer provided'}
                  </p>
                ))}
              {/* Paragraph */}
              {answers[0]?.featureType === featureType.Paragraph &&
                answers.map((a, idx) => (
                  <p key={idx}>
                    <strong>Answer {idx + 1}:</strong> {a.paragraph || 'No answer provided'}
                  </p>
                ))}
              {/* Multiple Choice and Checkboxes */}
              {(answers[0]?.featureType === featureType.MultipleChoice ||
                answers[0]?.featureType === featureType.Checkboxes) && (
                <div>{renderChart(answers, answers[0]?.featureType)}</div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default AnswerForm
