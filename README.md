# EventHub - Event Management Platform

A modern, full-stack event management platform built with React, Node.js, Express, and MongoDB, fully containerized with Docker.

## 🚀 Features

- **Modern Authentication UI**: Beautiful sign-in/sign-up interface with botanical design
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-first, responsive design that works on all devices
- **Dockerized**: Fully containerized application with Docker and Docker Compose
- **MongoDB Integration**: Robust database with Mongoose ODM
- **RESTful API**: Clean, well-structured backend API

## 🏗️ Architecture

```
EventHub/
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components (SignIn, SignUp, Home)
│   │   ├── styles/        # CSS stylesheets
│   │   └── ...
│   ├── Dockerfile         # Frontend Docker configuration
│   └── package.json
├── backend/           # Node.js/Express backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   ├── Dockerfile         # Backend Docker configuration
│   └── package.json
├── docker-compose.yml  # Multi-container orchestration
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with modern design

### Backend
- **Node.js 22** - Latest LTS version
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB 7.0** - Database container

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EventHub
```

### 2. Environment Setup
The project includes `.env` files with default configurations. For production, update the following:

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/event-scheduler?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Run with Docker Compose
```bash
# Start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 📱 Application Features

### Authentication
- **Sign Up**: Create new user accounts with email and password
- **Sign In**: Secure login with JWT token authentication
- **Password Security**: Passwords are hashed using bcryptjs
- **Form Validation**: Client-side and server-side validation

### UI/UX Design
- **Modern Design**: Clean, professional interface
- **Botanical Theme**: Beautiful botanical pattern on the left panel
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and hover effects
- **Social Login UI**: Google and Facebook login buttons (UI only)

## 🔧 Development

### Running Locally (without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check

#### Example API Usage

**Register User**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login User**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Rebuild specific service
docker-compose up --build frontend

# Remove all containers and volumes
docker-compose down -v
```

## 🔒 Security Features

- **Password Hashing**: All passwords are securely hashed using bcryptjs
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: Both client and server-side input validation

## 📁 Project Structure

### Backend Structure
```
backend/src/
├── config/
│   └── database.js      # MongoDB connection configuration
├── controllers/
│   └── authController.js # Authentication logic
├── models/
│   └── User.js          # User model schema
├── routes/
│   ├── auth.js          # Authentication routes
│   └── index.js         # Main router
└── server.js            # Express server setup
```

### Frontend Structure
```
frontend/src/
├── components/          # Reusable components
├── pages/
│   ├── Home.js         # Home page
│   ├── SignIn.js       # Sign in page
│   └── SignUp.js       # Sign up page
├── styles/
│   ├── Home.css        # Home page styles
│   ├── SignIn.css      # Sign in page styles
│   └── SignUp.css      # Sign up page styles
└── App.js              # Main App component
```

## 🌟 Design Features

The application features a modern, professional design with:

- **Color Scheme**: 
  - Primary: Bright yellow (#FFD700) background
  - Secondary: Muted teal (#709696) for botanical panel
  - Accent: Dark teal (#5A7A8A) for buttons and text
  - Neutral: Light grey (#A0A0A0) for placeholders

- **Typography**: Clean, modern sans-serif fonts
- **Layout**: Two-panel design with botanical pattern and form
- **Interactions**: Smooth transitions and hover effects
- **Responsiveness**: Mobile-first design approach

## 🚀 Deployment

### Production Deployment

1. **Update Environment Variables**:
   - Change JWT_SECRET to a strong, unique secret
   - Update MONGODB_URI for production database
   - Set NODE_ENV=production

2. **Build and Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **SSL/HTTPS**: Configure reverse proxy (nginx) for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Docker logs for troubleshooting

---

**Happy Event Planning! 🎉**