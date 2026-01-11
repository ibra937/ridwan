<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Validation\ValidationException;

class MouvementStockController extends Controller
{
    public function index(){
        $mouvements = MouvementStock::orderBy('date_mouvement', 'desc')->get();
        return response()->json($mouvements, 200);
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'code_produit'   => 'required|string|exists:produits,code_produit',
                'produit'       => 'nullable|string',
                'categorie'    => 'nullable|string',
                'type_mouvement' => 'required|in:ENTREE,SORTIE',
                'quantite'       => 'required|integer|min:1',
                'prix_unitaire'  => 'nullable|numeric|min:0',
                'description'    => 'nullable|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }

        // 🔍 Vérifier si le produit existe
        $produit = Produit::where('code_produit', $validated['code_produit'])->first();

        if (!$produit) {
            return response()->json([
                'status' => 'error',
                'message' => 'Produit introuvable'
            ], 404);
        }

        // 🔄 Ajuster la quantité
        if ($validated['type_mouvement'] === 'ENTREE') {
            $produit->quantite += $validated['quantite'];
        } else {
            if ($produit->quantite < $validated['quantite']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stock insuffisant pour cette sortie'
                ], 400);
            }
            $produit->quantite -= $validated['quantite'];
        }

        $produit->save();

        // 💾 Enregistrer le mouvement
        $mouvement = MouvementStock::create([
            'code_produit'   => $validated['code_produit'],
            'produit'       => $validated['produit'] ?? $produit->produit,
            'categorie'    => $validated['categorie'] ?? $produit->categorie,
            'type_mouvement' => $validated['type_mouvement'],
            'quantite'       => $validated['quantite'],
            'prix_unitaire'  => $validated['prix_unitaire'] ?? null,
            'description'    => $validated['description'] ?? null,
            'user_id'        => auth()->id() ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mouvement enregistré avec succès',
            'produit' => $produit,
            'mouvement' => $mouvement
        ], 201);
    }

    public function show($code_produit){
        $mouvements = MouvementStock::where('code_produit', $code_produit)
            ->orderBy('date_mouvement', 'desc')
            ->get();

        if ($mouvements->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun mouvement trouvé pour ce produit'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $mouvements
        ], 200);
    }
}
