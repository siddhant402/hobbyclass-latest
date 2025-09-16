import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, User } from '../../services/auth';

interface StudentClass {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  status: 'available' | 'offline' | 'busy';
  mentorName: string;
  description: string;
  enrolled?: boolean;
}

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css'
})
export class StudentDashboard implements OnInit {
  currentUser: User | null = null;
  
  // Filter options
  selectedSpecialization = 'all';
  selectedAvailability = 'all';
  searchTerm = '';
  
  // Dashboard statistics
  dashboardStats = {
    totalClasses: 5,
    availableNow: 3,
    matchingSearch: 5
  };
  
  // Available specializations
  specializations = [
    { value: 'all', label: 'All Specializations' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'dance', label: 'Dance' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'technology', label: 'Technology' }
  ];
  
  // Available mentors filter
  mentorFilters = [
    { value: 'all', label: 'All Mentors' },
    { value: 'available', label: 'Available Now' },
    { value: 'top-rated', label: 'Top Rated' }
  ];
  
  // Mock classes data
  availableClasses: StudentClass[] = [
    {
      id: '1',
      name: 'Oil Painting class',
      category: 'art',
      date: '12/09/2025',
      time: '10:00am',
      status: 'available',
      mentorName: 'Sarah Johnson',
      description: 'Learn the fundamentals of oil painting with professional techniques'
    },
    {
      id: '2',
      name: 'Jazz with Jazz',
      category: 'music',
      date: '12/09/2025',
      time: '10:00am',
      status: 'offline',
      mentorName: 'Jazz Martinez',
      description: 'Explore the world of jazz music and improvisation'
    },
    {
      id: '3',
      name: 'Dance it out',
      category: 'dance',
      date: '12/09/2025',
      time: '10:00am',
      status: 'busy',
      mentorName: 'Emma Wilson',
      description: 'Express yourself through contemporary dance movements'
    }
  ];
  
  filteredClasses: StudentClass[] = [];

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    // Check if user is logged in and is a student
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role === 'admin' || user.role === 'mentor') {
        // For non-students, allow access but they might have different view
        // In this case, we'll allow students and general users
      }
    });
    
    this.filteredClasses = [...this.availableClasses];
    this.updateStats();
  }

  onSpecializationChange(): void {
    this.applyFilters();
  }

  onAvailabilityChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedSpecialization = 'all';
    this.selectedAvailability = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredClasses = this.availableClasses.filter(studentClass => {
      const matchesSpecialization = this.selectedSpecialization === 'all' || 
        studentClass.category.toLowerCase() === this.selectedSpecialization.toLowerCase();
      
      const matchesAvailability = this.selectedAvailability === 'all' || 
        (this.selectedAvailability === 'available' && studentClass.status === 'available');
      
      const matchesSearch = !this.searchTerm || 
        studentClass.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        studentClass.mentorName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSpecialization && matchesAvailability && matchesSearch;
    });
    
    this.updateStats();
  }

  private updateStats(): void {
    this.dashboardStats.totalClasses = this.availableClasses.length;
    this.dashboardStats.availableNow = this.availableClasses.filter(c => c.status === 'available').length;
    this.dashboardStats.matchingSearch = this.filteredClasses.length;
  }

  onChooseClass(classId: string): void {
    const selectedClass = this.availableClasses.find(c => c.id === classId);
    if (selectedClass) {
      selectedClass.enrolled = true;
      console.log('Enrolled in class:', selectedClass.name);
      // Here you would typically make an API call to enroll the student
    }
  }

  onViewMentorProfile(classId: string): void {
    const selectedClass = this.availableClasses.find(c => c.id === classId);
    if (selectedClass) {
      console.log('Viewing mentor profile for:', selectedClass.mentorName);
      // Navigate to mentor profile or show modal
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'status-available';
      case 'offline': return 'status-offline';
      case 'busy': return 'status-busy';
      default: return '';
    }
  }

  getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'art': return 'category-art';
      case 'music': return 'category-music';
      case 'dance': return 'category-dance';
      default: return 'category-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Available';
      case 'offline': return 'Offline';
      case 'busy': return 'Busy';
      default: return status;
    }
  }
}
