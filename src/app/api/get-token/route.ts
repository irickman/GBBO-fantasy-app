import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'BLOB_READ_WRITE_TOKEN not found in environment' 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      token: token,
      message: 'Token retrieved successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error retrieving token' 
    }, { status: 500 })
  }
}
