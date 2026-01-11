<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\VenteController;

Route::get('/test', function() {
    return response()->json(['message' => 'API fonctionne']);
});

//Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('produits', ProduitController::class);
    Route::apiResource('mouvements', MouvementStockController::class);
    Route::apiResource('ventes', VenteController::class);
    Route::apiResource('factures', App\Http\Controllers\Api\FactureController::class);
//});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // actions réservées aux admins 
});

