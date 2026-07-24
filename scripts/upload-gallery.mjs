/**
 * Script d'upload des images locales vers Supabase Storage + création des enregistrements.
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
const files = readdirSync(galleryDir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));

if (files.length === 0) {
  console.log('❌ Aucune image trouvée dans src/assets/gallery/');
  process.exit(0);
}

console.log(`📸 ${files.length} image(s) trouvée(s), upload en cours...\n`);

for (const file of files) {
  const filePath = join(galleryDir, file);
  const stats = statSync(filePath);
  const buffer = readFileSync(filePath);

  // Titre depuis le nom de fichier
  const title = file
    .replace(/\.(jpe?g|png|webp|gif)$/i, '')
    .replace(/^magnific__/, '')
    .replace(/__\d+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase());

  // Upload vers Supabase Storage
  const storagePath = `gallery/${Date.now()}_${file}`;
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(storagePath, buffer, {
      contentType: `image/${file.endsWith('.png') ? 'png' : file.endsWith('.webp') ? 'webp' : 'jpeg'}`,
      upsert: false,
    });

  if (uploadError) {
    console.error(`   ❌ ${file} : ${uploadError.message}`);
    continue;
  }

  const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(storagePath);

  // Création enregistrement dans la table gallery
  const { error: dbError } = await supabase.from('gallery').insert({
    title,
    description: null,
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

  console.log(`   ✅ ${file} → "${title}" (${(stats.size / 1024).toFixed(0)} KB)`);
}

console.log(`\n✅ Terminé ! Rafraîchis la galerie dans l'admin.`);
