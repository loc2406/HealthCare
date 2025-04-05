import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { FormValues, featureType } from '../../../../types/formTypes'

// Hàm đọc dữ liệu từ file JSON
const readFileData = (filePath: string): FormValues[] => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return fileContent ? JSON.parse(fileContent) : []
  }
  return []
}

// Hàm ghi dữ liệu vào file JSON
const writeFileData = (filePath: string, data: FormValues[]) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// Hàm lọc dữ liệu theo featureType
const filterQuestions = (questions: FormValues['add']) => {
  return questions.map(question => {
    const base = {
      question_id: question.question_id,
      question: question.question,
      featureType: question.featureType,
      is_done: question.is_done,
      isRequired: question.isRequired,
    }

    // Lọc theo từng featureType
    if (question.featureType === featureType.ShortAnswer) {
      return { ...base, shortAnswer: question.shortAnswer }
    } else if (question.featureType === featureType.Paragraph) {
      return { ...base, paragraph: question.paragraph }
    } else if (question.featureType === featureType.MultipleChoice) {
      return { ...base, multipleChoice: question.multipleChoice }
    } else if (question.featureType === featureType.Checkboxes) {
      return { ...base, checkboxGroup: question.checkboxGroup }
    }

    return base // Trả về cơ bản nếu không có featureType hợp lệ
  })
}

// Hàm xử lý POST request
export async function POST(request: Request) {
  try {
    const formData: FormValues = await request.json()
    const filePath = path.join(process.cwd(), 'data', 'formData.json')

    const data = readFileData(filePath)

    // Lọc các câu hỏi trước khi thêm vào
    const filteredFormData = {
      ...formData,
      add: filterQuestions(formData.add),
    }

    // Thêm form mới
    data.push(filteredFormData)

    // Ghi dữ liệu vào file JSON
    writeFileData(filePath, data)

    return NextResponse.json({ message: 'Form created successfully', formId: formData.formId })
  } catch (error) {
    console.error('Error saving form:', error)
    return NextResponse.json({ message: 'Error saving form' }, { status: 500 })
  }
}

// Hàm xử lý PUT request
export async function PUT(request: Request) {
  try {
    const formData: FormValues = await request.json()
    const filePath = path.join(process.cwd(), 'data', 'formData.json')

    const data = readFileData(filePath)

    // Tìm form cần cập nhật
    const index = data.findIndex(item => item.formId === formData.formId)

    if (index !== -1) {
      // Lọc các câu hỏi trước khi cập nhật
      const filteredFormData = {
        ...formData,
        add: filterQuestions(formData.add),
      }

      // Cập nhật form
      data[index] = filteredFormData

      // Ghi dữ liệu vào file JSON
      writeFileData(filePath, data)

      return NextResponse.json({ message: 'Form updated successfully', formId: formData.formId })
    } else {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json({ message: 'Error updating form' }, { status: 500 })
  }
}
