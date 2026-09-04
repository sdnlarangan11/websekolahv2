# SDN Larangan 11 Website V3 — Production Ready

Versi ini mempertahankan tema/UI dari `SDN-Larangan-11-Website-v2.zip`, tetapi mengganti data demo/localStorage menjadi Supabase.

## Yang dipertahankan
- Hero gradien biru muda
- Brand L11
- Header putih sticky
- Kartu putih dengan aksen biru
- Statistik navy
- Sidebar Admin navy
- Pola panel Admin versi lama

## Fitur produksi
- Supabase Auth untuk admin
- Profil sekolah editable
- Jumlah siswa/guru editable
- Rombel lengkap + histori tahun ajaran/semester
- Ekstrakurikuler lengkap: pembina, pelatih, jadwal, kelas peserta, kuota, foto
- Update kegiatan per ekstrakurikuler
- Program sekolah
- Berita + draft/publish
- Pengumuman
- Prestasi
- Galeri + upload foto
- Dokumen publik + upload file
- Jadwal sekolah
- Sync staging: internet → kandidat → review admin
- Tidak ada auto-overwrite data sekolah
- Supabase Storage
- RLS

## Instalasi

1. Buat project Supabase.
2. Buka SQL Editor.
3. Jalankan `sql/schema.sql`.
4. Buka Authentication > Users lalu buat akun admin.
5. Isi Supabase Project URL + anon/publishable key pada DUA file:
   - `js/config.js`
   - `admin/js/config.js`
6. Upload semua file ke repository GitHub.
7. GitHub > Settings > Pages:
   - Deploy from a branch
   - `main`
   - `/ (root)`

## Login Admin
`https://USERNAME.github.io/NAMA-REPO/admin/`

## Catatan keamanan
Jangan masukkan `service_role` key ke GitHub/frontend.

Policy saat ini menganggap semua akun `authenticated` adalah admin. Ini cocok untuk sekolah dengan akun admin yang dibuat manual dan public signup dimatikan. Jika nanti ada guru/operator dengan hak berbeda, buat tabel role/profiles dan policy per role.

## Sinkronisasi
Sinkronisasi menerima endpoint JSON yang mengizinkan CORS. Hasil disimpan di `sync_staging`, bukan langsung masuk profil/rombel. Tombol "Terima sebagai referensi" menandai hasil sebagai diterima untuk dijadikan bahan verifikasi; perubahan data final tetap dilakukan manual di modul terkait.
