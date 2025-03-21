import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Booking {
  _id?: string;
  room: string;
  customer: { fname: string; lname: string; };
  checkInDate: string;
  checkOutDate: string;
  grandTotal?: number;
  addons?: any[]; // Replace `any` with your Addon interface if available
  status?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.api}/booking`;

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  getBookingByRoomId(roomId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/room/${roomId}`);
  }

  updateBooking(bookingId: string, updateData: any): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}`, updateData);
  }
 
  // Get all bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }
}
