# RouletteTV

A casino prize wheel system designed for FiveM Item and TV integration, with real-time history streaming.

## 🎥 Demonstration

<div align="center">
  <a href="https://www.youtube.com/watch?v=OoPI71_KAIg">
    <img src="https://img.youtube.com/vi/OoPI71_KAIg/0.jpg" alt="RouletteTV Demonstration" width="600" style="border-radius:10px;">
    <br>
    <img src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/youtube.svg" width="20px" alt="Play Video">
    <span>Click to watch the demo video</span>
  </a>
</div>

## 🎮 Integration Points

### [Main Wheel](/public/index.html)
- Designed to be integrated as a URL Item in FiveM Prop "Roulette"

### [History Page](/public/index.html)
- Automated streaming setup:
  - Using my open-source tool [PageStreamer](https://github.com/cezou/PageStreamer) to stream the history page to YouTube from a linux server
  - YouTube stream displayed on a FiveM TV using `/media` in FiveM

## 🛠 Core Components

- **Redis Database**: Stores all wheel spins and results
- **Vercel**: Hosts the application and handles serverless functions
- **Oracle Cloud Infastructure**: Manages the FFmpeg streaming pipeline
- **FiveM Integration**: 
  - Wheel: Direct URL integration in a URL Item (Or via phone if the server can't use URL Items)
  - History: YouTube stream via `/media` command