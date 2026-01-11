import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacturesService {
  private BASE_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getFactures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/factures`);
  }
}
