import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Đường dẫn đến file User.json
    const filePath = path.join(process.cwd(), 'public', 'user.json')

    // Đọc dữ liệu từ file JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const users = JSON.parse(fileContent)

    // Kiểm tra nếu dữ liệu không phải là mảng
    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Invalid data format in User.json' }, { status: 500 })
    }

    // Trả về danh sách users
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error reading User.json:', error)
    return NextResponse.json({ error: 'Failed to read User.json' }, { status: 500 })
  }
}
