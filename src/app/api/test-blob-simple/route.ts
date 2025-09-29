import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

export async function GET() {
  try {
    console.log('=== SIMPLE BLOB TEST ===')
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0)
    
    // Test listing blobs
    console.log('Testing blob list...')
    const { blobs } = await list({ prefix: 'database/' })
    console.log('Found blobs:', blobs.map(b => ({ pathname: b.pathname, size: b.size })))
    
    // Test writing a simple blob
    console.log('Testing blob write...')
    const testData = { 
      test: 'hello world', 
      timestamp: new Date().toISOString(),
      random: Math.random()
    }
    
    const result = await put('database/test-simple.json', JSON.stringify(testData), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('Blob write successful:', result.url)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple blob test completed successfully',
      tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
      existingBlobs: blobs.map(b => ({ pathname: b.pathname, size: b.size })),
      testBlobUrl: result.url
    })
    
  } catch (error) {
    console.error('=== SIMPLE BLOB TEST ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
    }, { status: 500 })
  }
}
