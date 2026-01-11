// src/app/ventes/add-vente/add-vente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddVenteService {
  private BASE_URL = 'http://localhost:8000/api'; // adapter selon ton API

  constructor(private http: HttpClient) {}

  addVente(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/ventes`, data);
  }

  produits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/produits`);
  }
}
