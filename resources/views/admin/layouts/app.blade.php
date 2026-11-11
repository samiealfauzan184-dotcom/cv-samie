<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Dashboard') — CV Samie Admin</title>
    @include('admin.partials.theme')
</head>
<body>
@php
    $sec = request()->route('section');
    $sections = ['education'=>'Pendidikan','experience'=>'Pengalaman','projects'=>'Proyek','skills'=>'Keahlian','achievements'=>'Pencapaian','languages'=>'Bahasa'];
@endphp
<div class="wrap">
    <nav class="nav-bar halftone">
        <a class="logo" href="{{ route('admin.dashboard') }}">CV SAMIE</a>
        <a class="nl {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}">Dashboard</a>
        <a class="nl {{ request()->routeIs('admin.profile.*') ? 'active' : '' }}" href="{{ route('admin.profile.edit') }}">Profil</a>
        <span class="spacer"></span>
        <a class="chip" href="{{ route('cv') }}" target="_blank">Lihat Website ↗</a>
        <form class="logout-form" method="POST" action="{{ route('admin.logout') }}">@csrf<button class="button" type="submit">Keluar</button></form>
    </nav>
    <div class="subnav">
        @foreach($sections as $key => $label)
            <a class="{{ $sec === $key ? 'active' : '' }}" href="{{ route('admin.content.index', $key) }}">{{ $label }}</a>
        @endforeach
    </div>
    <main class="main">
        @yield('content')
    </main>
    <footer class="footer-bar halftone"><span>© {{ date('Y') }} CV Samie — Admin Panel</span><span class="badge">ADMIN ONLY</span></footer>
</div>
</body>
</html>
