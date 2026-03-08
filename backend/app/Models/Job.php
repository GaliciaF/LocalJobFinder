<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'employer_id','category_id', 'category_name','title','description',
        'salary','rate_type','negotiable','barangay','purok',
        'latitude','longitude','start_date','start_time',
        'notify_nearby','status','hired_worker_id',
    ];

    protected $casts = [
        'negotiable'     => 'boolean',
        'notify_nearby'  => 'boolean',
        'start_date'     => 'date',
        'salary'         => 'decimal:2',
    ];

    public function employer()     { return $this->belongsTo(User::class, 'employer_id'); }
    public function category()     { return $this->belongsTo(Category::class); }
    public function applications() { return $this->hasMany(Application::class); }
    public function hiredWorker()  { return $this->belongsTo(User::class, 'hired_worker_id'); }
    public function reviews()      { return $this->hasMany(Review::class); }

    public function getApplicantCountAttribute()
    {
        return $this->applications()->count();
    }
}