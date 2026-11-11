# CV Samie Admin — Tahap 1

Tahap ini menambahkan login admin tersembunyi, pembatasan akses backend, perintah pembuatan akun admin, dan dashboard ringkasan. Halaman CV publik tidak diubah.

## File yang ditambahkan/diubah

- `routes/web.php`
- `bootstrap/app.php`
- `app/Http/Middleware/EnsureUserIsAdmin.php`
- `app/Http/Controllers/Admin/AuthController.php`
- `app/Http/Controllers/Admin/DashboardController.php`
- `app/Console/Commands/CreateAdmin.php`
- `database/migrations/2026_11_10_000001_add_is_admin_to_users_table.php`
- `resources/views/admin/auth/login.blade.php`
- `resources/views/admin/layouts/app.blade.php`
- `resources/views/admin/dashboard.blade.php`

## Cara memasang

1. Cadangkan folder proyek dan database terlebih dahulu.
2. Salin isi folder patch ke root proyek Laravel `cv-samie`, izinkan file `routes/web.php` dan `bootstrap/app.php` ditimpa.
3. Buka terminal di root proyek.
4. Jalankan:

```bash
php artisan migrate
php artisan make:admin
php artisan optimize:clear
```

5. Saat diminta, masukkan email, nama, dan password admin. Password minimal 12 karakter dan tidak ditampilkan saat diketik.
6. Jalankan proyek seperti biasa, lalu buka `/panel-management`.

## URL

- Login: `/panel-management`
- Dashboard: `/panel-management/dashboard`
- Website publik: `/`

URL login tidak dipasang pada navbar publik. Selain itu, dashboard dilindungi middleware `auth` dan `admin`; mengetahui URL saja tidak memberikan hak akses.

## Catatan keamanan

- Buat password unik dan kuat.
- Jangan membagikan file `.env` atau password admin.
- Di server produksi, atur `APP_ENV=production`, `APP_DEBUG=false`, gunakan HTTPS, dan jalankan migrasi melalui proses deployment.
- Akun pengguna biasa tidak otomatis menjadi admin. Hanya akun yang ditandai `is_admin=true` yang dapat masuk.

Tahap 1 belum menyediakan form CRUD. Tahap berikutnya adalah modul pengelolaan profil, lalu pendidikan, pengalaman, proyek, keahlian, pencapaian, bahasa, dan upload media.
