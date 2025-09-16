# HobbyClass Backend Implementation Guide

## Technology Stack Recommendation

### Backend Framework
- **Primary**: Java Spring Boot 3.x with Spring Security 6.x
- **Database**: PostgreSQL (primary) with Redis (caching/sessions)
- **Authentication**: JWT with Spring Security and refresh tokens
- **ORM**: Spring Data JPA with Hibernate
- **File Storage**: AWS S3 / Cloudinary for images
- **Email Service**: Spring Mail with SendGrid / AWS SES
- **Payment Processing**: Stripe API integration
- **Real-time**: WebSocket with Spring WebSocket / SockJS
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Testing**: JUnit 5, Mockito, Spring Boot Test
- **Build Tool**: Maven or Gradle
- **Java Version**: Java 17+ (LTS)

## Database Schema Design (JPA Entity Mapping)

### Spring Boot Entity Structure

#### 1. User Entity
```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private MentorProfile mentorProfile;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Enrollment> enrollments;

    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ClassEntity> classes;
}

// Enums
public enum UserRole {
    ADMIN, MENTOR, STUDENT
}

public enum UserStatus {
    ACTIVE, INACTIVE, SUSPENDED, PENDING
}
```

#### 2. Mentor Profile Entity
```java
@Entity
@Table(name = "mentor_profiles", indexes = {
    @Index(name = "idx_mentor_rating", columnList = "rating"),
    @Index(name = "idx_mentor_verified", columnList = "is_verified")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Lob
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(length = 255)
    private String location;

    @Lob
    private String availability; // JSON string

    @ElementCollection
    @CollectionTable(name = "mentor_specializations", 
                     joinColumns = @JoinColumn(name = "mentor_profile_id"))
    @Column(name = "specialization")
    private Set<String> specializations;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Add validation
    @PrePersist
    @PreUpdate
    private void validateRating() {
        if (rating != null && (rating.compareTo(BigDecimal.ZERO) < 0 || rating.compareTo(new BigDecimal("5")) > 0)) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
    }
}
```

#### 3. Class Entity
```java
@Entity
@Table(name = "classes", indexes = {
    @Index(name = "idx_classes_mentor", columnList = "mentor_id"),
    @Index(name = "idx_classes_category", columnList = "category"),
    @Index(name = "idx_classes_status", columnList = "status"),
    @Index(name = "idx_classes_start_date", columnList = "start_date"),
    @Index(name = "idx_classes_price", columnList = "price")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @Column(nullable = false, length = 255)
    private String name;

    @Lob
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String subcategory;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "max_students", nullable = false)
    @Builder.Default
    private Integer maxStudents = 10;

    @Column(name = "min_students")
    @Builder.Default
    private Integer minStudents = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.BEGINNER;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ClassStatus status = ClassStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type")
    @Builder.Default
    private ScheduleType scheduleType = ScheduleType.FIXED;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "recurring_pattern", length = 100)
    private String recurringPattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type")
    @Builder.Default
    private LocationType locationType = LocationType.ONLINE;

    @Column(name = "location_address")
    private String locationAddress;

    @Column(name = "materials_needed")
    private String materialsNeeded;

    @Column(name = "prerequisites")
    private String prerequisites;

    @Column(name = "cancellation_policy")
    private String cancellationPolicy;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ClassSession> sessions;

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Enrollment> enrollments;

    // Validation
    @PrePersist
    @PreUpdate
    private void validateClass() {
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price must be non-negative");
        }
        if (maxStudents <= 0 || minStudents <= 0 || maxStudents < minStudents) {
            throw new IllegalArgumentException("Invalid student capacity");
        }
    }
}

// Enums for Class
public enum DifficultyLevel {
    BEGINNER, INTERMEDIATE, ADVANCED
}

public enum ClassStatus {
    DRAFT, ACTIVE, INACTIVE, CANCELLED, COMPLETED
}

public enum ScheduleType {
    FIXED, FLEXIBLE, RECURRING
}

public enum LocationType {
    ONLINE, IN_PERSON, HYBRID
}
```

#### 4. Class Session Entity
```java
@Entity
@Table(name = "class_sessions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "session_number"}),
       indexes = {
    @Index(name = "idx_sessions_class", columnList = "class_id"),
    @Index(name = "idx_sessions_date", columnList = "scheduled_date"),
    @Index(name = "idx_sessions_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Lob
    private String notes;

    @Column(name = "recording_url", length = 500)
    private String recordingUrl;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<SessionAttendance> attendances;

    // Validation
    @PrePersist
    @PreUpdate
    private void validateTimes() {
        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }
}

public enum SessionStatus {
    SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
}
```

#### 5. Enrollment Entity
```java
@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "class_id"}),
       indexes = {
    @Index(name = "idx_enrollments_student", columnList = "student_id"),
    @Index(name = "idx_enrollments_class", columnList = "class_id"),
    @Index(name = "idx_enrollments_status", columnList = "status"),
    @Index(name = "idx_enrollments_payment_status", columnList = "payment_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @CreationTimestamp
    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_transaction_id", length = 255)
    private String paymentTransactionId;

    @Column(name = "completion_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal completionPercentage = BigDecimal.ZERO;

    @Column(name = "final_rating")
    private Integer finalRating;

    @Column(name = "review_text")
    private String reviewText;

    @Column(name = "certificate_issued")
    @Builder.Default
    private Boolean certificateIssued = false;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "refund_reason")
    private String refundReason;

    @Lob
    private String notes;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<SessionAttendance> attendances;

    @OneToOne(mappedBy = "enrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Review review;

    // Validation
    @PrePersist
    @PreUpdate
    private void validateEnrollment() {
        if (paymentAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Payment amount must be non-negative");
        }
        if (finalRating != null && (finalRating < 1 || finalRating > 5)) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
}

public enum EnrollmentStatus {
    ACTIVE, COMPLETED, CANCELLED, REFUNDED, SUSPENDED
}

public enum PaymentStatus {
    PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED
}
```

#### 6. Session Attendance Entity
```java
@Entity
@Table(name = "session_attendance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "student_id"}),
       indexes = {
    @Index(name = "idx_attendance_session", columnList = "session_id"),
    @Index(name = "idx_attendance_student", columnList = "student_id"),
    @Index(name = "idx_attendance_enrollment", columnList = "enrollment_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ClassSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Builder.Default
    private Boolean attended = false;

    @Column(name = "attendance_marked_at")
    private LocalDateTime attendanceMarkedAt;

    @Column(name = "join_time")
    private LocalDateTime joinTime;

    @Column(name = "leave_time")
    private LocalDateTime leaveTime;

    @Lob
    private String notes;
}
```

#### 7. Category Entity
```java
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_categories_parent", columnList = "parent_id"),
    @Index(name = "idx_categories_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Lob
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Category> subcategories;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

#### 8. Review Entity
```java
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_reviews_reviewee", columnList = "reviewee_id"),
    @Index(name = "idx_reviews_class", columnList = "class_id"),
    @Index(name = "idx_reviews_rating", columnList = "rating")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", unique = true)
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee; // mentor being reviewed

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "review_text")
    private String reviewText;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Validation
    @PrePersist
    @PreUpdate
    private void validateRating() {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
}
```

#### 9. Payment Entity
```java
@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_enrollment", columnList = "enrollment_id"),
    @Index(name = "idx_payments_student", columnList = "student_id"),
    @Index(name = "idx_payments_mentor", columnList = "mentor_id"),
    @Index(name = "idx_payments_status", columnList = "status"),
    @Index(name = "idx_payments_transaction_id", columnList = "transaction_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(name = "payment_provider", nullable = false, length = 50)
    private String paymentProvider;

    @Column(name = "transaction_id", unique = true, nullable = false, length = 255)
    private String transactionId;

    @Column(name = "provider_transaction_id", length = 255)
    private String providerTransactionId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentTransactionStatus status = PaymentTransactionStatus.PENDING;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "platform_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Column(name = "mentor_payout", precision = 10, scale = 2)
    private BigDecimal mentorPayout;

    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status")
    @Builder.Default
    private PayoutStatus payoutStatus = PayoutStatus.PENDING;

    @Column(name = "payout_date")
    private LocalDateTime payoutDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    // Validation
    @PrePersist
    @PreUpdate
    private void validatePayment() {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}

public enum PaymentTransactionStatus {
    PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED
}

public enum PayoutStatus {
    PENDING, PROCESSED, FAILED, ON_HOLD
}
```

#### 10. Notification Entity
```java
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user", columnList = "user_id"),
    @Index(name = "idx_notifications_type", columnList = "type"),
    @Index(name = "idx_notifications_read", columnList = "is_read"),
    @Index(name = "idx_notifications_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private String message;

    @Column(columnDefinition = "jsonb")
    private String data; // JSON string for additional data

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "is_email_sent")
    @Builder.Default
    private Boolean isEmailSent = false;

    @Column(name = "is_push_sent")
    @Builder.Default
    private Boolean isPushSent = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}

public enum NotificationType {
    ENROLLMENT_CONFIRMED, 
    CLASS_STARTED, 
    CLASS_CANCELLED, 
    PAYMENT_RECEIVED, 
    REVIEW_RECEIVED, 
    SYSTEM_UPDATE,
    REMINDER
}
```

#### 11. Refresh Token Entity
```java
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_tokens_user", columnList = "user_id"),
    @Index(name = "idx_refresh_tokens_hash", columnList = "token_hash"),
    @Index(name = "idx_refresh_tokens_expires", columnList = "expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", unique = true, nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    @Column(name = "is_revoked")
    @Builder.Default
    private Boolean isRevoked = false;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;
}
```

#### 12. Audit Log Entity
```java
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_table", columnList = "table_name"),
    @Index(name = "idx_audit_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "table_name", nullable = false, length = 100)
    private String tableName;

    @Column(name = "record_id", length = 100)
    private String recordId;

    @Column(name = "old_values", columnDefinition = "jsonb")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "jsonb")
    private String newValues;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

## Phase-wise Implementation Guide

### Phase 1: Foundation & Core Database (Weeks 1-2)

#### Week 1: Project Setup & Database Foundation
**Objectives**: Set up Spring Boot environment and complete database structure

**Tasks**:
1. **Spring Boot Environment Setup**
   - Initialize Spring Boot 3.x project with Maven/Gradle
   - Configure PostgreSQL database connection (application.yml)
   - Set up Redis for caching and sessions
   - Configure environment profiles (dev, staging, prod)
   - Set up Docker containers for development

2. **Complete Database Schema & JPA Setup**
   - Create ALL JPA entities (User, MentorProfile, ClassEntity, etc.)
   - Configure Hibernate/JPA properties
   - Set up database migrations with Flyway/Liquibase
   - Create all entity relationships and mappings
   - Seed initial data (categories, sample users)

3. **Basic Project Structure**
   - Set up package structure (controller, service, repository, entity, dto)
   - Configure application properties and profiles
   - Set up logging with Logback
   - Create JPA repositories with Spring Data JPA
   - Configure Jackson for JSON serialization

**Spring Boot Configuration Examples**:
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hobbyclass
    username: ${DB_USERNAME:hobbyclass}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  redis:
    host: localhost
    port: 6379
  flyway:
    enabled: true
    locations: classpath:db/migration
```

**Repository Examples**:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.status = :status AND u.role IN :roles")
    List<User> findByStatusAndRoles(@Param("status") UserStatus status, 
                                   @Param("roles") List<UserRole> roles);
}

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    List<ClassEntity> findByMentorAndStatus(User mentor, ClassStatus status);
    Page<ClassEntity> findByCategoryAndStatusOrderByCreatedAtDesc(
        String category, ClassStatus status, Pageable pageable);
    
    @Query("SELECT c FROM ClassEntity c WHERE c.status = 'ACTIVE' " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:minPrice IS NULL OR c.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR c.price <= :maxPrice)")
    Page<ClassEntity> findClassesWithFilters(
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable);
}
```

**Deliverables**:
- Working Spring Boot application
- Complete JPA entity model with all tables
- Database migration scripts
- Spring Data JPA repositories
- Application configuration

#### Week 2: Basic Authentication & User Management
**Objectives**: Implement minimal Spring Security setup and basic user CRUD

**Tasks**:
1. **Basic Spring Security Setup (Development Only)**
   - Configure Spring Security with in-memory authentication
   - Basic password encoder (BCrypt)
   - Simple role-based access (ADMIN, MENTOR, STUDENT)
   - Basic session management
   - CORS configuration for frontend

2. **User Management CRUD with REST Controllers**
   - UserController with @RestController
   - UserService with business logic
   - DTO classes for request/response mapping
   - ModelMapper or MapStruct for entity-DTO conversion
   - Basic input validation with @Valid

**Controller Example**:
```java
@RestController
@RequestMapping("/api/users")
@Validated
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<PageResponse<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {
        
        PageResponse<UserDto> users = userService.getAllUsers(page, size, role, status, search);
        return ResponseEntity.ok(users);
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserDto createUserDto) {
        UserDto createdUser = userService.createUser(createUserDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, 
                                             @Valid @RequestBody UpdateUserDto updateUserDto) {
        UserDto updatedUser = userService.updateUser(id, updateUserDto);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Service Example**:
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    
    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(int page, int size, UserRole role, 
                                           UserStatus status, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage;
        
        if (search != null && !search.isEmpty()) {
            userPage = userRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        
        List<UserDto> userDtos = userPage.getContent().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
        
        return PageResponse.<UserDto>builder()
                .content(userDtos)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .currentPage(page)
                .size(size)
                .build();
    }
    
    public UserDto createUser(CreateUserDto createUserDto) {
        // Validate email uniqueness
        if (userRepository.findByEmail(createUserDto.getEmail()).isPresent()) {
            throw new BusinessException("Email already exists");
        }
        
        User user = User.builder()
                .name(createUserDto.getName())
                .email(createUserDto.getEmail())
                .passwordHash(passwordEncoder.encode(createUserDto.getPassword()))
                .role(createUserDto.getRole())
                .status(UserStatus.ACTIVE)
                .build();
        
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDto.class);
    }
}
```

**DTO Examples**:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private UserStatus status;
    private Boolean emailVerified;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDto {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private UserRole role;
}
```

**Deliverables**:
- Basic Spring Security configuration
- Complete user CRUD REST API
- DTO classes with validation
- Service layer with business logic
- Basic error handling

### Phase 2: Core CRUD Operations - Users & Profiles (Weeks 3-4)

#### Week 3: Advanced User Management & Admin CRUD
**Objectives**: Implement all user-related CRUD operations with Spring Security and admin functionality

**Tasks**:
1. **Extended User CRUD with Spring Security**
   - AdminController with @PreAuthorize for admin-only operations
   - Advanced UserService with complex business logic
   - Spring Data JPA Specifications for dynamic filtering
   - Custom validators using Bean Validation
   - Global exception handling with @ControllerAdvice

2. **Advanced Query Features with Spring Data JPA**
   - JPA Criteria API for complex filtering
   - Custom repository methods with @Query annotations
   - Projection interfaces for optimized queries
   - Page and Sort support for pagination
   - Custom result transformers

3. **Spring Security Integration**
   - Method-level security with @PreAuthorize
   - Role-based access control (RBAC)
   - Authentication context integration
   - Security audit logging

**Spring Boot Implementation Examples**:
```java
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Validated
@RequiredArgsConstructor
public class AdminUserController {
    
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<PageResponse<AdminUserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        UserFilterDto filter = UserFilterDto.builder()
                .role(role)
                .status(status)
                .search(search)
                .fromDate(fromDate)
                .toDate(toDate)
                .build();
        
        PageRequest pageRequest = PageRequest.of(page, size, 
                sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, 
                sortBy);
        
        PageResponse<AdminUserDto> users = userService.getAllUsersForAdmin(pageRequest, filter);
        return ResponseEntity.ok(users);
    }
    
    @PostMapping
    public ResponseEntity<AdminUserDto> createUser(@Valid @RequestBody CreateUserDto createUserDto) {
        AdminUserDto createdUser = userService.createUserByAdmin(createUserDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<UserStatsDto> getUserStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        UserStatsDto stats = userService.getUserStatistics(fromDate, toDate);
        return ResponseEntity.ok(stats);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserDto> updateUserStatus(@PathVariable Long id,
                                                        @Valid @RequestBody UpdateUserStatusDto statusDto) {
        AdminUserDto updatedUser = userService.updateUserStatus(id, statusDto.getStatus());
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.softDeleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/export")
    public ResponseEntity<Resource> exportUsers(@Valid @RequestBody UserExportDto exportDto) 
            throws IOException {
        ByteArrayResource resource = userService.exportUsers(exportDto);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
```

**Advanced Service with Specifications**:
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final AuditService auditService;
    
    @Transactional(readOnly = true)
    public PageResponse<AdminUserDto> getAllUsersForAdmin(Pageable pageable, UserFilterDto filter) {
        Specification<User> spec = Specification.where(null);
        
        if (filter.getRole() != null) {
            spec = spec.and(UserSpecifications.hasRole(filter.getRole()));
        }
        
        if (filter.getStatus() != null) {
            spec = spec.and(UserSpecifications.hasStatus(filter.getStatus()));
        }
        
        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            spec = spec.and(UserSpecifications.searchByNameOrEmail(filter.getSearch()));
        }
        
        if (filter.getFromDate() != null && filter.getToDate() != null) {
            spec = spec.and(UserSpecifications.createdBetween(
                filter.getFromDate().atStartOfDay(),
                filter.getToDate().atTime(LocalTime.MAX)
            ));
        }
        
        Page<User> userPage = userRepository.findAll(spec, pageable);
        
        List<AdminUserDto> userDtos = userPage.getContent().stream()
                .map(user -> modelMapper.map(user, AdminUserDto.class))
                .collect(Collectors.toList());
        
        return PageResponse.<AdminUserDto>builder()
                .content(userDtos)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .currentPage(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .build();
    }
    
    public UserStatsDto getUserStatistics(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : LocalDateTime.now();
        
        UserStatsProjection stats = userRepository.getUserStatistics(from, to);
        
        return UserStatsDto.builder()
                .totalUsers(stats.getTotalUsers())
                .activeUsers(stats.getActiveUsers())
                .mentors(stats.getMentors())
                .students(stats.getStudents())
                .admins(stats.getAdmins())
                .newUsersThisPeriod(stats.getNewUsersThisPeriod())
                .verifiedUsers(stats.getVerifiedUsers())
                .build();
    }
    
    @Transactional
    public AdminUserDto updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        UserStatus previousStatus = user.getStatus();
        user.setStatus(status);
        user.setLastModifiedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Audit log
        auditService.logUserStatusChange(userId, previousStatus, status);
        
        return modelMapper.map(savedUser, AdminUserDto.class);
    }
    
    @Transactional
    public void softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        // Check if user can be deleted (business rules)
        if (user.getRole() == UserRole.MENTOR) {
            long activeClasses = classRepository.countByMentorAndStatus(user, ClassStatus.ACTIVE);
            if (activeClasses > 0) {
                throw new BusinessException("Cannot delete mentor with active classes");
            }
        }
        
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Audit log
        auditService.logUserDeletion(userId, user.getEmail());
    }
}

// Specifications for dynamic queries
@Component
public class UserSpecifications {
    
    public static Specification<User> hasRole(UserRole role) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("role"), role);
    }
    
    public static Specification<User> hasStatus(UserStatus status) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), status);
    }
    
    public static Specification<User> searchByNameOrEmail(String search) {
        return (root, query, criteriaBuilder) -> {
            String searchPattern = "%" + search.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchPattern)
            );
        };
    }
    
    public static Specification<User> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.between(root.get("createdAt"), from, to);
    }
    
    public static Specification<User> isNotDeleted() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.notEqual(root.get("status"), UserStatus.DELETED);
    }
}

// Custom projection for statistics
public interface UserStatsProjection {
    Long getTotalUsers();
    Long getActiveUsers();
    Long getMentors();
    Long getStudents();
    Long getAdmins();
    Long getNewUsersThisPeriod();
    Long getVerifiedUsers();
}
```

**Enhanced Repository with Custom Queries**:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmailAndStatus(String email, UserStatus status);
    
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    
    @Query("SELECT new com.hobbyclass.backend.dto.projection.UserStatsProjection(" +
           "COUNT(u), " +
           "COUNT(CASE WHEN u.status = 'ACTIVE' THEN 1 END), " +
           "COUNT(CASE WHEN u.role = 'MENTOR' THEN 1 END), " +
           "COUNT(CASE WHEN u.role = 'STUDENT' THEN 1 END), " +
           "COUNT(CASE WHEN u.role = 'ADMIN' THEN 1 END), " +
           "COUNT(CASE WHEN u.createdAt BETWEEN :fromDate AND :toDate THEN 1 END), " +
           "COUNT(CASE WHEN u.emailVerified = true THEN 1 END)) " +
           "FROM User u WHERE u.status != 'DELETED'")
    UserStatsProjection getUserStatistics(@Param("fromDate") LocalDateTime fromDate, 
                                         @Param("toDate") LocalDateTime toDate);
    
    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :id")
    void updateLastLogin(@Param("id") Long id, @Param("lastLogin") LocalDateTime lastLogin);
    
    @Query(value = "SELECT u.* FROM users u WHERE " +
           "to_tsvector('english', u.name || ' ' || u.email) @@ plainto_tsquery('english', :searchText)", 
           nativeQuery = true)
    Page<User> fullTextSearch(@Param("searchText") String searchText, Pageable pageable);
}
```

**Deliverables**:
- Complete admin user management API with Spring Security
- Advanced filtering using JPA Specifications
- User statistics and reporting with custom projections
- Role-based access control and audit logging

#### Week 4: Mentor Profiles CRUD Operations
**Objectives**: Implement complete mentor profile management with Spring Boot file handling

**Tasks**:
1. **Mentor Profile CRUD with JPA Relationships**
   - MentorProfileController with proper security annotations
   - One-to-One relationship mapping between User and MentorProfile
   - Cascade operations and orphan removal
   - Profile validation with custom validators
   - Rating calculation using JPA aggregate functions

2. **File Upload with Spring Boot**
   - MultipartFile handling for profile images
   - Spring Boot file storage configuration
   - Image validation and processing
   - AWS S3 integration preparation
   - File cleanup and management

3. **Public API for Mentor Directory**
   - Public endpoints without authentication
   - Optimized queries with projection
   - Search and filtering capabilities
   - Caching with Spring Cache

**Spring Boot Implementation**:
```java
@RestController
@RequestMapping("/api/mentor-profiles")
@RequiredArgsConstructor
@Validated
public class MentorProfileController {
    
    private final MentorProfileService mentorProfileService;
    private final FileStorageService fileStorageService;
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<MentorProfileDto> getCurrentMentorProfile(Authentication authentication) {
        String email = authentication.getName();
        MentorProfileDto profile = mentorProfileService.getMentorProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/me")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<MentorProfileDto> createMentorProfile(
            @Valid @RequestBody CreateMentorProfileDto createDto,
            Authentication authentication) {
        String email = authentication.getName();
        MentorProfileDto profile = mentorProfileService.createMentorProfile(createDto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }
    
    @PutMapping("/me")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<MentorProfileDto> updateMentorProfile(
            @Valid @RequestBody UpdateMentorProfileDto updateDto,
            Authentication authentication) {
        String email = authentication.getName();
        MentorProfileDto profile = mentorProfileService.updateMentorProfile(updateDto, email);
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/me/profile-image")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ProfileImageDto> uploadProfileImage(
            @RequestParam("file") @Valid @FileValidation MultipartFile file,
            Authentication authentication) throws IOException {
        String email = authentication.getName();
        ProfileImageDto imageDto = mentorProfileService.uploadProfileImage(file, email);
        return ResponseEntity.ok(imageDto);
    }
    
    // Public endpoints for mentor directory
    @GetMapping
    @Cacheable("mentors")
    public ResponseEntity<PageResponse<PublicMentorDto>> getAllMentors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) @DecimalMin("0") @DecimalMax("5") Double minRating,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        
        MentorFilterDto filter = MentorFilterDto.builder()
                .specialization(specialization)
                .minRating(minRating)
                .location(location)
                .search(search)
                .build();
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("averageRating").descending());
        PageResponse<PublicMentorDto> mentors = mentorProfileService.getPublicMentors(pageRequest, filter);
        return ResponseEntity.ok(mentors);
    }
    
    @GetMapping("/{mentorId}")
    @Cacheable(value = "mentor", key = "#mentorId")
    public ResponseEntity<PublicMentorDto> getPublicMentorProfile(@PathVariable Long mentorId) {
        PublicMentorDto mentor = mentorProfileService.getPublicMentorProfile(mentorId);
        return ResponseEntity.ok(mentor);
    }
}
```

**Service with File Handling**:
```java
@Service
@Transactional
@RequiredArgsConstructor
public class MentorProfileService {
    
    private final MentorProfileRepository mentorProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    
    public MentorProfileDto createMentorProfile(CreateMentorProfileDto createDto, String email) {
        User mentor = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Mentor not found"));
        
        if (mentor.getRole() != UserRole.MENTOR) {
            throw new BusinessException("Only mentors can create mentor profiles");
        }
        
        if (mentorProfileRepository.existsByMentor(mentor)) {
            throw new BusinessException("Mentor profile already exists");
        }
        
        MentorProfile profile = MentorProfile.builder()
                .mentor(mentor)
                .bio(createDto.getBio())
                .specializations(String.join(",", createDto.getSpecializations()))
                .experienceYears(createDto.getExperienceYears())
                .hourlyRate(createDto.getHourlyRate())
                .location(createDto.getLocation())
                .isVerified(false)
                .status(MentorStatus.PENDING_VERIFICATION)
                .build();
        
        MentorProfile savedProfile = mentorProfileRepository.save(profile);
        
        // Initialize mentor statistics
        initializeMentorStats(savedProfile);
        
        return modelMapper.map(savedProfile, MentorProfileDto.class);
    }
    
    public ProfileImageDto uploadProfileImage(MultipartFile file, String email) throws IOException {
        User mentor = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Mentor not found"));
        
        MentorProfile profile = mentorProfileRepository.findByMentor(mentor)
                .orElseThrow(() -> new EntityNotFoundException("Mentor profile not found"));
        
        // Delete old image if exists
        if (profile.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(profile.getProfileImageUrl());
        }
        
        // Upload new image
        String imageUrl = fileStorageService.storeFile(file, "mentor-profiles", mentor.getId().toString());
        
        // Update profile
        profile.setProfileImageUrl(imageUrl);
        mentorProfileRepository.save(profile);
        
        return ProfileImageDto.builder()
                .imageUrl(imageUrl)
                .uploadedAt(LocalDateTime.now())
                .build();
    }
    
    @Transactional(readOnly = true)
    public PageResponse<PublicMentorDto> getPublicMentors(Pageable pageable, MentorFilterDto filter) {
        Specification<MentorProfile> spec = Specification.where(MentorProfileSpecifications.isActive());
        
        if (filter.getSpecialization() != null) {
            spec = spec.and(MentorProfileSpecifications.hasSpecialization(filter.getSpecialization()));
        }
        
        if (filter.getMinRating() != null) {
            spec = spec.and(MentorProfileSpecifications.hasMinRating(filter.getMinRating()));
        }
        
        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            spec = spec.and(MentorProfileSpecifications.searchByNameOrBio(filter.getSearch()));
        }
        
        Page<MentorProfile> profilePage = mentorProfileRepository.findAll(spec, pageable);
        
        List<PublicMentorDto> mentorDtos = profilePage.getContent().stream()
                .map(this::mapToPublicDto)
                .collect(Collectors.toList());
        
        return PageResponse.<PublicMentorDto>builder()
                .content(mentorDtos)
                .totalElements(profilePage.getTotalElements())
                .totalPages(profilePage.getTotalPages())
                .currentPage(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .build();
    }
    
    private PublicMentorDto mapToPublicDto(MentorProfile profile) {
        PublicMentorDto dto = modelMapper.map(profile, PublicMentorDto.class);
        dto.setMentorName(profile.getMentor().getName());
        dto.setSpecializationsList(Arrays.asList(profile.getSpecializations().split(",")));
        dto.setTotalClasses(profile.getClasses().size());
        return dto;
    }
}

// File storage service
@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    @Value("${app.file.upload-dir}")
    private String uploadDir;
    
    @Value("${app.file.max-size}")
    private long maxFileSize;
    
    private final List<String> supportedImageTypes = Arrays.asList("image/jpeg", "image/png", "image/gif");
    
    public String storeFile(MultipartFile file, String category, String identifier) throws IOException {
        validateFile(file);
        
        String fileName = generateFileName(file.getOriginalFilename(), identifier);
        Path categoryPath = Paths.get(uploadDir, category);
        Files.createDirectories(categoryPath);
        
        Path filePath = categoryPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return String.format("/%s/%s", category, fileName);
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new FileStorageException("File size exceeds maximum limit");
        }
        
        if (!supportedImageTypes.contains(file.getContentType())) {
            throw new FileStorageException("Unsupported file type");
        }
    }
    
    private String generateFileName(String originalFileName, String identifier) {
        String extension = getFileExtension(originalFileName);
        return String.format("%s_%s.%s", identifier, System.currentTimeMillis(), extension);
    }
}
```

**Custom Validators**:
```java
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileValidator.class)
public @interface FileValidation {
    String message() default "Invalid file";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class FileValidator implements ConstraintValidator<FileValidation, MultipartFile> {
    
    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("File is required").addConstraintViolation();
            return false;
        }
        
        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("File size must be less than 5MB").addConstraintViolation();
            return false;
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("File must be an image").addConstraintViolation();
            return false;
        }
        
        return true;
    }
}
```

**Deliverables**:
- Complete mentor profile CRUD system with Spring Boot
- File upload functionality with validation
- Public mentor directory with caching
- JPA Specifications for advanced filtering
- Custom validators and error handling

### Phase 3: Class Management CRUD Operations (Weeks 5-7)

#### Week 5: Classes CRUD Implementation
**Objectives**: Implement complete class management system

**Tasks**:
1. **Class CRUD Operations**
   - GET /mentor/classes (mentor's classes with filters)
   - POST /mentor/classes (create new class)
   - GET /classes/:id (class details)
   - PUT /classes/:id (update class)
   - DELETE /classes/:id (delete class)
   - PATCH /classes/:id/status (activate/deactivate class)

2. **Class Data Management**
   - Class categorization system
   - Pricing and capacity management
   - Schedule and duration handling
   - Prerequisites and requirements
   - Class materials and resources

3. **Class Validation & Business Logic**
   - Input validation for all class fields
   - Schedule conflict detection
   - Capacity and pricing validation
   - Category assignment logic
   - Class status workflow

**Deliverables**:
- Complete class CRUD system
- Class validation and business rules
- Class categorization
- Status management workflow

#### Week 6: Class Discovery & Search CRUD
**Objectives**: Implement student-facing class browsing and search

**Tasks**:
1. **Class Discovery APIs**
   - GET /classes (public class listing with filters)
   - GET /classes/search (advanced search functionality)
   - GET /classes/categories (category-based browsing)
   - GET /classes/featured (featured classes)
   - GET /classes/popular (popular classes based on enrollments)

2. **Advanced Search Implementation**
   - Full-text search across class names and descriptions
   - Filter by category, subcategory, price range
   - Filter by mentor rating, class rating
   - Sort by price, rating, date, popularity
   - Location-based filtering (online/in-person)

3. **Performance Optimization**
   - Database query optimization
   - Indexing for search performance
   - Pagination and limit handling
   - Caching popular searches
   - Query result counting

**Deliverables**:
- Class discovery and search APIs
- Advanced filtering system
- Search performance optimization
- Comprehensive class browsing

#### Week 7: Class Sessions CRUD Operations
**Objectives**: Implement class session management

**Tasks**:
1. **Session Management CRUD**
   - GET /classes/:id/sessions (list class sessions)
   - POST /classes/:id/sessions (create session)
   - PUT /sessions/:id (update session)
   - DELETE /sessions/:id (delete session)
   - PATCH /sessions/:id/status (update session status)

2. **Session Scheduling Logic**
   - Single and recurring session creation
   - Schedule conflict detection and resolution
   - Time zone handling and conversion
   - Session capacity management
   - Automated session generation for recurring classes

3. **Session Business Logic**
   - Session prerequisite checking
   - Attendance tracking preparation
   - Session material assignment
   - Cancellation and rescheduling logic
   - Session completion tracking

**Deliverables**:
- Complete session management system
- Scheduling and conflict resolution
- Recurring session support
- Session lifecycle management

### Phase 4: Enrollment & Attendance CRUD (Weeks 8-10)

#### Week 8: Enrollment System Implementation
**Objectives**: Implement complete enrollment management

**Tasks**:
1. **Enrollment CRUD Operations**
   - POST /classes/:id/enroll (student enrollment)
   - GET /student/enrollments (student's enrollments)
   - GET /mentor/classes/:id/enrollments (class enrollments for mentor)
   - PUT /enrollments/:id (update enrollment)
   - DELETE /enrollments/:id (cancel enrollment)
   - PATCH /enrollments/:id/status (change enrollment status)

2. **Enrollment Business Logic**
   - Class capacity checking and waitlist management
   - Prerequisite validation before enrollment
   - Schedule conflict detection for students
   - Enrollment deadline enforcement
   - Multiple class enrollment handling

3. **Enrollment Data Management**
   - Enrollment status workflow (pending → active → completed)
   - Progress tracking and completion percentage
   - Enrollment analytics and reporting
   - Student communication preferences
   - Refund eligibility tracking

**Deliverables**:
- Complete enrollment system
- Capacity and waitlist management
- Enrollment validation and business rules
- Enrollment analytics

#### Week 9: Attendance Tracking CRUD
**Objectives**: Implement session attendance management

**Tasks**:
1. **Attendance CRUD Operations**
   - POST /sessions/:id/attendance (mark attendance)
   - GET /sessions/:id/attendance (session attendance list)
   - PUT /attendance/:id (update attendance record)
   - GET /students/:id/attendance (student attendance history)
   - GET /classes/:id/attendance-report (class attendance analytics)

2. **Attendance Logic Implementation**
   - Automated attendance marking for online sessions
   - Manual attendance marking by mentors
   - Late arrival and early departure tracking
   - Absence excuse and makeup session handling
   - Attendance percentage calculations

3. **Attendance Analytics**
   - Individual student attendance reports
   - Class attendance statistics
   - Mentor attendance insights
   - Attendance trend analysis
   - Completion certificate eligibility

**Deliverables**:
- Complete attendance tracking system
- Attendance analytics and reporting
- Automated attendance features
- Certificate eligibility tracking

#### Week 10: Payment System CRUD (Basic)
**Objectives**: Implement basic payment tracking (without Stripe initially)

**Tasks**:
1. **Payment Data CRUD**
   - POST /payments (record payment)
   - GET /payments (payment history)
   - PUT /payments/:id (update payment status)
   - GET /students/:id/payments (student payment history)
   - GET /mentors/:id/earnings (mentor earnings)

2. **Payment Logic Implementation**
   - Payment amount calculation (class price + fees)
   - Payment status workflow (pending → completed → refunded)
   - Refund amount calculations
   - Mentor payout calculations
   - Platform fee management

3. **Financial Reporting**
   - Student payment summaries
   - Mentor earning reports
   - Platform revenue tracking
   - Refund processing records
   - Financial analytics dashboard data

**Deliverables**:
- Basic payment tracking system
- Payment calculation logic
- Financial reporting foundation
- Mentor payout tracking

### Phase 5: Reviews & Communication CRUD (Weeks 11-12)

#### Week 11: Review System Implementation
**Objectives**: Implement complete review and rating system

**Tasks**:
1. **Review CRUD Operations**
   - POST /classes/:id/reviews (submit review)
   - GET /classes/:id/reviews (class reviews)
   - GET /mentors/:id/reviews (mentor reviews)
   - PUT /reviews/:id (update review)
   - DELETE /reviews/:id (delete review)
   - GET /students/:id/reviews (student's reviews)

2. **Rating Calculation Logic**
   - Individual class rating aggregation
   - Overall mentor rating calculation
   - Weighted rating system implementation
   - Review authenticity validation
   - Rating distribution analytics

3. **Review Management Features**
   - Review moderation and approval workflow
   - Inappropriate content filtering
   - Review helpfulness voting
   - Review response system for mentors
   - Featured review selection

**Deliverables**:
- Complete review and rating system
- Rating calculation algorithms
- Review moderation features
- Review analytics

#### Week 12: Notification System CRUD
**Objectives**: Implement notification management system

**Tasks**:
1. **Notification CRUD Operations**
   - POST /notifications (create notification)
   - GET /notifications (user notifications)
   - PUT /notifications/:id (update notification)
   - PATCH /notifications/:id/read (mark as read)
   - DELETE /notifications/:id (delete notification)
   - PATCH /notifications/read-all (mark all as read)

2. **Notification Logic Implementation**
   - Automated notification triggers (enrollment, class start, etc.)
   - Notification template system
   - User notification preferences
   - Notification scheduling and delivery
   - Notification history and tracking

3. **Communication Features**
   - Basic messaging between students and mentors
   - System announcements
   - Class-specific notifications
   - Reminder notifications for upcoming classes
   - Emergency notifications for class changes

**Deliverables**:
- Complete notification system
- Automated notification triggers
- Notification preferences management
- Basic messaging functionality

### Phase 6: Advanced Features & Business Logic (Weeks 13-14)

#### Week 13: Advanced Features Implementation
**Objectives**: Implement advanced platform features and business logic

**Tasks**:
1. **Advanced Analytics CRUD**
   - GET /admin/analytics/users (user analytics)
   - GET /admin/analytics/classes (class performance)
   - GET /admin/analytics/revenue (revenue analytics)
   - GET /mentor/analytics (mentor-specific analytics)
   - GET /analytics/platform (platform-wide statistics)

2. **Content Management System**
   - Class materials upload and management
   - Content versioning and history
   - Resource sharing between classes
   - Content search and categorization
   - Content access control

3. **Platform Enhancement Features**
   - Favorites/wishlist system for students
   - Class recommendation engine (basic algorithm)
   - Platform-wide search functionality
   - User activity tracking
   - System health monitoring endpoints

**Deliverables**:
- Advanced analytics system
- Content management features
- Platform enhancement tools
- Recommendation system foundation

#### Week 14: Data Integrity & Business Rules
**Objectives**: Implement comprehensive business rules and data validation

**Tasks**:
1. **Advanced Validation Implementation**
   - Cross-table data validation
   - Business rule enforcement
   - Data consistency checks
   - Referential integrity validation
   - Complex business logic implementation

2. **Data Management Features**
   - Data archiving and cleanup
   - Database maintenance procedures
   - Data export and import functionality
   - Backup verification procedures
   - Data migration utilities

3. **Performance Optimization**
   - Database query optimization
   - Caching strategy implementation (Redis)
   - API response optimization
   - Batch processing for heavy operations
   - Database connection pooling optimization

**Deliverables**:
- Comprehensive business rules
- Data integrity systems
- Performance optimization
- Database maintenance tools

### Phase 7: Security & Authentication Enhancement (Weeks 15-16)

#### Week 15: Comprehensive Security Implementation
**Objectives**: Implement production-level security features

**Tasks**:
1. **Advanced Authentication System**
   - JWT token generation and validation
   - Refresh token system implementation
   - Multi-factor authentication (optional)
   - Session management and security
   - Password reset and recovery

2. **Authorization & Access Control**
   - Role-based access control (RBAC)
   - Permission-based authorization
   - API endpoint protection
   - Resource-level access control
   - Admin privilege management

3. **Security Hardening**
   - Input sanitization and XSS protection
   - SQL injection prevention
   - Rate limiting implementation
   - CORS configuration
   - Security headers implementation

**Deliverables**:
- Production-ready authentication
- Comprehensive authorization system
- Security hardening measures
- Access control framework

#### Week 16: Integration & Production Readiness
**Objectives**: Integrate external services and prepare for production

**Tasks**:
1. **Third-Party Integrations**
   - Stripe payment processing integration
   - Email service integration (SendGrid/AWS SES)
   - File storage integration (AWS S3/Cloudinary)
   - Real-time notifications (Socket.IO)
   - External API integrations

2. **Production Environment Setup**
   - Environment configuration management
   - SSL certificate configuration
   - Database production setup
   - Error monitoring integration (Sentry)
   - Application performance monitoring

3. **Testing & Quality Assurance**
   - Unit test completion for all modules
   - Integration test implementation
   - End-to-end testing
   - Load testing and performance validation
   - Security testing and penetration testing

**Deliverables**:
- Complete third-party integrations
- Production-ready deployment
- Comprehensive testing suite
- Performance and security validation

## Post-Launch Maintenance

### Immediate Post-Launch (Weeks 17-20)
- Monitor system performance and stability
- Address any production issues
- User feedback collection and analysis
- Performance optimization based on real usage

### Ongoing Maintenance
- Regular security updates
- Database maintenance and optimization
- Feature enhancements based on user feedback
- Scalability improvements as user base grows

## Resource Requirements

### Development Team
- **Backend Developer (Lead)**: Full-time, experienced with Node.js/PostgreSQL
- **Backend Developer**: Full-time, mid-level
- **DevOps Engineer**: Part-time, experienced with AWS/Docker
- **QA Engineer**: Part-time, automated testing experience

### Infrastructure
- **Development**: Local development + staging server
- **Production**: Cloud hosting (AWS/GCP), PostgreSQL, Redis, CDN
- **Third-party Services**: Stripe, SendGrid, AWS S3, monitoring tools

### Timeline Summary
- **Total Duration**: 16 weeks (4 months)
- **Core CRUD Functionality**: Week 10 (complete business logic)
- **Security Implementation**: Weeks 15-16
- **Full Feature Launch**: Week 16
- **Post-launch Optimization**: Weeks 17-20

## Implementation Priority Order

### **Priority 1: Core Data Operations (Weeks 1-10)**
1. **Database & Models** (Week 1) - Complete schema implementation
2. **User Management** (Weeks 2-4) - All user and profile CRUD
3. **Class System** (Weeks 5-7) - Complete class and session management
4. **Enrollment & Payments** (Weeks 8-10) - Student enrollment and basic payment tracking

### **Priority 2: Communication & Reviews** (Weeks 11-12)
5. **Reviews System** (Week 11) - Rating and review functionality
6. **Notifications** (Week 12) - Communication and messaging

### **Priority 3: Advanced Features** (Weeks 13-14)
7. **Analytics & Content** (Week 13) - Advanced features and reporting
8. **Business Rules** (Week 14) - Data integrity and optimization

### **Priority 4: Security & Production** (Weeks 15-16)
9. **Security Implementation** (Week 15) - Authentication, authorization, security hardening
10. **Production Deployment** (Week 16) - Third-party integrations, testing, deployment

This revised implementation sequence ensures that:
- **All CRUD operations are implemented first** with basic authentication
- **Business logic and data integrity** are established before security layers
- **Security is added as an enhancement** rather than a foundational requirement
- **External integrations** (Stripe, AWS) are implemented last when core functionality is stable
- **Testing and deployment** happen after all features are complete

This implementation guide provides a comprehensive roadmap for building a robust, scalable backend that perfectly integrates with the existing Angular frontend.
