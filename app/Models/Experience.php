<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Experience extends Model
{
    protected $guarded = [];

    public function profile(): BelongsTo { return $this->belongsTo(Profile::class); }
    public function points(): HasMany    { return $this->hasMany(ExperiencePoint::class)->orderBy('sort_order'); }

    public function getPeriodAttribute(): string
    {
        if ($this->period_end === $this->period_start) {
            return $this->period_start;
        }

        return $this->period_start." \u{2013} ".($this->period_end ?: 'present');
    }
}