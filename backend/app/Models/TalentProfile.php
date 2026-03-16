<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TalentProfile extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'model',
        'photographer',
        'makeup artist',
        'tattoo artist',
        'creative director',
        'stylist',
    ];

    protected $fillable = [
        'user_id',
        'stage_name',
        'category',
        'city',
        'age',
        'bio',
        'day_rate',
        'session_rate',
        'availability_text',
        'profile_image',
        'cover_image',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'age' => 'integer',
            'day_rate' => 'decimal:2',
            'session_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class)->orderBy('sort_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
