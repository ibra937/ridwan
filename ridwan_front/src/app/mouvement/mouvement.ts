import { Component, OnInit } from '@angular/core';
import { MouvementsService } from './mouvement.service';
import { ProduitsService } from '../produits/produits.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-mouvements',
  templateUrl: './mouvement.html',
  styleUrls: ['./mouvement.scss'],
  standalone: false
})
export class MouvementsComponent implements OnInit {

  loading = false;
  mouvements: any[] = [];

  constructor(
    private svc: MouvementsService,
    private produitsSvc: ProduitsService
  ) {}

  ngOnInit(): void {
    this.loadMouvements();
    this.loadProduits();
  }

  loadMouvements() {
    this.loading = true;

    this.svc.getMouvements().subscribe({
      next: (data) => {
        this.mouvements = data;
        this.loading = false;
      },
      error: () => {
        alert('Erreur lors du chargement des mouvements');
        this.loading = false;
      }
    });
  }

  produitsMap: Record<number, string> = {};
  loadProduits() {
  this.produitsSvc.getProduits().subscribe({
    next: (produits) => {
      produits.forEach(p => {
        this.produitsMap[p.id] = p.produit;
      });
    },
    error: () => console.error('Erreur chargement produits')
  });
}

  /** 💰 Montant total du mouvement */
  getMontant(m: any): number {
    if (!m.prix_unitaire) return 0;
    return m.quantite * m.prix_unitaire;
  }

}