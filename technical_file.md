I'll help you create a comprehensive PTF (Project Technical File) for your Great British Bake Off fantasy league scoring application. Let me break this down into a detailed technical specification.

# PTF: GBBO Fantasy League Scoring Application

## Project Overview

**Application Name:** GBBO Fantasy League Tracker  
**Purpose:** Web-based application for tracking fantasy league scoring for The Great British Bake Off  
**Target Users:** Fantasy league participants (15 players)  
**Deployment:** Web-hosted application with password protection  

## Technical Requirements

### Core Functionality

1. **User Authentication**
   - Password-protected access
   - Simple login system (no user registration required)
   - Session management

2. **Contestant Management**
   - Upload/import list of 15 contestants
   - Assign 3 contestants per player (45 total assignments)
   - Team naming system for each player
   - Handle eliminated contestants (remain on team but can't score)

3. **Scoring System**
   - Weekly score input interface
   - 7 scoring categories with specific point values:
     - Star Baker: 4 points (1 per week)
     - Technical Win: 3 points (1 per week)
     - Handshake: 4 points (unlimited)
     - Raw: -1 points (unlimited)
     - Overbaked: -1 points (unlimited)
     - Last in Technical: -1 points (1 per week)
     - Cries during Testimonial: 1 point (unlimited)
   - Cumulative scoring across 10 weeks (scoring starts week 2)
   - Validation to prevent duplicate weekly winners

4. **Data Display**
   - Current season leaderboard (ranked by total points)
   - Weekly breakdown for each player
   - Individual contestant scoring history
   - Team composition display

### Technical Architecture

**Frontend:**
- Modern web framework (React/Vue.js recommended)
- Responsive design for mobile/desktop
- Real-time updates when scores are entered

**Backend:**
- RESTful API (Node.js/Python/Java)
- Database (PostgreSQL/MySQL recommended)
- Data persistence for all scoring and team data

**Database Schema:**
```
Tables:
- players (id, name, team_name, password_hash)
- contestants (id, name, eliminated_week)
- teams (player_id, contestant_id)
- weekly_scores (week, contestant_id, category, points)
- season_totals (player_id, total_points)
```

**Deployment:**
- Cloud hosting (AWS, Google Cloud, or Heroku)
- HTTPS enabled
- Environment variable management for secrets

### User Interface Requirements

1. **Login Page**
   - Simple password entry
   - Clean, branded design

2. **Main Dashboard**
   - Current leaderboard
   - Quick access to score entry
   - Navigation to other sections

3. **Score Entry Page**
   - Week selection dropdown
   - Category-by-category input forms
   - Contestant selection (dropdowns/checkboxes)
   - Save/submit functionality
   - Confirmation before saving

4. **Team Management Page**
   - Upload contestants (CSV/JSON import)
   - Assign contestants to players
   - Edit team names
   - View team compositions

5. **Leaderboard Page**
   - Sortable by total points
   - Expandable weekly breakdowns
   - Contestant-level detail views

6. **History/Reports Page**
   - Weekly score summaries
   - Individual player performance
   - Export functionality (optional)

### Data Validation Rules

1. **Weekly Scoring:**
   - Only one Star Baker per week
   - Only one Technical Win per week
   - Only one Last in Technical per week
   - Cannot assign positive or negative points to eliminated contestants
   - Week 1 has no scoring (start week 2)

2. **Team Management:**
   - Exactly 3 contestants per player
   - No duplicate contestant assignments
   - Contestant names must be unique

### Security Considerations

- Password hashing (bcrypt recommended)
- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting on score entry

### Performance Requirements

- Page load times < 3 seconds
- Support for 15 concurrent users
- Data backup and recovery
- Responsive design for mobile devices

### Future Enhancement Possibilities

- Email notifications for score updates
- Historical season data
- Advanced statistics and analytics
- Mobile app version
- Social features (comments, predictions)

## Implementation Priority

**Phase 1 (MVP):**
1. Basic authentication
2. Contestant upload and team assignment
3. Weekly score entry
4. Basic leaderboard display

**Phase 2:**
1. Enhanced UI/UX
2. Weekly breakdown views
3. Data validation improvements
4. Mobile optimization

**Phase 3:**
1. Advanced reporting
2. Export functionality
3. Performance optimizations
4. Additional features

This PTF provides a comprehensive foundation for building your GBBO fantasy league application. The technical requirements are clearly defined, and the phased approach allows for iterative development while maintaining core functionality throughout the process.