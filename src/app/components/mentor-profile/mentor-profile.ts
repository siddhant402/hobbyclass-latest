import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, User } from '../../services/auth';

@Component({
  selector: 'app-mentor-profile',
  imports: [CommonModule],
  templateUrl: './mentor-profile.html',
  styleUrl: './mentor-profile.css'
})
export class MentorProfile implements OnInit {
  currentUser: User | null = null;
  isEditMode = false;

  // Mentor profile data
  mentorData = {
    name: 'Jane Doe',
    title: 'Master Calligrapher',
    description: `With over 15 years of teaching experience, this award-winning artist and passionate educator brings expert guidance to every calligraphy class. Designed for all skill levels, the sessions focus on mastering technique, fostering creativity, and building confidence in lettering. Join to explore the timeless art of calligraphy in a supportive and inspiring environment.`,
    profileImage: '/assets/images/mentor-profile/1dd129badf9c1651a9b414b74aec0b7405d07b38.png',
    workImage: '/assets/images/mentor-profile/a8948bee51d6cac38fd1447c50ed8607a4011031.png'
  };

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Redirect if not logged in or not mentor
    if (!this.authService.isLoggedIn || !this.isMentor()) {
      this.router.navigate(['/login']);
      return;
    }

    // Update mentor data with current user info if available
    if (this.currentUser) {
      this.mentorData.name = this.currentUser.name;
    }
  }

  isMentor(): boolean {
    return this.authService.currentUser?.role === 'mentor';
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToMentorDashboard(): void {
    // Will be implemented when we create the mentor dashboard
    console.log('Navigate to mentor dashboard');
  }
}
