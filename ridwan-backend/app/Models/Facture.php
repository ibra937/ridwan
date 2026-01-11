<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = [
        'numero_facture',
        'client', 
        'total_prix',
    ];

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }
}

