import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomCategory, RoomCategoryService } from '../../../Services/RoomCategory/room-category.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-room-category',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, RouterModule, FormsModule],
  templateUrl: './room-category.component.html',
  styleUrls: ['./room-category.component.css']
})
export class RoomCategoryComponent implements OnInit {
  Categories: RoomCategory[] = [];
  categoryForm!: FormGroup;
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedCategory: RoomCategory | null = null;
  errorMessage = '';

  // Icons
  editIcon = faEdit;

  // Search & Pagination Properties
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 5; // Adjust items per page as needed

  constructor(
    private svc: RoomCategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({ categoryName: ['', Validators.required] });
    this.fetchCategories();
  }

  fetchCategories() {
    this.svc.getCategory().subscribe({
      next: data => {
        this.Categories = data;
        this.currentPage = 1; // Reset pagination on data fetch
      },
      error: err => this.errorMessage = err.message
    });
  }

  // Filter categories based on the search query
  get filteredCategories(): RoomCategory[] {
    if (!this.searchQuery) return this.Categories;
    const q = this.searchQuery.toLowerCase();
    return this.Categories.filter(category =>
      category.categoryName.toLowerCase().includes(q)
    );
  }

  // Slice filtered categories for the current page
  get pagedCategories(): RoomCategory[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  OpenModal(mode: 'add' | 'edit', category?: RoomCategory) {
    this.modalMode = mode;
    this.isModalOpen = true;
    this.errorMessage = '';
    if (mode === 'edit' && category) {
      this.selectedCategory = category;
      this.categoryForm.patchValue({ categoryName: category.categoryName });
    } else {
      this.selectedCategory = null;
      this.categoryForm.reset();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoryForm.reset();
    this.selectedCategory = null;
    this.errorMessage = '';
  }

  save() {
    if (this.categoryForm.invalid) return;
    const payload = this.categoryForm.value;

    if (this.modalMode === 'add') {
      this.svc.createCategory(payload).subscribe({
        next: newCat => {
          this.Categories.push(newCat);
          this.closeModal();
        },
        error: err => this.errorMessage = err.error?.message || err.message
      });
    } else if (this.selectedCategory) {
      this.svc.updateCategory(this.selectedCategory._id, payload).subscribe({
        next: updatedCat => {
          const idx = this.Categories.findIndex(c => c._id === updatedCat._id);
          if (idx > -1) this.Categories[idx] = updatedCat;
          this.closeModal();
        },
        error: err => this.errorMessage = err.error?.message || err.message
      });
    }
  }

  deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    this.svc.deleteCategory(id).subscribe({
      next: () => this.Categories = this.Categories.filter(c => c._id !== id),
      error: err => this.errorMessage = err.error?.message || err.message
    });
  }
}
