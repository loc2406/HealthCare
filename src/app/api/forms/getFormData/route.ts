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
    const formId = url.searchParams.get('formId')

    if (formId) {
      const form = data.find(f => f.formId === formId)
      if (!form) {
        return NextResponse.json({ message: 'Form not found' }, { status: 404 })
      }
      return NextResponse.json(form)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'Error reading forms', error }, { status: 500 })
  }
}
