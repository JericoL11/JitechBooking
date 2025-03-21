import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoomService, Room } from '../../Services/Room/room.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-rooms',
  imports: [CommonModule,RouterModule],
  templateUrl: './booking-rooms.component.html',
  styleUrls: ['./booking-rooms.component.css']
})
export class BookingRoomsComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoomType: string = '';

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    // Subscribe to query parameters
    this.route.queryParams.subscribe((params) => {
      this.selectedRoomType = params['roomType'] || '';
      console.log('Selected Room Type:', this.selectedRoomType);
      if (this.selectedRoomType) {
        this.fetchRooms();
      } else {
        console.warn('Room type not selected.');
      }
    });
  }

  fetchRooms() {
    this.roomService.getRoomsByType(this.selectedRoomType).subscribe({
      next: (data) => {
        this.rooms = data;
      },
      error: (err) => {
        console.error('Error fetching rooms:', err);
      }
    });
  }

  // Helper method to get a color class based on room status
  getRoomStatusColor(room: Room): string {
    if (room.isAvailable) {
      return 'bg-blue-500'; // Available = blue
    } else if (!room.isAvailable && room.isActive) {
      return 'bg-yellow-500'; // In use = yellow
    } else if (!room.isActive) {
      return 'bg-red-500'; // Not available = red
    }
    return 'bg-gray-500'; // default color if none of the conditions match
  }
  
}
