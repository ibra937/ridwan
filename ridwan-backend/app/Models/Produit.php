<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;
    protected $fillable = [
        'produit',
        'description',
        'prix',
        'prix_vente',
        'code_produit',
        'quantite',
        'categorie',
    ];

    public function ventes()
    {
        return $this->hasMany(Vente::class)->with('produit');
    }
    
}
