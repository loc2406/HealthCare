import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth' // Nếu sử dụng NextAuth
import {authOptions} from '@/app/api/auth/[...nextauth]/route' // Đường dẫn cấu hình NextAuth

// Đường dẫn tới file user.json
const filePath = path.join(process.cwd(), 'public', 'user.json')

// Hàm đọc dữ liệu từ file user.json
const readData = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return []
  }
}

// Hàm ghi dữ liệu vào file user.json
const writeData = (data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing data:', error)
  }
}

// API lấy thông tin cá nhân của người dùng
export async function GET(req: Request) {
  try {
    // Lấy session của người dùng
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Đọc dữ liệu từ file
    const users = readData()
    const user = users.find((u: { id: string }) => u.id === session.user.id)

    if (!user) {
      return NextResponse.json({ message: 'User not found or not authorized' }, { status: 404 })
    }

    // Chỉ lấy các trường cần thiết
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    }

    return NextResponse.json(safeUser, { status: 200 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ message: 'Error fetching user.' }, { status: 500 })
  }
}

// API cập nhật thông tin cá nhân của người dùng
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const users = readData()
    const body = await req.json()

    const index = users.findIndex((u: { id: string }) => u.id === session.user.id)
    if (index === -1) {
      return NextResponse.json({ message: 'User not found or not authorized' }, { status: 404 })
    }

    // Cập nhật thông tin cá nhân
    if (body.name) users[index].name = body.name
    if (body.phone) users[index].phone = body.phone

    // Nếu có file avatar mới, lưu file và cập nhật avatar URL
    if (body.avatarFile) {
      const avatarPath = `/images/avatar/user-${session.user.id}.jpg`
      const avatarFullPath = path.join(process.cwd(), 'public', avatarPath)

      // Lưu file ảnh
      fs.writeFileSync(avatarFullPath, Buffer.from(body.avatarFile, 'base64'))
      users[index].avatar = avatarPath
    }

    writeData(users)
    return NextResponse.json({ message: 'User updated successfully.' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Error updating user.' }, { status: 500 })
  }
}
