const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onSystemInfo: (callback) =>
    ipcRenderer.on("system-info", (_, data) => callback(data)),

  startListening: () => {
    console.log("📢 Запуск прослушивания...");
    ipcRenderer.send("start-listening");
  },

  onTranscription: (callback) => {
    ipcRenderer.on("transcription", (_, text) => {
      console.log("🎤 Распознанный текст:", text);
      callback(text);
    });
  },

  setMode: (mode) => {
    console.log("🔄 Переключение режима:", mode);
    ipcRenderer.send("set-mode", mode);
  },
});
