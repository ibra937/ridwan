<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;
use App\Models\MouvementStock;


class ProduitController extends Controller
{
    // 🔹 Lister tous les produits
    public function index(Request $request)
    {
        // Vérifie si un filtre de catégorie est présent
        if ($request->has('categorie')) {
            $produits = Produit::where('categorie', $request->categorie)->get();
        } else {
            $produits = Produit::all();
        }
        return response()->json($produits, 200);
    }

    // 🔹 Ajouter un produit
    public function store(Request $request)
    {
       $validated = $request->validate([
           'produit' => 'required|string|max:255',
           'quantite' => 'required|integer|min:1',
           'prix' => 'required|numeric|min:0',
           'description' => 'nullable|string',
           'categorie' => 'required|string',
       ]);
    
       // 🔹 Génération automatique du code produit
       $codeProduit = strtoupper(
           substr($validated['categorie'], 0, 3) . '-' .
           substr(str_replace(' ', '', $validated['produit']), 0, 6)
       );
    
       $validated['code_produit'] = $codeProduit;
    
       // 🔍 Vérifie si le produit existe déjà
       $produit = Produit::where('code_produit', $codeProduit)->first();
    
       if ($produit) {
           // Produit existant → mise à jour du stock
           $produit->quantite += $validated['quantite'];
           $produit->save();
    
           MouvementStock::create([
               'code_produit' => $produit->code_produit,
               'produit' => $produit->produit,
               'categorie' => $produit->categorie,
               'type_mouvement' => 'ENTREE',
               'quantite' => $validated['quantite'],
               'description' => 'Réapprovisionnement du stock existant',
               'date_mouvement' => now(),
           ]);
    
           return response()->json([
               'message' => 'Stock du produit mis à jour ✅',
               'produit' => $produit
           ], 200);
       }
    
       // Nouveau produit
       $produit = Produit::create($validated);
    
       MouvementStock::create([
           'code_produit' => $produit->code_produit,
           'produit' => $produit->produit,
           'categorie' => $produit->categorie,
           'type_mouvement' => 'ENTREE',
           'quantite' => $produit->quantite,
           'description' => 'Ajout initial du produit au stock',
           'date_mouvement' => now(),
       ]);
    
       return response()->json([
           'message' => 'Nouveau produit ajouté avec succès ✅',
           'produit' => $produit
       ], 201);
    }



    // 🔹 Afficher un produit
    public function show($id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json([
                'message' => 'Produit introuvable 🚫'
            ], 404);
        }

        return response()->json($produit, 200);
    }

    // 🔹 Mettre à jour un produit
    public function update(Request $request, $id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable 🚫'], 404);
        }

        $validated = $request->validate([
            'produit' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'sometimes|required|numeric|min:0',
            'prix_vente' => 'nullable|numeric|min:0',
            'code_produit' => 'sometimes|required|string|max:55',
            'quantite' => 'sometimes|required|integer|min:0',
            'categorie' => 'nullable|string|max:255',
        ]);

        $produit->update($validated);

        return response()->json([
            'message' => 'Produit mis à jour avec succès ✅',
            'data' => $produit,
        ], 200);
    }

    // 🔹 Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable 🚫'], 404);
        }

        $produit->delete();

        return response()->json(['message' => 'Produit supprimé avec succès 🗑️'], 200);
    }
}
