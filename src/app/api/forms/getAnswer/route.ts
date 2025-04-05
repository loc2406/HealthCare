import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    // Đường dẫn đến file responses.json
    const filePath = path.join(process.cwd(), 'data', 'responses.json')

    // Đọc dữ liệu từ file JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    // Kiểm tra nếu dữ liệu không phải là mảng
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format in responses.json' }, { status: 500 })
    }

    // Lấy formId từ tham số truy vấn
    const url = new URL(req.url)
    const formId = url.searchParams.get('formId')

    // Lọc dữ liệu theo formId
    const filteredResponses = data.filter(
      (response: { formId: string }) => response.formId === formId
    )

    // Nếu không có phản hồi nào cho formId, trả về mảng rỗng
    if (filteredResponses.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // Trả về dữ liệu đã lọc
    return NextResponse.json(filteredResponses, { status: 200 })
  } catch (error) {
    console.error('Error reading responses.json:', error)
    return NextResponse.json({ error: 'Failed to read responses.json' }, { status: 500 })
  }
}
