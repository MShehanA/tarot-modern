# Tarot-Modern

Project publik interaktif berbasis HTML/CSS/JavaScript murni dengan backend Node.js + Express + MySQL.

## Struktur
```text
tarot-modern/
├── index.html
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── database/
    └── tarot-modern.sql
```

## Demo mode
`index.html` memakai:
```js
const API_BASE_URL="";
const DEMO_MODE=true;
```

Dalam mode ini website langsung dapat dibuka tanpa server dan riwayat disimpan sementara di `localStorage`.

## Production / database
1. Install Node.js dan MySQL.
2. Import `database/tarot-modern.sql` ke MySQL.
3. Masuk ke `server/` dan jalankan `npm install`.
4. Salin `.env.example` menjadi `.env` lalu sesuaikan kredensial database.
5. Jalankan `node server.js`.
6. Sajikan `index.html` melalui Live Server atau web server.
7. Ubah `DEMO_MODE=false` dan isi `API_BASE_URL` sesuai alamat backend.

> Untuk production, tambahkan autentikasi owner/session yang lebih kuat sebelum mengaktifkan pembacaan privat dan fitur akun.

## Backup
```bash
mysqldump tarot_modern > backup.sql
```

## Catatan PDF
Tombol Download Reading pada frontend demo membuat dokumen HTML yang otomatis membuka dialog print; pilih **Save as PDF** di browser. Ini menjaga frontend tetap tanpa library eksternal.
