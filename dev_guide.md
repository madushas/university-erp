# University Course Management System - Complete Development Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Development (Spring Boot)](#backend-development-spring-boot)
4. [Database Setup (PostgreSQL)](#database-setup-postgresql)
5. [Frontend Development (Next.js)](#frontend-development-nextjs)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)
8. [Best Practices](#best-practices)

## Project Overview

### System Requirements
- **Backend**: Spring Boot 3.2.0, Java 17+
- **Frontend**: Next.js 14, Node.js 18+
- **Database**: PostgreSQL 16
- **Package Manager**: pnpm (faster than npm)
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI 3.0 (Swagger)

### Key Features
- User authentication and authorization
- Role-based access control (Student/Admin)
- Course management (CRUD operations)
- Student enrollment system
- Grade management
- Responsive UI with modern design

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 14    │    │  Spring Boot    │    │  PostgreSQL     │
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (Port 3000)   │    │  (Port 8080)    │    │  (Port 5432)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Improvements
- **Backend**: Spring Boot + Spring Security + Spring Data JPA
- **Authentication**: JWT with refresh tokens
- **Database**: PostgreSQL with HikariCP connection pooling
- **Frontend**: Next.js 14 with App Router
- **State Management**: Zustand (lightweight alternative to Redux)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **UI Components**: Tailwind CSS + Headless UI
- **Testing**: Jest + React Testing Library + Testcontainers

## Backend Development (Spring Boot)

### 1. Project Setup

#### Dependencies (pom.xml)
```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- API Documentation -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- MapStruct for DTO mapping -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2. Application Configuration

#### application.yml
```yaml
spring:
  application:
    name: university-course-management
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/university_db}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: ${SHOW_SQL:false}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
  
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER:http://localhost:8080}

server:
  port: 8080
  servlet:
    context-path: /api

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized

logging:
  level:
    com.university.backend: ${LOG_LEVEL:INFO}
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

app:
  jwt:
    secret: ${JWT_SECRET:mySecretKey}
    expiration: ${JWT_EXPIRATION:86400000} # 24 hours
    refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000} # 7 days
```

### 3. Project Structure
```
src/main/java/com/university/backend/
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── OpenApiConfig.java
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   ├── CourseController.java
│   └── RegistrationController.java
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── CourseRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── UserResponse.java
│       └── CourseResponse.java
├── entity/
│   ├── User.java
│   ├── Course.java
│   └── Registration.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── CustomExceptions.java
├── repository/
│   ├── UserRepository.java
│   ├── CourseRepository.java
│   └── RegistrationRepository.java
├── security/
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── CourseService.java
│   └── RegistrationService.java
├── mapper/
│   ├── UserMapper.java
│   └── CourseMapper.java
└── BackendApplication.java
```

### 4. Entity Classes

#### User.java
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @Size(min = 3, max = 50)
    private String username;

    @Column(nullable = false)
    @Email
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Registration> registrations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

public enum Role {
    STUDENT, ADMIN
}
```

#### Course.java
```java
@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String instructor;

    @Column(nullable = false)
    private String schedule;

    @Column(nullable = false)
    private Integer credits;

    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Registration> registrations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Registration.java
```java
@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    @Column(name = "grade")
    private String grade;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
        status = RegistrationStatus.ENROLLED;
    }
}

public enum RegistrationStatus {
    ENROLLED, COMPLETED, DROPPED
}
```

### 5. Security Configuration

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> 
                exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/auth/**").permitAll();
                auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll();
                auth.requestMatchers(HttpMethod.GET, "/courses").hasAnyRole("STUDENT", "ADMIN");
                auth.requestMatchers(HttpMethod.POST, "/courses").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.PUT, "/courses/**").hasRole("ADMIN");
                auth.requestMatchers(HttpMethod.DELETE, "/courses/**").hasRole("ADMIN");
                auth.anyRequest().authenticated();
            });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 6. JWT Implementation

#### JwtTokenProvider.java
```java
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationInMs;

    @Value("${app.jwt.refresh-expiration}")
    private int refreshExpirationInMs;

    public String generateToken(UserDetails userDetails) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);
        
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Date expiryDate = new Date(System.currentTimeMillis() + refreshExpirationInMs);
        
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
```

### 7. Service Layer

#### AuthService.java
```java
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return AuthResponse.builder()
            .accessToken(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build())
            .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(Role.STUDENT)
            .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = User.builder()
            .username(savedUser.getUsername())
            .password(savedUser.getPassword())
            .role(savedUser.getRole())
            .build();

        String token = tokenProvider.generateToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .accessToken(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole().name())
                .build())
            .build();
    }
}
```

### 8. Controller Layer

#### AuthController.java
```java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
}
```

## Database Setup (PostgreSQL)

### 1. Database Schema Migration (Flyway)

#### V1__Create_initial_tables.sql
```sql
-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructor VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    max_students INTEGER DEFAULT 50,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(5),
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED')),
    UNIQUE(user_id, course_id)
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_course_id ON registrations(course_id);
```

#### V2__Insert_sample_data.sql
```sql
-- Insert admin user
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'admin@university.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', 'User', 'ADMIN');

-- Insert sample courses
INSERT INTO courses (code, title, description, instructor, schedule, credits, max_students)
VALUES 
    ('CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem-solving', 'Dr. Smith', 'Mon/Wed/Fri 10:00-11:00', 3, 30),
    ('CS102', 'Data Structures', 'Arrays, linked lists, trees, and graphs', 'Dr. Johnson', 'Tue/Thu 14:00-15:30', 4, 25),
    ('MATH201', 'Calculus I', 'Limits, derivatives, and integrals', 'Prof. Williams', 'Mon/Wed/Fri 09:00-10:00', 4, 40);
```

### 2. Database Connection Configuration

#### Using Neon (Free PostgreSQL Service)
1. Sign up at [Neon](https://neon.tech/)
2. Create a new database
3. Get connection string: `postgresql://username:password@host/database`
4. Add to environment variables:
```bash
DATABASE_URL=postgresql://username:password@host/database
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
```

## Frontend Development (Next.js)

### 1. Project Setup

#### Initialize Next.js Project
```bash
pnpm create next-app@latest university-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd university-frontend
```

#### Install Dependencies
```bash
pnpm add axios zustand react-hook-form @hookform/resolvers zod @headlessui/react @heroicons/react date-fns clsx tailwind-merge
pnpm add -D @types/node @types/react @types/react-dom
```

### 2. Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── admin/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── CourseForm.tsx
│   └── course/
│       ├── CourseCard.tsx
│       ├── CourseList.tsx
│       └── CourseModal.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── store/
│   ├── authStore.ts
│   ├── courseStore.ts
│   └── registrationStore.ts
├── types/
│   ├── auth.ts
│   ├── course.ts
│   └── user.ts
└── hooks/
    ├── useAuth.ts
    ├── useCourses.ts
    └── useRegistrations.ts
```

### 3. Environment Configuration

#### .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=University Course Management
```

### 4. API Client Setup

#### lib/api.ts
```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5. State Management with Zustand

#### store/authStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types/auth';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/login', credentials);
          const { user, accessToken } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/register', data);
          const { user, accessToken } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        try {
          const refreshToken = get().token;
          const response = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken,
          });
          const { user, accessToken } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 6. Form Validation with Zod

#### lib/validations.ts
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Course title is required'),
  description: z.string().optional(),
  instructor: z.string().min(1, 'Instructor name is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  credits: z.number().min(1, 'Credits must be at least 1').max(6, 'Credits cannot exceed 6'),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;

### 7. React Hook Form Components

#### components/forms/LoginForm.tsx
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Username"
          type="text"
          {...register('username')}
          error={errors.username?.message}
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
```

#### components/forms/RegisterForm.tsx
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [error, setError] = useState<string>('');

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await register(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          {...formRegister('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          type="text"
          {...formRegister('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Username"
        type="text"
        {...formRegister('username')}
        error={errors.username?.message}
      />

      <Input
        label="Email"
        type="email"
        {...formRegister('email')}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        {...formRegister('password')}
        error={errors.password?.message}
      />

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
```

### 8. UI Components

#### components/ui/Button.tsx
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

#### components/ui/Input.tsx
```typescript
import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          className={clsx(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

### 9. Course Management Components

#### components/course/CourseCard.tsx
```typescript
import { Course } from '@/types/course';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: number) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: number) => void;
}

export default function CourseCard({ course, onEnroll, onEdit, onDelete }: CourseCardProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.code}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {course.credits} Credits
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Instructor:</span> {course.instructor}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Schedule:</span> {course.schedule}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Max Students:</span> {course.maxStudents}
        </p>
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {course.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        {isStudent && onEnroll && (
          <Button
            onClick={() => onEnroll(course.id)}
            size="sm"
          >
            Enroll
          </Button>
        )}

        {isAdmin && (
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(course)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(course.id)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 10. Pages Implementation

#### app/login/page.tsx
```typescript
import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

#### app/dashboard/page.tsx
```typescript
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import CourseCard from '@/components/course/CourseCard';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { courses, fetchCourses, enrollInCourse } = useCourseStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Admin Dashboard' : 'My Courses'}
            </h1>
            {isAdmin && (
              <Button>
                Add New Course
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={!isAdmin ? handleEnroll : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 11. Store Implementation

#### store/courseStore.ts
```typescript
import { create } from 'zustand';
import { Course, CreateCourseData } from '@/types/course';
import api from '@/lib/api';

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
  createCourse: (data: CreateCourseData) => Promise<void>;
  updateCourse: (id: number, data: Partial<CreateCourseData>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  enrollInCourse: (courseId: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: false,

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Course[]>('/courses');
      set({ courses: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createCourse: async (data) => {
    try {
      const response = await api.post<Course>('/courses', data);
      set({ courses: [...get().courses, response.data] });
    } catch (error) {
      throw error;
    }
  },

  updateCourse: async (id, data) => {
    try {
      const response = await api.put<Course>(`/courses/${id}`, data);
      set({
        courses: get().courses.map((course) =>
          course.id === id ? response.data : course
        ),
      });
    } catch (error) {
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      set({
        courses: get().courses.filter((course) => course.id !== id),
      });
    } catch (error) {
      throw error;
    }
  },

  enrollInCourse: async (courseId) => {
    try {
      await api.post('/registrations', { courseId });
      // Optionally refresh courses or update enrollment status
    } catch (error) {
      throw error;
    }
  },
}));
```

### 12. TypeScript Types

#### types/auth.ts
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

#### types/course.ts
```typescript
export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  instructor: string;
  schedule: string;
  credits: number;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  code: string;
  title: string;
  description?: string;
  instructor: string;
  schedule: string;
  credits: number;
  maxStudents: number;
}
```

## Testing Strategy

### 1. Backend Testing

#### Integration Tests with Testcontainers
```java
@SpringBootTest
@Testcontainers
class UserServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserService userService;

    @Test
    void shouldCreateUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .firstName("Test")
                .lastName("User")
                .build();

        AuthResponse response = userService.register(request);

        assertThat(response.getUser().getUsername()).isEqualTo("testuser");
        assertThat(response.getAccessToken()).isNotNull();
    }
}
```

### 2. Frontend Testing

#### Component Tests
```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/forms/LoginForm';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/store/authStore');

describe('LoginForm', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('should render login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should call login on form submission', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });
});
```

## Deployment

### 1. Backend Deployment (Docker)

#### Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/university-backend-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: university_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/university_db
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: password
      JWT_SECRET: your-jwt-secret-key

volumes:
  postgres_data:
```

### 2. Frontend Deployment (Vercel)

#### vercel.json
```json
{
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend-url.com/api"
  }
}
```

### 3. Production Configuration

#### Environment Variables
```bash
# Backend
DATABASE_URL=your-production-db-url
JWT_SECRET=your-production-jwt-secret
LOG_LEVEL=WARN

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Best Practices

### 1. Security
- Use HTTPS in production
- Implement proper CORS configuration
- Use environment variables for sensitive data
- Implement rate limiting
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

### 2. Performance
- Implement database indexing
- Use connection pooling
- Implement caching strategies
- Optimize database queries
- Use pagination for large datasets
- Implement lazy loading for components

### 3. Code Quality
- Follow consistent coding standards
- Use TypeScript for type safety
- Implement comprehensive error handling
- Write meaningful tests
- Use code formatting tools (Prettier, ESLint)
- Implement continuous integration

### 4. Monitoring
- Implement logging
- Set up health checks
- Monitor application metrics
- Use error tracking tools
- Implement alerting for critical issues

### 5. Documentation
- Document API endpoints with OpenAPI
- Write clear README files
- Document deployment procedures
- Keep architecture diagrams updated

## Development Workflow

### 1. Local Development
```bash
# Backend
./mvnw spring-boot:run

# Frontend
pnpm dev
```

### 2. Running Tests
```bash
# Backend tests
./mvnw test

# Frontend tests
pnpm test
```

### 3. Building for Production
```bash
# Backend
./mvnw clean package

# Frontend
pnpm build
```

This comprehensive guide provides a solid foundation for building a modern University Course Management System with Spring Boot and Next.js. The architecture is scalable, secure, and follows industry best practices.