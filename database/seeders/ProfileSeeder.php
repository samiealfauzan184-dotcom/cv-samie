<?php

namespace Database\Seeders;

use App\Models\Profile;
use Illuminate\Database\Seeder;

class ProfileSeeder extends Seeder
{
    public function run(): void
    {
        $p = Profile::create([
            'name'     => 'Samie Al Fauzan',
            'role'     => 'Informatics Engineering Student',
            'tagline'  => 'One sentence about what you work on and what you are looking for.',
            'about'    => 'Write a 2 to 3 sentence summary about yourself here.',
            'photo'    => 'img/foto.jpg',
            'location' => 'City, Province',
            'email'    => 'nama@contoh.example',
            'github'   => 'https://github.com/username',
        ]);

        $p->educations()->create([
            'institution' => 'University Name', 'major' => 'Informatics Engineering',
            'period_start' => '2024', 'note' => 'GPA / focus / short note', 'sort_order' => 1,
        ]);

        $exp = $p->experiences()->create([
            'type' => 'organization', 'title' => 'Position / Role', 'organization' => 'Organization Name',
            'period_start' => '2025', 'period_end' => '2026', 'sort_order' => 1,
        ]);
        $exp->points()->createMany([
            ['content' => 'What you did, with results you can point to.', 'sort_order' => 1],
            ['content' => 'Second point.', 'sort_order' => 2],
        ]);

        $p->projects()->createMany([
            ['name' => 'Project Name', 'stack' => 'Laravel · MySQL', 'description' => 'One or two sentences about this project.', 'sort_order' => 1],
            ['name' => 'Second Project', 'stack' => 'Next.js · TypeScript', 'description' => 'Short description.', 'sort_order' => 2],
        ]);

        $p->skills()->createMany([
            ['name' => 'PHP / Laravel', 'category' => 'Backend', 'level' => 8, 'sort_order' => 1],
            ['name' => 'JavaScript / TypeScript', 'category' => 'Frontend', 'level' => 7, 'sort_order' => 2],
            ['name' => 'Database', 'category' => 'Data', 'level' => 7, 'sort_order' => 3],
        ]);

        $p->achievements()->create([
            'title' => 'Achievement Name', 'issuer' => 'Issuer', 'year' => '2026',
            'description' => 'Short description.', 'sort_order' => 1,
        ]);

        $p->languages()->createMany([
            ['name' => 'Indonesian', 'level' => 'Native', 'sort_order' => 1],
            ['name' => 'English', 'level' => 'Proficiency level', 'sort_order' => 2],
        ]);
    }
}