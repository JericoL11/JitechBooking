import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Room, RoomService } from '../../Services/Room/room.service';
import { Booking, BookingService } from '../../Services/Booking/booking.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBook, faGear, faHouse } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-dashboard-landing',
  imports: [CommonModule,RouterModule,FontAwesomeModule],
  templateUrl: './dashboard-landing.component.html',
  styleUrl: './dashboard-landing.component.css'
})
export class DashboardLandingComponent implements OnInit {
  availableRoomsCount: number = 0;
  bookingMonitoringCount: number = 0;
  maintenanceIcon = faGear ;
  houseIcon = faHouse ;
  bookingIcon =faBook;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.fetchCounts();
  }

  fetchCounts(): void {
    // Fetch rooms and count only those that are active and available.
    this.roomService.getAllRooms().subscribe({
      next: (rooms: Room[]) => {
        this.availableRoomsCount = rooms.filter(room => room.isAvailable).length;
      },
      error: (err) => console.error('Error loading rooms:', err)
    });

    // Fetch bookings and count those with status 'pending' (i.e. not confirmed).
    this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookingMonitoringCount = bookings.filter(booking => booking.status === 'pending').length;
      },
      error: (err) => console.error('Error loading bookings:', err)
    });
  }
}