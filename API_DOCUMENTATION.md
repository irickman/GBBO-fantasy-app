# GBBO Fantasy League - Admin API Documentation

This document describes the comprehensive CRUD APIs available for managing all aspects of the GBBO Fantasy League system.

## Base URL
All APIs are available at: `https://gbbo-fantasy.vercel.app/api/admin/`

## Authentication
All admin APIs require authentication. Users must be logged in to access these endpoints.

---

## 1. Players Management

### GET `/api/admin/players`
**Description:** Get all players
**Response:**
```json
{
  "success": true,
  "players": [
    {
      "id": 1,
      "name": "Player Name",
      "teamName": "Team Name",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/players`
**Description:** Create a new player
**Body:**
```json
{
  "name": "Player Name",
  "teamName": "Team Name"
}
```
**Response:**
```json
{
  "success": true,
  "player": {
    "id": 1,
    "name": "Player Name",
    "teamName": "Team Name",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT `/api/admin/players`
**Description:** Update an existing player
**Body:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "teamName": "Updated Team Name"
}
```

### DELETE `/api/admin/players?id=1`
**Description:** Delete a player
**Query Parameters:** `id` - Player ID to delete

---

## 2. Contestants Management

### GET `/api/admin/contestants`
**Description:** Get all contestants
**Response:**
```json
{
  "success": true,
  "contestants": [
    {
      "id": 1,
      "name": "Contestant Name",
      "eliminatedWeek": null,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/contestants`
**Description:** Create a new contestant
**Body:**
```json
{
  "name": "Contestant Name",
  "eliminatedWeek": null
}
```

### PUT `/api/admin/contestants`
**Description:** Update an existing contestant
**Body:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "eliminatedWeek": 3
}
```

### DELETE `/api/admin/contestants?id=1`
**Description:** Delete a contestant
**Query Parameters:** `id` - Contestant ID to delete

---

## 3. Team Assignments Management

### GET `/api/admin/teams`
**Description:** Get all teams or teams for a specific player
**Query Parameters:** 
- `playerId` (optional) - Get teams for specific player
**Response:**
```json
{
  "success": true,
  "teams": [
    {
      "id": 1,
      "playerId": 1,
      "contestantId": 1,
      "contestantName": "Contestant Name",
      "eliminatedWeek": null,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/teams`
**Description:** Create a team assignment (assign contestant to player)
**Body:**
```json
{
  "playerId": 1,
  "contestantId": 1
}
```

### PUT `/api/admin/teams`
**Description:** Update player's entire team (replace all contestants)
**Body:**
```json
{
  "playerId": 1,
  "contestantIds": [1, 2, 3]
}
```
**Note:** Exactly 3 contestants must be provided.

### DELETE `/api/admin/teams`
**Description:** Delete team assignments
**Query Parameters:**
- `teamId` - Delete specific team assignment
- `playerId` - Delete all assignments for a player

---

## 4. Weekly Scores Management

### GET `/api/admin/weekly-scores`
**Description:** Get weekly scores
**Query Parameters:**
- `week` (optional) - Get scores for specific week
- `id` (optional) - Get specific score by ID
**Response:**
```json
{
  "success": true,
  "scores": [
    {
      "id": 1,
      "week": 2,
      "contestantId": 1,
      "contestantName": "Contestant Name",
      "category": "star_baker",
      "points": 4,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/weekly-scores`
**Description:** Create a new weekly score
**Body:**
```json
{
  "week": 2,
  "contestantId": 1,
  "category": "star_baker",
  "points": 4
}
```

### PUT `/api/admin/weekly-scores`
**Description:** Update an existing weekly score
**Body:**
```json
{
  "id": 1,
  "week": 2,
  "contestantId": 1,
  "category": "technical_win",
  "points": 3
}
```

### DELETE `/api/admin/weekly-scores?id=1`
**Description:** Delete a weekly score
**Query Parameters:** `id` - Score ID to delete

---

## 5. Season Totals Management

### GET `/api/admin/season-totals`
**Description:** Get season totals
**Query Parameters:**
- `playerId` (optional) - Get totals for specific player
**Response:**
```json
{
  "success": true,
  "totals": [
    {
      "id": 1,
      "playerId": 1,
      "playerName": "Player Name",
      "week": 2,
      "contestantId": 1,
      "contestantName": "Contestant Name",
      "points": 4,
      "runningTotal": 12,
      "lastUpdated": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/season-totals`
**Description:** Calculate and update season totals
**Body:**
```json
{
  "playerId": 1,
  "week": 2
}
```
**Note:** This will recalculate totals based on weekly scores.

### PUT `/api/admin/season-totals`
**Description:** Update season total manually
**Body:**
```json
{
  "playerId": 1,
  "totalPoints": 25
}
```

---

## Data Structure Overview

### JSON Storage Format
The system uses a simple JSON structure stored in Vercel Blob storage:

```json
{
  "players": [
    {
      "id": 1,
      "name": "Player Name",
      "teamName": "Team Name",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "contestants": [
    {
      "id": 1,
      "name": "Contestant Name",
      "eliminatedWeek": null,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "teams": [
    {
      "id": 1,
      "playerId": 1,
      "contestantId": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "weeklyScores": [
    {
      "id": 1,
      "week": 2,
      "contestantId": 1,
      "category": "star_baker",
      "points": 4,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "seasonTotals": [
    {
      "id": 1,
      "playerId": 1,
      "week": 2,
      "contestantId": 1,
      "points": 4,
      "runningTotal": 12,
      "lastUpdated": "2025-01-01T00:00:00.000Z"
    }
  ],
  "nextId": 1
}
```

### Season Totals Structure
The season totals are organized by:
- **Week**: Each week has separate entries
- **Player**: Each player has separate entries per week
- **Contestant**: Each contestant has separate entries per week
- **Points**: Points earned by the contestant in that week
- **Running Total**: Cumulative total for the player through that week

This structure allows for:
- Weekly breakdowns by player and contestant
- Running totals that accumulate through the season
- Easy calculation of leaderboards and rankings

---

## Error Handling
All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Usage Examples

### Create a Player and Assign Contestants
```bash
# 1. Create a player
curl -X POST https://gbbo-fantasy.vercel.app/api/admin/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Dani", "teamName": "Danis Dream Team"}'

# 2. Assign 3 contestants to the player
curl -X PUT https://gbbo-fantasy.vercel.app/api/admin/teams \
  -H "Content-Type: application/json" \
  -d '{"playerId": 1, "contestantIds": [1, 2, 3]}'
```

### Add Weekly Scores
```bash
# Add a star baker score for week 2
curl -X POST https://gbbo-fantasy.vercel.app/api/admin/weekly-scores \
  -H "Content-Type: application/json" \
  -d '{"week": 2, "contestantId": 1, "category": "star_baker", "points": 4}'
```

### Calculate Season Totals
```bash
# Recalculate all season totals
curl -X POST https://gbbo-fantasy.vercel.app/api/admin/season-totals \
  -H "Content-Type: application/json" \
  -d '{}'
```
