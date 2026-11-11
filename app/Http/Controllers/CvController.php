<?php

namespace App\Http\Controllers;

use App\Models\Profile;

class CvController extends Controller
{
    public function index()
    {
        $profile = Profile::with([
            'educations', 'experiences.points', 'projects',
            'skills', 'achievements', 'languages',
        ])->firstOrFail();

        return view('cv', compact('profile'));
    }
}