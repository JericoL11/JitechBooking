import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RoomService, Room } from '../../Services/Room/room.service';
import { BookingService, Booking } from '../../Services/Booking/booking.service';
import { AddonService, Addon } from '../../Services/Addon/addon.service';

@Component({
  selector: 'app-booking-rooms',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './booking-rooms.component.html',
  styleUrls: ['./booking-rooms.component.css']
})
export class BookingRoomsComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoomType = '';
  isModalOpen = false;
  selectedRoom?: Room;
  selectedBooking: Booking | null | undefined = undefined;
  bookingForm: FormGroup;
  availableAddons: Addon[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private bookingService: BookingService,
    private addonService: AddonService
  ) {
    this.bookingForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      addons: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedRoomType = params['roomType'] || '';
      if (this.selectedRoomType) {
        this.fetchRooms();
      } else {
        console.warn('Room type not selected.');
      }
    });

    // Load available add‑ons
    this.addonService.getAddons().subscribe({
      next: data => (this.availableAddons = data),
      error: err => console.error('Error loading addons:', err)
    });
  }

  fetchRooms(): void {
    this.roomService.getRoomsByType(this.selectedRoomType).subscribe({
      next: data => (this.rooms = data),
      error: err => console.error('Error fetching rooms:', err)
    });
  }

  openModal(room: Room): void {
    this.selectedRoom = room;
    this.isModalOpen = true;

    if (!room.isAvailable) {
      this.bookingService.getBookingByRoomId(room._id!).subscribe({
        next: booking => {
          this.selectedBooking = booking;
        },
        error: err => {
          if (err.status === 404) {
            // No active booking found; set to null.
            this.selectedBooking = null;
          } else {
            console.error('Error fetching booking details:', err);
          }
        }
      });
    } else {
      // For available rooms, clear previous booking info and reset the form.
      this.resetBookingForm();
      this.selectedBooking = undefined;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetBookingForm();
    this.selectedBooking = undefined;
  }

  submitBooking(): void {
    if (this.bookingForm.valid && this.selectedRoom) {
      const bookingData: Partial<Booking> = {
        room: this.selectedRoom._id,
        customer: {
          fname: this.bookingForm.value.fname,
          lname: this.bookingForm.value.lname
        },
        checkInDate: this.bookingForm.value.checkInDate,
        checkOutDate: this.bookingForm.value.checkOutDate,
        addons: this.bookingForm.value.addons
      };

      this.bookingService.createBooking(bookingData).subscribe({
        next: res => {
          console.log('Booking created successfully', res);
          this.closeModal();
          this.fetchRooms();
        },
        error: err => console.error('Error creating booking:', err)
      });
    }
  }

  completeTransaction(): void {
    if (this.selectedBooking && this.selectedBooking._id) {
      this.bookingService.updateBooking(this.selectedBooking._id, { status: 'completed' }).subscribe({
        next: updatedBooking => {
          console.log('Booking completed successfully', updatedBooking);
          this.closeModal();
          this.fetchRooms();
        },
        error: err => console.error('Error completing booking:', err)
      });
    }
  }

  cancelBooking(): void {
    if (this.selectedBooking && this.selectedBooking._id) {
      this.bookingService.updateBooking(this.selectedBooking._id, { status: 'cancelled' }).subscribe({
        next: updatedBooking => {
          console.log('Booking cancelled successfully', updatedBooking);
          this.closeModal();
          this.fetchRooms();
        },
        error: err => console.error('Error cancelling booking:', err)
      });
    }
  }

  getRoomStatusColor(room: Room): string {
    if (room.isAvailable) {
      return 'bg-blue-500';
    } else if (!room.isAvailable && room.isActive) {
      return 'bg-yellow-500';
    } else if (!room.isActive) {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  }

  // Getter for addons FormArray.
  get addonsFormArray(): FormArray {
    return this.bookingForm.get('addons') as FormArray;
  }

  onAddonChange(event: any, addon: Addon): void {
    if (event.target.checked) {
      this.addonsFormArray.push(
        this.fb.group({
          addonItem: [addon._id, Validators.required],
          quantity: [1, [Validators.required, Validators.min(1)]]
        })
      );
    } else {
      const index = this.addonsFormArray.controls.findIndex(ctrl => ctrl.value.addonItem === addon._id);
      if (index !== -1) {
        this.addonsFormArray.removeAt(index);
      }
    }
  }

  onAddonQuantityChange(event: any, addon: Addon): void {
    const newQuantity = Number(event.target.value);
    const index = this.addonsFormArray.controls.findIndex(ctrl => ctrl.value.addonItem === addon._id);
    if (index !== -1 && newQuantity >= 1) {
      this.addonsFormArray.at(index).patchValue({ quantity: newQuantity });
    }
  }

  isAddonSelected(addonId: string): boolean {
    return this.addonsFormArray.controls.some(ctrl => ctrl.value.addonItem === addonId);
  }

  getAddonQuantity(addonId: string): number {
    const ctrl = this.addonsFormArray.controls.find(control => control.value.addonItem === addonId);
    return ctrl ? ctrl.value.quantity : 1;
  }

  // Private helper to reset the booking form and clear add‑ons.
  private resetBookingForm(): void {
    this.bookingForm.reset();
    this.addonsFormArray.clear();
  }

  updateBookingStatus(newStatus: string): void {
    if (this.selectedBooking && this.selectedBooking._id) {
      this.bookingService.updateBooking(this.selectedBooking._id, { status: newStatus }).subscribe({
        next: updatedBooking => {
          console.log(`Booking ${newStatus} successfully`, updatedBooking);
          this.closeModal();
          this.fetchRooms();
        },
        error: err => console.error(`Error updating booking status to ${newStatus}:`, err)
      });
    }
  }
  
}
