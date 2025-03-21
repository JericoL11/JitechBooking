import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

//model
export interface RoomCategory {
  _id: string;
  categoryName: string;
}

export interface Room {
  _id: string;
  roomName: string;
  description: string;
  price: number;
  roomType: string | RoomCategory;   // ← allow both
  capacity: number;
  isActive: boolean;
  excessPerhead: number;
  isAvailable: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  //api
  private apiUrl = `${environment.api}/rooms`;

  //constructor
  constructor( private http: HttpClient) { }

  getAllRooms(): Observable<Room[]>{
    return this.http.get<Room[]>(this.apiUrl);
  };

  addRoom(room:Room): Observable<Room>{
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(_id: String, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${_id}`, room);
  }

  deleteRoom(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${_id}`);
  }
  

  // Get rooms by type (e.g., filtering by a category id or string)
  getRoomsByType(roomType: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}?roomType=${roomType}`);
  }
  
  
  
}
