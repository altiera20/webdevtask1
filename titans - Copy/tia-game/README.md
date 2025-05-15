# Titans - Hexagonal Strategy Game

A turn-based hexagonal grid strategy game built with HTML, CSS, and vanilla JavaScript.

## Game Overview

Titans is a two-player strategy game where players place and move "Titans" on a grid of three concentric hexagons. The goal is to control edges between nodes and score points.

## Game Rules

1. **Setup**: The game board consists of three concentric hexagonal circuits (outer, middle, inner).
2. **Players**: Two players, Red and Blue, take turns.
3. **Phases**:
   - **Placement Phase**: Players take turns placing their Titans on the board.
   - **Movement Phase**: After all Titans are placed, players move them to control edges.
4. **Titans**: Each player has 4 Titans to place.
5. **Circuits**: Initially, only the outer circuit is available. Inner circuits unlock as the game progresses.
6. **Scoring**: Players score points by controlling edges (connecting two adjacent nodes with their Titans).
7. **Edge Values**: Edges are worth different point values based on their location (higher values toward the center).

## Project Structure

```
/tia-game
  ├── index.html         # Main HTML file
  ├── css/
  │   └── style.css      # CSS styling for the game
  ├── js/
  │   ├── main.js        # Entry point and event handlers
  │   ├── config.js      # Game constants and configuration
  │   ├── state.js       # Game state management
  │   ├── grid.js        # Grid rendering and UI updates
  │   ├── gameLogic.js   # Core game rules and actions
  │   └── timer.js       # Timer functionality
  └── README.md          # Project documentation
```

## Features

- Modular JavaScript architecture
- Responsive hexagonal grid layout
- Turn-based gameplay system
- Game state management
- Timer functionality for turns and overall game
- Score tracking

## Future Enhancements

- Undo/redo functionality
- AI opponents
- Power-ups
- Improved visual feedback for edge control
- Game statistics and history

## Development

This is an MVP (Minimum Viable Product) implementation focusing on the core game mechanics and structure. The codebase is designed to be easily extensible for future features.

## How to Run

Simply open the `index.html` file in a web browser to start the game.
