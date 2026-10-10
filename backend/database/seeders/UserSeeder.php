<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'مدیر سیستم',
            'email' => 'admin@ofogh.ir',
            'phone' => '۰۹۱۲۳۴۵۶۷۸۹',
            'password' => Hash::make('admin123456'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'نگار تهرانی',
            'email' => 'negar@ofogh.ir',
            'phone' => '۰۹۱۲۳۴۵۶۷۹۰',
            'password' => Hash::make('agent123456'),
            'role' => 'agent',
        ]);
    }
}
