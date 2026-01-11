<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vente;
use App\Models\Produit;
use App\Models\Facture;
use App\Models\MouvementStock;
use Illuminate\Support\Facades\DB;

class VenteController extends Controller
{
    /**
     * Liste des ventes
     */
    public function index()
    {
        $ventes = Vente::orderBy('created_at', 'desc')->get();
        return response()->json($ventes);
    }

    /**
     * Créer une vente
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'client' => 'nullable|string',
                'produits' => 'required|array|min:1',
                'produits.*.code_produit' => 'required|exists:produits,code_produit',
                'produits.*.quantite' => 'required|integer|min:1',
                'produits.*.prix_unitaire' => 'required|numeric|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }

        return DB::transaction(function () use ($validated) {

            
            $total_prix = 0;
            foreach ($validated['produits'] as $item) {
                $produit = Produit::where('code_produit', $item['code_produit'])->first();

                if (!$produit) {
                    throw new \Exception("Produit {$item['code_produit']} introuvable");
                }

                if ($produit->quantite < $item['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit {$item['code_produit']}");
                }

                $total_prix += $item['quantite'] * $item['prix_unitaire'];
            }

            $numero_facture = 'FAC-' . time();

            // 2️⃣ Créer la facture
            $facture = Facture::create([
                'numero_facture' => $numero_facture,
                'client' => $validated['client'] ?? null,
                'total_prix' => $total_prix,
                'user_id' => auth()->id() ?? null,
            ]);

            // 3️⃣ Créer les ventes et les mouvements de stock
            foreach ($validated['produits'] as $item) {
                $produit = Produit::where('code_produit', $item['code_produit'])->first();

                // Créer la vente liée à la facture
                Vente::create([
                    'facture_id'    => $facture->id,  // 🔑 obligatoire
                    'code_produit'  => $produit->code_produit,
                    'produit'       => $produit->produit,
                    'quantite'      => $item['quantite'],
                    'client'        => $validated['client'] ?? null,
                    'prix_unitaire' => $item['prix_unitaire'],
                    'total'         => $item['quantite'] * $item['prix_unitaire'],
                ]);

                // Décrémenter le stock
                $produit->decrement('quantite', $item['quantite']);

                // Enregistrer le mouvement de stock
                MouvementStock::create([
                    'code_produit'   => $produit->code_produit,
                    'produit'       => $produit->produit,
                    'categorie'    => $produit->categorie,
                    'type_mouvement' => 'SORTIE', // minuscule pour l'enum SQLite
                    'quantite'       => $item['quantite'],
                    'prix_unitaire'  => $item['prix_unitaire'],
                    'description'    => 'Sortie suite à une vente',
                    'date_mouvement' => now(),
                ]);
            }

            // 4️⃣ Retourner la facture avec ses ventes
            return response()->json([
                'message' => 'Facture et ventes enregistrées avec succès',
                'facture' => $facture->load('ventes'),
            ], 201);
        });
    }
    /**
     * Afficher une vente
     */
    public function show($id)
    {
        $vente = Vente::find($id);
        if (!$vente) {
            return response()->json(['message' => 'Vente non trouvée'], 404);
        }
        return response()->json($vente);
    }
}
