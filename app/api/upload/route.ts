import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    if (!file || !propertyId) {
      return NextResponse.json(
        { error: 'File and propertyId required' },
        { status: 400 }
      );
    }

    // Service role client (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const buffer = await file.arrayBuffer();
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    const filepath = `${propertyId}-${Date.now()}-${filename}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filepath);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });
  } catch (error: unknown) {
    console.error('API upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { filepath } = body;

    if (!filepath) {
      return NextResponse.json(
        { error: 'Filepath required' },
        { status: 400 }
      );
    }

    // Service role client (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { error } = await supabase.storage
      .from('property-images')
      .remove([filepath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('API delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
