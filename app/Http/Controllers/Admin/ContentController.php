<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Education;
use App\Models\Experience;
use App\Models\ExperiencePoint;
use App\Models\Language;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    private array $sections = [
        'education' => ['title' => 'Pendidikan', 'model' => Education::class, 'fields' => ['institution' => 'Nama institusi', 'major' => 'Jurusan', 'period_start' => 'Tahun mulai', 'period_end' => 'Tahun selesai', 'note' => 'Keterangan', 'sort_order' => 'Urutan'], 'rules' => ['institution' => 'required|string|max:255', 'major' => 'required|string|max:255', 'period_start' => 'required|string|max:4', 'period_end' => 'nullable|string|max:10', 'note' => 'nullable|string|max:255', 'sort_order' => 'nullable|integer|min:0']],
        'experience' => ['title' => 'Pengalaman', 'model' => Experience::class, 'fields' => ['type' => 'Jenis', 'title' => 'Jabatan', 'organization' => 'Organisasi / perusahaan', 'period_start' => 'Mulai', 'period_end' => 'Selesai', 'points_text' => 'Poin tugas (satu poin per baris)', 'sort_order' => 'Urutan'], 'rules' => ['type' => 'required|string|max:100', 'title' => 'required|string|max:255', 'organization' => 'required|string|max:255', 'period_start' => 'required|string|max:10', 'period_end' => 'nullable|string|max:10', 'points_text' => 'nullable|string', 'sort_order' => 'nullable|integer|min:0']],
        'projects' => ['title' => 'Proyek', 'model' => Project::class, 'fields' => ['name' => 'Nama proyek', 'stack' => 'Teknologi', 'description' => 'Deskripsi', 'url' => 'Link proyek', 'sort_order' => 'Urutan'], 'rules' => ['name' => 'required|string|max:255', 'stack' => 'required|string|max:255', 'description' => 'required|string', 'url' => 'nullable|url|max:255', 'sort_order' => 'nullable|integer|min:0']],
        'skills' => ['title' => 'Keahlian', 'model' => Skill::class, 'fields' => ['name' => 'Nama keahlian', 'category' => 'Kategori', 'level' => 'Level (0–100)', 'sort_order' => 'Urutan'], 'rules' => ['name' => 'required|string|max:255', 'category' => 'nullable|string|max:255', 'level' => 'required|integer|min:0|max:100', 'sort_order' => 'nullable|integer|min:0']],
        'achievements' => ['title' => 'Sertifikat & Pencapaian', 'model' => Achievement::class, 'fields' => ['title' => 'Nama pencapaian', 'issuer' => 'Penerbit', 'year' => 'Tahun', 'description' => 'Deskripsi', 'sort_order' => 'Urutan'], 'rules' => ['title' => 'required|string|max:255', 'issuer' => 'nullable|string|max:255', 'year' => 'required|string|max:4', 'description' => 'nullable|string', 'sort_order' => 'nullable|integer|min:0']],
        'languages' => ['title' => 'Bahasa', 'model' => Language::class, 'fields' => ['name' => 'Nama bahasa', 'level' => 'Tingkat kemampuan', 'sort_order' => 'Urutan'], 'rules' => ['name' => 'required|string|max:255', 'level' => 'required|string|max:255', 'sort_order' => 'nullable|integer|min:0']],
    ];

    private function section(string $section): array
    {
        abort_unless(isset($this->sections[$section]), 404);
        return $this->sections[$section];
    }

    public function index(string $section)
    {
        $config = $this->section($section);
        $items = ($config['model'])::where('profile_id', Profile::query()->value('id'))->orderBy('sort_order')->orderByDesc('id')->paginate(10);
        return view('admin.content.index', compact('section', 'config', 'items'));
    }

    public function create(string $section)
    {
        $config = $this->section($section);
        $item = new ($config['model']);
        return view('admin.content.form', compact('section', 'config', 'item'));
    }

    public function store(Request $request, string $section)
    {
        $config = $this->section($section);
        $profileId = Profile::query()->value('id');
        abort_unless($profileId, 404, 'Profil CV belum tersedia.');
        $data = $request->validate($config['rules']);
        $pointsText = $data['points_text'] ?? null;
        unset($data['points_text']);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['profile_id'] = $profileId;
        $item = ($config['model'])::create($data);
        if ($section === 'experience') { $this->syncExperiencePoints($item, $pointsText); }
        return redirect()->route('admin.content.index', $section)->with('success', $config['title'].' berhasil ditambahkan.');
    }

    public function edit(string $section, int $id)
    {
        $config = $this->section($section);
        $item = ($config['model'])::where('profile_id', Profile::query()->value('id'))->findOrFail($id);
        if ($section === 'experience') { $item->setAttribute('points_text', $item->points->pluck('content')->implode("\n")); }
        return view('admin.content.form', compact('section', 'config', 'item'));
    }

    public function update(Request $request, string $section, int $id)
    {
        $config = $this->section($section);
        $item = ($config['model'])::where('profile_id', Profile::query()->value('id'))->findOrFail($id);
        $data = $request->validate($config['rules']);
        $pointsText = $data['points_text'] ?? null;
        unset($data['points_text']);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $item->update($data);
        if ($section === 'experience') { $this->syncExperiencePoints($item, $pointsText); }
        return redirect()->route('admin.content.index', $section)->with('success', $config['title'].' berhasil diperbarui.');
    }

    public function destroy(string $section, int $id)
    {
        $config = $this->section($section);
        $item = ($config['model'])::where('profile_id', Profile::query()->value('id'))->findOrFail($id);
        $item->delete();
        return redirect()->route('admin.content.index', $section)->with('success', $config['title'].' berhasil dihapus.');
    }

    private function syncExperiencePoints(Experience $experience, ?string $text): void
    {
        $experience->points()->delete();
        $lines = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $text ?? ''))));
        foreach ($lines as $index => $line) { $experience->points()->create(['content' => $line, 'sort_order' => $index]); }
    }

    public function profileEdit()
    {
        $profile = Profile::firstOrFail();
        return view('admin.profile.edit', compact('profile'));
    }

    public function profileUpdate(Request $request)
    {
        $profile = Profile::firstOrFail();
        $data = $request->validate([
            'name' => 'required|string|max:255', 'role' => 'required|string|max:255',
            'tagline' => 'required|string|max:255', 'about' => 'required|string',
            'location' => 'required|string|max:255', 'email' => 'required|email|max:255',
            'github' => 'nullable|string|max:255', 'linkedin' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255', 'whatsapp' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255', 'tiktok' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:3072', 'video' => 'nullable|mimes:mp4,webm,ogg|max:20480',
        ]);
        foreach (['photo' => 'images/profiles', 'video' => 'videos/profiles'] as $field => $directory) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
                if (! is_dir(public_path($directory))) { mkdir(public_path($directory), 0755, true); }
                $file->move(public_path($directory), $filename);
                $data[$field] = $directory.'/'.$filename;
            }
        }
        $profile->update($data);
        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
