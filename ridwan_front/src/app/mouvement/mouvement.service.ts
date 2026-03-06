import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MouvementsService {

  private baseUrl = 'http://localhost:8000/api/mouvements';

  constructor(private http: HttpClient) {}

  // 📌 Tous les mouvements
  getMouvements(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }


  // 📌 Un mouvement
  getMouvement(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // 📌 Ajouter un mouvement
  addMouvement(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // 📌 Supprimer un mouvement
  deleteMouvement(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
