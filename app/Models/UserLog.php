<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLog extends Model
{
    use HasFactory;

    protected $table = 'TBL_R_Log';

    protected $fillable = [
        'user_id',
        'method',
        'url',
        'ip_address',
        'user_agent',
        'payload',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
