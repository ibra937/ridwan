import { Component, OnInit, output } from '@angular/core';
import { ProduitsService } from './produits.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.html',
  standalone: false,
  styleUrls: ['./produits.scss']
})
export class ProduitsComponent implements OnInit {

  @Output() addProduit = new EventEmitter<any>();

  produits: any[] = [];
  loading = false;

  constructor(private produitsService: ProduitsService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits() {
    this.loading = true;
    this.produitsService.getProduits().subscribe({
      next: (res) => {
        this.produits = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteProduit(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.produitsService.deleteProduit(id).subscribe({
        next: () => {
          this.produits = this.produits.filter(p => p.id !== id);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  updateProduit(produit: any) {
    this.addProduit.emit(produit)
  }
}
