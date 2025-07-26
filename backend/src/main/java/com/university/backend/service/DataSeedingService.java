package com.university.backend.service;

import com.university.backend.entity.*;
import com.university.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // Don't run in test profile
public class DataSeedingService implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicSemesterRepository academicSemesterRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        // Only seed if database is empty
        if (userRepository.count() > 0) {
            log.info("Database already contains data, skipping seeding");
            return;
        }

        log.info("Starting data seeding process...");
        
        try {
            seedDepartments();
            seedAcademicSemesters();
            seedUsers();
            seedCourses();
            seedRegistrations();
            
            log.info("Data seeding completed successfully!");
        } catch (Exception e) {
            log.error("Error during data seeding: ", e);
        }
    }

    private void seedDepartments() {
        log.info("Seeding departments...");
        
        List<Department> departments = Arrays.asList(
            Department.builder()
                .code("CS")
                .name("Computer Science")
                .description("Department of Computer Science and Information Technology")
                .headOfDepartment("Dr. Sarah Johnson")
                .headEmail("sarah.johnson@university.edu")
                .building("Engineering Building")
                .roomNumber("E-101")
                .phoneNumber("+1-555-0101")
                .email("cs@university.edu")
                .website("https://cs.university.edu")
                .budgetAllocation(new BigDecimal("2500000.00"))
                .status(DepartmentStatus.ACTIVE)
                .build(),
                
            Department.builder()
                .code("MATH")
                .name("Mathematics")
                .description("Department of Mathematics and Statistics")
                .headOfDepartment("Dr. Michael Chen")
                .headEmail("michael.chen@university.edu")
                .building("Science Building")
                .roomNumber("S-201")
                .phoneNumber("+1-555-0102")
                .email("math@university.edu")
                .website("https://math.university.edu")
                .budgetAllocation(new BigDecimal("1800000.00"))
                .status(DepartmentStatus.ACTIVE)
                .build(),
                
            Department.builder()
                .code("BUS")
                .name("Business Administration")
                .description("School of Business and Management")
                .headOfDepartment("Dr. Emily Rodriguez")
                .headEmail("emily.rodriguez@university.edu")
                .building("Business Center")
                .roomNumber("B-301")
                .phoneNumber("+1-555-0103")
                .email("business@university.edu")
                .website("https://business.university.edu")
                .budgetAllocation(new BigDecimal("2200000.00"))
                .status(DepartmentStatus.ACTIVE)
                .build(),
                
            Department.builder()
                .code("ENG")
                .name("Engineering")
                .description("Faculty of Engineering and Applied Sciences")
                .headOfDepartment("Dr. Robert Kim")
                .headEmail("robert.kim@university.edu")
                .building("Engineering Complex")
                .roomNumber("EC-401")
                .phoneNumber("+1-555-0104")
                .email("engineering@university.edu")
                .website("https://engineering.university.edu")
                .budgetAllocation(new BigDecimal("3500000.00"))
                .status(DepartmentStatus.ACTIVE)
                .build(),
                
            Department.builder()
                .code("PSYC")
                .name("Psychology")
                .description("Department of Psychology and Behavioral Sciences")
                .headOfDepartment("Dr. Lisa Wang")
                .headEmail("lisa.wang@university.edu")
                .building("Liberal Arts Building")
                .roomNumber("LA-501")
                .phoneNumber("+1-555-0105")
                .email("psychology@university.edu")
                .website("https://psychology.university.edu")
                .budgetAllocation(new BigDecimal("1500000.00"))
                .status(DepartmentStatus.ACTIVE)
                .build()
        );
        
        departmentRepository.saveAll(departments);
        log.info("Seeded {} departments", departments.size());
    }

    private void seedAcademicSemesters() {
        log.info("Seeding academic semesters...");
        
        List<AcademicSemester> semesters = Arrays.asList(
            AcademicSemester.builder()
                .code("2024-FALL")
                .name("Fall 2024")
                .startDate(LocalDate.of(2024, 9, 1))
                .endDate(LocalDate.of(2024, 12, 15))
                .registrationStartDate(LocalDate.of(2024, 7, 1))
                .registrationEndDate(LocalDate.of(2024, 8, 31))
                .addDropDeadline(LocalDate.of(2024, 9, 15))
                .withdrawalDeadline(LocalDate.of(2024, 11, 1))
                .finalExamStartDate(LocalDate.of(2024, 12, 10))
                .finalExamEndDate(LocalDate.of(2024, 12, 15))
                .gradeSubmissionDeadline(LocalDate.of(2024, 12, 20))
                .status(SemesterStatus.COMPLETED)
                .isCurrent(false)
                .build(),
                
            AcademicSemester.builder()
                .code("2025-SPRING")
                .name("Spring 2025")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .registrationStartDate(LocalDate.of(2024, 11, 1))
                .registrationEndDate(LocalDate.of(2025, 1, 10))
                .addDropDeadline(LocalDate.of(2025, 1, 30))
                .withdrawalDeadline(LocalDate.of(2025, 4, 1))
                .finalExamStartDate(LocalDate.of(2025, 5, 10))
                .finalExamEndDate(LocalDate.of(2025, 5, 15))
                .gradeSubmissionDeadline(LocalDate.of(2025, 5, 20))
                .status(SemesterStatus.ACTIVE)
                .isCurrent(true)
                .build(),
                
            AcademicSemester.builder()
                .code("2025-SUMMER")
                .name("Summer 2025")
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 8, 15))
                .registrationStartDate(LocalDate.of(2025, 3, 1))
                .registrationEndDate(LocalDate.of(2025, 5, 25))
                .addDropDeadline(LocalDate.of(2025, 6, 10))
                .withdrawalDeadline(LocalDate.of(2025, 7, 15))
                .finalExamStartDate(LocalDate.of(2025, 8, 10))
                .finalExamEndDate(LocalDate.of(2025, 8, 15))
                .gradeSubmissionDeadline(LocalDate.of(2025, 8, 20))
                .status(SemesterStatus.REGISTRATION_OPEN)
                .isCurrent(false)
                .build(),
                
            AcademicSemester.builder()
                .code("2025-FALL")
                .name("Fall 2025")
                .startDate(LocalDate.of(2025, 9, 1))
                .endDate(LocalDate.of(2025, 12, 15))
                .registrationStartDate(LocalDate.of(2025, 6, 1))
                .registrationEndDate(LocalDate.of(2025, 8, 31))
                .addDropDeadline(LocalDate.of(2025, 9, 15))
                .withdrawalDeadline(LocalDate.of(2025, 11, 1))
                .finalExamStartDate(LocalDate.of(2025, 12, 10))
                .finalExamEndDate(LocalDate.of(2025, 12, 15))
                .gradeSubmissionDeadline(LocalDate.of(2025, 12, 20))
                .status(SemesterStatus.PLANNING)
                .isCurrent(false)
                .build()
        );
        
        academicSemesterRepository.saveAll(semesters);
        log.info("Seeded {} academic semesters", semesters.size());
    }

    private void seedUsers() {
        log.info("Seeding users...");
        
        List<User> users = new ArrayList<>();
        
        // Add admin users
        users.addAll(createAdminUsers());
        
        // Add faculty users
        users.addAll(createFacultyUsers());
        
        // Add student users
        users.addAll(createStudentUsers());
        
        userRepository.saveAll(users);
        log.info("Seeded {} users", users.size());
    }

    private List<User> createAdminUsers() {
        return Arrays.asList(
            User.builder()
                .username("admin")
                .email("admin@university.edu")
                .password(passwordEncoder.encode("admin123"))
                .firstName("System")
                .lastName("Administrator")
                .employeeId("EMP001")
                .phoneNumber("+1-555-0001")
                .department("IT")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build(),
                
            User.builder()
                .username("registrar")
                .email("registrar@university.edu")
                .password(passwordEncoder.encode("reg123"))
                .firstName("Jane")
                .lastName("Smith")
                .employeeId("EMP002")
                .phoneNumber("+1-555-0002")
                .department("Academic Affairs")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build()
        );
    }

    private List<User> createFacultyUsers() {
        List<User> faculty = new ArrayList<>();
        String[] firstNames = {"John", "Sarah", "Michael", "Emily", "David", "Lisa", "Robert", "Anna", "James", "Maria"};
        String[] lastNames = {"Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez"};
        String[] departments = {"CS", "MATH", "BUS", "ENG", "PSYC"};
        
        for (int i = 0; i < 10; i++) {
            String firstName = firstNames[i];
            String lastName = lastNames[i];
            String username = firstName.toLowerCase() + "." + lastName.toLowerCase();
            
            faculty.add(User.builder()
                .username(username)
                .email(username + "@university.edu")
                .password(passwordEncoder.encode("faculty123"))
                .firstName(firstName)
                .lastName(lastName)
                .employeeId("FAC" + String.format("%03d", i + 1))
                .phoneNumber("+1-555-" + String.format("%04d", 1000 + i))
                .department(departments[i % departments.length])
                .role(Role.ADMIN) // Faculty can manage courses
                .status(UserStatus.ACTIVE)
                .build());
        }
        
        return faculty;
    }

    private List<User> createStudentUsers() {
        List<User> students = new ArrayList<>();
        String[] firstNames = {"Alex", "Emma", "Ryan", "Sophia", "Daniel", "Olivia", "Matthew", "Isabella", "Christopher", "Mia",
                              "Andrew", "Charlotte", "Joshua", "Amelia", "Nicholas", "Harper", "Tyler", "Evelyn", "Kevin", "Abigail"};
        String[] lastNames = {"Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
                             "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King"};
        String[] cities = {"New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"};
        String[] states = {"NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"};
        
        for (int i = 0; i < 20; i++) {
            String firstName = firstNames[i];
            String lastName = lastNames[i];
            String username = firstName.toLowerCase() + "." + lastName.toLowerCase() + (i + 1);
            
            students.add(User.builder()
                .username(username)
                .email(username + "@student.university.edu")
                .password(passwordEncoder.encode("student123"))
                .firstName(firstName)
                .lastName(lastName)
                .studentId("STU" + String.format("%06d", 2024001 + i))
                .phoneNumber("+1-555-" + String.format("%04d", 2000 + i))
                .dateOfBirth(LocalDate.of(2000 + random.nextInt(5), 1 + random.nextInt(12), 1 + random.nextInt(28)))
                .address((1000 + i) + " Main Street")
                .city(cities[i % cities.length])
                .state(states[i % states.length])
                .postalCode(String.format("%05d", 10000 + i))
                .country("USA")
                .yearOfStudy(1 + random.nextInt(4))
                .gpa(2.0 + random.nextDouble() * 2.0) // GPA between 2.0 and 4.0
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .enrollmentDate(LocalDate.of(2024, 9, 1))
                .build());
        }
        
        return students;
    }

    private void seedCourses() {
        log.info("Seeding courses...");
        
        List<Course> courses = createCourses();
        courseRepository.saveAll(courses);
        log.info("Seeded {} courses", courses.size());
    }

    private List<Course> createCourses() {
        return Arrays.asList(
            // Computer Science Courses
            Course.builder()
                .code("CS101")
                .title("Introduction to Computer Science")
                .description("Fundamental concepts of computer science including programming basics, algorithms, and data structures.")
                .instructor("Dr. John Johnson")
                .instructorEmail("john.johnson@university.edu")
                .department("CS")
                .courseLevel("Undergraduate")
                .schedule("MWF 9:00-10:00 AM")
                .classroom("CS-101")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(3)
                .maxStudents(30)
                .minStudents(5)
                .courseFee(new BigDecimal("1200.00"))
                .status(CourseStatus.ACTIVE)
                .textbook("Introduction to Algorithms by Cormen")
                .passingGrade("C")
                .build(),
                
            Course.builder()
                .code("CS102")
                .title("Data Structures and Algorithms")
                .description("Advanced data structures, algorithm design and analysis, complexity theory.")
                .instructor("Dr. Sarah Williams")
                .instructorEmail("sarah.williams@university.edu")
                .department("CS")
                .courseLevel("Undergraduate")
                .schedule("TTH 2:00-3:30 PM")
                .classroom("CS-201")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 30))
                .daysOfWeek("TUE,THU")
                .credits(4)
                .maxStudents(25)
                .courseFee(new BigDecimal("1400.00"))
                .prerequisites("CS101")
                .status(CourseStatus.ACTIVE)
                .textbook("Data Structures and Algorithm Analysis by Weiss")
                .build(),
                
            Course.builder()
                .code("CS201")
                .title("Object-Oriented Programming")
                .description("Object-oriented programming concepts using Java. Classes, inheritance, polymorphism, and design patterns.")
                .instructor("Dr. Michael Brown")
                .instructorEmail("michael.brown@university.edu")
                .department("CS")
                .courseLevel("Undergraduate")
                .schedule("MWF 11:00-12:00 PM")
                .classroom("CS-102")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(12, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(3)
                .maxStudents(28)
                .courseFee(new BigDecimal("1300.00"))
                .prerequisites("CS101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("CS301")
                .title("Database Systems")
                .description("Database design, SQL, normalization, transactions, and distributed databases.")
                .instructor("Dr. Emily Jones")
                .instructorEmail("emily.jones@university.edu")
                .department("CS")
                .courseLevel("Undergraduate")
                .schedule("TTH 10:00-11:30 AM")
                .classroom("CS-203")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .daysOfWeek("TUE,THU")
                .credits(3)
                .maxStudents(25)
                .courseFee(new BigDecimal("1350.00"))
                .prerequisites("CS102,CS201")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("CS401")
                .title("Software Engineering")
                .description("Software development lifecycle, project management, testing, and quality assurance.")
                .instructor("Dr. David Garcia")
                .instructorEmail("david.garcia@university.edu")
                .department("CS")
                .courseLevel("Undergraduate")
                .schedule("MW 3:00-4:30 PM")
                .classroom("CS-301")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(16, 30))
                .daysOfWeek("MON,WED")
                .credits(4)
                .maxStudents(20)
                .courseFee(new BigDecimal("1500.00"))
                .prerequisites("CS201,CS301")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            // Mathematics Courses
            Course.builder()
                .code("MATH101")
                .title("Calculus I")
                .description("Limits, derivatives, applications of derivatives, and introduction to integrals.")
                .instructor("Dr. Lisa Miller")
                .instructorEmail("lisa.miller@university.edu")
                .department("MATH")
                .courseLevel("Undergraduate")
                .schedule("MWF 8:00-9:00 AM")
                .classroom("MATH-101")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(9, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(4)
                .maxStudents(35)
                .courseFee(new BigDecimal("1100.00"))
                .status(CourseStatus.ACTIVE)
                .textbook("Calculus by Stewart")
                .build(),
                
            Course.builder()
                .code("MATH102")
                .title("Calculus II")
                .description("Integration techniques, infinite series, parametric equations, and polar coordinates.")
                .instructor("Dr. Robert Davis")
                .instructorEmail("robert.davis@university.edu")
                .department("MATH")
                .courseLevel("Undergraduate")
                .schedule("TTH 9:00-10:30 AM")
                .classroom("MATH-102")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .daysOfWeek("TUE,THU")
                .credits(4)
                .maxStudents(30)
                .courseFee(new BigDecimal("1150.00"))
                .prerequisites("MATH101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("MATH201")
                .title("Linear Algebra")
                .description("Vector spaces, matrices, determinants, eigenvalues, and linear transformations.")
                .instructor("Dr. Anna Rodriguez")
                .instructorEmail("anna.rodriguez@university.edu")
                .department("MATH")
                .courseLevel("Undergraduate")
                .schedule("MWF 10:00-11:00 AM")
                .classroom("MATH-201")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(3)
                .maxStudents(25)
                .courseFee(new BigDecimal("1200.00"))
                .prerequisites("MATH102")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("STAT101")
                .title("Introduction to Statistics")
                .description("Descriptive statistics, probability distributions, hypothesis testing, and regression.")
                .instructor("Dr. James Martinez")
                .instructorEmail("james.martinez@university.edu")
                .department("MATH")
                .courseLevel("Undergraduate")
                .schedule("TTH 1:00-2:30 PM")
                .classroom("MATH-103")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(14, 30))
                .daysOfWeek("TUE,THU")
                .credits(3)
                .maxStudents(40)
                .courseFee(new BigDecimal("1000.00"))
                .status(CourseStatus.ACTIVE)
                .build(),
                
            // Business Courses
            Course.builder()
                .code("BUS101")
                .title("Introduction to Business")
                .description("Overview of business fundamentals, management principles, and entrepreneurship.")
                .instructor("Dr. Maria Hernandez")
                .instructorEmail("maria.hernandez@university.edu")
                .department("BUS")
                .courseLevel("Undergraduate")
                .schedule("MW 1:00-2:30 PM")
                .classroom("BUS-101")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(14, 30))
                .daysOfWeek("MON,WED")
                .credits(3)
                .maxStudents(45)
                .courseFee(new BigDecimal("1250.00"))
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("BUS201")
                .title("Financial Accounting")
                .description("Principles of financial accounting, financial statements, and accounting standards.")
                .instructor("Dr. Christopher Anderson")
                .instructorEmail("christopher.anderson@university.edu")
                .department("BUS")
                .courseLevel("Undergraduate")
                .schedule("TTH 11:00-12:30 PM")
                .classroom("BUS-201")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(12, 30))
                .daysOfWeek("TUE,THU")
                .credits(3)
                .maxStudents(35)
                .courseFee(new BigDecimal("1300.00"))
                .prerequisites("BUS101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("BUS301")
                .title("Marketing Management")
                .description("Marketing strategies, consumer behavior, market research, and digital marketing.")
                .instructor("Dr. Ashley Taylor")
                .instructorEmail("ashley.taylor@university.edu")
                .department("BUS")
                .courseLevel("Undergraduate")
                .schedule("MWF 2:00-3:00 PM")
                .classroom("BUS-301")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(3)
                .maxStudents(30)
                .courseFee(new BigDecimal("1350.00"))
                .prerequisites("BUS101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            // Engineering Courses
            Course.builder()
                .code("ENG101")
                .title("Engineering Fundamentals")
                .description("Introduction to engineering principles, problem-solving, and design thinking.")
                .instructor("Dr. Ryan Thomas")
                .instructorEmail("ryan.thomas@university.edu")
                .department("ENG")
                .courseLevel("Undergraduate")
                .schedule("MW 9:00-10:30 AM")
                .classroom("ENG-101")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .daysOfWeek("MON,WED")
                .credits(3)
                .maxStudents(25)
                .courseFee(new BigDecimal("1400.00"))
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("ENG201")
                .title("Circuit Analysis")
                .description("DC and AC circuit analysis, network theorems, and electronic components.")
                .instructor("Dr. Sophia Moore")
                .instructorEmail("sophia.moore@university.edu")
                .department("ENG")
                .courseLevel("Undergraduate")
                .schedule("TTH 3:00-4:30 PM")
                .classroom("ENG-201")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(16, 30))
                .daysOfWeek("TUE,THU")
                .credits(4)
                .maxStudents(20)
                .courseFee(new BigDecimal("1500.00"))
                .prerequisites("ENG101,MATH102")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            // Psychology Courses
            Course.builder()
                .code("PSYC101")
                .title("Introduction to Psychology")
                .description("Basic concepts in psychology, behavior, cognition, and psychological research methods.")
                .instructor("Dr. Daniel Jackson")
                .instructorEmail("daniel.jackson@university.edu")
                .department("PSYC")
                .courseLevel("Undergraduate")
                .schedule("MWF 12:00-1:00 PM")
                .classroom("PSYC-101")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(12, 0))
                .endTime(LocalTime.of(13, 0))
                .daysOfWeek("MON,WED,FRI")
                .credits(3)
                .maxStudents(50)
                .courseFee(new BigDecimal("1100.00"))
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("PSYC201")
                .title("Cognitive Psychology")
                .description("Mental processes including perception, memory, thinking, and problem-solving.")
                .instructor("Dr. Olivia Martin")
                .instructorEmail("olivia.martin@university.edu")
                .department("PSYC")
                .courseLevel("Undergraduate")
                .schedule("TTH 4:00-5:30 PM")
                .classroom("PSYC-201")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(16, 0))
                .endTime(LocalTime.of(17, 30))
                .daysOfWeek("TUE,THU")
                .credits(3)
                .maxStudents(25)
                .courseFee(new BigDecimal("1200.00"))
                .prerequisites("PSYC101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            // Advanced Courses
            Course.builder()
                .code("CS501")
                .title("Machine Learning")
                .description("Machine learning algorithms, neural networks, and artificial intelligence applications.")
                .instructor("Dr. Matthew Lee")
                .instructorEmail("matthew.lee@university.edu")
                .department("CS")
                .courseLevel("Graduate")
                .schedule("MW 5:00-6:30 PM")
                .classroom("CS-401")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(18, 30))
                .daysOfWeek("MON,WED")
                .credits(3)
                .maxStudents(15)
                .courseFee(new BigDecimal("2000.00"))
                .prerequisites("CS102,CS301,MATH201,STAT101")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("BUS501")
                .title("Strategic Management")
                .description("Advanced business strategy, competitive analysis, and organizational management.")
                .instructor("Dr. Isabella Perez")
                .instructorEmail("isabella.perez@university.edu")
                .department("BUS")
                .courseLevel("Graduate")
                .schedule("TH 6:00-9:00 PM")
                .classroom("BUS-401")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(21, 0))
                .daysOfWeek("THU")
                .credits(3)
                .maxStudents(20)
                .courseFee(new BigDecimal("1800.00"))
                .prerequisites("BUS201,BUS301")
                .status(CourseStatus.ACTIVE)
                .build(),
                
            Course.builder()
                .code("ENG501")
                .title("Advanced Systems Design")
                .description("Complex systems engineering, project management, and advanced design methodologies.")
                .instructor("Dr. Kevin Thompson")
                .instructorEmail("kevin.thompson@university.edu")
                .department("ENG")
                .courseLevel("Graduate")
                .schedule("T 6:00-9:00 PM")
                .classroom("ENG-401")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 5, 15))
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(21, 0))
                .daysOfWeek("TUE")
                .credits(3)
                .maxStudents(12)
                .courseFee(new BigDecimal("2200.00"))
                .prerequisites("ENG201")
                .status(CourseStatus.ACTIVE)
                .build()
        );
    }

    private void seedRegistrations() {
        log.info("Seeding registrations...");
        
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Course> courses = courseRepository.findAll();
        List<Registration> registrations = new ArrayList<>();
        
        String[] grades = {"A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"};
        String[] paymentMethods = {"Credit Card", "Bank Transfer", "Cash", "Check", "Financial Aid"};
        
        // Ensure each student is enrolled in 3-6 courses
        for (User student : students) {
            int numCourses = 3 + random.nextInt(4); // 3-6 courses
            List<Course> availableCourses = new ArrayList<>(courses);
            
            for (int i = 0; i < numCourses && !availableCourses.isEmpty(); i++) {
                Course course = availableCourses.remove(random.nextInt(availableCourses.size()));
                
                String grade = random.nextBoolean() ? grades[random.nextInt(grades.length)] : null;
                
                Registration registration = Registration.builder()
                    .user(student)
                    .course(course)
                    .registrationDate(LocalDateTime.of(2025, 1, 10 + random.nextInt(5), 
                                                     9 + random.nextInt(8), random.nextInt(60)))
                    .grade(grade)
                    .gradePoints(calculateGradePoints(grade))
                    .attendancePercentage(75.0 + random.nextDouble() * 25.0) // 75-100%
                    .courseFeePaid(course.getCourseFee())
                    .paymentStatus(PaymentStatus.values()[random.nextInt(PaymentStatus.values().length)])
                    .paymentMethod(paymentMethods[random.nextInt(paymentMethods.length)])
                    .status(RegistrationStatus.values()[random.nextInt(RegistrationStatus.values().length)])
                    .transcriptReleased(random.nextBoolean())
                    .certificateIssued(random.nextBoolean())
                    .build();
                
                // Set payment date if paid
                if (registration.getPaymentStatus() == PaymentStatus.PAID) {
                    registration.setPaymentDate(registration.getRegistrationDate().plusDays(random.nextInt(30)));
                }
                
                // Set completion date if completed
                if (registration.getStatus() == RegistrationStatus.COMPLETED) {
                    registration.setCompletionDate(LocalDateTime.now().minusDays(random.nextInt(180)));
                }
                
                registrations.add(registration);
            }
        }
        
        registrationRepository.saveAll(registrations);
        log.info("Seeded {} registrations", registrations.size());
    }
    
    private Double calculateGradePoints(String grade) {
        if (grade == null) return null;
        
        return switch (grade) {
            case "A+", "A" -> 4.0;
            case "A-" -> 3.7;
            case "B+" -> 3.3;
            case "B" -> 3.0;
            case "B-" -> 2.7;
            case "C+" -> 2.3;
            case "C" -> 2.0;
            case "C-" -> 1.7;
            case "D+" -> 1.3;
            case "D" -> 1.0;
            case "F" -> 0.0;
            default -> null;
        };
    }
}
