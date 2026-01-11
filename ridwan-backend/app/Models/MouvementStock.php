<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_produit',
        'type_mouvement',
        'quantite',
        'prix_unitaire',
        'description',
        'date_mouvement',
    ];

    protected $casts = [
        'date_mouvement' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($mouvement) {
            $mouvement->date_mouvement = now();
        });
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public $timestamps = true;
}
