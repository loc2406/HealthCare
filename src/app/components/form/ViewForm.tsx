'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FormValues, featureType, question } from '../../../types/formTypes'
import '../../form/viewform/ViewForm.scss'

const DisplayFormData: React.FC = () => {
  const [formData, setFormData] = useState<FormValues | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0) // Thêm state để lưu tiến trình
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
  const router = useRouter()
  const user_id = searchParams.get('userId')

  // Lấy dữ liệu form từ API
  useEffect(() => {
    const fetchData = async () => {
      if (formId) {
        const response = await fetch(`/api/forms/getFormData?formId=${formId}&userId=${user_id}`)
        const data = await response.json()
        setFormData(data)
      }
    }
    fetchData()
  }, [formId, user_id])

  // Tính giá trị initialValues cho Formik
  const initialValues = {
    answers:
      formData?.add?.map(question => {
        switch (question.featureType) {
          case featureType.ShortAnswer:
          case featureType.Paragraph:
            return ''
          case featureType.MultipleChoice:
            return ''
          case featureType.Checkboxes:
            return []
          default:
            return ''
        }
      }) || [],
  }

  type FormSubmitValues = {
    answers: (string | string[])[]
  }

  // Hàm tính tiến trình
  const calculateProgress = (answers: (string | string[])[], questions: question[]): number => {
    let answeredCount = 0
    const requiredQuestions = questions.filter(q => q.isRequired)

    requiredQuestions.forEach((question, index) => {
      const answer = answers[index]
      switch (question.featureType) {
        case featureType.ShortAnswer:
        case featureType.Paragraph:
          if (typeof answer === 'string' && answer.trim() !== '') {
            answeredCount++
          }
          break
        case featureType.MultipleChoice:
          if (typeof answer === 'string' && answer.length > 0) {
            answeredCount++
          }
          break
        case featureType.Checkboxes:
          if (Array.isArray(answer) && answer.length > 0) {
            answeredCount++
          }
          break
        default:
          break
      }
    })

    return requiredQuestions.length
      ? Math.round((answeredCount / requiredQuestions.length) * 100)
      : 100
  }

  const handleSubmit = async (values: FormSubmitValues) => {
    const unansweredRequiredQuestions = formData?.add?.filter((question, index) => {
      if (!question.isRequired) return false // Bỏ qua câu hỏi không bắt buộc
      const answer = values.answers[index]
      switch (question.featureType) {
        case featureType.ShortAnswer:
        case featureType.Paragraph:
          return !(typeof answer === 'string' && answer.trim() !== '')
        case featureType.MultipleChoice:
          return !(typeof answer === 'string' && answer.length > 0)
        case featureType.Checkboxes:
          return !(Array.isArray(answer) && answer.length > 0)
        default:
          return false
      }
    })

    if (unansweredRequiredQuestions && unansweredRequiredQuestions.length > 0) {
      alert('Please answer all required questions.')
      return
    }

    const formDataToSubmit = {
      user_id: formData?.user_id,
      formId: formId,
      title: formData?.title,
      description: formData?.description,
      add:
        formData?.add?.map((question, question_id) => {
          const answer = values.answers[question_id]
          const is_done = answer !== undefined && answer.length > 0

          return {
            ...question,
            is_done: is_done,
            question_id: question.question_id,
            ...(question.featureType === featureType.ShortAnswer && { shortAnswer: answer || '' }),
            ...(question.featureType === featureType.Paragraph && { paragraph: answer || '' }),
            ...(question.featureType === featureType.MultipleChoice && {
              multipleChoice: answer ? [answer] : [],
            }),
            ...(question.featureType === featureType.Checkboxes && { checkboxGroup: answer || [] }),
          }
        }) || [],
      start_time: formData?.start_time,
      end_time: formData?.end_time,
      progress: [
        {
          lessons_completed: progressPercentage === 100 ? 1 : 0,
          questions_answered: progressPercentage,
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

    try {
      const response = await fetch('/api/forms/saveFormResponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSubmit),
      })

      if (response.ok) {
        router.push(`/form/success`)
      } else {
        console.error('Error saving form responses')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="displayForm-Container">
      {formData ? (
        <>
          <div className="displayForm-Container__titleSection">
            <h1 className="displayForm-Container__titleSection-title">{formData.title}</h1>
            <p className="displayForm-Container__titleSection-description">
              {formData.description}
            </p>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${progressPercentage}%` }} />
              <span className="progress-bar__percentage">{progressPercentage}%</span>
            </div>
          </div>
          <Formik
            initialValues={initialValues}
            onSubmit={values => {
              handleSubmit(values)
            }}
          >
            {({ values }) => {
              // Cập nhật tiến trình khi câu trả lời thay đổi
              useEffect(() => {
                if (formData?.add) {
                  const progress = calculateProgress(values.answers, formData.add)
                  setProgressPercentage(progress)
                }
              }, [values.answers, formData?.add])

              return (
                <Form>
                  {formData.add && formData.add.length > 0 ? (
                    formData.add.map((question, index) => (
                      <div key={index} className="displayForm-Container__questionSection">
                        <h3 className="displayForm-Container__questionSection-Text">
                          {question.question}
                          {question.isRequired && <span className="required">*</span>}
                        </h3>
                        {question.featureType === featureType.ShortAnswer && (
                          <Field
                            name={`answers.${index}`}
                            placeholder="Type your answer"
                            className="displayForm-Container__questionSection-answerField"
                          />
                        )}
                        {question.featureType === featureType.Paragraph && (
                          <Field
                            as="textarea"
                            name={`answers.${index}`}
                            placeholder="Type your answer"
                            className="displayForm-Container__questionSection-answerField"
                          />
                        )}
                        {question.featureType === featureType.Checkboxes && (
                          <div role="group">
                            {question.checkboxGroup?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="displayForm-Container__questionSection-option"
                              >
                                <label>
                                  <Field
                                    type="checkbox"
                                    name={`answers.${index}`}
                                    value={option}
                                    className="displayForm-Container__questionSection-checkbox"
                                  />
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.featureType === featureType.MultipleChoice && (
                          <div role="group">
                            {question.multipleChoice?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="displayForm-Container__questionSection-option"
                              >
                                <label>
                                  <Field
                                    type="radio"
                                    name={`answers.${index}`}
                                    value={option}
                                    className="displayForm-Container__questionSection-radio"
                                  />
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        <ErrorMessage
                          name={`answers.${index}`}
                          component="span"
                          className="error"
                        />
                      </div>
                    ))
                  ) : (
                    <p>No questions available.</p>
                  )}
                  <button type="submit" className="displayForm-Container__submitButton">
                    Submit Answers
                  </button>
                </Form>
              )
            }}
          </Formik>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default DisplayFormData
