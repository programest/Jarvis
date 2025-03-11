const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn, execFile } = require("child_process");
const path = require("path");
const si = require("systeminformation");

let mainWindow;
let mode = "Обычный режим";

const isDev = !app.isPackaged;

// Автоматическая перезагрузка в dev-режиме, игнорируем временные файлы
if (isDev) {
    require("electron-reload")(__dirname, { ignored: /temp\.wav$/ });
}

// Определение пути к ресурсам в зависимости от среды
const resourcesPath = isDev 
  ? path.join(__dirname, "resources") 
  : process.resourcesPath;

// Пути к необходимым файлам
const whisperPath = path.join(resourcesPath, "conf", "whisper-cli.exe");
const modelPath = path.join(resourcesPath, "ggml-base.bin");
const audioPath = path.join(resourcesPath, "temp.wav");

// Команды для различных режимов
const modeCommands = {
    "Игровой режим": [
        { command: "DisplaySwitch.exe", args: ["/external"] },
        { command: "./resources/nircmd.exe", args: ["setdefaultsounddevice", "Наушники"] },
    ],
    "Рабочий режим": [
        { command: "DisplaySwitch.exe", args: ["/extend"] },
        { command: "./resources/nircmd.exe", args: ["setdefaultsounddevice", "Динамики"] },
    ],
};

// Создание главного окна приложения
app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + "/preload.js",
        },
        autoHideMenuBar: true,
    });
    mainWindow.loadFile("index.html");
});

// Получение системной информации и её обновление
async function updateSystemInfo() {
    try {
        const [cpu, mem, proc] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.processes(),
        ]);
        
        mainWindow.webContents.send("system-info", {
            cpu: cpu.currentLoad.toFixed(1),
            ram: ((mem.used / mem.total) * 100).toFixed(1),
            proc: proc.all,
        });
    } finally {
        setTimeout(updateSystemInfo, 1000); // Обновление информации каждую секунду
    }
}
app.whenReady().then(updateSystemInfo);

// Функция выполнения команд режима
function executeCommands(commands, mode) {
    commands.forEach(({ command, args }) => {
        execFile(command, args, (error) => {
            if (error) return;
        });
    });

    // Выбор аудиофайла в зависимости от режима
    const audioFile = mode === "Рабочий режим" ? "true.wav" : "true2.wav";
    playAudio(audioFile);
}

// Обработчик переключения режима
ipcMain.on("set-mode", (event, selectedMode) => {
    if (modeCommands[selectedMode]) {
        mode = selectedMode;
        executeCommands(modeCommands[mode], mode);
        mainWindow.webContents.send("mode", mode);
    }
});

// Запись аудио через SoX
function recordAudio() {
    return new Promise((resolve, reject) => {
        const sox = spawn("sox", [
            "-t", "waveaudio", "default",
            "-r", "16000", "-c", "1", "-b", "16", "-e", "signed-integer",
            audioPath, "trim", "0", "5"
        ]);

        sox.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error("Ошибка записи звука"));
        });
    });
}

// Запуск Whisper для распознавания речи
function runWhisper() {
    return new Promise((resolve, reject) => {
        const whisper = spawn(whisperPath, ["-m", modelPath, "-f", audioPath, "-l", "ru"]);
        let output = "";

        whisper.stdout.on("data", (data) => output += data.toString().toLowerCase());
        whisper.on("close", (code) => {
            if (code === 0) resolve(output);
            else reject(new Error("Ошибка обработки Whisper"));
        });
    });
}

// Основной процесс голосового управления
async function startListening() {
    try {
        await recordAudio();
        const result = await runWhisper();
        mainWindow.webContents.send("transcription", result);
        processVoiceCommand(result);
        setTimeout(startListening, 500); // Задержка перед следующим циклом
    } catch (error) {
        mainWindow.webContents.send("error", error.message);
        setTimeout(startListening, 1000);
    }
}

// Воспроизведение аудиофайлов
function playAudio(fileName) {
    const filePath = path.join(resourcesPath, "voices", fileName);
    spawn("ffplay", ["-nodisp", "-autoexit", filePath], { stdio: "ignore" });
}

// Обработка голосовых команд
function processVoiceCommand(result) {
    if (result.includes("джарвис включи рабочий режим") || result.includes("рабочий режим")) {
        mode = "Рабочий режим";
    } else if (result.includes("джарвис включи игровой режим") || result.includes("игровой режим")) {
        mode = "Игровой режим";
    } else if (result.includes("джарвис")) {
        execFile("notepad.exe");
        return;
    } else {
        return;
    }

    mainWindow.webContents.send("mode", mode);
    executeCommands(modeCommands[mode], mode);
}

// Запуск прослушивания голосовых команд
ipcMain.on("start-listening", startListening);
