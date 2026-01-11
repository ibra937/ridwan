<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Facture;

class FactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $factures=Facture::orderBy('create_at')->get();
        return response()->json($factures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    /*public function show($numero_facture)
    {
        // Récupérer la facture avec toutes ses ventes
        $facture = Facture::with('ventes')->where("numero_facture", $numero_facture)->first();

        if (!$facture) {
            return response()->json(['message' => 'Facture non trouvée'], 404);
        }

        return response()->json([
            'facture' => $facture,
            'ventes' => $facture->ventes
        ], 200);
    }*/

    public function show($id)
    {
        // Récupérer la facture avec toutes ses ventes
        $facture = Facture::with('ventes')->find($id);

        if (!$facture) {
            return response()->json(['message' => 'Facture non trouvée'], 404);
        }

        return response()->json([
            'facture' => $facture
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
