<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActualDaily extends Model
{
    use HasFactory;

    protected $table = 'TBL_T_ACTUAL_DAILY';

    protected $fillable = [
        'date',
        'fund_center',
        'commitment_item',
        'amount',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];
}
