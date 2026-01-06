# Tic Tac Toe (Vue) — Product Requirements Document (PRD)

## 1) Overview & goals

This project is a simple, modern, light-themed Tic Tac Toe web application built with Vue 3 and Vite. It provides a two-player (local) 3x3 Tic Tac Toe experience with clear turn/status messaging, win/draw detection, and a reset option. In addition, it includes a persistent, on-device statistics dashboard that tracks outcomes across page refreshes on the same device/browser using local storage.

The primary goal is to deliver a polished, easy-to-understand reference app that demonstrates clean game logic, a responsive UI, basic accessibility, and local persistence for lightweight analytics without a backend.

## 2) In-scope / out-of-scope

### In-scope
The initial release must include the following:
- A playable Tic Tac Toe game on a 3x3 grid with two-player local turns.
- Win detection and draw detection.
- In-game status display (turn, winner, draw).
- A “Reset game” action that resets the board and current player.
- A persistent statistics dashboard that tracks total games, X wins, O wins, draws, and win/draw rates.
- Automatic statistics updates when a game ends (win or draw), recorded exactly once per finished game.
- A “Reset Statistics” action that resets statistics without resetting the current board.

### Out-of-scope
The following are explicitly not required for this scope:
- Online multiplayer, matchmaking, or network play.
- AI/computer opponent.
- User accounts, server-side storage, or cross-device sync.
- Advanced game history, replay, or per-move timeline.
- Internationalization/localization.
- Dark mode. The product is expected to use the provided light theme.

## 3) User stories

### Core gameplay
- As a player, I want to click a cell to place my mark so I can play my turn.
- As a player, I want the app to prevent moves on already filled cells so I cannot accidentally overwrite a move.
- As a player, I want the app to prevent moves after the game ends so the outcome is preserved.
- As a player, I want to see whose turn it is so I can follow the game.
- As a player, I want to know immediately when someone wins so I can stop playing and celebrate.
- As a player, I want to know when the game is a draw so I can start a new game.
- As a player, I want to reset the board so I can quickly start another game.

### Persistent statistics dashboard
- As a player, I want to see how many total games have been played on this device so I can track usage.
- As a player, I want to see how many games X has won, how many O has won, and how many draws occurred so I can compare outcomes.
- As a player, I want to see win/draw rates so I can understand performance over time.
- As a player, I want stats to update automatically when a game ends so I do not need extra steps.
- As a player, I want to reset stats without losing my current board so I can clear counters while finishing the current round.
- As a player, I want the game to still work even if local storage is unavailable so I can play in restrictive browser environments.

## 4) Functional requirements

### 4.1 Core gameplay requirements
- The app must render a 3x3 grid of clickable cells.
- The game must start with player X as the current player.
- When the current player clicks an empty cell during an active game, the app must place the current player’s mark in that cell.
- The app must alternate turns between X and O after each valid move, unless the move ends the game.
- The app must detect a winner when any one of the 8 standard winning lines is completed (3 rows, 3 columns, 2 diagonals).
- The app must detect a draw when all 9 cells are filled and no winner exists.
- The app must display a game status string:
  - “Turn: X” or “Turn: O” during active play
  - “Winner: X” or “Winner: O” when a winner exists
  - “It’s a draw.” when the game is drawn
- The app must provide a “Reset game” control that:
  - Clears the board back to 9 empty cells
  - Sets the current player back to X
  - Enables play again

### 4.2 Persistent statistics dashboard requirements
- The app must maintain a statistics model with the following counters:
  - Total games
  - X wins
  - O wins
  - Draws
- The app must compute and display the following rates:
  - X win rate = X wins / total games
  - O win rate = O wins / total games
  - Draw rate = draws / total games
  - Overall (non-draw) win rate = (X wins + O wins) / total games
- The app must persist statistics on the client using `localStorage` under the key `ttt_stats_v1`.
- All `localStorage` access must be guarded so that the app remains playable even if storage is blocked or unavailable.
- The app must load stored statistics on app mount and display them in the dashboard.
- The app must automatically update statistics when a game ends:
  - When a win is detected, record the appropriate winner (X or O).
  - When a draw is detected, record “draw”.
  - The update must happen exactly once per finished game, even if reactive computations re-run.
- The app must provide a “Reset Statistics” control that:
  - Resets all counters to 0
  - Removes the persisted storage entry
  - Does not change the current game board state

## 5) UX/UI requirements

### 5.1 Visual design and layout
- The UI must follow the provided light theme and modern style:
  - Background: light gray/off-white
  - Surface: white cards/panels
  - Text: dark neutral
  - Accents: primary blue and success cyan
  - Error accent used for destructive reset action
- The layout must be centered and responsive.
- On wider screens, the statistics panel should be displayed alongside the game card.
- On smaller screens, the layout should stack vertically for readability and tap targets.

### 5.2 Interaction design
- Cells must present clear hover/focus states when interactive.
- Cells must be disabled when:
  - The cell is already filled, or
  - The game has ended (winner or draw)
- A winning line should be visually highlighted to make the outcome obvious.
- “Reset game” and “Reset Statistics” controls must be clearly distinguishable, including using color to communicate destructive action for stats reset.

### 5.3 Accessibility basics
- The game status must be announced to assistive technologies (for example, via an aria-live region).
- The grid and grid cells must be discoverable via semantics and accessible names (for example, “Cell 1, X”).
- All interactive elements must be keyboard reachable with visible focus indicators.
- Buttons must use semantic `<button>` elements and be operable via keyboard.

## 6) Non-functional requirements

### 6.1 Performance
- The app must remain responsive on typical mobile and desktop browsers.
- Moves, win/draw detection, and stats updates must complete effectively instantly (within a single animation frame under normal conditions), given the small board size.

### 6.2 Reliability
- Statistics persistence must not prevent the user from playing the game. If `localStorage` access fails, the app must continue functioning and stats may reset to defaults for that session.
- Statistics must not double-count a single finished game. Each win/draw should increment counters exactly once.

### 6.3 Compatibility
- The app must run in modern evergreen browsers supporting Vue 3 and standard DOM APIs.
- The development environment uses Vite and serves the app on port 3000 in this repository configuration.

### 6.4 Privacy and data handling
- No personal data is collected.
- Statistics are stored only on the user’s device in the browser’s `localStorage` and are not transmitted to any server.
- The UI must clearly indicate that statistics are “Persisted across refreshes on this device.”

## 7) Analytics & success metrics

This app is intentionally lightweight and does not require third-party analytics. Success should be measurable through functional outcomes and (optionally) local-only instrumentation.

Primary success metrics:
- Game completion rate: proportion of started games that reach a win or draw.
- Stats correctness: totals must equal X wins + O wins + draws, and rates must match counters.
- UX quality proxy: users can complete a full game and start a new one without confusion (validated via basic usability review).

Operational quality metrics:
- Zero runtime errors in normal play flows (start game, play to win, play to draw, reset board, reset stats).
- Graceful degradation when local storage is unavailable (no crash; gameplay continues).

## 8) Release plan & milestones

### Milestone 1: Core gameplay (Done / baseline)
- Implement 3x3 grid.
- Implement turns, status, win detection, draw detection.
- Implement reset game.

### Milestone 2: Persistent statistics dashboard (Done / baseline)
- Implement stats model and UI panel.
- Persist via `localStorage` under `ttt_stats_v1`.
- Auto-update at game end once per game.
- Implement reset statistics independent of board.

### Milestone 3: UX polish and accessibility verification (Target)
- Verify responsive behavior on narrow screens.
- Verify keyboard navigation and focus states for cells and buttons.
- Confirm aria-live status behavior and meaningful aria labels.

## 9) Open questions / assumptions

Assumptions:
- The game is strictly two-player local play (no AI).
- Persistence is per device/browser profile; clearing browser storage resets stats.
- The definition of “win rate” is per total games, and “overall win rate” excludes draws (as displayed).

Open questions (not blocking for this scope):
- Should “Reset game” also clear any win highlight animation/state beyond the board reset?
- Should there be a confirmation prompt for “Reset Statistics” to avoid accidental resets?
- Should win rate be displayed with more precision (for example, 1 decimal) instead of whole percent?

## 10) Acceptance criteria

### Core gameplay acceptance criteria
- [ ] The UI shows a 3x3 grid of 9 clickable cells.
- [ ] The initial status indicates it is X’s turn.
- [ ] Clicking an empty cell places the current player’s mark and (if the game is not over) switches the turn.
- [ ] Clicking a filled cell does nothing and does not change the turn.
- [ ] Once a win occurs, the status shows the winner and further moves are prevented.
- [ ] Once a draw occurs, the status shows a draw message and further moves are prevented.
- [ ] “Reset game” clears the board and sets the current player back to X.

### Statistics dashboard acceptance criteria
- [ ] A “Statistics” dashboard is visible in the UI.
- [ ] The dashboard shows total games, X wins, O wins, draws.
- [ ] The dashboard shows X win rate, O win rate, and draw rate computed from totals.
- [ ] The dashboard shows an overall non-draw win rate computed from totals.
- [ ] Statistics persist across page refreshes using `localStorage` key `ttt_stats_v1`.
- [ ] Statistics update automatically when a game ends, and each completed game increments totals exactly once.
- [ ] “Reset Statistics” clears counters and removes the persisted storage entry without resetting the current board.
- [ ] If `localStorage` is not accessible, the game remains playable and the UI does not crash.

### UX/accessibility acceptance criteria
- [ ] Layout is centered and remains usable on both desktop and mobile widths.
- [ ] All interactive elements are keyboard reachable with visible focus styling.
- [ ] The status text is exposed via an aria-live region so outcome changes are announced.
- [ ] Cells have meaningful accessible names indicating position and value when present.
