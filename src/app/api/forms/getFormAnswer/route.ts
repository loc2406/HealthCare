import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { FormValues } from '../../../../types/formTypes'

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'formData.json')

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'No forms found' }, { status: 404 })
    }

    const data: FormValues[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') // Lấy userId từ query

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 })
    }

    // Lọc các form theo userId
    const userForms = data.filter(form => form.user_id && form.user_id.includes(userId))

    if (userForms.length === 0) {
      return NextResponse.json({ message: 'No forms found for the given userId' }, { status: 404 })
    }

    // Trả về danh sách các form của userId
    return NextResponse.json(userForms)
  } catch (error) {
    // console.error('Error reading form data:', error)
    return NextResponse.json({ message: 'Error reading forms' }, { status: 500 })
  }
}
