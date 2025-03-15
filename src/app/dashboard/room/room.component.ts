import { Component, OnInit } from '@angular/core';
import { Room, RoomService } from '../../Services/Room/room.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-room',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit {

  //property
  rooms: any[] = []; //for display
  errorMessage: string = '';
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedRoom: Room | null = null;
  roomForm!: FormGroup; //for modal
  roomTypes: string[] = ["Standard", "Deluxe", "Family", "Suite"];


  //Initialize room | reset && add
  newRoom: Room = {
    _id:'',
    roomName:'',
    price: 0,
    roomType: 'Standard',
    capacity: 0,
    excessPerhead: 0,
    isActive: true,
    isAvailable: true
  }

  constructor(private roomService: RoomService, private fb: FormBuilder){}

  
  ngOnInit(): void {
    this.initializeRoomForm();
    this.fetchRoom();
  }

  initializeRoomForm(){
    this.roomForm = this.fb.group({
      roomName: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      roomType:['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      excessPerhead: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      isAvailable: [true]
    });
  }


  fetchRoom(): void {
    this.roomService.getAllRooms().subscribe({
      next: (data) => this.rooms = data,
      error: (err) => this.errorMessage = err.message
    });
  }

  //modals 

  // Method to open the modal
  openModal(mode: 'add' | 'edit', room?:Room): void {
    this.modalMode = mode;
    this.isModalOpen = true;

    if(mode === 'edit' && room ){
      this.selectedRoom = room;
        // Pre-fill the form with the room details
        this.roomForm.patchValue(room);
    }else{
      this.selectedRoom = null;
      this.roomForm.reset(this.newRoom);
    }
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage='';
  }

  saveRoom(): void {
    if (this.roomForm.valid) {
      if (this.modalMode === 'add') {
        console.log('Creating room:', this.roomForm.value);
        this.roomService.addRoom(this.roomForm.value).subscribe({
          next: (room) => {
            this.rooms.push(room);  // Insert the newly added room in the table
            this.roomForm.reset(this.newRoom);
            this.errorMessage = ''; // Clear any previous error messages
            this.closeModal();      // Close modal on success
          },
          error: (err) => {
            console.error('Error adding room:', err);
            // Set error message but do not close the modal so it is visible to the user
            this.errorMessage = err.error && err.error.message 
                                ? err.error.message 
                                : 'An error occurred while adding the room.';
          }
        });
      } else if (this.modalMode === 'edit' && this.selectedRoom) {
        this.roomService.updateRoom(this.selectedRoom._id, this.roomForm.value).subscribe({
          next: (updatedRoom) => {
            const index = this.rooms.findIndex(r => r._id === updatedRoom._id);
            if (index !== -1) {
              this.rooms[index] = updatedRoom; // Update the data inside the row
            }
            this.errorMessage = ''; // Clear any previous error messages
            this.closeModal();      // Close modal on success
          },
          error: (err) => {
            console.error('Error updating room:', err);
            this.errorMessage = err.error && err.error.message 
                                ? err.error.message 
                                : 'An error occurred while updating the room.';
          }
        });
      }
    }
  }
}  
