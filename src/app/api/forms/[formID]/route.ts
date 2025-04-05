import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { FormValues } from '../../../../types/formTypes'

const filePath = path.join(process.cwd(), 'data', 'formData.json')

export async function GET(req: NextRequest, { params }: { params: { formID: string } }) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const form = data.find((item: FormValues) => item.formId === params.formID)

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json(form)
}

export async function DELETE(req: NextRequest, { params }: { params: { formID: string } }) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const formIndex = data.findIndex((item: FormValues) => item.formId === params.formID)

  if (formIndex === -1) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const deletedForm = data.splice(formIndex, 1)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  return NextResponse.json(deletedForm[0])
}

export async function PATCH(req: NextRequest, { params }: { params: { formID: string } }) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const formIndex = data.findIndex((item: FormValues) => item.formId === params.formID)

  if (formIndex === -1) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  try {
    const { title } = await req.json() // Lấy dữ liệu từ body của request
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Cập nhật tiêu đề của biểu mẫu
    data[formIndex].title = title

    // Ghi lại dữ liệu đã được cập nhật vào file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return NextResponse.json({
      message: 'Form title updated successfully',
      updatedForm: data[formIndex],
    })
  } catch (error) {
    console.error('Error updating form title:', error)
    return NextResponse.json({ error: 'Failed to update form title' }, { status: 500 })
  }
}
