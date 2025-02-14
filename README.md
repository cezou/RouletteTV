# RouletteTV

A casino prize wheel system designed for FiveM Item and TV integration, with real-time history streaming.

## 🎮 Integration Points

### Main Wheel ([https://roulette-tv.vercel.app/](https://roulette-tv.vercel.app/))
- Designed to be integrated as a URL Item in FiveM Prop "Roulette"

### History Page ([https://roulette-tv.vercel.app/history.html](https://roulette-tv.vercel.app/history.html))
- Automated streaming setup:
  - In an Oracle Cloud Instance (It's like an AWS EC2):
    - Page content captured via puppeteer (it's a non-headless browser)
    - Streamed to YouTube via FFmpeg
  - YouTube stream displayed on a FiveM TV using `/media`
- Real-time updates every 5 seconds

## 🛠 Core Components

- **Redis Database**: Stores all wheel spins and results
- **Vercel**: Hosts the application and handles serverless functions
- **Oracle Cloud Infastructure**: Manages the FFmpeg streaming pipeline
- **FiveM Integration**: 
  - Wheel: Direct URL integration in a URL Item (Or via phone if the server can't use URL Items)
  - History: YouTube stream via `/media` command
