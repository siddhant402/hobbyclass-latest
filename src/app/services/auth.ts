import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isBrowser: boolean;

  // Dummy admin credentials
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  // Dummy mentor credentials
  private readonly MENTOR_CREDENTIALS = {
    username: 'mentor',
    password: 'mentor123'
  };

  // Dummy student credentials
  private readonly STUDENT_CREDENTIALS = {
    username: 'student',
    password: 'student123'
  };

  // Dummy user data
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'johndoe@gmail.com', role: 'mentor', status: 'active' },
    { id: 2, name: 'Jane Doe', email: 'janedoe@gmail.com', role: 'student', status: 'active' },
    { id: 3, name: 'Admin User', email: 'admin@hobbyclass.com', role: 'admin', status: 'active' },
    { id: 4, name: 'Alice Student', email: 'student@hobbyclass.com', role: 'student', status: 'active' },
    { id: 5, name: 'Bob Mentor', email: 'mentor@hobbyclass.com', role: 'mentor', status: 'active' }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check if user is already logged in (from localStorage) - only in browser
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      }
    }
  }

  // Observables for components to subscribe to
  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Login method
  login(username: string, password: string): { success: boolean; message: string; user?: User } {
    // Check admin credentials
    if (username === this.ADMIN_CREDENTIALS.username && password === this.ADMIN_CREDENTIALS.password) {
      const adminUser = this.users.find(u => u.role === 'admin')!;
      
      this.currentUserSubject.next(adminUser);
      this.isLoggedInSubject.next(true);
      
      // Save to localStorage - only in browser
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
      }
      
      return { success: true, message: 'Login successful', user: adminUser };
    }

    // Check mentor credentials
    if (username === this.MENTOR_CREDENTIALS.username && password === this.MENTOR_CREDENTIALS.password) {
      const mentorUser = this.users.find(u => u.role === 'mentor' && u.email === 'mentor@hobbyclass.com')!;
      
      this.currentUserSubject.next(mentorUser);
      this.isLoggedInSubject.next(true);
      
      // Save to localStorage - only in browser
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(mentorUser));
      }
      
      return { success: true, message: 'Login successful', user: mentorUser };
    }

    // Check student credentials
    if (username === this.STUDENT_CREDENTIALS.username && password === this.STUDENT_CREDENTIALS.password) {
      const studentUser = this.users.find(u => u.role === 'student' && u.email === 'student@hobbyclass.com')!;
      
      this.currentUserSubject.next(studentUser);
      this.isLoggedInSubject.next(true);
      
      // Save to localStorage - only in browser
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
      }
      
      return { success: true, message: 'Login successful', user: studentUser };
    }

    // Check regular user credentials (for demo purposes, we'll check if username exists in users)
    const user = this.users.find(u => u.email === username || u.name.toLowerCase() === username.toLowerCase());
    if (user && password === 'demo123') { // Simple demo password for all users
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      
      // Save to localStorage - only in browser
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return { success: true, message: 'Login successful', user };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  // Logout method
  logout(): void {
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Check if current user is mentor
  isMentor(): boolean {
    return this.currentUser?.role === 'mentor';
  }

  // Check if current user is student
  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  // Get all users (admin only)
  getUsers(): User[] {
    return [...this.users];
  }

  // Add new user (admin only)
  addUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      ...userData,
      id: Math.max(...this.users.map(u => u.id)) + 1
    };
    this.users.push(newUser);
    return newUser;
  }

  // Delete user (admin only)
  deleteUser(userId: number): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.users.splice(userIndex, 1);
      return true;
    }
    return false;
  }

  // Update user (admin only)
  updateUser(userId: number, userData: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      return this.users[userIndex];
    }
    return null;
  }
}
