<?php

namespace Database\Seeders;

use App\Models\Profile;
use Illuminate\Database\Seeder;

class EducationSeeder extends Seeder
{
    public function run(): void
    {
        $profile = Profile::firstOrFail();

        $profile->educations()->delete();

        $items = [
            [
                'institution'  => 'Universitas Muhammadiyah Sukabumi',
                'major'        => "Bachelor's Degree in Informatics Engineering",
                'period_start' => '2024',
                'period_end'   => null,
                'note'         => null,
            ],
            [
                'institution'  => 'SMKN P 1 Sukaraja',
                'major'        => 'Computer and Network Engineering',
                'period_start' => '2019',
                'period_end'   => '2022',
                'note'         => 'Vocational High School (SMK)',
            ],
            [
                'institution'  => 'SMP Sinar Islam',
                'major'        => 'Junior High School',
                'period_start' => '2016',
                'period_end'   => '2019',
                'note'         => null,
            ],
            [
                'institution'  => 'SDN Buniwangi',
                'major'        => 'Elementary School',
                'period_start' => '2010',
                'period_end'   => '2016',
                'note'         => null,
            ],
        ];

        foreach ($items as $i => $item) {
            $profile->educations()->create($item + ['sort_order' => $i + 1]);
        }
    }
}
