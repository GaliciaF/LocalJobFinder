<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Job;
use App\Models\Review;
use App\Models\Report;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    // GET /api/admin/analytics
    public function index()
    {
        $totalAdmins    = User::where('role', 'admin')->count();
        $totalUsers     = User::count();                  // includes admins
        $totalWorkers   = User::where('role', 'worker')->count();
        $totalEmployers = User::where('role', 'employer')->count();
        $totalJobs      = Job::count();

        // Filled jobs for hire success rate
        $filledJobs = Job::where('status', 'filled')->count();
        $hireRate   = $totalJobs > 0 ? round(($filledJobs / $totalJobs) * 100, 1) : 0;

        // Average rating across all reviews
        $avgRating = round(Review::avg('rating') ?? 0, 1);

        // Report rate (percentage of users with at least one report)
        $reportRate = $totalUsers > 0 ? round((Report::count() / $totalUsers) * 100, 2) : 0;

        // Top barangays by workers
        $byBarangay = User::where('role', 'worker')
            ->join('worker_profiles', 'users.id', '=', 'worker_profiles.user_id') 
            ->selectRaw('worker_profiles.barangay, COUNT(*) as count')
            ->groupBy('worker_profiles.barangay')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Weekly activity (last 7 days)
        $weeklyActivity = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayName = $date->format('D'); // Mon, Tue, etc.

            $newUsers = User::whereDate('created_at', $date)->count();
            $newJobs  = Job::whereDate('created_at', $date)->count();

            $weeklyActivity->push([
                'day'       => $dayName,
                'new_users' => $newUsers,
                'new_jobs'  => $newJobs,
            ]);
        }

        return response()->json([
            'hire_success_rate' => $hireRate,
            'avg_rating'        => $avgRating,
            'report_rate'       => $reportRate,
            'total_users'       => $totalUsers,
            'total_admins'      => $totalAdmins,
            'total_workers'     => $totalWorkers,
            'total_employers'   => $totalEmployers,
            'total_jobs'        => $totalJobs,
            'top_barangays'     => $byBarangay,
            'weekly_activity'   => $weeklyActivity,   // <-- added for chart
        ]);
    }
}