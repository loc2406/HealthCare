import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth' // Nếu sử dụng NextAuth
import {authOptions} from '@/app/api/auth/[...nextauth]/route' // Đường dẫn cấu hình NextAuth
const filePath = path.join(process.cwd(), 'public', 'user.json')

// Đọc dữ liệu từ file
const readData = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return []
  }
}

// Ghi dữ liệu vào file
const writeData = (data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing data:', error)
  }
}

// Lấy danh sách bệnh nhân
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) // Lấy session từ NextAuth
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id // Lấy userId từ session
    const patients = readData() // Đọc toàn bộ dữ liệu từ file

    // Lọc bệnh nhân dựa trên `createdBy` và `role`
    const filteredPatients = patients.filter(
      (patient: { createdBy: string; role: string }) =>
        patient.createdBy === userId && patient.role === 'patient'
    )

    return NextResponse.json(filteredPatients, { status: 200 })
  } catch (error) {
    console.error('Error reading patients:', error)
    return NextResponse.json({ message: 'Error reading patients.' }, { status: 500 })
  }
}

// Thêm bệnh nhân mới
export async function POST(req: Request) {
  try {
    const paitents = readData()
    const newPaitent = await req.json()
    // const role = "patient";
    // const patientID = uuidv4();
    const patientWithId = { id: uuidv4(), ...newPaitent }
    // Kiểm tra trùng email hoặc số điện thoại
    const isDuplicate = paitents.some(
      (patient: { email: string; phone: string }) =>
        patient.email === newPaitent.email || patient.phone === newPaitent.phone
    )
    if (isDuplicate) {
      return NextResponse.json(
        { message: 'Email or phone number already exists.' },
        { status: 400 }
      )
    }

    paitents.push(patientWithId)
    writeData(paitents)
    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 })
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json({ message: 'Error saving user.' }, { status: 500 })
  }
}

// Sửa thông tin bệnh nhân
export async function PUT(req: Request) {
  try {
    const users = readData()
    const updatedUser = await req.json()

    const index = users.findIndex((user: { email: string }) => user.email === updatedUser.email)
    if (index === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 })
    }

    // Cập nhật thông tin
    users[index] = { ...users[index], ...updatedUser }
    writeData(users)
    return NextResponse.json({ message: 'User updated successfully.' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Error updating user.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ message: 'id is required to delete a user.' }, { status: 400 })
    }
    const patients = readData()
    const filteredPatients = patients.filter((patient: { id: string }) => patient.id !== id)
    if (filteredPatients.length === patients.length) {
      return NextResponse.json({ message: 'patient not found.' }, { status: 404 })
    }

    // Ghi dữ liệu mới vào file JSON
    writeData(filteredPatients)

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Error deleting user.' }, { status: 500 })
  }
}
