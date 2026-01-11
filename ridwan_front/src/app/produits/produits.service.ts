import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private BASE_URL = 'http://localhost:8000/api/produits';

  constructor(private http: HttpClient) {}

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(this.BASE_URL);
  }

  getProduit(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`);
  }

  updateProduit(id: number, produit: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, produit);
  }

  deleteProduit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`);
  }
}
