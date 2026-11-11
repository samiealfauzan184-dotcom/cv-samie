@extends('admin.layouts.app')
@section('title', 'Dashboard')
@section('content')
<header class="top"><div><p class="muted" style="margin:0 0 7px">Selamat datang kembali, {{ auth()->user()->name }}</p><h1>Dashboard Admin</h1></div><a class="button light" href="{{ route('cv') }}" target="_blank">Lihat Website ↗</a></header>
<div class="notice">Kelola konten CV dari panel ini. Perubahan yang disimpan akan menggunakan data database yang dibaca halaman CV utama.</div>
<section class="grid"><article class="stat"><small>Profil</small><strong>{{ $profile ? '1' : '0' }}</strong></article>@foreach($counts as $label => $count)<article class="stat"><small>{{ $label }}</small><strong>{{ $count }}</strong></article>@endforeach</section>
<section class="panel"><div class="bar">Akses cepat</div><div class="pad"><p>Pilih bagian website yang ingin diperbarui.</p><div class="actions"><a class="button" href="{{ route('admin.profile.edit') }}">Edit Profil</a><a class="button" href="{{ route('admin.content.index','education') }}">Pendidikan</a><a class="button" href="{{ route('admin.content.index','experience') }}">Pengalaman</a><a class="button" href="{{ route('admin.content.index','projects') }}">Proyek</a><a class="button" href="{{ route('admin.content.index','skills') }}">Keahlian</a><a class="button" href="{{ route('admin.content.index','achievements') }}">Pencapaian</a><a class="button" href="{{ route('admin.content.index','languages') }}">Bahasa</a></div></div></section>
@endsection
