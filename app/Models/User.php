<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['id', 'name', 'nik', 'email', 'password', 'role', 'last_login_at', 'last_login_ip', 'last_login_device', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'TBL_M_User';
    protected $primaryKey = 'nik';
    public $incrementing = false;
    protected $keyType = 'string';

    const ROLE_ADMIN = 'admin';

    const ROLES = [
        self::ROLE_ADMIN => 'Admin',
    ];
    public static function getCustomRoles(): array
    {
        $setting = \App\Models\Setting::where('key', 'custom_roles')->first();
        if ($setting && $setting->value) {
            return json_decode($setting->value, true) ?: [];
        }
        return [];
    }

    public static function getAvailableRoles(): array
    {
        $customRoles = self::getCustomRoles();
        $roles = self::ROLES;
        foreach ($customRoles as $id => $label) {
            $roles[$id] = $label;
        }
        return $roles;
    }

    public static function getSystemFeatures(): array
    {
        return [
            'admin.users.index' => 'Manajemen Pengguna',
            'admin.settings' => 'Pengaturan Sistem',
        ];
    }

    public static function getCustomFeatures(): array
    {
        $setting = \App\Models\Setting::where('key', 'custom_features')->first();
        if ($setting && $setting->value) {
            return json_decode($setting->value, true) ?: [];
        }
        return [];
    }

    public static function getAvailableFeatures(): array
    {
        $customFeatures = self::getCustomFeatures();
        $features = self::getSystemFeatures();
        foreach ($customFeatures as $id => $label) {
            $features[$id] = $label;
        }
        return $features;
    }

    public static function getAppFeaturesDictionary(): array
    {
        return [
            'dashboard' => [
                'label' => 'Dashboard',
                'features' => [
                    'dashboard.kpi.revenue' => 'KPI Card Revenue',
                    'dashboard.kpi.total_cost' => 'KPI Card Total Cost',
                    'dashboard.kpi.total_cogs' => 'KPI Card Total COGS',
                    'dashboard.kpi.ebitda' => 'KPI Card EBITDA',
                    'dashboard.chart.monthly_trend' => 'Monthly Actual vs Budget Trend',
                    'dashboard.chart.cost_composition' => 'Cost Composition',
                    'dashboard.chart.budget_vs_actual' => 'Budget vs Actual',
                    'dashboard.chart.top_5_variance' => 'Top 5 Variance Cost',
                    'dashboard.table.summary' => 'Summary Table',
                ]
            ],
            'config' => [
                'label' => 'Config',
                'features' => [
                    'config.users.create' => 'Manajemen Pengguna - Tambah Pengguna Baru',
                    'config.users.edit' => 'Manajemen Pengguna - Edit Pengguna',
                    'config.users.delete' => 'Manajemen Pengguna - Hapus Pengguna',
                    'config.users.reset_password' => 'Manajemen Pengguna - Reset Password',
                    'config.settings.theme' => 'Pengaturan Sistem - Ubah Tema',
                    'config.settings.running_text' => 'Pengaturan Sistem - Ubah Teks Berjalan',
                    'config.settings.roles' => 'Pengaturan Sistem - Manajemen Role',
                    'config.settings.features' => 'Pengaturan Sistem - Manajemen Fitur',
                    'config.settings.permissions' => 'Pengaturan Sistem - Konfigurasi Akses Menu',
                    'config.settings.privacy_policy' => 'Pengaturan Sistem - Privacy Policy',
                ]
            ]
        ];
    }

    /**
     * Role helper methods
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN || $this->role === 'administrator';
    }

    public function hasRole(string|array $roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    /**
     * Get dashboard route based on role
     */
    public function getDashboardRoute(): string
    {
        return match ($this->role) {
            self::ROLE_ADMIN => 'admin.dashboard',
            default => 'user.dashboard',
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
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }
}
