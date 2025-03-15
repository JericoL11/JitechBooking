import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../Services/Booking/booking.service';
import { RoomService, Room } from '../../Services/Room/room.service';
import { CustomerService } from '../../Services/Customer/customer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  customerForm!: FormGroup;
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: string[] = ["Standard", "Deluxe", "Family", "Suite"];
  selectedRoomType: string | null = null;
  selectedRoom: Room | null = null;
  errorMessage: string = '';
  currentStep: number = 1;

  // Pricing & Charges
  totalPrice: number = 0;
  extraChargePerPerson: number = 500; 
  extraPersonLimit: number = 2; 

  // Nights & Extra Person Tracking
  extraCharge: number = 0;
  numberOfNights: number = 0;
  extraPersons: number = 0;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      roomId: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      numPersons: ['', [Validators.required, Validators.min(1)]]
    });

    this.customerForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });

    this.fetchRooms();

    // Auto-update price when any booking field changes
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  get roomPrice(): number {
    return Number(this.selectedRoom?.price) || 0;
  }

  calculateTotalPrice(): void {
    if (!this.selectedRoom) {
      this.totalPrice = 0;
      this.numberOfNights = 0;
      this.extraPersons = 0;
      return;
    }
  
    const checkInDateValue = this.bookingForm.get('checkInDate')?.value;
    const checkOutDateValue = this.bookingForm.get('checkOutDate')?.value;
    const numPersons = Number(this.bookingForm.get('numPersons')?.value) || 1;
  
    if (!checkInDateValue || !checkOutDateValue) {
      this.totalPrice = 0;
      this.numberOfNights = 0;
      this.errorMessage = 'Please select check-in and check-out dates.';
      return;
    }
  
    const checkInDate = new Date(checkInDateValue);
    const checkOutDate = new Date(checkOutDateValue);
  
    // Prevent invalid date selection
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      this.totalPrice = 0;
      this.numberOfNights = 0;
      this.errorMessage = 'Check-out date must be later than check-in date.';
      return;
    }
  
    // Calculate nights
    this.numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
  
    const roomPrice = Number(this.selectedRoom?.price) || 0;
    const basePrice = this.numberOfNights * roomPrice;
    let extraCharge = 0;
    
    // Calculate extra persons charge (only multiply by extra persons, not by number of nights)
    this.extraPersons = Math.max(0, numPersons - Number(this.selectedRoom?.capacity ?? 0));
    if (this.extraPersons > 0) {
      // Use the room's excessPerhead value for extra charge
      extraCharge = this.extraPersons * Number(this.selectedRoom?.excessPerhead);
    }
  
    // Calculate total price including extra charges
    this.totalPrice = basePrice + extraCharge;
    this.extraCharge = extraCharge;
    this.errorMessage = ''; // Clear previous errors
  
    console.log(`
      Booking Calculation:
      - Room Price Per Night: ₱${roomPrice}
      - Number of Nights: ${this.numberOfNights}
      - Base Price: ₱${basePrice}
      - Extra Persons: ${this.extraPersons} (₱${this.selectedRoom?.excessPerhead} per extra person)
      - Extra Charge: ₱${extraCharge}
      - Total Price: ₱${this.totalPrice}
    `);
  }
  

  fetchRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => (this.rooms = rooms),
      error: () => (this.errorMessage = 'Unable to load rooms.')
    });
  }

  selectRoomType(type: string): void {
    this.selectedRoomType = type;
    this.filteredRooms = this.rooms.filter(room => room.roomType === type );
    this.currentStep = 2;
  }

  updateRoomDetails(event: any): void {
    const roomId = event.target.value;
    this.selectedRoom = this.filteredRooms.find(room => room._id === roomId) || null;
    // Update the booking form with the selected room id
    this.bookingForm.patchValue({ roomId: roomId });
    this.calculateTotalPrice();
  }

  nextStep(): void {
    // Mark all booking form controls as touched so validation messages show up
    this.bookingForm.markAllAsTouched();
    if (this.bookingForm.valid) {
      const numPersons = Number(this.bookingForm.get('numPersons')?.value);
      if (this.selectedRoom && numPersons > Number(this.selectedRoom.capacity) + this.extraPersonLimit) {
        this.errorMessage = `This room can only accommodate up to ${Number(this.selectedRoom.capacity) + this.extraPersonLimit} persons.`;
        return;
      }
      this.errorMessage = '';
      this.currentStep = 3;
    } else {
      this.errorMessage = 'Please fill all required fields in Step 2.';
    }
  }

  previousStep(): void {
    // Allow navigation back to the previous step
    if (this.currentStep === 3) {
      this.currentStep = 2;
    } else {
      this.currentStep = 1;
    }
  }
  onSubmit(): void {
    // Mark all customer form controls as touched
    this.customerForm.markAllAsTouched();
    if (this.customerForm.valid) {
      // Build the bookingData using values from both the booking and customer forms
      const bookingData = {
        roomId: this.bookingForm.get('roomId')?.value,
        checkInDate: this.bookingForm.get('checkInDate')?.value,
        checkOutDate: this.bookingForm.get('checkOutDate')?.value,
        guests: Number(this.bookingForm.get('numPersons')?.value),
        roomType: this.selectedRoom?.roomType,
        grandTotal: this.totalPrice,
        // Directly embed the customer details from the form
        customer: {
          fname: this.customerForm.get('fname')?.value,
          lname: this.customerForm.get('lname')?.value,
          email: this.customerForm.get('email')?.value  // include email if needed
        }
      };
  
      // Directly create the booking using the bookingData
      this.bookingService.createBooking(bookingData).subscribe({
        next: (booking) => {
          alert('Booking successful!');
          this.resetForms();
        },
        error: (err) => {
          this.errorMessage = "Error creating booking: " + err.error.message;
        }
      });
    } else {
      this.errorMessage = 'Please fill all customer details.';
    }
  }
  

  resetForms(): void {
    this.bookingForm.reset();
    this.customerForm.reset();
    this.selectedRoom = null;
    this.currentStep = 1;
    this.totalPrice = 0;
    this.numberOfNights = 0;
    this.extraPersons = 0;
    this.errorMessage = '';
  }
}
