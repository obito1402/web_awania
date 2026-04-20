import { supabase } from './supabase';

export async function testUpload() {
  try {
    // Use server-side API route to test upload
    const testFile = new File(['test'], `test-${Date.now()}.txt`, { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('propertyId', 'test');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.url) {
      throw new Error(result.error || 'Upload test gagal');
    }

    // Try to delete test file
    try {
      const deleteResponse = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath: `test-${Date.now()}.txt` }),
      });
    } catch (deleteError: unknown) {
      // Cleanup error tidak perlu block
    }

    return { success: true, message: 'Storage siap digunakan!' };
  } catch (error: unknown) {
    console.error('Error testing upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload test gagal - pastikan SUPABASE_SERVICE_ROLE_KEY di .env.local';
    return {
      success: false,
      message: errorMessage,
    };
  }
}
