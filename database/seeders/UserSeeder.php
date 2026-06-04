<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'              => 'Administrator',
                'email'             => 'admin@plo.test',
                'password'          => Hash::make('password'),
                'role'              => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'IT Support',
                'email'             => 'it@plo.test',
                'password'          => Hash::make('password'),
                'role'              => User::ROLE_IT,
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Customer Care',
                'email'             => 'cc@plo.test',
                'password'          => Hash::make('password'),
                'role'              => User::ROLE_CC,
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Regular User',
                'email'             => 'user@plo.test',
                'password'          => Hash::make('password'),
                'role'              => User::ROLE_USER,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✅ Demo users created:');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@plo.test', 'password'],
                ['IT',    'it@plo.test',    'password'],
                ['CC',    'cc@plo.test',    'password'],
                ['User',  'user@plo.test',  'password'],
            ]
        );
    }
}
