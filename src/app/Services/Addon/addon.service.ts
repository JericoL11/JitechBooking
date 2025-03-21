import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Addon {
  _id: string;        
  name: string;
  price: number;
  description?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddonService {
  private apiUrl = `${environment.api}/addons`;

  constructor(private http: HttpClient) {}

  getAddons(): Observable<Addon[]> {
    return this.http.get<Addon[]>(this.apiUrl);
  }
  
}
