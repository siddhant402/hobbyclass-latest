import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  formData = {
    username: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

  onSubmit() {
    if (this.formData.username && this.formData.password) {
      this.isLoading = true;
      this.errorMessage = '';

      const result = this.authService.login(this.formData.username, this.formData.password);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (result.user?.role === 'mentor') {
          this.router.navigate(['/mentor-dashboard']);
        } else if (result.user?.role === 'student') {
          // Redirect to student dashboard
          this.router.navigate(['/student-dashboard']);
        } else {
          // Default redirect for other users
          this.router.navigate(['/student-dashboard']);
        }
      } else {
        this.errorMessage = result.message;
      }

      this.isLoading = false;
    }
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
    // Handle forgot password logic
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
