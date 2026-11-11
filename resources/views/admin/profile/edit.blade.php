@extends('admin.layouts.app')
@section('title', 'Profil')
@section('content')
<header class="top"><div><p class="muted" style="margin:0 0 7px">Informasi utama website</p><h1>Edit Profil</h1></div><a class="button" href="{{ route('cv') }}" target="_blank">Lihat website ↗</a></header>
@if(session('success'))<div class="alert">{{ session('success') }}</div>@endif
@if($errors->any())<div class="alert err">Periksa kembali isian. {{ $errors->first() }}</div>@endif
<section class="panel"><div class="bar">Data profil</div><div class="pad"><form method="POST" action="{{ route('admin.profile.update') }}" enctype="multipart/form-data">@csrf @method('PUT')
@foreach(['name'=>'Nama lengkap','role'=>'Profesi / peran','tagline'=>'Tagline','about'=>'Tentang saya','location'=>'Lokasi','email'=>'Email','github'=>'GitHub','linkedin'=>'LinkedIn','website'=>'Website','whatsapp'=>'WhatsApp','instagram'=>'Instagram','tiktok'=>'TikTok'] as $key=>$label)
<label class="field"><span>{{ $label }}</span>
@if($key==='about')
<textarea name="{{ $key }}" required>{{ old($key,$profile->{$key}) }}</textarea>
@else
<input name="{{ $key }}" value="{{ old($key,$profile->{$key}) }}" @if(in_array($key,['name','role','tagline','location','email'])) required @endif>
@endif
</label>
@error($key)<span class="error-text">{{ $message }}</span>@enderror
@endforeach
<hr class="dotted">
<label class="field"><span>Foto profil (maks. 3 MB)</span><input type="file" name="photo" accept="image/*">@if($profile->photo)<small class="muted">File saat ini: {{ $profile->photo }}</small>@endif</label>
<label class="field"><span>Video profil (MP4/WebM/OGG, maks. 20 MB)</span><input type="file" name="video" accept="video/mp4,video/webm,video/ogg">@if($profile->video)<small class="muted">File saat ini: {{ $profile->video }}</small>@endif</label>
<div class="actions"><button class="button submit" type="submit">Simpan perubahan</button></div></form></div></section>
@endsection
