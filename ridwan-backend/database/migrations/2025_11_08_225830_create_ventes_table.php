<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void 
    {
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('code_produit'); // relié à produits.code_produit
            $table->string('produit');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('total', 10, 2);
            $table->string('client')->nullable();
            $table->foreignId('facture_id')->constrained('factures')->onDelete('cascade');
            $table->timestamps();

            $table->foreign('code_produit')
                  ->references('code_produit')
                  ->on('produits')
                  ->onDelete('cascade');
        });

        Schema::table('ventes', function (Blueprint $table) {
            $table->foreignId('user_id')->after('client')->nullable()->constrained('users')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventes');
    }
};
