import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface RoomCategory {
  _id: string;
  categoryName: string;
}

@Injectable({ providedIn: 'root' })
export class RoomCategoryService {
  private apiUrl = `${environment.api}/roomCategory`;

  constructor(private http: HttpClient) {}

  getCategory(): Observable<RoomCategory[]> {
    return this.http.get<RoomCategory[]>(this.apiUrl);
  }
  createCategory(cat: Partial<RoomCategory>): Observable<RoomCategory> {
    return this.http.post<RoomCategory>(this.apiUrl, cat);
  }
  updateCategory(id: string, cat: Partial<RoomCategory>): Observable<RoomCategory> {
    return this.http.put<RoomCategory>(`${this.apiUrl}/${id}`, cat);
  }
  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
