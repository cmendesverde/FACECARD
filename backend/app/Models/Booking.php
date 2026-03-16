<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    public const STATUSES = [
        'pending',
        'accepted',
        'rejected',
        'completed',
    ];

    protected $fillable = [
        'client_id',
        'talent_profile_id',
        'project_type',
        'event_date',
        'location',
        'budget',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function talentProfile(): BelongsTo
    {
        return $this->belongsTo(TalentProfile::class);
    }
}
