import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  formData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  onSubmit() {
    if (this.formData.username && this.formData.email && this.formData.password) {
      console.log('Form submitted:', this.formData);
      // Handle form submission logic here
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
