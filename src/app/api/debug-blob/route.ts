import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

export async function GET() {
  try {
    console.log('=== BLOB STORAGE DEBUG ===')
    
    // Test 1: Try to list existing blobs
    console.log('1. Testing list()...')
    const { blobs } = await list({ prefix: 'database/' })
    console.log('Found blobs:', blobs.map(b => b.pathname))
    
    // Test 2: Try to save a simple test file
    console.log('2. Testing put()...')
    const testData = { test: 'hello world', timestamp: new Date().toISOString() }
    const result = await put('database/test.json', JSON.stringify(testData), {
      access: 'public',
      addRandomSuffix: false
    })
    console.log('Test file saved:', result.url)
    
    // Test 3: List blobs again to confirm
    console.log('3. Testing list() again...')
    const { blobs: newBlobs } = await list({ prefix: 'database/' })
    console.log('Found blobs after save:', newBlobs.map(b => b.pathname))
    
    return NextResponse.json({ 
      success: true,
      message: 'Blob storage test completed',
      blobs: blobs.map(b => b.pathname),
      newBlobs: newBlobs.map(b => b.pathname),
      testUrl: result.url
    })
  } catch (error) {
    console.error('Blob storage test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
