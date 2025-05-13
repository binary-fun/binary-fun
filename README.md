# Binary.fun

A binary options simulation game where you predict whether the price will rise or fall, and earn rewards for correct predictions.

## Overview

Binary.fun is a web application that simulates binary options trading for cryptocurrencies. It allows you to experience binary options trading without using real funds.

## Key Features

- **Real-time Chart Display**: View price movements in real-time on the chart
- **Up/Down Prediction**: Predict whether the price will rise or fall after 60 seconds
- **Stake Setting**: Set the amount to stake on your prediction
- **Result Display**: View prediction results and earned rewards
- **Win/Loss Record**: Track past prediction results and win rate
- **Win Streak Bonus**: Earn additional bonuses for consecutive wins
- **Sound Effects**: Various sound effects to enhance the gaming experience

## Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Hooks

## Architecture

This application consists of the following components and services:

### Components

- **App**: Main application component
- **ChartComponent**: Component for displaying the price chart
- **PredictionComponent**: Component for making predictions
- **TimerComponent**: Component for displaying the countdown timer
- **ResultComponent**: Component for displaying prediction results

### Services

- **GameService**: Service for managing game logic
- **ChartService**: Service for generating and managing chart data
- **AudioService**: Service for managing sound effects

### Core Logic

- **Game**: Class responsible for core game logic

## Design Principles

This project is implemented following these design principles:

- **Single Responsibility Principle**: Each class has a single responsibility
- **Dependency Inversion Principle**: High-level modules do not depend on low-level modules
- **Interface Segregation Principle**: Clients are not forced to depend on methods they do not use

## Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/binary-fun.git

# Navigate to the project directory
cd binary-fun

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Build and Run

```bash
# Production build
npm run build

# Preview the build
npm run preview
```

## License

This project is released under the [MIT License](LICENSE).
