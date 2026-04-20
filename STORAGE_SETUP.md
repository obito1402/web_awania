# 🔧 Supabase Storage Setup Guide

## Problem
Upload gambar gagal dengan error: "Bucket not found"

## Solusi: Create Storage Bucket Manually

Karena client-side tidak punya permission untuk create bucket, Anda perlu setup manual di Supabase Dashboard:

### Langkah-langkah:

1. **Login ke Supabase Dashboard**
   - Buka: https://app.supabase.com
   - Login dengan akun Anda

2. **Pilih Project**
   - Nama: ntwpmquvegbzdvcqsjse (atau sesuai project Anda)

3. **Navigasi ke Storage**
   - Sidebar kiri > "Storage"
   - Klik tab "Buckets"

4. **Create New Bucket**
   - Klik tombol "+ New Bucket"
   - Bucket name: **property-images** (exact name, case-sensitive)
   - Toggle "Public bucket": **ON**
   - Klik "Create bucket"

5. **Verifikasi di Admin Dashboard**
   - Kembali ke aplikasi
   - Admin > Klik "Test Storage"
   - Jika sukses: "✅ Storage siap digunakan!"

### After Setup:
- Upload foto seharusnya langsung bisa di admin form
- Foto akan tersimpan di Supabase Storage bucket
- URL foto tampil di property detail page

## Troubleshooting

**Error: "new row violates row-level security policy"**
- Pastikan bucket dibuat dengan "Public bucket" ON

**Error: "Bucket not found"**
- Pastikan nama bucket tepat: `property-images` (bukan "property_images" atau lainnya)

**File upload tapi tidak muncul di gallery**
- Refresh page (Ctrl+F5)
- Check console (F12) untuk error messages

## Next Steps
Setelah bucket siap:
1. Kembali ke admin dashboard
2. Upload foto untuk property
3. Foto akan langsung tampil di property card & detail page
