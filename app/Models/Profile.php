<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    protected $guarded = [];

    public function educations(): HasMany   { return $this->hasMany(Education::class)->orderBy('sort_order'); }
    public function experiences(): HasMany  { return $this->hasMany(Experience::class)->orderBy('sort_order'); }
    public function projects(): HasMany     { return $this->hasMany(Project::class)->orderBy('sort_order'); }
    public function skills(): HasMany       { return $this->hasMany(Skill::class)->orderBy('sort_order'); }
    public function achievements(): HasMany { return $this->hasMany(Achievement::class)->orderBy('sort_order'); }
    public function languages(): HasMany    { return $this->hasMany(Language::class)->orderBy('sort_order'); }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo && file_exists(public_path($this->photo)) ? asset($this->photo) : null;
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->video && file_exists(public_path($this->video)) ? asset($this->video) : null;
    }

    public function getWhatsappUrlAttribute(): ?string
    {
        if (! $this->whatsapp) return null;
        if (str_starts_with($this->whatsapp, 'http')) return $this->whatsapp;

        $n = preg_replace('/\D+/', '', $this->whatsapp);
        if (str_starts_with($n, '0')) $n = '62'.substr($n, 1);

        return 'https://wa.me/'.$n;
    }

    public function getInstagramUrlAttribute(): ?string
    {
        if (! $this->instagram) return null;
        if (str_starts_with($this->instagram, 'http')) return $this->instagram;

        return 'https://www.instagram.com/'.ltrim($this->instagram, '@').'/';
    }

    public function getTiktokUrlAttribute(): ?string
    {
        if (! $this->tiktok) return null;
        if (str_starts_with($this->tiktok, 'http')) return $this->tiktok;

        return 'https://www.tiktok.com/@'.ltrim($this->tiktok, '@');
    }
}