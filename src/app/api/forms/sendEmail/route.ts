import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, subject, message, formLink } = body

    // Kiểm tra dữ liệu đầu vào
    if (!email || !formLink) {
      return new Response(JSON.stringify({ error: 'Email và Link Form Required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Cấu hình transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true nếu dùng cổng 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject || 'Link to Your Form',
      html: `
        <p>${message || 'Here is the link to your form:'}</p>
        <button href="${formLink}" target="_blank">${formLink}</button>
      `,
    }

    // Gửi email
    await transporter.sendMail(mailOptions)

    return new Response(JSON.stringify({ success: 'Email sent successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: 'Failed to send email.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
