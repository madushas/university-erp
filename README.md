# University Course Management System

A comprehensive ERP system for managing course offerings, student registrations, and academic results.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.2.0 with Java 17+
- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL 16
- **Authentication**: JWT with refresh tokens
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose

## 🚀 Features

- ✅ User authentication and authorization
- ✅ Role-based access control (Student/Admin)
- ✅ Course management (CRUD operations)
- ✅ Student enrollment system
- ✅ Grade management
- ✅ Responsive UI with modern design
- ✅ API documentation with OpenAPI/Swagger
- ✅ Comprehensive testing
- ✅ CI/CD pipeline ready

## 📁 Project Structure

```
erp-app/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # Next.js application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Local development setup
├── .github/workflows/       # CI/CD pipelines
└── docs/                   # Documentation
```

## 🛠️ Development Setup

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 16 (or use Docker)
- Docker & Docker Compose (optional)
- pnpm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erp-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🚀 Deployment

### Production Deployment
- Backend: Deployed on Azure App Service
- Frontend: Deployed on Vercel/Netlify
- Database: PostgreSQL on Azure Database

### Environment Variables

**Backend**
```
DATABASE_URL=jdbc:postgresql://localhost:5432/university_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
```

**Frontend**
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=University Course Management
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
pnpm test
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password encryption with BCrypt
- CORS configuration
- Input validation and sanitization
- Role-based authorization
- SQL injection protection

## 🎯 Development Milestones

- [x] Project initialization and setup
- [ ] Backend API development
- [ ] Database setup and migrations
- [ ] Authentication and authorization
- [ ] Frontend development
- [ ] Integration testing
- [ ] Deployment configuration
- [ ] Performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- [Your Name] - Initial development

## 📞 Support

For support, email [your-email] or create an issue in this repository.
