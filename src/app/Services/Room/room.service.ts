import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

//model
export interface Room {
  _id: string;
  roomName: string;
  price: number;
  roomType: 'Standard' | 'Deluxe' | 'Suite' | 'Family';
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
  
  getRoomById(_id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${_id}`);
  }
  
  
}
