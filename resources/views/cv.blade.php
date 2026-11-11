@php
    $initials = \Illuminate\Support\Str::of($profile->name)->explode(' ')
        ->map(fn ($w) => mb_substr($w, 0, 1))->take(2)->implode('');
@endphp
<!doctype html>
<html lang="en" data-type="service">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CV {{ $profile->name }}</title>
    <meta name="description" content="CV {{ $profile->name }} — {{ $profile->role }}">
    <meta property="og:title" content="CV {{ $profile->name }}">
    <meta property="og:description" content="{{ $profile->tagline }}">
    <script>document.documentElement.classList.add('js')</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/cv.css') }}">
    <link rel="stylesheet" href="{{ asset('css/game.css') }}">
</head>
<body>
<a class="skip" href="#isi">Skip to content</a>

<header class="cmd">
    <div class="wrap bar">
        <a class="pill" href="#top" aria-label="Home">{{ $initials }}</a>
        <nav aria-label="CV sections" class="main-nav">
            <a href="#profil">Profile</a>
            <a href="#pendidikan">Education</a>
            <a href="#pengalaman">Experience</a>
            <a href="#proyek">Projects</a>
            <a href="#pencapaian">Achievements</a>
            <a href="#skill">Skills</a>
        </nav>
        <button class="chip" type="button" onclick="window.print()">Print / PDF</button>
    </div>
</header>

<div class="sub">
    <div class="wrap">
        <a href="mailto:{{ $profile->email }}">Email</a>
        @if($profile->github)<a href="{{ $profile->github }}" target="_blank" rel="noopener noreferrer">GitHub</a>@endif
        @if($profile->whatsapp_url)<a href="{{ $profile->whatsapp_url }}" target="_blank" rel="noopener noreferrer">WhatsApp</a>@endif
        @if($profile->instagram_url)<a href="{{ $profile->instagram_url }}" target="_blank" rel="noopener noreferrer">Instagram</a>@endif
        @if($profile->tiktok_url)<a href="{{ $profile->tiktok_url }}" target="_blank" rel="noopener noreferrer">TikTok</a>@endif
        @if($profile->linkedin)<a href="{{ $profile->linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>@endif
        @if($profile->website)<a href="{{ $profile->website }}" target="_blank" rel="noopener noreferrer">Website</a>@endif
    </div>
</div>

<main id="isi" class="wrap">

    <section class="hero plate" id="top" data-enter>
        <div class="hero-text">
            <p class="label">Curriculum Vitae</p>
            <h1 class="display" aria-label="{{ $profile->name }}" style="--n: {{ mb_strlen($profile->name) }}">
                @php $i = 0; @endphp
                @foreach(explode(' ', $profile->name) as $word)
                    <span class="w" aria-hidden="true">@foreach(mb_str_split($word) as $ch)<span class="ch" style="--i: {{ $i++ }}">{{ $ch }}</span>@endforeach</span>
                    @php $i++; @endphp
                @endforeach
            </h1>
            <p class="tagline">{{ $profile->role }}</p>
            <p class="lead">{{ $profile->tagline }}</p>
            <a class="go" href="#profil" aria-label="Start reading">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M8 5l8 7-8 7" fill="none" stroke="#fff" stroke-width="3"/></svg>
            </a>
        </div>
        <div class="avatar"@if($profile->video_url && $profile->photo_url) data-swap="5000"@endif>
            @if($profile->photo_url)
                <img src="{{ $profile->photo_url }}" alt="Photo of {{ $profile->name }}" width="160" height="200">
            @endif
            @if($profile->video_url)
                <video class="avatar-video" src="{{ $profile->video_url }}" autoplay muted loop playsinline preload="auto" width="160" height="200" aria-label="Video of {{ $profile->name }}"></video>
            @endif
            @if(! $profile->photo_url && ! $profile->video_url)
                <span aria-hidden="true">{{ $initials }}</span>
            @endif
        </div>
    </section>

    <section class="plate card arena" id="arena" aria-labelledby="arena-title" hidden>
        <h2 class="bar-title" id="arena-title">Jelajahi CV (mini game)</h2>
        <div class="arena-stage" tabindex="0" role="group"
             aria-label="Arena permainan. Panah kiri dan kanan untuk berjalan, spasi untuk melompat, sundul blok dari bawah untuk membuka bagian CV. Isi yang sama tersedia di bawah.">
            <canvas width="720" height="300" aria-hidden="true"></canvas>
            <div class="arena-start" aria-hidden="true">
                <span>Klik arena ini<br>← → untuk jalan · Spasi untuk lompat<br>Sundul blok dari bawah</span>
            </div>
            <div class="arena-pad" aria-hidden="true">
                <button type="button" tabindex="-1" data-k="left">◀</button>
                <button type="button" tabindex="-1" data-k="right">▶</button>
                <button type="button" tabindex="-1" data-k="jump" class="jump">Lompat</button>
            </div>
        </div>
        <div class="arena-panel" aria-live="polite" hidden>
            <div class="bar-title arena-bar">
                <span class="arena-panel-title"></span>
                <button type="button" class="arena-close">Tutup</button>
            </div>
            <div class="arena-panel-body"></div>
        </div>
    </section>

    <div class="cols">
        <div class="content">

            <section class="plate card" id="profil">
                <h2 class="bar-title">Profile</h2>
                <div class="pad"><p>{{ $profile->about }}</p></div>
            </section>

            <section class="plate card" id="pendidikan">
                <h2 class="bar-title">Education</h2>
                <div class="pad rows">
                    @foreach($profile->educations as $e)
                        <article class="row">
                            <div class="row-head">
                                <h3>{{ $e->major }}</h3>
                                <span class="period">{{ $e->period }}</span>
                            </div>
                            <p class="place">{{ $e->institution }}</p>
                            @if($e->note)<p>{{ $e->note }}</p>@endif
                        </article>
                    @endforeach
                </div>
            </section>

            <section class="plate card" id="pengalaman">
                <h2 class="bar-title">Experience &amp; Organizations</h2>
                <div class="pad rows">
                    @foreach($profile->experiences as $x)
                        <article class="row">
                            <div class="row-head">
                                <h3>{{ $x->title }}</h3>
                                <span class="period">{{ $x->period }}</span>
                            </div>
                            <p class="place">{{ $x->organization }} · {{ ucfirst($x->type) }}</p>
                            <ul>
                                @foreach($x->points as $pt)<li>{{ $pt->content }}</li>@endforeach
                            </ul>
                        </article>
                    @endforeach
                </div>
            </section>

            <section class="plate card" id="proyek">
                <h2 class="bar-title">Projects</h2>
                <div class="pad tiles">
                    @foreach($profile->projects as $p)
                        @if($p->url)<a class="tile" href="{{ $p->url }}" target="_blank" rel="noopener noreferrer">@else<div class="tile">@endif
                            <span class="stack">{{ $p->stack }}</span>
                            <h3>{{ $p->name }}</h3>
                            <p>{{ $p->description }}</p>
                        @if($p->url)</a>@else</div>@endif
                    @endforeach
                </div>
            </section>

            <section class="plate card" id="pencapaian">
                <h2 class="bar-title">Achievements</h2>
                <div class="pad rows">
                    @foreach($profile->achievements as $a)
                        <article class="row">
                            <div class="row-head">
                                <h3>{{ $a->title }}</h3>
                                <span class="period">{{ $a->year }}</span>
                            </div>
                            @if($a->issuer)<p class="place">{{ $a->issuer }}</p>@endif
                            @if($a->description)<p>{{ $a->description }}</p>@endif
                        </article>
                    @endforeach
                </div>
            </section>
        </div>

        <aside class="rail" aria-label="Contact and skills">
            <a class="btn-dark" href="mailto:{{ $profile->email }}">Contact me</a>
            @if($profile->github)<a class="btn-dark" href="{{ $profile->github }}" target="_blank" rel="noopener noreferrer">GitHub</a>@endif
            @if($profile->linkedin)<a class="btn-dark" href="{{ $profile->linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>@endif
            @if($profile->whatsapp_url)<a class="btn-dark" href="{{ $profile->whatsapp_url }}" target="_blank" rel="noopener noreferrer">WhatsApp</a>@endif
            @if($profile->instagram_url)<a class="btn-dark" href="{{ $profile->instagram_url }}" target="_blank" rel="noopener noreferrer">Instagram</a>@endif
            @if($profile->tiktok_url)<a class="btn-dark" href="{{ $profile->tiktok_url }}" target="_blank" rel="noopener noreferrer">TikTok</a>@endif
            <button class="btn-dark" type="button" onclick="window.print()">Save as PDF</button>

            <section class="info" id="skill">
                <h2 class="tab">Skills</h2>
                <ul class="skills">
                    @foreach($profile->skills as $s)
                        <li>
                            <span>{{ $s->name }}</span>
                            <div class="meter" role="img" aria-label="{{ $s->name }}: {{ $s->level }} out of 10">
                                @for($i = 1; $i <= 10; $i++)<i @class(['on' => $i <= $s->level]) style="--d: {{ $i * 45 }}ms"></i>@endfor
                            </div>
                        </li>
                    @endforeach
                </ul>
            </section>

            <section class="info">
                <h2 class="tab">Languages</h2>
                <ul class="langs">
                    @foreach($profile->languages as $l)
                        <li><b>{{ $l->name }}</b><span>{{ $l->level }}</span></li>
                    @endforeach
                </ul>
            </section>
        </aside>
    </div>
</main>

<footer class="foot">
    <div class="wrap">© {{ date('Y') }} {{ $profile->name }} · {{ $profile->email }}</div>
</footer>

<script src="{{ asset('js/cv.js') }}" defer></script>
<script src="{{ asset('js/game.js') }}" defer></script>
</body>
</html>