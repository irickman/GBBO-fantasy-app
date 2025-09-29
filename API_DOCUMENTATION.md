# GBBO Fantasy League - TypeScript Server Actions Documentation

This document describes the comprehensive TypeScript server actions available for managing all aspects of the GBBO Fantasy League system.

## Server Actions
All server actions are TypeScript functions that can be called directly from React components using the `'use server'` directive.

## Authentication
All server actions require authentication. Users must be logged in to access these functions.

---

## 1. Players Management

### `getAllPlayersAction()`
**Description:** Get all players
**Usage:** `const result = await getAllPlayersAction()`
**Response:**
```typescript
{
  ok: true,
  players: [
    {
      id: 1,
      name: "Player Name",
      teamName: "Team Name",
      createdAt: Date
    }
  ]
}
```

### `createPlayerAction(formData: FormData)`
**Description:** Create a new player
**Usage:** 
```typescript
const formData = new FormData()
formData.append('name', 'Player Name')
formData.append('teamName', 'Team Name')
const result = await createPlayerAction(formData)
```
**Response:**
```typescript
{
  ok: true,
  player: {
    id: 1,
    name: "Player Name",
    teamName: "Team Name",
    createdAt: Date
  }
}
```

### `updatePlayerAction(formData: FormData)`
**Description:** Update an existing player
**Usage:**
```typescript
const formData = new FormData()
formData.append('id', '1')
formData.append('name', 'Updated Name')
formData.append('teamName', 'Updated Team Name')
const result = await updatePlayerAction(formData)
```

### `deletePlayerAction(formData: FormData)`
**Description:** Delete a player
**Usage:**
```typescript
const formData = new FormData()
formData.append('playerId', '1')
const result = await deletePlayerAction(formData)
```

---

## 2. Contestants Management

### `getAllContestantsAction()`
**Description:** Get all contestants
**Usage:** `const result = await getAllContestantsAction()`
**Response:**
```typescript
{
  ok: true,
  contestants: [
    {
      id: 1,
      name: "Contestant Name",
      eliminatedWeek: 5
    }
  ]
}
```

### `createContestantAction(formData: FormData)`
**Description:** Create a new contestant
**Usage:**
```typescript
const formData = new FormData()
formData.append('name', 'Contestant Name')
formData.append('eliminatedWeek', '5')
const result = await createContestantAction(formData)
```

### `updateContestantAction(formData: FormData)`
**Description:** Update an existing contestant
**Usage:**
```typescript
const formData = new FormData()
formData.append('id', '1')
formData.append('name', 'Updated Name')
formData.append('eliminatedWeek', '6')
const result = await updateContestantAction(formData)
```

### `deleteContestantAction(formData: FormData)`
**Description:** Delete a contestant
**Usage:**
```typescript
const formData = new FormData()
formData.append('id', '1')
const result = await deleteContestantAction(formData)
```

---

## 3. Team Assignments Management

### `getPlayerTeamsAction(playerId: number)`
**Description:** Get all team assignments for a specific player
**Usage:** `const result = await getPlayerTeamsAction(1)`
**Response:**
```typescript
{
  ok: true,
  teams: [
    {
      id: 1,
      playerId: 1,
      contestantId: 5,
      teamId: 1,
      contestantName: "Contestant Name"
    }
  ]
}
```

### `createTeamAction(formData: FormData)`
**Description:** Create a team assignment (assign contestant to player)
**Usage:**
```typescript
const formData = new FormData()
formData.append('playerId', '1')
formData.append('contestantId', '5')
const result = await createTeamAction(formData)
```

### `deleteTeamAction(formData: FormData)`
**Description:** Delete a team assignment
**Usage:**
```typescript
const formData = new FormData()
formData.append('teamId', '1')
const result = await deleteTeamAction(formData)
```

### `updatePlayerTeamAction(formData: FormData)`
**Description:** Update all team assignments for a player (replaces existing assignments)
**Usage:**
```typescript
const formData = new FormData()
formData.append('playerId', '1')
formData.append('contestantIds', JSON.stringify([5, 8, 12]))
const result = await updatePlayerTeamAction(formData)
```

---

## 4. Weekly Scores Management

### `getWeeklyScoresAction(week: number)`
**Description:** Get all scores for a specific week
**Usage:** `const result = await getWeeklyScoresAction(2)`
**Response:**
```typescript
{
  ok: true,
  scores: [
    {
      id: 1,
      week: 2,
      contestantId: 5,
      category: "star_baker",
      points: 3,
      contestantName: "Contestant Name"
    }
  ]
}
```

### `addScoreAction(formData: FormData)`
**Description:** Add a new weekly score
**Usage:**
```typescript
const formData = new FormData()
formData.append('week', '2')
formData.append('contestantId', '5')
formData.append('category', 'star_baker')
const result = await addScoreAction(formData)
```

### `updateScoreAction(formData: FormData)`
**Description:** Update an existing weekly score
**Usage:**
```typescript
const formData = new FormData()
formData.append('scoreId', '1')
formData.append('contestantId', '8')
formData.append('category', 'technical')
const result = await updateScoreAction(formData)
```

### `deleteScoreAction(formData: FormData)`
**Description:** Delete a weekly score
**Usage:**
```typescript
const formData = new FormData()
formData.append('scoreId', '1')
const result = await deleteScoreAction(formData)
```

### `getContestantsAction()`
**Description:** Get all contestants (for scoring page)
**Usage:** `const result = await getContestantsAction()`

---

## 5. Season Totals Management

### `getAllSeasonTotalsAction()`
**Description:** Get all season totals
**Usage:** `const result = await getAllSeasonTotalsAction()`
**Response:**
```typescript
{
  ok: true,
  totals: [
    {
      id: 1,
      playerId: 1,
      week: 2,
      contestantId: 5,
      points: 3,
      runningTotal: 6,
      playerName: "Player Name",
      contestantName: "Contestant Name",
      lastUpdated: Date
    }
  ]
}
```

### `getSeasonTotalsByPlayerAction(playerId: number)`
**Description:** Get season totals for a specific player
**Usage:** `const result = await getSeasonTotalsByPlayerAction(1)`

### `createSeasonTotalAction(formData: FormData)`
**Description:** Create a new season total entry
**Usage:**
```typescript
const formData = new FormData()
formData.append('playerId', '1')
formData.append('week', '2')
formData.append('contestantId', '5')
formData.append('points', '3')
formData.append('runningTotal', '6')
const result = await createSeasonTotalAction(formData)
```

### `updateSeasonTotalAction(formData: FormData)`
**Description:** Update an existing season total
**Usage:**
```typescript
const formData = new FormData()
formData.append('id', '1')
formData.append('points', '5')
formData.append('runningTotal', '10')
const result = await updateSeasonTotalAction(formData)
```

### `recalculateSeasonTotalsAction()`
**Description:** Recalculate all season totals from weekly scores
**Usage:** `const result = await recalculateSeasonTotalsAction()`

---

## Error Handling

All server actions return a consistent response format:

**Success Response:**
```typescript
{
  ok: true,
  [data]: any // The actual data returned
}
```

**Error Response:**
```typescript
{
  ok: false,
  error: string // Error message
}
```

## Usage in React Components

```typescript
'use client'

import { getAllPlayersAction, createPlayerAction } from '@/app/admin/teams/actions'

export default function PlayersComponent() {
  const [players, setPlayers] = useState([])

  const loadPlayers = async () => {
    const result = await getAllPlayersAction()
    if (result.ok) {
      setPlayers(result.players)
    } else {
      console.error(result.error)
    }
  }

  const addPlayer = async (formData: FormData) => {
    const result = await createPlayerAction(formData)
    if (result.ok) {
      await loadPlayers() // Refresh the list
    } else {
      console.error(result.error)
    }
  }

  return (
    // Component JSX
  )
}
```

## Data Models

### Player
```typescript
{
  id: number
  name: string
  teamName: string
  createdAt: Date
}
```

### Contestant
```typescript
{
  id: number
  name: string
  eliminatedWeek: number | null
}
```

### Team Assignment
```typescript
{
  id: number
  playerId: number
  contestantId: number
  contestantName?: string // Added when fetching with names
}
```

### Weekly Score
```typescript
{
  id: number
  week: number
  contestantId: number
  category: string
  points: number
  contestantName?: string // Added when fetching with names
}
```

### Season Total
```typescript
{
  id: number
  playerId: number
  week: number
  contestantId: number
  points: number
  runningTotal: number
  lastUpdated: Date
  playerName?: string // Added when fetching with names
  contestantName?: string // Added when fetching with names
}
```

## Scoring Categories

Available scoring categories:
- `star_baker`: 3 points
- `technical`: 2 points
- `show_stopper`: 2 points
- `signature`: 1 point
- `eliminated`: 0 points