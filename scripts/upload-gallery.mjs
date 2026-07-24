/**
 * Upload des images locales vers Supabase Storage + création enregistrements.
 * Usage : node scripts/upload-gallery.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Chargement .env.local ─────────────────────────────────────
const envPath = join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k && !k.startsWith('#'))
);

const supabase = createClient(
  env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY
);

// ── Vérification bucket ───────────────────────────────────────
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some(b => b.name === 'gallery');
if (!bucketExists) {
  console.log('📦 Création du bucket "gallery"...');
  const { error } = await supabase.storage.createBucket('gallery', { public: true });
  if (error) { console.error('❌ Erreur création bucket:', error.message); process.exit(1); }
  console.log('   ✅ Bucket créé');
}

// ── Upload des images ─────────────────────────────────────────
const galleryDir = join(__dirname, '..', 'src', 'assets', 'gallery');
const files = readdirSync(galleryDir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort();

if (files.length === 0) {
  console.log('❌ Aucune image trouvée dans src/assets/gallery/');
  process.exit(0);
}

const pad = String(files.length).length;
console.log(`📸 ${files.length} image(s) trouvée(s), upload en cours...\n`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = join(galleryDir, file);
  const stats = statSync(filePath);
  const buffer = readFileSync(filePath);

  const ext = file.match(/\.(jpe?g|png|webp|gif)$/i)[1];
  const num = String(i + 1).padStart(pad, '0');
  const storageName = `image-${num}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(storageName, buffer, {
      contentType: `image/${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg'}`,
      upsert: true,
    });

  if (uploadError) {
    console.error(`   ❌ ${file} → ${storageName} : ${uploadError.message}`);
    continue;
  }

  const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(storageName);

  const { error: dbError } = await supabase.from('gallery').insert({
    title: `Image ${num}`,
    image_url: publicUrl,
    thumbnail_url: publicUrl,
    category: 'other',
    is_active: true,
    published_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error(`   ❌ ${file} (DB) : ${dbError.message}`);
    continue;
  }

  console.log(`   ✅ ${file} → ${storageName} (${(stats.size / 1024).toFixed(0)} KB)`);
}

console.log(`\n✅ Terminé ! Rafraîchis la galerie dans l'admin.`);
