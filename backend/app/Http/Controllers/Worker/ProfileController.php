<?php
namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // GET /api/worker/profile
    public function show(Request $request)
    {
        return response()->json($request->user()->load('workerProfile'));
    }

    // GET /api/employer/workers  — used by BrowseWorkers page
    public function index(Request $request)
    {
        $workers = User::where('role', 'worker')
            ->with(['workerProfile'])
            ->withAvg('reviewsReceived as avg_rating', 'rating')
            ->withCount('reviewsReceived as review_count')
            ->whereHas('workerProfile', fn($q) =>
                $q->where('is_available', true)->where('show_profile', true)
            )
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhereHas('workerProfile', fn($q2) =>
                      $q2->whereJsonContains('skills', $request->search)
                  )
            )
            ->when($request->barangay, fn($q) =>
                $q->whereHas('workerProfile', fn($q2) =>
                    $q2->where('barangay', $request->barangay)
                )
            )
            ->latest()
            ->paginate(20);

        return response()->json($workers);
    }

    // PUT /api/worker/profile
    public function update(Request $request)
    {
        $data = $request->validate([
            'full_name'        => 'nullable|string',
            'phone'            => 'nullable|string',
            'email'            => 'nullable|email',
            'barangay'         => 'nullable|string',
            'purok'            => 'nullable|string',
            'latitude'         => 'nullable|numeric',
            'longitude'        => 'nullable|numeric',
            'bio'              => 'nullable|string',
            'skills'           => 'nullable|array',
            'years_experience' => 'nullable|integer',
            'travel_distance'  => 'nullable|string',
            'expected_rate'    => 'nullable|numeric',
            'rate_type'        => 'nullable|in:Daily,Hourly,Per Service,Monthly',
            'negotiable'       => 'nullable|boolean',
            'is_available'     => 'nullable|boolean',
            'work_days'        => 'nullable|array',
            'work_start'       => 'nullable|string',
            'work_end'         => 'nullable|string',
            'blocked_dates'    => 'nullable|array',
            'show_profile'     => 'nullable|boolean',
            'allow_location'   => 'nullable|boolean',
            'receive_alerts'   => 'nullable|boolean',
            'two_factor'       => 'nullable|boolean',
        ]);

        $request->user()->workerProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json(['message' => 'Profile updated.']);
    }

    // POST /api/worker/profile/photo
    public function uploadPhoto(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:5120']);
        $path = $request->file('photo')->store('worker-photos', 'public');
        $request->user()->workerProfile()->update(['photo_path' => $path]);
        return response()->json(['photo_url' => Storage::url($path)]);
    }
}