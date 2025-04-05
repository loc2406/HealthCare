'use client'
import React, { useState, useEffect } from 'react'
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import { useSearchParams } from 'next/navigation'
import { FormValues, User } from '../../../types/formTypes'
import { validationSchema } from '@/validation/validationSchemaForm'
import '@/app/form/form.scss'
import '@/styles/formlist.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'

const useAutoSave = (values: FormValues, onSaving: (saving: boolean) => void) => {
  useEffect(() => {
    const autoSaveData = async () => {
      try {
        onSaving(true)
        const method = values.formId ? 'PUT' : 'POST'
        const response = await fetch('/api/forms/saveFormData', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error('Failed to save form data')
        }

        const result = await response.json()
        console.log(result.message)
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          onSaving(false)
        }, 2000)
        // Kết thúc lưu
      }
    }

    const debounceTimer = setTimeout(() => {
      autoSaveData()
    }, 2000) // Auto-save sau 2 giây

    return () => clearTimeout(debounceTimer) // Hủy bỏ debounce khi component unmount hoặc khi values thay đổi
  }, [values, onSaving])
}
const FormComponent: React.FC = () => {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
  const user_id = searchParams.get('userId')
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [initialValues, setInitialValues] = useState<FormValues>({
    id: user_id || '',
    user_id: [], // Đã thay đổi từ user_id thành user_ids (mảng để hỗ trợ nhiều người dùng)
    formId: formId || '',
    title: '',
    description: '',
    add: [],
    start_time: new Date(),
    end_time: null,
    progress: [],
    score: [],
  })

  useEffect(() => {
    const fetchFormData = async () => {
      if (formId) {
        const response = await fetch(`/api/forms/getFormData?formId=${formId}&userId=${user_id}`)
        const formData = await response.json()
        if (formData) {
          const endTime = formData.end_time ? new Date(formData.end_time) : null
          setInitialValues({ ...formData, formId: formId, end_time: endTime })
        }
      }
    }
    fetchFormData()
  }, [formId])

  const [users, setUsers] = useState<User[]>([])

  // Fetch user data from JSON file
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('api/forms/getUser') // Adjust path as needed
      const data = await response.json()
      setUsers(data)
    }
    fetchUsers()
  }, [])

  const handleSubmit = async (values: FormValues) => {
    console.log('Data saved successfully:', values)
  }
  const { data: session, status } = useSession() as { data: Session | null; status: string }

  const auth = session?.user
    ? {
        isAuth: true,
        id: session.user.id ?? null,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : { isAuth: false, name: null, email: null, image: null, id: null }

  const handleSignOut: React.MouseEventHandler<HTMLButtonElement> = async event => {
    event.preventDefault() // Ngăn ngừa mặc định nếu cần thiết
    await signOut() // Gọi hàm signOut
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false) // Tự động đóng sidebar khi chiều rộng nhỏ hơn 768px
    } else {
      setIsSidebarOpen(true) // Tự động mở sidebar khi chiều rộng lớn hơn hoặc bằng 768px
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // Gọi hàm để thiết lập trạng thái ban đầu

    // Cleanup để xóa sự kiện khi component unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        !(event.target as HTMLElement).closest('.sidebar') &&
        !(event.target as HTMLElement).closest('.opensidebarmenu')
      ) {
        setIsSidebarOpen(false) // Đóng sidebar
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside) // Cleanup event
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
    }
  }, [session, status, router])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, setFieldTouched }) => {
        useAutoSave(values, setIsSaving)
        return (
          <Form>
            {isSaving && <i className="spinner-border spinner-border-sm icon" role="status"></i>}
            <div className="form-sidebar__toggleIcon_formobile" onClick={toggleSidebar}>
              <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
            </div>
            <div className="form design_form">
              <div className={`form-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="form-sidebar__toggleIcon" onClick={toggleSidebar}>
                  <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
                </div>
                <div className="form-sidebar__sidebarItem">
                  <div className="user-profile mb-4 px-10">
                    <div className="d-flex align-items-center">
                      <div className="profile-image">
                        {auth.image ? (
                          <img
                            src={auth.image}
                            alt="Profile"
                            className="rounded-circle"
                            width="40"
                            height="40"
                          />
                        ) : (
                          <div className="default-avatar rounded-circle">
                            {auth.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="profile-info ms-3">
                        <h6 className="mb-1 text-black">{auth.name || 'User'}</h6>
                        <small className="profile-info__user-email">{auth.email}</small>
                      </div>
                    </div>
                    <button className="btn btn-outline-danger w-100 mt-3" onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </div>
                </div>
                {/* Assign to */}
                <div className="form-sidebar__sidebarItem">
                  <label htmlFor="user_id" className="form-sidebar__sidebarItem-label">
                    Assign To
                  </label>
                  <FieldArray name="user_id">
                    {({ push, remove }) => (
                      <div className="form-sidebar__sidebarItem-fieldArray">
                        {values.user_id.map((assignedUser, index) => (
                          <div key={index} className="form-sidebar__assignContainer">
                            <Field as="select" name={`user_id.${index}`} className="dropdown">
                              <option value="Unassigned">Unassigned</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </Field>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="removeButton"
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => push('')} className="addButton">
                          <i className="bi bi-plus-lg"></i> Add
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Due Date Section */}
                <div className="form-sidebar__sidebarItem">
                  <label htmlFor="due_date" className="form-sidebar__sidebarItem-label">
                    Due Date
                  </label>
                  <Field
                    name="end_time"
                    type="date"
                    className="dateField"
                    value={values.end_time ? values.end_time.toISOString().slice(0, 10) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('end_time', e.target.value ? new Date(e.target.value) : null)
                    }}
                  />
                </div>

                {/* Add Question Button */}
                <div className="form-sidebar__sidebarItem">
                  <FieldArray name="add">
                    {({ push }) => (
                      <button
                        title="Add New Question"
                        type="button"
                        onClick={() =>
                          push({
                            question_id: `Q${values.add.length + 1}`,
                            question: '',
                            featureType: '',
                            shortAnswer: '',
                            paragraph: '',
                            multipleChoice: [],
                            checkboxGroup: [],
                            is_done: false,
                            is_Required: false,
                          })
                        }
                        className="form-sidebar__addQuestionButton"
                      >
                        <i className="bi bi-plus-circle-fill"></i> Add Question
                      </button>
                    )}
                  </FieldArray>
                </div>
              </div>

              <div className="form-mainContent">
                {/* Title and Description Section */}
                <div className="form-mainContent__titleSection">
                  <div className="form-mainContent__labelWithError">
                    <label className="form-mainContent__label">Title</label>
                    <ErrorMessage name="title">
                      {msg => (
                        <span className="form-mainContent__errorIcon">
                          <i className="bi bi-exclamation-circle"></i>
                          <span className="form-mainContent__errorTooltip">{msg}</span>
                        </span>
                      )}
                    </ErrorMessage>
                  </div>
                  <Field
                    name="title"
                    type="text"
                    placeholder="Enter the title"
                    className="form-mainContent__answerField"
                  />
                </div>

                {/* Description */}
                <div className="form-mainContent__descriptionSection">
                  <div className="form-mainContent__labelWithError">
                    <label className="form-mainContent__label">Description</label>
                    <ErrorMessage name="description">
                      {msg => (
                        <span className="form-mainContent__errorIcon">
                          <i className="bi bi-exclamation-circle"></i>
                          <span className="form-mainContent__errorTooltip">{msg}</span>
                        </span>
                      )}
                    </ErrorMessage>
                  </div>
                  <Field
                    name="description"
                    as="textarea"
                    placeholder="Enter description"
                    className="form-mainContent__answerField"
                  />
                </div>

                {/* Questions Section */}
                <FieldArray name="add">
                  {({ remove }) => (
                    <div>
                      {(values.add || []).map((add, index) => (
                        <div key={index} className="form-mainContent__questionSection">
                          <div className="form-mainContent__labelWithError">
                            <label className="form-mainContent__label">Question</label>
                            <ErrorMessage name={`add.${index}.question`}>
                              {msg => (
                                <span className="form-mainContent__errorIcon">
                                  <i className="bi bi-exclamation-circle"></i>
                                  <span className="form-mainContent__errorTooltip">{msg}</span>
                                </span>
                              )}
                            </ErrorMessage>
                          </div>
                          <div className="questionSection-rowQuestion">
                            <Field
                              name={`add.${index}.question`}
                              type="textarea"
                              placeholder="Write your Question"
                              className="answerField-question"
                              onBlur={() => setFieldTouched(`add.${index}.question`)}
                            />
                            <Field
                              as="select"
                              name={`add.${index}.featureType`}
                              className="selectField"
                            >
                              <option value="">Select a feature</option>
                              <option value="Short Answer">Short Answer</option>
                              <option value="Paragraph">Paragraph</option>
                              <option value="Multiple Choice">Multiple Choice</option>
                              <option value="Checkboxes">Checkboxes</option>
                            </Field>
                          </div>
                          {/* Conditional Fields based on feature type */}
                          {add.featureType === 'Short Answer' && (
                            <Field
                              name={`add.${index}.shortAnswer`}
                              type="text"
                              placeholder="Write your short answers"
                              disabled
                              className="answerField"
                            />
                          )}
                          {add.featureType === 'Paragraph' && (
                            <Field
                              name={`add.${index}.paragraph`}
                              as="textarea"
                              placeholder="Write your paragraph answers"
                              disabled
                              className="answerField"
                            />
                          )}
                          {add.featureType === 'Multiple Choice' && (
                            <FieldArray name={`add.${index}.multipleChoice`}>
                              {({ remove, push }) => (
                                <div>
                                  {(add.multipleChoice || []).map((option, optionIndex) => (
                                    <div key={optionIndex} className="optionRow">
                                      <Field
                                        name={`add.${index}.multipleChoice.${optionIndex}`}
                                        placeholder="Enter an option"
                                        className="answerField"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => remove(optionIndex)}
                                        className="removeOption"
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    title="add new options"
                                    type="button"
                                    onClick={() => push('')}
                                    className="addQuestionButton"
                                  >
                                    <i className="bi bi-plus-circle-fill"></i>
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          )}
                          {add.featureType === 'Checkboxes' && (
                            <FieldArray name={`add.${index}.checkboxGroup`}>
                              {({ remove, push }) => (
                                <div>
                                  {(add.checkboxGroup || []).map((option, optionIndex) => (
                                    <div key={optionIndex} className="optionRow">
                                      <Field
                                        name={`add.${index}.checkboxGroup.${optionIndex}`}
                                        placeholder="Enter an option"
                                        className="answerField"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => remove(optionIndex)}
                                        className="removeOption"
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    title="add new options"
                                    type="button"
                                    onClick={() => push('')}
                                    className="addQuestionButton"
                                  >
                                    <i className="bi bi-plus-circle-fill"></i>
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          )}
                          <div className="switchSection">
                            <label htmlFor={`add.${index}.isRequired`} className="ms-2">
                              Required
                            </label>
                            <Field
                              name={`add.${index}.isRequired`}
                              type="checkbox"
                              className="form-check-input"
                              id={`add.${index}.isRequired`}
                              checked={values.add[index].isRequired}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFieldValue(`add.${index}.isRequired`, e.target.checked)
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              title="remove question"
                              className="form__remove-question"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </div>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default FormComponent
