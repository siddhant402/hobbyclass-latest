# 🎨 HobbyClass Frontend

> A comprehensive Angular 18+ frontend application for a hobby class platform connecting students with mentors.

[![Angular](https://img.shields.io/badge/Angular-18%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### 🔐 **Multi-Role Authentication**
- **Admin Dashboard** - User management, analytics, platform oversight
- **Mentor Dashboard** - Class creation, student management, earnings
- **Student Dashboard** - Browse classes, enroll, track progress

### 🚀 **Core Functionality**
- Secure authentication with role-based access control
- Advanced class browsing with real-time search & filters
- Comprehensive mentor profiles with reviews & ratings
- Responsive design optimized for all devices
- Modern UI/UX with smooth interactions

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Angular 18+ with TypeScript |
| **Styling** | Modern CSS with Flexbox/Grid |
| **Architecture** | Standalone Components |
| **Routing** | Angular Router with Guards |
| **Forms** | Reactive Forms with Validation |
| **Assets** | Optimized Image Handling |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/siddhant402/hobbyclass-latest.git
cd hobbyclass-latest

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:4200` 🎉

## 🎯 Demo Access

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Users** | *any* | `demo123` |

## 📱 Application Structure

```
src/app/
├── components/
│   ├── 👑 admin-dashboard/     # Admin management
│   ├── 👨‍🏫 mentor-dashboard/    # Mentor tools  
│   ├── 👨‍🎓 student-dashboard/   # Student portal
│   ├── 👤 mentor-profile/      # Profile management
│   ├── 🔐 login/              # Authentication
│   └── 📝 register/           # User registration
├── guards/                    # Route protection
├── services/                  # Business logic
└── assets/                    # Images & resources
```

## 🎨 Component Features

### 🏠 **Student Dashboard**
- **Class Discovery** - Browse 500+ hobby classes
- **Smart Filters** - Category, price, difficulty, rating
- **Quick Actions** - Favorites, schedule, enrollment
- **Progress Tracking** - Learning journey visualization

### 👨‍🏫 **Mentor Dashboard**  
- **Class Management** - Create, edit, publish classes
- **Student Analytics** - Enrollment stats, feedback
- **Revenue Tracking** - Earnings overview & history
- **Profile Tools** - Skills, portfolio, availability

### 👑 **Admin Dashboard**
- **User Management** - CRUD operations for all users
- **Platform Analytics** - Usage stats, growth metrics  
- **Content Moderation** - Class approval, user verification
- **System Health** - Performance monitoring

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run lint` | Code linting |
| `ng generate component <name>` | Generate component |

## 📋 Documentation

- 📖 [**Project Overview**](PROJECT_DESCRIPTION.md) - Complete feature breakdown
- 🔌 [**API Documentation**](API_ENDPOINTS.md) - Backend integration guide  
- 🎮 [**UI Interactions**](BUTTON_FUNCTIONALITY.md) - Button & form behaviors
- ⚙️ [**Backend Setup**](BACKEND_IMPLEMENTATION_GUIDE.md) - Spring Boot guide

## 🎯 Key Highlights

- **🏗️ Modern Architecture** - Standalone components, lazy loading
- **🔒 Security First** - Route guards, input validation, RBAC
- **📱 Mobile Ready** - Responsive design, touch-friendly
- **⚡ Performance** - Optimized assets, efficient change detection
- **♿ Accessible** - ARIA labels, keyboard navigation
- **🎨 Beautiful UI** - Clean design, smooth animations

## 🚀 Future Roadmap

- [ ] Real-time messaging system
- [ ] Video conferencing integration  
- [ ] Payment gateway integration
- [ ] Mobile app development
- [ ] AI-powered recommendations
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🌟 Support

⭐ **Star this repo** if you find it helpful!

📧 **Questions?** Open an issue or reach out!

---

<div align="center">
  <strong>Built with ❤️ using Angular</strong>
  <br>
  <em>Happy Learning! 🎓</em>
</div>