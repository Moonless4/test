<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            [
                'slug' => 'arash-rostegar',
                'name' => 'آرش رستگار',
                'role' => 'مدیرعامل',
                'photo_id' => 'photo-1507003211169-0a1dd7228f2d',
                'phone' => '۰۹۱۲۳۴۵۶۷۸۹',
                'email' => 'arash@ofogh.ir',
                'specialty' => 'املاک ممتاز، فروش خارج از نمایش عمومی، خریداران بین‌المللی',
            ],
            [
                'slug' => 'negar-tehrani',
                'name' => 'نگار تهرانی',
                'role' => 'مشاور املاک لوکس',
                'photo_id' => 'photo-1573496359142-b8d87734a5a2',
                'phone' => '۰۹۱۲۳۴۵۶۷۹۰',
                'email' => 'negar@ofogh.ir',
                'specialty' => 'خانه‌های لوکس، فروش مجدد شاخص‌های معماری، بازدیدهای خصوصی',
            ],
            [
                'slug' => 'kaveh-amini',
                'name' => 'کاوه امینی',
                'role' => 'مشاور سرمایه‌گذاری',
                'photo_id' => 'photo-1519085360753-af0119f7cbe7',
                'phone' => '۰۹۱۲۳۴۵۶۷۹۱',
                'email' => 'kaveh@ofogh.ir',
                'specialty' => 'خریدهای سرمایه‌گذاری، تحلیل بازدهی، راهبرد پرتفوی',
            ],
            [
                'slug' => 'sara-bahrami',
                'name' => 'سارا بهرامی',
                'role' => 'کارشناس ارشد املاک',
                'photo_id' => 'photo-1580489944761-15a19d654956',
                'phone' => '۰۹۱۲۳۴۵۶۷۹۲',
                'email' => 'sara@ofogh.ir',
                'specialty' => 'خانه‌های خانوادگی، جابه‌جایی، مشاورهٔ محله',
            ],
        ];

        foreach ($agents as $agent) {
            Agent::create($agent);
        }
    }
}
