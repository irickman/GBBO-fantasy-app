# Product Requirements Document (PRD)
## GBBO Fantasy League Scoring Application

### Document Information
- **Version:** 1.0
- **Date:** September 2024
- **Author:** Development Team
- **Status:** Final Implementation

---

## 1. Executive Summary

### 1.1 Product Overview
The GBBO Fantasy League is a web-based application designed to track and manage fantasy league scoring for The Great British Bake Off television show. The application allows N participants to form teams of 3 contestants each and compete through a 10-week scoring system.

### 1.2 Business Objectives
- Provide an engaging platform for GBBO fantasy league participants
- Automate scoring calculations and leaderboard management
- Create a centralized hub for league administration
- Enable real-time tracking of team performance

### 1.3 Success Metrics
- 100% accuracy in score calculations
- Sub-3 second page load times
- Zero data loss incidents

---

## 2. Product Description

### 2.1 Target Audience
- **Primary Users:** fantasy league participants
- **Secondary Users:** League administrator (score entry)
- **User Characteristics:** Non-technical users requiring simple, intuitive interface

### 2.2 Core Value Proposition
- **Simplified Management:** Single shared password system eliminates user registration complexity
- **Real-time Scoring:** Instant leaderboard updates and team performance tracking
- **Comprehensive Tracking:** Complete historical data and weekly breakdowns
- **Mobile-Friendly:** Responsive design for all devices

---

## 3. Functional Requirements

### 3.1 Authentication System
**Requirement ID:** AUTH-001
- **Description:** Single shared password authentication system
- **Acceptance Criteria:**
  - Users access application with shared password
  - Session management with secure cookies
  - Automatic logout after inactivity
  - Password hashing using bcrypt

### 3.2 Contestant Management
**Requirement ID:** CONT-001
- **Description:** Pre-loaded contestant database with elimination tracking
- **Acceptance Criteria:**
  - N contestants pre-loaded in system (user provided N)
  - Contestant elimination status tracking
  - No ability to add/remove contestants (fixed roster)
  - App reflects admin user provided contestant names

### 3.3 Team Assignment
**Requirement ID:** TEAM-001
- **Description:** Fixed team assignments with 3 contestants per player
- **Acceptance Criteria:**
  - N players with unique team names
  - Each player has exactly 3 contestants (contestants can be shared between players)
  - Teams reflect admin provided contestants

### 3.4 Scoring System
**Requirement ID:** SCORE-001
- **Description:** Weekly scoring input with 7 categories
- **Acceptance Criteria:**
  - **Every Week Categories (single selection):**
    - Star Baker: 4 points (1 per week)
    - Technical Win: 3 points (1 per week)
    - Last in Technical: -1 points (1 per week)
  - **Optional Categories (multiple selection):**
    - Handshake: 4 points (unlimited)
    - Raw: -1 points (unlimited)
    - Overbaked: -1 points (unlimited)
    - Cries during Testimonial: 1 point (unlimited)
  - Week selection (1-10, scoring starts week 2)
  - Save/edit functionality for existing scores
  - Validation to prevent duplicate weekly winners

### 3.5 Leaderboard Display
**Requirement ID:** LEAD-001
- **Description:** Real-time leaderboard with detailed breakdowns
- **Acceptance Criteria:**
  - Current standings ranked by total points
  - Expandable player details showing:
    - Team contestants and elimination status
    - Weekly scoring breakdown
  - User-friendly category names (sentence case, no underscores)
  - Current week scores display

### 3.6 Administrative Interface
**Requirement ID:** ADMIN-001
- **Description:** Admin-only functions for score entry and team management
- **Acceptance Criteria:**
  - Admin dropdown menu in top-right corner
  - Score entry page with week selection
  - Team management page showing detailed scoring
  - Home navigation from admin pages

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Page Load Time:** < 3 seconds
- **Concurrent Users:** Support 15+ users
- **Database Response:** < 500ms for queries
- **Mobile Performance:** Responsive on all screen sizes

### 4.2 Security
- **Authentication:** Secure session management
- **Data Protection:** Password hashing with bcrypt
- **Input Validation:** All user inputs sanitized
- **HTTPS:** Secure data transmission

### 4.3 Usability
- **User Interface:** Intuitive, clean design
- **Navigation:** Clear, consistent navigation patterns
- **Error Handling:** User-friendly error messages
- **Accessibility:** Basic accessibility compliance

### 4.4 Reliability
- **Uptime:** 99% availability
- **Data Integrity:** Zero data loss
- **Backup:** Regular database backups
- **Recovery:** Quick recovery from failures

---

## 5. User Stories

### 5.1 Player Stories
- **As a player**, I want to view the current leaderboard so I can see my ranking
- **As a player**, I want to see my team's contestants so I can track their performance
- **As a player**, I want to view weekly score breakdowns so I can understand my points
- **As a player**, I want to see current week's scores so I can track recent performance

### 5.2 Admin Stories
- **As an admin**, I want to enter weekly scores so I can update the leaderboard
- **As an admin**, I want to edit existing scores so I can correct mistakes
- **As an admin**, I want to view all team details so I can manage the league
- **As an admin**, I want to navigate easily between functions so I can efficiently manage the app
- **As an admin**, I want to add, edit, and delete players and their teams of contestants
- **As an admin** I want to add the list of contestants and see them reflected in the application
- **As an admin** I want to update and track eliminated players by week of elimination

---

## 6. Data Requirements

### 6.1 Core Entities
- **Players:** N fantasy league participants with team names
- **Contestants:** 12 GBBO contestants with elimination status
- **Teams:** 45 team assignments (3 per player)
- **Weekly Scores:** All scoring events with categories and points
- **Season Totals:** Calculated point totals per player

### 6.2 Data Relationships
- One player has many contestants (through teams)
- One contestant can have many weekly scores
- One player has one season total

### 6.3 Data Validation Rules
- Exactly 3 contestants per player
- Contestants can be assigned to multiple players (shared contestants allowed)
- One winner per week for "Every Week" categories
- No scoring for eliminated contestants, past their elimination week
- Week 1 has no scoring (starts week 2)

---

## 7. User Interface Requirements

### 7.1 Design Principles
- **Consistency:** Uniform design language throughout
- **Simplicity:** Clean, uncluttered interface
- **Accessibility:** Clear typography and contrast
- **Responsiveness:** Mobile-first design approach

### 7.2 Page Specifications

#### 7.2.1 Login Page
- Simple password entry form
- GBBO-themed branding
- Error message display
- "Leave the Tent" logout button

#### 7.2.2 Dashboard (Home Page)
- Current leaderboard with rankings
- Current week's scores
- Admin dropdown menu
- Expandable player details
- Responsive grid layout

#### 7.2.3 Score Entry Page
- Week selection buttons
- Separate sections for "Every Week" and "Optional" categories
- Dropdown/multi-select interfaces
- Save functionality with confirmation
- Home navigation button

#### 7.2.4 Team Management Page
- List of all players and teams
- Detailed weekly scoring breakdown
- Contestant information display
- Home navigation button

---

## 8. Technical Constraints

### 8.1 Technology Stack
- **Frontend:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **Backend:** Next.js API routes with Server Actions
- **Database:** SQLite with Drizzle ORM
- **Authentication:** iron-session with bcrypt
- **Deployment:** Vercel (planned)

### 8.2 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 8.3 Device Support
- Desktop (1920x1080 and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

---

## 9. Success Criteria

### 9.1 Launch Criteria
- All functional requirements implemented
- Security testing completed
- Performance benchmarks met
- User acceptance testing passed
- Documentation complete

### 9.2 Post-Launch Criteria
- Zero critical bugs in first month
- 99% uptime achieved

---

## 10. Future Enhancements

### 10.1 Phase 2 Features
- Email notifications for score updates
- Advanced statistics and analytics
- Historical season data
- Export functionality

### 10.2 Phase 3 Features
- Mobile app version
- Social features (comments, predictions)
- Real-time notifications
- Advanced reporting tools

---

## 11. Risk Assessment

### 11.1 Technical Risks
- **Database Performance:** SQLite may not scale beyond 15 users
- **Mitigation:** Monitor performance, consider PostgreSQL migration

### 11.2 User Experience Risks
- **Complexity:** Too many features may confuse users
- **Mitigation:** Keep interface simple, focus on core functionality

### 11.3 Security Risks
- **Single Password:** Shared password creates security risk
- **Mitigation:** Regular password rotation, secure hosting

---

## 12. Appendices

### 12.1 Glossary
- **Contestant:** GBBO show participant
- **Player:** Fantasy league participant
- **Team:** Group of 3 contestants assigned to a player
- **Weekly Score:** Points awarded for specific achievements
- **Season Total:** Cumulative points for entire season

### 12.2 References
- Original PRD document
- Technical implementation notes
- User feedback and requirements
- GBBO show format and scoring rules

