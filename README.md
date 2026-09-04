# SDN Larangan 11 Website V4

V4 menggabungkan UI Professional/V2 dengan fondasi produksi V3.

Fitur utama:
- UI publik bergaya Professional/V2 dan responsif.
- Supabase Auth + Postgres + Storage.
- Admin untuk profil, rombel, eskul, kegiatan eskul, program, berita, pengumuman, prestasi, galeri, dokumen, dan jadwal.
- Upload logo sekolah dari admin.
- Smart Sync berbasis Supabase Edge Function.
- Daftar sumber tepercaya/whitelist melalui `sync_sources`.
- Perbandingan per-field pada `sync_staging` dengan approval/reject admin.
- Tidak ada auto-overwrite dari internet.

Untuk upgrade dari V3 baca `DEPLOY-V4.md` dan jalankan `sql/v4_patch.sql`.
