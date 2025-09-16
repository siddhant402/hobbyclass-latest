import { Routes } from '@angular/router';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { MentorProfile } from './components/mentor-profile/mentor-profile';
import { MentorDashboard } from './components/mentor-dashboard/mentor-dashboard';
import { StudentDashboard } from './components/student-dashboard/student-dashboard';
import { authGuard } from './guards/auth-guard';
import { mentorGuard } from './guards/mentor-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboard,
    canActivate: [authGuard]
  },
  {
    path: 'mentor-dashboard',
    component: MentorDashboard,
    canActivate: [mentorGuard]
  },
  {
    path: 'mentor-profile',
    component: MentorProfile,
    canActivate: [mentorGuard]
  },
  {
    path: 'student-dashboard',
    component: StudentDashboard
  },
  { path: '**', redirectTo: '/register' }
];
