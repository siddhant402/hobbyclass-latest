import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, User } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  showAddUserForm = false;
  selectedRole = '';
  searchTerm = '';

  newUser = {
    name: '',
    email: '',
    password: '',
    role: ''
  };

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Redirect if not logged in or not admin
    if (!this.authService.isLoggedIn || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getUsers();
    this.filteredUsers = [...this.users];
  }

  toggleAddUserForm(): void {
    this.showAddUserForm = !this.showAddUserForm;
    if (!this.showAddUserForm) {
      this.resetForm();
    }
  }

  onAddUser(form: NgForm): void {
    if (form.valid) {
      const userData = {
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role as 'admin' | 'mentor' | 'student',
        status: 'active' as const
      };

      try {
        const addedUser = this.authService.addUser(userData);
        console.log('User added successfully:', addedUser);
        this.loadUsers();
        this.filterUsers();
        this.resetForm();
        this.showAddUserForm = false;
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  }

  resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      password: '',
      role: ''
    };
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesRole && matchesSearch;
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      if (this.authService.deleteUser(userId)) {
        this.loadUsers();
        this.filterUsers();
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
