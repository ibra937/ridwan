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
        Schema::create('mouvement_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('code_produit');
            $table->string('produit')->nullable();
            $table->string('categorie')->nullable();
            $table->enum('type_mouvement', ['ENTREE', 'SORTIE']);
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('date_mouvement')->useCurrent();
            $table->timestamps();
        });

        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->foreignId('user_id')->after('description')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('categorie')->nullable()->after('produit');
        });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};
