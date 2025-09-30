# 🎯 Absensi Standalone

Employee attendance management system with GPS tracking and comprehensive reporting features.

## 📋 Project Overview

Absensi Standalone adalah aplikasi manajemen absensi karyawan yang modern, aman, dan mudah digunakan dengan fitur GPS tracking dan laporan absensi yang komprehensif. Aplikasi ini dikembangkan menggunakan metode MoSCoW untuk prioritas fitur.

## 🚀 Features

### ✅ Phase 1 - MVP (Completed)
- **Authentication & User Management**
  - Role-based access control (Admin, Manager, User)
  - Secure login/logout with NextAuth.js
  - User profile management
  - Session management

- **Core Infrastructure**
  - Next.js 15 with TypeScript
  - Prisma ORM with MySQL
  - Tailwind CSS + Custom UI Components
  - PWA Support

- **Location Services**
  - GPS location capture
  - Location validation
  - Geofencing capabilities
  - Address reverse geocoding

### ⏳ Phase 2 - Enhanced Features (In Progress)
- Check-in/out functionality with GPS
- Real-time dashboard
- Basic reporting
- Data export capabilities

### 🔮 Phase 3 - Advanced Features (Planned)
- Advanced analytics
- Notification system
- Mobile optimization
- Performance enhancements

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React state + React Query (planned)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v4 (Stable)
- **Password Hashing**: bcrypt

### Development Tools
- **ORM**: Prisma
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Package Manager**: npm

## 🏗️ Project Structure

```
project-absensi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   └── auth/             # Auth-specific components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   ├── location.ts       # GPS utilities
│   │   └── utils.ts          # General utilities
│   └── types/                # TypeScript type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Database seeding
├── docs/                     # Project documentation
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and setup project**
   ```bash
   cd project-absensi
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database and API credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/absensi_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Setup database**
   ```bash
   # Create database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed initial data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Development server runs with Next.js 15 + Turbo bundler
   - Use demo accounts to test:
     - **Admin**: admin@company.com / admin123
     - **Manager**: manager@company.com / manager123
     - **User**: user@company.com / user123

## 📊 Database Schema

### Core Tables

#### Users
- User management with role-based access
- Supports admin, manager, and user roles
- Profile information and activity tracking

#### Absensi Records
- Daily attendance records
- GPS location data (check-in/out)
- Work hours calculation
- Status tracking (present, late, absent, half_day)

#### Activity Logs
- Comprehensive audit trail
- User action tracking
- System events logging

#### Settings
- Configurable system settings
- Geofencing parameters
- Work schedule configuration

## 🔒 Security Features

- **Authentication**: Secure JWT-based authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure session handling
- **Security Headers**: Comprehensive security headers
- **Role-based Access**: Granular permission system
- **Activity Logging**: Complete audit trail

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach
- **PWA Support**: Progressive Web App capabilities
- **Offline Support**: Basic offline functionality (planned)
- **GPS Integration**: Native geolocation API
- **Touch Optimization**: Mobile-optimized interactions

## ⚡ Next.js 15 Features

### Turbo Bundler
- **Faster Builds**: Up to 700x faster builds than Webpack
- **Hot Module Replacement**: Instant updates during development
- **Memory Efficient**: Lower memory usage and faster startup
- **Modern JavaScript**: Native support for latest JS features

### React 19 Integration
- **Concurrent Rendering**: Improved performance with concurrent features
- **Automatic Batching**: Better state updates and rendering
- **Strict Mode**: Enhanced debugging and development experience
- **Server Components**: Enhanced server-side rendering capabilities

### Performance Improvements
- **Better Caching**: Improved cache invalidation strategies
- **Optimized Images**: Enhanced image optimization with new formats
- **Streaming**: Better streaming support for dynamic content
- **Code Splitting**: Automatic and intelligent code splitting

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

## 📈 Performance

- **Core Web Vitals**: Optimized for performance
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Efficient caching strategies
- **Database**: Optimized queries with proper indexing

## 🛣️ Roadmap

### Phase 1: MVP (Weeks 1-4) ✅
- [x] Project setup and infrastructure
- [x] Authentication system
- [x] Database schema
- [x] Basic UI components
- [x] GPS location services

### Phase 2: Core Features (Weeks 5-8) ✅
- ✅ Check-in/out functionality with GPS
- ✅ User dashboard with role-based access
- ✅ Attendance reports system
- ✅ Data export features
- ✅ Admin panel with RBAC
- ✅ Role-based access control (RBAC)

### Phase 3: Advanced Features (Weeks 9-12) 📋
- [ ] Advanced analytics
- [ ] Notification system
- [ ] Mobile app optimization
- [ ] Performance improvements
- [ ] Advanced reporting

## 🤝 Contributing

1. Follow the established code style
2. Write TypeScript for type safety
3. Add proper error handling
4. Include appropriate logging
5. Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the documentation in `/docs`
- Review the project issues
- Contact the development team

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
