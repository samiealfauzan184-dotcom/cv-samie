<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CreateAdmin extends Command
{
    protected $signature = 'make:admin {email? : Email akun admin}';
    protected $description = 'Membuat atau menaikkan akun menjadi administrator';

    public function handle(): int
    {
        $email = $this->argument('email') ?: $this->ask('Email admin');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Format email tidak valid.');
            return self::FAILURE;
        }

        $name = $this->ask('Nama admin', 'Administrator');
        $password = $this->secret('Password admin (minimal 12 karakter)');

        if (! is_string($password) || strlen($password) < 12) {
            $this->error('Password harus minimal 12 karakter.');
            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->password = Hash::make($password);
        $user->is_admin = true;
        $user->save();

        $this->info('Akun admin berhasil disiapkan. Simpan password di tempat aman.');
        return self::SUCCESS;
    }
}
