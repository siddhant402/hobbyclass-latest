# HobbyClass API Endpoints Documentation

## Base URL Structure
```
Development: http://localhost:3000/api
Production: https://api.hobbyclass.com/api
```

## Authentication Endpoints

### 1. User Login
**Endpoint**: `POST /auth/login`
**Description**: Authenticate user and return JWT token
**Request Format**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin|mentor|student",
    "status": "active|inactive"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### 2. User Registration
**Endpoint**: `POST /auth/register`
**Description**: Register new user account
**Request Format**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "role": "student|mentor",
  "agreeToTerms": true
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "status": "active"
  }
}
```

### 3. Logout
**Endpoint**: `POST /auth/logout`
**Description**: Invalidate user session
**Headers**: `Authorization: Bearer {token}`
**Request Format**: `{}`
**Response Format**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Token Refresh
**Endpoint**: `POST /auth/refresh`
**Description**: Refresh JWT token
**Headers**: `Authorization: Bearer {token}`
**Request Format**: `{}`
**Response Format**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

## Admin Endpoints

### 5. Get All Users
**Endpoint**: `GET /admin/users`
**Description**: Retrieve all users (admin only)
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)
- `role`: string (optional, filter by role)
- `status`: string (optional, filter by status)
- `search`: string (optional, search by name/email)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "status": "active",
        "createdAt": "2025-09-16T10:00:00.000Z",
        "updatedAt": "2025-09-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### 6. Add New User
**Endpoint**: `POST /admin/users`
**Description**: Create new user (admin only)
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "name": "string",
  "email": "string",
  "role": "admin|mentor|student",
  "status": "active|inactive"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "status": "active",
    "createdAt": "2025-09-16T10:00:00.000Z"
  }
}
```

### 7. Update User
**Endpoint**: `PUT /admin/users/{userId}`
**Description**: Update existing user (admin only)
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "name": "string",
  "email": "string",
  "role": "admin|mentor|student",
  "status": "active|inactive"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "role": "mentor",
    "status": "active",
    "updatedAt": "2025-09-16T11:00:00.000Z"
  }
}
```

### 8. Delete User
**Endpoint**: `DELETE /admin/users/{userId}`
**Description**: Delete user (admin only)
**Headers**: `Authorization: Bearer {token}`
**Response Format**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Mentor Endpoints

### 9. Get Mentor Profile
**Endpoint**: `GET /mentor/profile`
**Description**: Get current mentor's profile
**Headers**: `Authorization: Bearer {token}`
**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Mentor",
    "email": "jane@example.com",
    "bio": "Experienced art instructor...",
    "specializations": ["Art", "Painting", "Sculpture"],
    "experience": "5 years",
    "rating": 4.8,
    "profileImage": "https://example.com/images/profile.jpg",
    "location": "New York, NY",
    "availability": "weekends",
    "createdAt": "2025-09-16T10:00:00.000Z"
  }
}
```

### 10. Update Mentor Profile
**Endpoint**: `PUT /mentor/profile`
**Description**: Update mentor profile information
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "name": "string",
  "bio": "string",
  "specializations": ["string"],
  "experience": "string",
  "location": "string",
  "availability": "string",
  "profileImage": "string (base64 or URL)"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "Jane Mentor Updated",
    "bio": "Updated bio...",
    "updatedAt": "2025-09-16T11:00:00.000Z"
  }
}
```

### 11. Get Mentor Classes
**Endpoint**: `GET /mentor/classes`
**Description**: Get all classes created by mentor
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `status`: string (optional, filter by status)
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-1",
        "name": "Oil Painting Basics",
        "category": "Art",
        "description": "Learn fundamental oil painting techniques...",
        "schedule": "Saturdays 2-4 PM",
        "duration": "2 hours",
        "maxStudents": 10,
        "enrolledStudents": 7,
        "price": 50,
        "status": "active",
        "createdDate": "2025-09-10T00:00:00.000Z"
      }
    ],
    "stats": {
      "totalClasses": 5,
      "activeClasses": 3,
      "totalEnrollments": 42
    }
  }
}
```

### 12. Create New Class
**Endpoint**: `POST /mentor/classes`
**Description**: Create new class offering
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "name": "string",
  "category": "string",
  "description": "string",
  "schedule": "string",
  "duration": "string",
  "maxStudents": 10,
  "price": 50
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Class created successfully",
  "class": {
    "id": "class-new",
    "name": "Advanced Pottery",
    "category": "Art",
    "status": "active",
    "createdDate": "2025-09-16T12:00:00.000Z"
  }
}
```

### 13. Update Class
**Endpoint**: `PUT /mentor/classes/{classId}`
**Description**: Update existing class
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "name": "string",
  "description": "string",
  "schedule": "string",
  "duration": "string",
  "maxStudents": 12,
  "price": 60,
  "status": "active|inactive"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Class updated successfully",
  "class": {
    "id": "class-1",
    "name": "Oil Painting Advanced",
    "updatedAt": "2025-09-16T12:00:00.000Z"
  }
}
```

### 14. Delete Class
**Endpoint**: `DELETE /mentor/classes/{classId}`
**Description**: Delete a class
**Headers**: `Authorization: Bearer {token}`
**Response Format**:
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

### 15. Toggle Class Status
**Endpoint**: `PATCH /mentor/classes/{classId}/status`
**Description**: Activate or deactivate a class
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "status": "active|inactive"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Class status updated successfully",
  "class": {
    "id": "class-1",
    "status": "inactive",
    "updatedAt": "2025-09-16T12:00:00.000Z"
  }
}
```

## Student Endpoints

### 16. Get Available Classes
**Endpoint**: `GET /student/classes`
**Description**: Browse all available classes
**Headers**: `Authorization: Bearer {token}` (optional)
**Query Parameters**:
- `category`: string (optional, filter by specialization)
- `availability`: string (optional, filter by mentor availability)
- `search`: string (optional, search by name or mentor)
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-1",
        "name": "Oil Painting class",
        "category": "art",
        "date": "12/09/2025",
        "time": "10:00am",
        "status": "available",
        "mentorName": "Sarah Johnson",
        "mentorId": "mentor-1",
        "description": "Learn the fundamentals of oil painting",
        "price": 50,
        "duration": "2 hours",
        "maxStudents": 10,
        "enrolledStudents": 3,
        "enrolled": false
      }
    ],
    "stats": {
      "totalClasses": 15,
      "availableNow": 8,
      "matchingSearch": 12
    }
  }
}
```

### 17. Enroll in Class
**Endpoint**: `POST /student/classes/{classId}/enroll`
**Description**: Enroll student in a class
**Headers**: `Authorization: Bearer {token}`
**Request Format**:
```json
{
  "paymentMethod": "credit_card|paypal|stripe",
  "paymentToken": "string (payment processor token)"
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Successfully enrolled in class",
  "enrollment": {
    "id": "enrollment-1",
    "classId": "class-1",
    "studentId": "student-1",
    "enrolledAt": "2025-09-16T12:00:00.000Z",
    "status": "active",
    "paymentStatus": "completed"
  }
}
```

### 18. Get Student Enrollments
**Endpoint**: `GET /student/enrollments`
**Description**: Get student's enrolled classes
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `status`: string (optional, filter by enrollment status)
- `upcoming`: boolean (optional, show only upcoming classes)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "enrollment-1",
        "class": {
          "id": "class-1",
          "name": "Oil Painting class",
          "mentorName": "Sarah Johnson",
          "schedule": "Saturdays 2-4 PM",
          "nextSession": "2025-09-21T14:00:00.000Z"
        },
        "enrolledAt": "2025-09-16T12:00:00.000Z",
        "status": "active"
      }
    ],
    "stats": {
      "totalEnrollments": 3,
      "activeEnrollments": 2,
      "upcomingClasses": 5
    }
  }
}
```

### 19. Cancel Enrollment
**Endpoint**: `DELETE /student/classes/{classId}/enroll`
**Description**: Cancel enrollment in a class
**Headers**: `Authorization: Bearer {token}`
**Response Format**:
```json
{
  "success": true,
  "message": "Enrollment cancelled successfully",
  "refund": {
    "amount": 50,
    "status": "processing",
    "expectedDate": "2025-09-20T00:00:00.000Z"
  }
}
```

### 20. Get Mentor Profile (Public)
**Endpoint**: `GET /student/mentors/{mentorId}`
**Description**: View public mentor profile
**Headers**: `Authorization: Bearer {token}` (optional)
**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": "mentor-1",
    "name": "Sarah Johnson",
    "bio": "Professional art instructor with 10 years experience",
    "specializations": ["Oil Painting", "Watercolor", "Drawing"],
    "rating": 4.9,
    "totalStudents": 156,
    "totalClasses": 12,
    "profileImage": "https://example.com/images/mentor.jpg",
    "location": "New York, NY",
    "classes": [
      {
        "id": "class-1",
        "name": "Oil Painting Basics",
        "price": 50,
        "rating": 4.8,
        "enrolledStudents": 8
      }
    ]
  }
}
```

## File Upload Endpoints

### 21. Upload Profile Image
**Endpoint**: `POST /upload/profile-image`
**Description**: Upload profile image for mentor
**Headers**: `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`
**Request Format**: `FormData with 'image' field`
**Response Format**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://example.com/images/uploaded-image.jpg"
}
```

## Error Response Format
All endpoints return errors in this standardized format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Specific field error details"
    }
  }
}
```

## HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity (validation failed)
- `500`: Internal Server Error

## Rate Limiting
- `100 requests per minute` for authenticated users
- `20 requests per minute` for unauthenticated users
- Headers included in response:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp
