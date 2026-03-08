<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/admin/users?role=worker&search=juan&status=active
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->with(['workerProfile','employerProfile'])
            ->withCount(['reviewsReceived as review_count'])
            ->withAvg('reviewsReceived as avg_rating', 'rating')
            ->latest()
            ->paginate(20);

        // Fill missing phone/email from profiles
        $users->getCollection()->transform(function ($user) {
            if (!$user->phone) {
                $user->phone = $user->workerProfile->phone ?? $user->employerProfile->phone ?? null;
            }
            if (!$user->email) {
                $user->email = $user->workerProfile->email ?? $user->employerProfile->email ?? null;
            }
            return $user;
        });

        return response()->json($users);
    }

    // GET /api/admin/users/{id}
    public function show(User $user)
    {
        $user->load(['employerProfile','workerProfile','reviewsReceived']);
        if (!$user->phone) {
            $user->phone = $user->workerProfile->phone ?? $user->employerProfile->phone ?? null;
        }
        if (!$user->email) {
            $user->email = $user->workerProfile->email ?? $user->employerProfile->email ?? null;
        }

        return response()->json($user);
    }

    // PATCH /api/admin/users/{id}/status
    public function updateStatus(Request $request, User $user)
    {
        $data = $request->validate([
            'status'           => 'required|in:active,suspended,banned',
            'suspension_reason'=> 'nullable|string',
            'suspended_until'  => 'nullable|date',
        ]);

        $user->update($data);

        return response()->json(['message' => "User {$data['status']}.", 'user' => $user]);
    }

    // DELETE /api/admin/users/{id}
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}