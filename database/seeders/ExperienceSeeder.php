<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\ExperiencePoint;
use App\Models\Profile;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $profile = Profile::firstOrFail();

        $ids = Experience::where('profile_id', $profile->id)->pluck('id');
        ExperiencePoint::whereIn('experience_id', $ids)->delete();
        Experience::where('profile_id', $profile->id)->delete();

        $items = [
            [
                'type' => 'work',
                'title' => 'Work Experience',
                'organization' => 'Honda',
                'period_start' => '2022',
                'period_end' => '2023',
                'points' => [
                    'Gained work experience at Honda, responsible for carrying out operational tasks according to company directions and standards.',
                    'Developed discipline, responsibility, teamwork, and communication skills in a professional work environment.',
                ],
            ],
            [
                'type' => 'committee',
                'title' => 'Member, Voting Organizing Group (KPPS)',
                'organization' => 'General Election 2024',
                'period_start' => '2024',
                'period_end' => '2024',
                'points' => [
                    'Took part in the 2024 General Election as a member of KPPS.',
                    'Assisted with the voting and vote-counting process in accordance with applicable procedures and regulations.',
                    'Upheld integrity, accuracy, neutrality, and responsibility in carrying out duties.',
                ],
            ],
            [
                'type' => 'organization',
                'title' => 'Member, Media, Communication, and Information (Medkominfo)',
                'organization' => 'Campus Organization',
                'period_start' => '2025',
                'period_end' => '2025',
                'points' => [
                    'Contributed to campus organization activities in the Media, Communication, and Information division.',
                    'Supported the dissemination of information and the publication of organization activities.',
                    'Took part in managing communication and delivering information to students.',
                ],
            ],
        ];

        foreach ($items as $i => $item) {
            $points = $item['points'];
            unset($item['points']);

            $experience = $profile->experiences()->create($item + ['sort_order' => $i + 1]);

            foreach ($points as $j => $text) {
                $experience->points()->create(['content' => $text, 'sort_order' => $j + 1]);
            }
        }
    }
}