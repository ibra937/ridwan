<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_produit',
        'produit',
        'quantite',
        'prix_unitaire',
        'total',
        'client',
        'facture_id'
    ];

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation avec le produit
    public function produit()
    {
        return $this->belongsTo(Produit::class, 'code_produit', 'code_produit');
    }
}
