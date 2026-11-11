<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login — CV Samie</title>
    @include('admin.partials.theme')
</head>
<body class="login-page">
    <main class="login-box">
        <div class="nav-bar halftone"><span class="logo">CV SAMIE</span><span class="nl">Admin</span></div>
        <div class="bubble">Halo! Masuk dulu ya, Admin.</div>
        <section class="panel">
            <div class="bar">Log in</div>
            <div class="pad">
                <p>Halaman ini khusus administrator CV Samie. Silakan masuk menggunakan akun admin.</p>
                <hr class="dotted">
                @if(session('status'))<div class="alert">{{ session('status') }}</div>@endif
                <form method="POST" action="{{ route('admin.login.store') }}">
                    @csrf
                    <label class="field"><span>Email admin</span>
                        <input class="login-input" id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" required autofocus>
                    </label>
                    @error('email')<span class="error-text">{{ $message }}</span>@enderror
                    <label class="field"><span>Password</span>
                        <input class="login-input" id="password" name="password" type="password" autocomplete="current-password" required>
                    </label>
                    @error('password')<span class="error-text">{{ $message }}</span>@enderror
                    <button class="button submit" type="submit">Masuk ke Dashboard</button>
                </form>
            </div>
        </section>
        <a class="sub" href="{{ route('cv') }}">← Kembali ke website CV</a>
    </main>
</body>
</html>
