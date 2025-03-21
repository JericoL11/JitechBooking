import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../Services/Booking/booking.service';
import { RoomService, Room } from '../../Services/Room/room.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHotel, faTshirt } from '@fortawesome/free-solid-svg-icons';
import { RoomCategory, RoomCategoryService } from '../../Services/RoomCategory/room-category.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-booking',
  imports: [CommonModule,ReactiveFormsModule,FontAwesomeModule,RouterModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})

export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  customerForm!: FormGroup;
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: any[] = [];
  selectedRoomType: string | null = null;
  selectedRoom: Room | null = null;
  errorMessage: string = '';



blanketIcon = faTshirt;

  colorClasses = ['bg-red-100', 'bg-green-100', 'bg-blue-100', 'bg-yellow-100', 'bg-gray-100', 'bg-violet-100' ];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private RoomCategoryService: RoomCategoryService
  ) {}

  ngOnInit(): void {

    this.fetchRoomcategory();
    this.fetchAllRoomsCount();

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

  }

fetchRoomcategory(){
  this.RoomCategoryService.getCategory().subscribe({
    next: (data) => this.roomTypes = data,
    error: (err) => this.errorMessage = err.message
  });
}

  

  selectRoomType(type: string): void {
    this.selectedRoomType = type;
    this.filteredRooms = this.rooms.filter(room => room.roomType === type );
   
  }

  fetchAllRoomsCount(){
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
    
        // Update each category with total room count and available room count
        this.roomTypes = this.roomTypes.map((category: any) => {
          // Total rooms for this category
          const total = rooms.filter((room: any) => {
            if (typeof room.roomType === 'object' && room.roomType._id) {
              return room.roomType._id === category._id;
            } else {
              return room.roomType === category._id;
            }
          }).length;
    
          // Available rooms for this category
          const available = rooms.filter((room: any) => {
            if (!room.isAvailable) return false;
            if (typeof room.roomType === 'object' && room.roomType._id) {
              return room.roomType._id === category._id;
            } else {
              return room.roomType === category._id;
            }
          }).length;
    
          return { ...category, total, available };
        });
      },
      error: (err) => console.error(err)
    });
  }
}
