<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Setting;
use Illuminate\Validation\Rules;
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
            'role' => 'required|string|in:admin,it,cc,user',
            'password' => ['required', Rules\Password::defaults()],
        ]);

        User::create([
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
}
