// src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Booking {
  _id?: string;
  roomId?: string | { _id: string; roomName: string };
  customer?: { fname: string; lname: string };  // Embedded customer data
  checkInDate: Date;
  checkOutDate: Date;
  guests?: number;
  roomType?: 'Standard' | 'Deluxe' | 'Family' | 'Suite';
  grandTotal?: number;
  status?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Adjust the URL if your backend endpoint is different
  private apiUrl = `${environment.api}/booking`;

  constructor(private http: HttpClient) {}

  // Create a new booking
  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  // Optionally, you can add methods to get or update bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  updateBooking(booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${booking._id}`, booking);
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  
}
