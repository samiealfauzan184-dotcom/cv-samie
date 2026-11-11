<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExperiencePoint extends Model
{
    protected $guarded = [];

    public function experience(): BelongsTo { return $this->belongsTo(Experience::class); }
}