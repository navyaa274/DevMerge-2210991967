# AI University Platform - Complete Frontend

A comprehensive, modern university learning management system built with React, featuring AI-powered learning tools, role-based access control, and a beautiful responsive design.

## 🚀 Features

### 🎓 Multi-Portal System
- **Student Portal**: Course management, assignments, grades, AI tutor, library, certificates, internships
- **Faculty Portal**: Course creation, assignment management, grading tools, student analytics
- **Admin Portal**: User management, course catalog, department management, system settings
- **HOD Portal**: Faculty management, department oversight, analytics, broadcasting
- **Super Admin Portal**: System monitoring, institution management, global settings

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Full dark mode support with smooth transitions
- **Beautiful Components**: Custom UI components with Framer Motion animations
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels

### 🔐 Authentication & Security
- **Role-Based Access Control**: 5 distinct user roles with appropriate permissions
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Protected Routes**: Route guards for different user types
- **Session Management**: Persistent login with automatic token refresh

### 🤖 AI-Powered Features
- **AI Tutor**: Personalized learning assistance
- **Smart Analytics**: Performance tracking and insights
- **Adaptive Content**: Dynamic content based on user progress
- **Intelligent Recommendations**: Course and resource suggestions

### 📊 Analytics & Reporting
- **Student Performance**: Detailed progress tracking and analytics
- **Course Analytics**: Engagement metrics and completion rates
- **System Analytics**: Platform-wide usage statistics
- **Custom Reports**: Generate and export detailed reports

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **React Router 6**: Client-side routing with protected routes
- **Framer Motion**: Beautiful animations and transitions
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Consistent icon library
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors

### Backend Integration
- **RESTful APIs**: Complete API service layer
- **Error Handling**: Comprehensive error management
- **Loading States**: Consistent loading indicators
- **Data Fetching**: Custom hooks for API calls

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # Base UI components (Button, Card, etc.)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── student/        # Student portal pages
│   ├── faculty/        # Faculty portal pages
│   ├── admin/          # Admin portal pages
│   ├── hod/            # HOD portal pages
│   └── super-admin/    # Super admin portal pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # State management (Zustand)
├── styles/             # Global styles
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-university-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5002/api
   REACT_APP_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Login Credentials

Use these credentials to test different roles:

- **Email**: `test@example.com`
- **Password**: `password`
- **Role**: Select any role (student, faculty, admin, hod, super_admin)

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Customization

### Theming
The application uses CSS custom properties for easy theming:
- Edit `src/index.css` to modify colors and variables
- Dark mode is automatically supported

### Components
All components are built with:
- Reusability in mind
- Consistent design patterns
- TypeScript-ready (can be easily converted)
- Accessibility features

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Structure

- **Components**: Functional components with hooks
- **State Management**: Zustand for global state
- **API Layer**: Axios with interceptors
- **Routing**: React Router with protected routes
- **Styling**: Tailwind CSS with custom utilities

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set these in your production environment:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

### Deployment Options
- **Vercel**: Automatic deployment from Git
- **Netlify**: Static hosting with continuous deployment
- **AWS S3**: Static file hosting with CloudFront
- **Docker**: Containerized deployment

## 📊 Features by Role

### 👨‍🎓 Student
- 📚 Course enrollment and management
- 📝 Assignment submission and tracking
- 📊 Grade viewing and progress tracking
- 🤖 AI-powered tutoring
- 📚 Digital library access
- 🎓 Certificate management
- 💼 Internship opportunities

### 👨‍🏫 Faculty
- 📚 Course creation and management
- 📝 Assignment creation and grading
- 👥 Student roster management
- 📊 Performance analytics
- 📅 Schedule management
- 📈 Student progress tracking

### 👨‍💼 Admin
- 👥 User management across all roles
- 📚 Course catalog management
- 🏛️ Department administration
- ⚙️ System configuration
- 📊 System analytics
- 📋 Report generation

### 👨‍🔬 HOD (Head of Department)
- 👨‍🏫 Faculty management
- 📚 Department course oversight
- 📊 Department analytics
- 📢 Department announcements
- 📈 Performance monitoring

### 👨‍💻 Super Admin
- 🖥️ System monitoring
- 🏛️ Institution management
- 🌐 Global analytics
- ⚙️ Global settings
- 🔒 Security management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@aiuniversity.com
- 📱 Discord: [Join our community](https://discord.gg/aiuniversity)
- 📖 Documentation: [docs.aiuniversity.com](https://docs.aiuniversity.com)

## 🎉 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for beautiful animations
- Heroicons for the consistent icon set
- All contributors and users of this platform

---

**Built with ❤️ for the future of education**
