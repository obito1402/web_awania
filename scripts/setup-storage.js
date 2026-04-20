import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntwpmquvegbzdvcqsjse.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment');
  console.error('Tambahkan ke .env.local:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupStorage() {
  try {
    console.log('🔧 Setting up storage bucket...');

    // Create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket('property-images', {
        public: true,
      });
      console.log('✅ Bucket "property-images" berhasil dibuat');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "property-images" sudah ada');
      } else {
        throw error;
      }
    }

    console.log('✅ Storage setup selesai!');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();
