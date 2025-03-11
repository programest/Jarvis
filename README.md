# JARVIS Voice Assistant
![asd](https://github.com/user-attachments/assets/d5bf26ac-d14b-45dc-a509-b0f510768e58)


## Tech Stack

- Backend: Node.js + Electron
- Frontend: HTML, CSS, JavaScript
- Libraries: SystemInformation, Sox, Whisper, FFMPEG

## Features

- Voice Command Recognition using Whisper
- Mode Switching between Work and Game modes
- System Information Display (CPU, RAM, Processes)
- Audio Playback for system responses

## How It Works
- Speech Recognition: Uses Whisper for transcribing voice commands.
- Command Processing: Recognizes and executes predefined actions.
- Mode Switching: Controls display and sound settings.
- Continuous Listening: Automatically listens for new commands.

## Installation

Clone the repository:
```sh
git clone https://github.com/your-repo/jarvis.git
cd jarvis
```

Install dependencies:
```sh
npm install
```
Set up Git LFS (if not installed):
```sh
git lfs install
git lfs pull
```
Run the application:
```sh
npm start
```
## Available Commands


| Plugin | README |
| ------ | ------ |
| "Джарвис, включи рабочий режим" | [Switches to Work Mode] |
| "Джарвис, включи игровой режим" | [Switches to Game Mode] |
| "Джарвис" | [Opens Notepad] |


## Author

Miermanov Adil

