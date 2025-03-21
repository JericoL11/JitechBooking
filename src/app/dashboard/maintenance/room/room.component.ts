import { Component, OnInit } from '@angular/core';
import { Room, RoomService } from '../../../Services/Room/room.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomCategory, RoomCategoryService } from '../../../Services/RoomCategory/room-category.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,        // for [(ngModel)] usage
    FontAwesomeModule,
    RouterModule
  ],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  // Room display properties
  rooms: Room[] = []; // full list of rooms from backend
  errorMessage: string = '';

  // Modal and form properties
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedRoom: Room | null = null;
  roomForm!: FormGroup;

  // Initialize new room
  newRoom: Room = {
    _id: '',
    roomName: '',
    description: '',
    price: 0,
    roomType: '',
    capacity: 0,
    excessPerhead: 0,
    isActive: true,
    isAvailable: true
  };

  // Room categories
  roomCategory: RoomCategory[] = [];

  // Icons
  editIcon = faEdit;

  // Search & Pagination
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 5; // Adjust as needed

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder,
    private roomCategoryService: RoomCategoryService
  ) {}

  ngOnInit(): void {
    this.initializeRoomForm();
    this.fetchRoomCategory();
    this.fetchRoom();
  }

  // Set up the reactive form
  initializeRoomForm(): void {
    this.roomForm = this.fb.group({
      roomName: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      roomType: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      excessPerhead: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      isAvailable: [true]
    });
  }

  // Fetch categories
  fetchRoomCategory(): void {
    this.roomCategoryService.getCategory().subscribe({
      next: (data) => (this.roomCategory = data),
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  // Fetch rooms
  fetchRoom(): void {
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.currentPage = 1; // reset pagination
      },
      error: (err) => (this.errorMessage = err.message)
    });
  }

  // ======================
  //    SEARCH & PAGING
  // ======================
  get filteredRooms(): Room[] {
    if (!this.searchQuery) {
      return this.rooms;
    }
    return this.rooms.filter((room) =>
      room.roomName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get pagedRooms(): Room[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRooms.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRooms.length / this.pageSize);
  }

  // ======================
  //      ROOM LOGIC
  // ======================
  openModal(mode: 'add' | 'edit', room?: Room): void {
    this.modalMode = mode;
    this.isModalOpen = true;

    if (mode === 'edit' && room) {
      this.selectedRoom = room;
      this.roomForm.patchValue({
        roomName: room.roomName,
        price: room.price,
        roomType: typeof room.roomType === 'object' ? room.roomType._id : room.roomType,
        capacity: room.capacity,
        excessPerhead: room.excessPerhead,
        isActive: room.isActive,
        isAvailable: room.isAvailable
      });
    } else {
      this.selectedRoom = null;
      this.roomForm.reset(this.newRoom);
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage = '';
  }

  saveRoom(): void {
    if (this.roomForm.valid) {
      if (this.modalMode === 'add') {
        this.roomService.addRoom(this.roomForm.value).subscribe({
          next: (room) => {
            this.rooms.push(room);
            this.roomForm.reset(this.newRoom);
            this.errorMessage = '';
            this.closeModal();
          },
          error: (err) => {
            console.error('Error adding room:', err);
            this.errorMessage =
              err.error && err.error.message
                ? err.error.message
                : 'An error occurred while adding the room.';
          }
        });
      } else if (this.modalMode === 'edit' && this.selectedRoom) {
        this.roomService.updateRoom(this.selectedRoom._id, this.roomForm.value).subscribe({
          next: (updatedRoom) => {
            const index = this.rooms.findIndex((r) => r._id === updatedRoom._id);
            if (index !== -1) {
              this.rooms[index] = updatedRoom;
            }
            this.errorMessage = '';
            this.closeModal();
          },
          error: (err) => {
            console.error('Error updating room:', err);
            this.errorMessage =
              err.error && err.error.message
                ? err.error.message
                : 'An error occurred while updating the room.';
          }
        });
      }
    }
  }

  // ======================
  // HELPER FUNCTION
  // ======================
  /**
   * Safely get the category name for a room.
   * This avoids arrow functions in the template and prevents parser errors.
   */
  getCategoryName(room: Room): string {
    if (!room.roomType) return '';
    // If it's already an object, return the categoryName
    if (typeof room.roomType === 'object') {
      return room.roomType.categoryName || '';
    }
    // Otherwise, it's a string ID
    const category = this.roomCategory.find((cat) => cat._id === room.roomType);
    return category ? category.categoryName : '';
  }
}
