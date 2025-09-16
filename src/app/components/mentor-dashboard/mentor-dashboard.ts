import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, User } from '../../services/auth';

interface MentorClass {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  maxStudents: number;
  currentStudents: number;
  description: string;
  imageUrl: string;
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-mentor-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-dashboard.html',
  styleUrl: './mentor-dashboard.css'
})
export class MentorDashboard implements OnInit {
  currentUser: User | null = null;
  dashboardStats = {
    totalClasses: 6,
    activeClasses: 2,
    studentsEnrolled: 92
  };

  // Form for adding new class
  newClass: Omit<MentorClass, 'id'> = {
    title: '',
    category: '',
    date: '',
    time: '',
    duration: '',
    maxStudents: 0,
    currentStudents: 0,
    description: '',
    imageUrl: '',
    status: 'active'
  };

  // Mock classes data
  mentorClasses: MentorClass[] = [
    {
      id: '1',
      title: 'Calligraphy',
      category: 'Art',
      date: '12/09/2025',
      time: '10:00am',
      duration: '120 min',
      maxStudents: 50,
      currentStudents: 35,
      description: 'With over 15 years of teaching experience, this award-winning artist and passionate educator brings expert guidance to every calligraphy class. Designed for all skill levels, the sessions focus on mastering technique, fostering creativity, and building confidence in lettering. Join to explore the timeless art of calligraphy in a supportive and inspiring environment.',
      imageUrl: '/assets/images/mentor-dashboard/010dd8a8ed27fe629d69e6bf6074307dbb15720c.png',
      status: 'active'
    },
    {
      id: '2',
      title: 'Pottery',
      category: 'Art',
      date: '22/09/2025',
      time: '12:00pm',
      duration: '160 min',
      maxStudents: 55,
      currentStudents: 42,
      description: 'With over 15 years of teaching experience, this award-winning artist and passionate educator offers expert guidance in pottery. Classes are designed for all skill levels, focusing on hands-on techniques, creativity, and developing confidence with clay. Students will explore various pottery methods in a supportive and inspiring environment.',
      imageUrl: '/assets/images/mentor-dashboard/64be93649b9709f55ed5e5c60c86a5b3d2a46b5f.png',
      status: 'active'
    },
    {
      id: '3',
      title: 'Photography',
      category: 'Art',
      date: '15/10/2025',
      time: '2:00pm',
      duration: '90 min',
      maxStudents: 20,
      currentStudents: 15,
      description: 'Learn the fundamentals of digital photography with hands-on practice. This course covers composition, lighting, and basic editing techniques. Perfect for beginners who want to improve their photography skills.',
      imageUrl: '/assets/images/mentor-dashboard/010dd8a8ed27fe629d69e6bf6074307dbb15720c.png',
      status: 'inactive'
    }
  ];

  filteredClasses: MentorClass[] = [];
  searchTerm = '';
  statusFilter = 'all';

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    // Check if user is logged in and is a mentor
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'mentor') {
        this.router.navigate(['/login']);
      }
    });
    
    this.filteredClasses = [...this.mentorClasses];
  }

  onAddClass(): void {
    if (this.newClass.title && this.newClass.category) {
      const newClassWithId: MentorClass = {
        ...this.newClass,
        id: Date.now().toString(),
        currentStudents: 0
      };
      
      this.mentorClasses.push(newClassWithId);
      this.updateFilteredClasses();
      this.resetForm();
      
      // Update stats
      this.dashboardStats.totalClasses++;
      if (newClassWithId.status === 'active') {
        this.dashboardStats.activeClasses++;
      }
    }
  }

  onEditClass(classId: string): void {
    console.log('Edit class:', classId);
    // Implementation for editing class
  }

  onDeleteClass(classId: string): void {
    const classIndex = this.mentorClasses.findIndex(c => c.id === classId);
    if (classIndex > -1) {
      const deletedClass = this.mentorClasses[classIndex];
      this.mentorClasses.splice(classIndex, 1);
      this.updateFilteredClasses();
      
      // Update stats
      this.dashboardStats.totalClasses--;
      if (deletedClass.status === 'active') {
        this.dashboardStats.activeClasses--;
      }
      this.dashboardStats.studentsEnrolled -= deletedClass.currentStudents;
    }
  }

  onDeactivateClass(classId: string): void {
    const classToDeactivate = this.mentorClasses.find(c => c.id === classId);
    if (classToDeactivate && classToDeactivate.status === 'active') {
      classToDeactivate.status = 'inactive';
      this.dashboardStats.activeClasses--;
      this.updateFilteredClasses();
    }
  }

  onActivateClass(classId: string): void {
    const classToActivate = this.mentorClasses.find(c => c.id === classId);
    if (classToActivate && classToActivate.status !== 'active') {
      classToActivate.status = 'active';
      this.dashboardStats.activeClasses++;
      this.updateFilteredClasses();
    }
  }

  onSearch(): void {
    this.updateFilteredClasses();
  }

  onStatusFilterChange(): void {
    this.updateFilteredClasses();
  }

  onRefreshData(): void {
    // Refresh dashboard data
    console.log('Refreshing data...');
  }

  private updateFilteredClasses(): void {
    this.filteredClasses = this.mentorClasses.filter(mentorClass => {
      const matchesSearch = !this.searchTerm || 
        mentorClass.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mentorClass.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || 
        mentorClass.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  private resetForm(): void {
    this.newClass = {
      title: '',
      category: '',
      date: '',
      time: '',
      duration: '',
      maxStudents: 0,
      currentStudents: 0,
      description: '',
      imageUrl: '',
      status: 'active'
    };
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }
}
