<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'nik', 'email', 'password', 'role', 'last_login_at', 'last_login_ip', 'last_login_device', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_IT    = 'it';
    const ROLE_CC    = 'cc';
    const ROLE_USER  = 'user';

    const ROLES = [
        self::ROLE_ADMIN => 'Admin',
        self::ROLE_IT    => 'IT',
        self::ROLE_CC    => 'CC',
        self::ROLE_USER  => 'User',
    ];

    /**
     * Role helper methods
     */
    public function isAdmin(): bool  { return $this->role === self::ROLE_ADMIN; }
    public function isIT(): bool     { return $this->role === self::ROLE_IT; }
    public function isCC(): bool     { return $this->role === self::ROLE_CC; }
    public function isUser(): bool   { return $this->role === self::ROLE_USER; }

    public function hasRole(string|array $roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    /**
     * Get dashboard route based on role
     */
    public function getDashboardRoute(): string
    {
        return match($this->role) {
            self::ROLE_ADMIN => 'admin.dashboard',
            self::ROLE_IT    => 'it.dashboard',
            self::ROLE_CC    => 'cc.dashboard',
            default          => 'user.dashboard',
        };
    }

    /**
     * Get avatar url accessor
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar) {
            // Check if avatar is uploaded directly to public (starts with avatars/)
            if (str_starts_with($this->avatar, 'avatars/')) {
                return asset($this->avatar);
            }
            return asset('storage/' . $this->avatar);
        }
        return null;
    }

    protected $appends = ['avatar_url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'last_login_at'     => 'datetime',
        ];
    }
}
