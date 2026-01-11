import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddProduitService {
  private BASE_URL = 'http://localhost:8000/api/produits';

  constructor(private http: HttpClient) {}

  addProduit(produit: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL, produit);
  }

  getProduit(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`);
  }

  updateProduit(id: number, produit: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, produit);
  }
}
