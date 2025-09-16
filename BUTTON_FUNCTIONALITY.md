# HobbyClass Frontend - Button Functionality Documentation

## Authentication Buttons

### Login Component (`/login`)

#### 1. **Login Button**
- **Location**: Login form primary action
- **Trigger**: Form submission with username/password
- **Expected Functionality**: 
  - Validate form data (required fields)
  - Call `authService.login(username, password)`
  - Show loading state during authentication
  - On success: Redirect based on user role
    - Admin → `/admin-dashboard`
    - Mentor → `/mentor-dashboard` 
    - Student → `/student-dashboard`
  - On failure: Display error message
- **API Call**: `POST /auth/login`

#### 2. **Forgot Password Button**
- **Location**: Below login form
- **Trigger**: Click event
- **Expected Functionality**:
  - Open forgot password modal/page
  - Allow email input for password reset
  - Send password reset email
- **API Call**: `POST /auth/forgot-password`

#### 3. **Register Redirect Button**
- **Location**: Bottom of login form
- **Trigger**: Click event
- **Expected Functionality**:
  - Navigate to registration page (`/register`)
- **API Call**: None (client-side routing)

### Register Component (`/register`)

#### 4. **Register Button**
- **Location**: Registration form primary action
- **Trigger**: Form submission
- **Expected Functionality**:
  - Validate all form fields (name, email, password, confirm password)
  - Check terms acceptance checkbox
  - Call registration API
  - On success: Show success message and redirect to login
  - On failure: Display validation errors
- **API Call**: `POST /auth/register`

#### 5. **Login Redirect Button**
- **Location**: Bottom of registration form
- **Trigger**: Click event  
- **Expected Functionality**:
  - Navigate to login page (`/login`)
- **API Call**: None (client-side routing)

## Admin Dashboard Buttons

### Admin Dashboard Component (`/admin-dashboard`)

#### 6. **Add User Button**
- **Location**: Top of user table
- **Trigger**: Click event
- **Expected Functionality**:
  - Open "Add User" modal/form
  - Allow input of: name, email, role, status
  - Submit new user data to backend
  - Refresh user list on success
  - Show success/error messages
- **API Call**: `POST /admin/users`

#### 7. **Edit User Button** (per user row)
- **Location**: Actions column in user table
- **Trigger**: Click on edit icon
- **Expected Functionality**:
  - Open edit modal with pre-filled user data
  - Allow modification of: name, email, role, status
  - Submit updated data to backend
  - Update user list on success
- **API Call**: `PUT /admin/users/{userId}`

#### 8. **Delete User Button** (per user row)
- **Location**: Actions column in user table
- **Trigger**: Click on delete icon
- **Expected Functionality**:
  - Show confirmation dialog
  - On confirm: Delete user from system
  - Remove user from table
  - Show success message
- **API Call**: `DELETE /admin/users/{userId}`

#### 9. **Filter/Search Controls**
- **Location**: Above user table
- **Trigger**: Input change/dropdown selection
- **Expected Functionality**:
  - Filter users by role (admin/mentor/student)
  - Filter users by status (active/inactive)
  - Search users by name or email
  - Update table data in real-time
- **API Call**: `GET /admin/users` with query parameters

#### 10. **Logout Button**
- **Location**: Top navigation bar
- **Trigger**: Click event
- **Expected Functionality**:
  - Clear user session/token
  - Redirect to login page
  - Clear any cached user data
- **API Call**: `POST /auth/logout`

## Mentor Dashboard Buttons

### Mentor Dashboard Component (`/mentor-dashboard`)

#### 11. **Add Class Button**
- **Location**: Top of classes section
- **Trigger**: Click event
- **Expected Functionality**:
  - Open "Add Class" modal/form
  - Allow input of: name, category, description, schedule, duration, max students, price
  - Submit new class data to backend
  - Refresh class list on success
- **API Call**: `POST /mentor/classes`

#### 12. **Edit Class Button** (per class card)
- **Location**: Class card actions
- **Trigger**: Click on edit icon
- **Expected Functionality**:
  - Open edit modal with pre-filled class data
  - Allow modification of class details
  - Submit updated data to backend
  - Update class display on success
- **API Call**: `PUT /mentor/classes/{classId}`

#### 13. **Delete Class Button** (per class card)
- **Location**: Class card actions
- **Trigger**: Click on delete icon
- **Expected Functionality**:
  - Show confirmation dialog
  - On confirm: Delete class from system
  - Remove class card from display
  - Update statistics
- **API Call**: `DELETE /mentor/classes/{classId}`

#### 14. **Activate/Deactivate Toggle Button** (per class card)
- **Location**: Class card actions
- **Trigger**: Click event
- **Expected Functionality**:
  - Toggle class status between active/inactive
  - Update button text dynamically ("Activate" ↔ "Deactivate")
  - Change class visual status indicator
  - Update backend status
- **API Call**: `PATCH /mentor/classes/{classId}/status`

#### 15. **View Enrollments Button** (per class card)
- **Location**: Class card actions
- **Trigger**: Click event
- **Expected Functionality**:
  - Show list of enrolled students
  - Display student contact information
  - Allow mentor to message students
- **API Call**: `GET /mentor/classes/{classId}/enrollments`

#### 16. **Profile Button**
- **Location**: Top navigation
- **Trigger**: Click event
- **Expected Functionality**:
  - Navigate to mentor profile page (`/mentor-profile`)
- **API Call**: None (client-side routing)

### Mentor Profile Component (`/mentor-profile`)

#### 17. **Edit Profile Button**
- **Location**: Profile display section
- **Trigger**: Click event
- **Expected Functionality**:
  - Enable edit mode for profile fields
  - Allow modification of: name, bio, specializations, experience, location, availability
  - Change button text to "Save" and "Cancel"
- **API Call**: None (UI state change)

#### 18. **Save Profile Button**
- **Location**: Appears in edit mode
- **Trigger**: Click event after editing
- **Expected Functionality**:
  - Validate profile data
  - Submit updated profile to backend
  - Return to display mode on success
  - Show success/error messages
- **API Call**: `PUT /mentor/profile`

#### 19. **Cancel Edit Button**
- **Location**: Appears in edit mode
- **Trigger**: Click event
- **Expected Functionality**:
  - Discard unsaved changes
  - Return to profile display mode
  - Restore original field values
- **API Call**: None (UI state reset)

#### 20. **Upload Profile Image Button**
- **Location**: Profile image section
- **Trigger**: Click event or file selection
- **Expected Functionality**:
  - Open file picker dialog
  - Allow image file selection (jpg, png, gif)
  - Preview selected image
  - Upload image to server
  - Update profile image display
- **API Call**: `POST /upload/profile-image`

## Student Dashboard Buttons

### Student Dashboard Component (`/student-dashboard`)

#### 21. **Choose Class Button** (per class row)
- **Location**: Actions column in classes table
- **Trigger**: Click event (only if class is available)
- **Expected Functionality**:
  - Initiate class enrollment process
  - Show payment/confirmation modal
  - Process enrollment payment
  - Update class enrollment status
  - Change button to "Enrolled" state
- **API Call**: `POST /student/classes/{classId}/enroll`

#### 22. **View Mentor Button** (per class row)
- **Location**: Actions column in classes table
- **Trigger**: Click event
- **Expected Functionality**:
  - Open mentor profile modal/page
  - Display mentor's bio, specializations, ratings
  - Show mentor's other available classes
  - Allow student to contact mentor
- **API Call**: `GET /student/mentors/{mentorId}`

#### 23. **Filter Controls**
- **Location**: Above classes table
- **Trigger**: Dropdown selection/input change
- **Expected Functionality**:
  - Filter by specialization (All, Art, Music, Dance, Cooking, Technology)
  - Filter by mentor availability (All, Available Now, Top Rated)
  - Apply filters and update table data
- **API Call**: `GET /student/classes` with query parameters

#### 24. **Search Button/Input**
- **Location**: Filter section
- **Trigger**: Input change or button click
- **Expected Functionality**:
  - Search classes by name or mentor name
  - Update table with search results
  - Highlight matching terms
- **API Call**: `GET /student/classes` with search parameter

#### 25. **Reset Filters Button**
- **Location**: Filter section
- **Trigger**: Click event
- **Expected Functionality**:
  - Clear all filter selections
  - Clear search input
  - Reset table to show all classes
  - Reset statistics counters
- **API Call**: `GET /student/classes` (no filters)

#### 26. **Quick Action Cards**
- **Location**: Bottom of dashboard
- **Trigger**: Click on action cards
- **Expected Functionality**:
  - **Browse All Classes**: Show all available classes
  - **My Schedule**: Navigate to enrolled classes view
  - **Favorites**: Show favorited classes
- **API Call**: Various based on action

## Navigation Buttons (Global)

#### 27. **Logo/Brand Button**
- **Location**: Top navigation (all pages)
- **Trigger**: Click event
- **Expected Functionality**:
  - Navigate to appropriate dashboard based on user role
  - For non-authenticated users: go to login/register
- **API Call**: None (client-side routing)

#### 28. **User Avatar/Profile Dropdown**
- **Location**: Top right navigation
- **Trigger**: Click event
- **Expected Functionality**:
  - Show dropdown menu with:
    - View Profile
    - Account Settings
    - Logout
- **API Call**: Varies based on selection

#### 29. **Mobile Menu Toggle**
- **Location**: Mobile navigation
- **Trigger**: Click event (mobile only)
- **Expected Functionality**:
  - Toggle mobile navigation menu visibility
  - Show/hide navigation options
- **API Call**: None (UI toggle)

## Form Validation Buttons

#### 30. **Form Submit Buttons** (General)
- **Location**: All forms throughout application
- **Trigger**: Form submission
- **Expected Functionality**:
  - Validate all required fields
  - Show loading state during submission
  - Display success/error messages
  - Clear/reset form on success
  - Handle validation errors appropriately

## Error Handling & Loading States

### Button State Management
- **Loading State**: Show spinner/disable button during API calls
- **Error State**: Display error messages near relevant buttons
- **Success State**: Show success feedback and update UI
- **Disabled State**: Disable buttons when actions aren't available

### Expected Error Handling
- **Network Errors**: Show retry options
- **Validation Errors**: Highlight problematic fields
- **Permission Errors**: Redirect to appropriate page
- **Session Expired**: Redirect to login

### Loading Indicators
- **Button Loading**: Spinner inside button text
- **Form Loading**: Disable entire form during submission
- **Page Loading**: Loading overlay for major operations
- **Data Loading**: Skeleton screens for data tables

## Responsive Behavior
- **Mobile**: Stack buttons vertically, larger touch targets
- **Tablet**: Adjust button sizes and spacing
- **Desktop**: Full button functionality and hover states
- **Accessibility**: Keyboard navigation support for all buttons
