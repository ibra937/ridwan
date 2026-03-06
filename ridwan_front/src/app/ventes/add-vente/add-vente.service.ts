import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProduitApi {
  id: number | string;
  code_produit: string;
  produit: string;
  prix: number;
}

export interface VenteLignePayload {
  code_produit: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface VentePayload {
  client: string;
  produits: VenteLignePayload[];
}

@Injectable({
  providedIn: 'root'
})
export class AddVenteService {
  private readonly BASE_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  addVente(data: VentePayload): Observable<unknown> {
    return this.http.post(`${this.BASE_URL}/ventes`, data);
  }

  produits(): Observable<ProduitApi[]> {
    return this.http.get<ProduitApi[]>(`${this.BASE_URL}/produits`);
  }
}
