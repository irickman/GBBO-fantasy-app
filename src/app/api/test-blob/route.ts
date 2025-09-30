import { NextResponse } from 'next/server'
import { put, head } from '@vercel/blob'

export async function GET() {
  try {
    console.log('Testing blob storage...')
    
    // Test data
    const testData = {
      players: [
        { id: 1, name: 'Test Player', teamName: 'Test Team', createdAt: new Date().toISOString() }
      ],
      contestants: [
        { id: 1, name: 'Test Contestant', eliminatedWeek: null, createdAt: new Date().toISOString() }
      ],
      teams: [],
      weeklyScores: [],
      seasonTotals: [],
      nextId: 2
    }
    
    console.log('Uploading test data...')
    const result = await put('database/data.json', JSON.stringify(testData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('Upload successful:', result.url)
    
    // Test reading the data
    console.log('Testing data retrieval...')
    const blobInfo = await head('database/data.json')
    console.log('Blob info:', blobInfo)
    
    const response = await fetch(blobInfo.url)
    const data = await response.json()
    console.log('Retrieved data:', data)
    
    return NextResponse.json({ 
      success: true, 
      uploadUrl: result.url,
      blobInfo,
      retrievedData: data
    })
    
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}