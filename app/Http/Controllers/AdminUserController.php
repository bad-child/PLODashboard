<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Setting;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    /**
     * Menampilkan daftar user
     */
    public function index()
    {
        // Hanya admin yang bisa akses ini (sudah dilindungi middleware di route)
        $users = User::select('id', 'name', 'nik', 'role', 'email', 'last_login_at', 'last_login_ip', 'last_login_device')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $setting = Setting::where('key', 'running_text')->first();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'runningText' => $setting ? $setting->value : '',
            'availableRoles' => User::getAvailableRoles()
        ]);
    }

    /**
     * Menyimpan user baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'required|string|max:255|unique:'.User::class,
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'role' => ['required', 'string', Rule::in(array_keys(User::getAvailableRoles()))],
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $nextId = (User::max('id') ?? 0) + 1;

        User::create([
            'id' => $nextId,
            'name' => $request->name,
            'nik' => $request->nik,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan!');
    }

    /**
     * Menghapus user
     */
    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus!');
    }

    /**
     * Reset password user ke default ('password')
     */
    public function resetPassword(Request $request, User $user)
    {
        $user->update([
            'password' => Hash::make('12345678') // Default password
        ]);

        return redirect()->back()->with('success', 'Password reset to 12345678');
    }

    /**
     * Cari Karyawan dari DB HRD
     */
    public function searchKaryawan(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        try {
            $karyawans = \Illuminate\Support\Facades\DB::table('HRD.dbo.TKaryawan as k')
                ->leftJoin('HRD.dbo.TJabatan as j', 'k.KodeJB', '=', 'j.KodeJB')
                ->select('k.NIK', 'k.Nama', 'k.Email', 'j.Nama as Jabatan')
                ->where('k.NIK', 'LIKE', "%{$query}%")
                ->orWhere('k.Nama', 'LIKE', "%{$query}%")
                ->take(10)
                ->get();
                
            return response()->json($karyawans);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal mengambil data dari HRD: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateRunningText(Request $request)
    {
        $request->validate([
            'text' => 'nullable|string|max:1000'
        ]);

        Setting::updateOrCreate(
            ['key' => 'running_text'],
            ['value' => $request->text]
        );

        \Illuminate\Support\Facades\Cache::forget('running_text');

        return redirect()->back()->with('success', 'Running text updated successfully');
    }

    public function updateTheme(Request $request)
    {
        $request->validate([
            'theme' => 'required|string|in:dark,light,senja'
        ]);

        Setting::updateOrCreate(
            ['key' => 'theme_mode'],
            ['value' => $request->theme]
        );

        \Illuminate\Support\Facades\Cache::forget('theme_mode');

        return redirect()->back()->with('success', 'Theme updated successfully');
    }

    public function updateMenuPermissions(Request $request)
    {
        $request->validate([
            'permissions' => 'required|array'
        ]);

        Setting::updateOrCreate(
            ['key' => 'role_permissions'],
            ['value' => json_encode($request->permissions)]
        );

        \Illuminate\Support\Facades\Cache::forget('role_permissions');

        return redirect()->back()->with('success', 'Hak akses menu berhasil diperbarui');
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50'
        ]);

        $name = trim($request->name);
        $slug = \Illuminate\Support\Str::slug($name);

        if (array_key_exists($slug, User::getAvailableRoles())) {
            return redirect()->back()->withErrors(['name' => 'Role ini sudah ada.']);
        }

        $customRoles = User::getCustomRoles();
        $customRoles[$slug] = $name;

        Setting::updateOrCreate(
            ['key' => 'custom_roles'],
            ['value' => json_encode($customRoles)]
        );

        return redirect()->back()->with('success', 'Role baru berhasil ditambahkan');
    }

    public function destroyRole($roleSlug)
    {
        // Check if any users have this role
        $usersCount = User::where('role', $roleSlug)->count();
        if ($usersCount > 0) {
            return redirect()->back()->with('error', "Gagal dihapus: Ada $usersCount pengguna yang masih menggunakan role ini.");
        }

        $customRoles = User::getCustomRoles();
        if (isset($customRoles[$roleSlug])) {
            unset($customRoles[$roleSlug]);
            Setting::updateOrCreate(
                ['key' => 'custom_roles'],
                ['value' => json_encode($customRoles)]
            );
        }

        return redirect()->back()->with('success', 'Role berhasil dihapus');
    }

    public function storeFeature(Request $request)
    {
        $request->validate([
            'feature_id' => 'required|string'
        ]);

        $slug = $request->feature_id;

        if (array_key_exists($slug, User::getAvailableFeatures())) {
            return redirect()->back()->withErrors(['feature_id' => 'Fitur ini sudah ada dalam daftar akses menu.']);
        }

        // Get name from dictionary
        $dictionary = User::getAppFeaturesDictionary();
        $name = $slug; // default fallback
        
        foreach ($dictionary as $category) {
            if (isset($category['features'][$slug])) {
                $name = $category['features'][$slug];
                break;
            }
        }

        $customFeatures = User::getCustomFeatures();
        $customFeatures[$slug] = $name;

        Setting::updateOrCreate(
            ['key' => 'custom_features'],
            ['value' => json_encode($customFeatures)]
        );

        return redirect()->back()->with('success', 'Fitur baru berhasil ditambahkan');
    }

    public function destroyFeature($featureSlug)
    {
        $customFeatures = User::getCustomFeatures();
        if (isset($customFeatures[$featureSlug])) {
            unset($customFeatures[$featureSlug]);
            Setting::updateOrCreate(
                ['key' => 'custom_features'],
                ['value' => json_encode($customFeatures)]
            );
            
            // Optionally, we could clean up role_permissions to remove this feature from all roles
            // But leaving it in JSON is harmless (it just won't render).
        }

        return redirect()->back()->with('success', 'Fitur berhasil dihapus');
    }
}
