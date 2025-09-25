import { NextResponse } from 'next/server'
import { list, put } from '@vercel/blob'

export async function GET() {
  try {
    console.log('Testing blob storage...')
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0)
    
    // Test listing blobs
    console.log('Listing existing blobs...')
    const { blobs } = await list({ prefix: 'database/' })
    console.log('Found blobs:', blobs.map(b => b.pathname))
    
    // Test writing a simple blob
    console.log('Writing test blob...')
    const testData = { test: 'hello world', timestamp: new Date().toISOString() }
    const result = await put('database/test.json', JSON.stringify(testData), {
      access: 'public',
      addRandomSuffix: false
    })
    console.log('Test blob written:', result.url)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blob storage test completed',
      blobs: blobs.map(b => b.pathname),
      testBlobUrl: result.url
    })
  } catch (error) {
    console.error('Blob storage test error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
