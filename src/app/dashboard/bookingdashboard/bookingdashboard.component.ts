// src/app/dashboard/bookingdashboard/bookingdashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../Services/Booking/booking.service';
import { RoomService } from '../../Services/Room/room.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-bookingdashboard',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './bookingdashboard.component.html',
  styleUrls: ['./bookingdashboard.component.css']
})
export class BookingdashboardComponent implements OnInit {
  bookings: Booking[] = [];
  errorMessage: string = '';

  // Summary stats
  totalBookings: number = 0;
  checkInsToday: number = 0;
  checkOutsToday: number = 0;
  totalRevenueMonth: number = 0;

  // Lookup map for room names (if needed)
  roomsMap: { [key: string]: string } = {};

  // Modal for editing booking
  isModalOpen = false;
  selectedBooking: Booking | null = null;
  bookingEditForm!: FormGroup;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRooms();
    this.fetchBookings();
    this.initializeEditForm();
  }

  initializeEditForm(): void {
    this.bookingEditForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      status: ['', Validators.required],
      description: ['']
    });
  }

  fetchRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        for (let room of rooms) {
          this.roomsMap[room._id] = room.roomName;
        }
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
      }
    });
  }

  fetchBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (data) => {
          // Sort bookings by checkInDate (earliest first)
      this.bookings = data.sort((a, b) => {
        return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      });
        this.calculateStats(data);
      },
      error: (err) => {
        this.errorMessage = 'Error loading bookings: ' + err.message;
      }
    });
  }

  calculateStats(bookings: Booking[]): void {
    const today = new Date();
    this.totalBookings = bookings.length;
    this.checkInsToday = bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      return checkIn.toDateString() === today.toDateString();
    }).length;
    this.checkOutsToday = bookings.filter(booking => {
      const checkOut = new Date(booking.checkOutDate);
      return checkOut.toDateString() === today.toDateString();
    }).length;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    this.totalRevenueMonth = bookings
      .filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        return checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + (booking.grandTotal || 0), 0);
  }

  // Helper method to get room name
  getRoomName(booking: Booking): string {
    if (booking.roomId && typeof booking.roomId === 'object') {
      return booking.roomId.roomName;
    }
    if (booking.roomId && this.roomsMap[booking.roomId]) {
      return this.roomsMap[booking.roomId];
    }
    return 'Unknown Room';
  }

  // Helper method to get embedded customer name
  getCustomerName(booking: Booking): string {
    if (booking.customer) {
      return `${booking.customer.fname} ${booking.customer.lname}`;
    }
    return 'Unknown Customer';
  }

  // Action: View booking (navigate to a detail page)
  viewBooking(booking: Booking): void {
    if (booking._id) {
      this.router.navigate(['/booking', booking._id]);
    }
  }

  // Action: Open modal to edit booking
  openEditModal(booking: Booking): void {
    this.selectedBooking = booking;
    // Pre-fill the form with booking details
    this.bookingEditForm.patchValue({
      checkInDate: this.formatDateForInput(booking.checkInDate),
      checkOutDate: this.formatDateForInput(booking.checkOutDate),
      status: booking.status,
      description: booking.description
    });
    this.isModalOpen = true;
  }

  // Format date (yyyy-MM-dd) for input type="date"
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBooking = null;
  }

  // Save edited booking
  saveBooking(): void {
    if (this.bookingEditForm.valid && this.selectedBooking) {
      const updatedBooking: Booking = {
        ...this.selectedBooking,
        checkInDate: this.bookingEditForm.get('checkInDate')?.value,
        checkOutDate: this.bookingEditForm.get('checkOutDate')?.value,
        status: this.bookingEditForm.get('status')?.value,
        description: this.bookingEditForm.get('description')?.value
      };
      this.bookingService.updateBooking(updatedBooking).subscribe({
        next: (updated) => {
          const index = this.bookings.findIndex(b => b._id === updated._id);
          if (index !== -1) {
            this.bookings[index] = updated;
          }
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = 'Error updating booking: ' + err.error.message;
        }
      });
    }
  }

  // Delete a booking
  deleteBooking(booking: Booking): void {
    if (booking._id && confirm("Are you sure you want to delete this booking?")) {
      this.bookingService.deleteBooking(booking._id).subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b._id !== booking._id);
        },
        error: (err) => {
          this.errorMessage = "Error deleting booking: " + err.error.message;
        }
      });
    }
  }
}
