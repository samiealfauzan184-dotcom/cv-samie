<?php

return [
    'name'     => 'Samie Al Fauzan',
    'role'     => 'Mahasiswa Teknik Informatika',
    'tagline'  => 'Satu kalimat tentang apa yang kamu kerjakan dan cari.',
    'photo'    => 'img/foto.jpg', // taruh di public/img/foto.jpg, kalau tidak ada tampil inisial
    'location' => 'Kota, Provinsi',

    'contact' => [
        'email'    => 'nama@contoh.example',
        'github'   => 'https://github.com/username',
        'linkedin' => '', // kosongkan kalau belum ada, tombolnya otomatis hilang
        'website'  => '',
    ],

    'about' => 'Tulis ringkasan diri 2 sampai 3 kalimat di sini.',

    'education' => [
        ['title' => 'Teknik Informatika', 'place' => 'Nama Universitas', 'period' => '2024 – sekarang', 'note' => 'IPK / fokus / catatan singkat'],
    ],

    'experience' => [
        ['title' => 'Posisi / Peran', 'place' => 'Instansi', 'period' => 'Bulan Tahun – Bulan Tahun', 'points' => [
            'Apa yang kamu kerjakan, dengan hasil yang bisa disebut.',
            'Poin kedua.',
        ]],
    ],

    'projects' => [
        ['name' => 'Nama Proyek', 'stack' => 'Laravel · MySQL', 'desc' => 'Satu atau dua kalimat tentang proyek ini.', 'url' => ''],
        ['name' => 'Proyek Kedua', 'stack' => 'Next.js · TypeScript', 'desc' => 'Deskripsi singkat.', 'url' => ''],
    ],

    // level 1 sampai 10
    'skills' => [
        ['name' => 'PHP / Laravel', 'level' => 8],
        ['name' => 'JavaScript / TypeScript', 'level' => 7],
        ['name' => 'Database', 'level' => 7],
    ],

    'languages' => [
        ['name' => 'Indonesia', 'level' => 'Native'],
        ['name' => 'Inggris', 'level' => 'Tingkat kemampuan'],
    ],
];