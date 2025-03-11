// Запускаем код после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  initializeAnimations();  // Анимация появления элементов
  initializeSystemInfo();  // Обновление системной информации
  window.api.startListening(); // Автозапуск голосового распознавания
});

// Анимация появления элементов на странице
function initializeAnimations() {
  const elements = [
      "#date_time", "#cpu", "#ram", "#proc", "#note_input",
      "#temperature", "#mainCircle", "#time1"
  ];
  
  elements.forEach((el, index) => {
      $(el).hide().delay(2000 + index * 500).fadeIn(1000);
  });
}

// Обновление системной информации в UI
function initializeSystemInfo() {
  window.api.onSystemInfo((data) => {
      updateElement("cpu", `CPU Usage: ${data.cpu}%`);
      updateElement("ram", `RAM Usage: ${data.ram}%`);
      updateElement("proc", `Processes: ${data.proc}`);
  });
}

// Обновление текста в элементе по его ID
function updateElement(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

// Вывод текста распознанной речи на экран
window.api.onTranscription((text) => {
  document.getElementById("output").textContent = text;
});

// Обработчики кнопок переключения режима
document.getElementById("workMode").addEventListener("click", () => {
  window.api.setMode("Рабочий режим");
});

document.getElementById("gameMode").addEventListener("click", () => {
  window.api.setMode("Игровой режим");
});
