import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    console.log('🔍 Listing all blobs...')
    
    const { blobs } = await list({ prefix: 'database/' })
    console.log('Found blobs:', blobs.map(b => ({
      pathname: b.pathname,
      url: b.url,
      size: b.size,
      uploadedAt: b.uploadedAt
    })))
    
    // Find the data.json blob
    const dataBlob = blobs.find(blob => blob.pathname === 'database/data.json')
    
    if (dataBlob) {
      console.log('Found data.json blob:', dataBlob)
      
      // Fetch and show first few lines of the actual data
      const response = await fetch(dataBlob.url)
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          blobs: blobs.map(b => ({
            pathname: b.pathname,
            size: b.size,
            uploadedAt: b.uploadedAt
          })),
          dataBlob: {
            pathname: dataBlob.pathname,
            url: dataBlob.url,
            size: dataBlob.size,
            uploadedAt: dataBlob.uploadedAt
          },
          dataPreview: {
            players: data.players?.length || 0,
            contestants: data.contestants?.length || 0,
            teams: data.teams?.length || 0,
            firstPlayer: data.players?.[0]?.name || 'none',
            firstTeamName: data.players?.[0]?.teamName || 'none'
          }
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      blobs: blobs.map(b => ({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt
      })),
      dataBlob: null,
      message: 'No data.json blob found'
    })
    
  } catch (error) {
    console.error('❌ Error listing blobs:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
