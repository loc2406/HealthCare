import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Import các kiểu dữ liệu từ file formTypes
import { FormValues, featureType, question } from '../../../../types/formTypes'

// Kiểu FormResponse để nhận và lưu trữ form
type FormResponse = FormValues

// Hàm lọc câu hỏi dựa trên featureType
const filterQuestions = (questions: FormValues['add']) => {
  return questions.map(question => {
    const filteredQuestion: question = {
      question_id: question.question_id,
      question: question.question,
      featureType: question.featureType,
      is_done: question.is_done,
    }

    // Lọc các trường theo từng featureType
    if (question.featureType === featureType.ShortAnswer) {
      filteredQuestion.shortAnswer = question.shortAnswer || ''
    } else if (question.featureType === featureType.Paragraph) {
      filteredQuestion.paragraph = question.paragraph || ''
    } else if (question.featureType === featureType.MultipleChoice) {
      filteredQuestion.multipleChoice = question.multipleChoice || []
    } else if (question.featureType === featureType.Checkboxes) {
      filteredQuestion.checkboxGroup = question.checkboxGroup || []
    }

    return filteredQuestion
  })
}

// Hàm xử lý POST request
export async function POST(request: Request) {
  try {
    const formData: FormResponse = await request.json() // Lấy dữ liệu form từ client
    const filePath = path.join(process.cwd(), 'data', 'responses.json')

    // Đảm bảo thư mục lưu trữ tồn tại
    const dataDirectory = path.dirname(filePath)
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true })
    }

    // Đọc dữ liệu hiện có từ file JSON (nếu có)
    let existingData: FormResponse[] = []
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      if (fileContent) {
        existingData = JSON.parse(fileContent)
      }
    }

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!formData.formId || !formData.add || !Array.isArray(formData.add)) {
      return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
    }

    // Lọc dữ liệu câu hỏi
    const filteredFormData = {
      ...formData,
      add: filterQuestions(formData.add),
    }

    // Lưu dữ liệu mới vào responses.json
    existingData.push(filteredFormData)
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2))

    return NextResponse.json({
      message: 'Form answer created successfully',
      formId: filteredFormData.formId,
    })
  } catch (error) {
    console.error('Error saving form:', error)
    return NextResponse.json(
      {
        message: 'Error saving form',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
