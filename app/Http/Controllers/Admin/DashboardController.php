<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Language;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;

class DashboardController extends Controller
{
    public function index()
    {
        $profile = Profile::first();

        $counts = [
            'Pendidikan' => Education::count(),
            'Pengalaman' => Experience::count(),
            'Proyek' => Project::count(),
            'Keahlian' => Skill::count(),
            'Sertifikat & Pencapaian' => Achievement::count(),
            'Bahasa' => Language::count(),
        ];

        return view('admin.dashboard', compact('profile', 'counts'));
    }
}
