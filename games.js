/* =========================================================
   PORTAL + PARTÍCULAS
========================================================= */
const portal = document.getElementById("portal");
const enterBtn = document.getElementById("enterBtn");

const fx = document.getElementById("fx");
const fctx = fx.getContext("2d");

function sizeFX(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fx.width = Math.floor(innerWidth * dpr);
  fx.height = Math.floor(innerHeight * dpr);
  fx.style.width = innerWidth + "px";
  fx.style.height = innerHeight + "px";
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

if (window.innerWidth) {
  sizeFX();
}

window.addEventListener("resize", sizeFX);

// Partículas rosas suaves
let petals = [];
function initPetals(){
  petals = Array.from({length: 46}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 1.2 + Math.random() * 2.4,
    vx: -0.15 + Math.random() * 0.30,
    vy: 0.25 + Math.random() * 0.55,
    a: 0.22 + Math.random() * 0.35
  }));
}
initPetals();

function drawFX(){
  fctx.clearRect(0,0,innerWidth,innerHeight);

  for (const p of petals){
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > innerHeight + 20) { p.y = -10; p.x = Math.random() * innerWidth; }
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;

    fctx.globalAlpha = p.a;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    fctx.fillStyle = "rgba(244,114,182,0.8)";
    fctx.fill();
  }

  requestAnimationFrame(drawFX);
}
requestAnimationFrame(drawFX);

// Portal - funcion de entrada
function enterPortal(){
  if (portal) {
    portal.classList.remove("show");
    portal.setAttribute("aria-hidden","true");
  }
}

if (enterBtn) {
  enterBtn.addEventListener("click", enterPortal);
}

if (portal) {
  portal.addEventListener("click", (e) => {
    if (e.target === portal) enterPortal();
  });
}

/* =========================================================
   JUEGO 1: MEMORIA
========================================================= */
const memoryGrid = document.getElementById("memoryGrid");
const memoryPairs = document.getElementById("memoryPairs");
const memoryTime = document.getElementById("memoryTime");
const memoryResult = document.getElementById("memoryResult");
const memoryReset = document.getElementById("memoryReset");

const emojis = ["🌸", "💕", "⭐", "🌙", "✨", "💗"];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryTimer = null;
let memoryTimeLeft = 30;
let memoryGameActive = false;

function initMemory() {
  memoryCards = [...emojis, ...emojis];
  memoryCards.sort(() => Math.random() - 0.5);
  
  if (memoryGrid) {
    memoryGrid.innerHTML = "";
  }
  flippedCards = [];
  matchedPairs = 0;
  memoryTimeLeft = 30;
  memoryGameActive = true;
  
  if (memoryPairs) memoryPairs.textContent = "0";
  if (memoryTime) memoryTime.textContent = memoryTimeLeft;
  if (memoryResult) memoryResult.textContent = "";
  
  memoryCards.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.className = "memory-card hidden";
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.textContent = emoji;
    card.addEventListener("click", () => flipCard(card));
    if (memoryGrid) {
      memoryGrid.appendChild(card);
    }
  });
  
  if (memoryTimer) clearInterval(memoryTimer);
  memoryTimer = setInterval(() => {
    if (!memoryGameActive) return;
    memoryTimeLeft--;
    if (memoryTime) memoryTime.textContent = memoryTimeLeft;
    if (memoryTimeLeft <= 0) {
      endMemory(false);
    }
  }, 1000);
}

function flipCard(card) {
  if (!memoryGameActive || card.classList.contains("flipped") || card.classList.contains("matched") || flippedCards.length >= 2) {
    return;
  }
  
  card.classList.remove("hidden");
  card.classList.add("flipped");
  flippedCards.push(card);
  
  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  
  if (card1.dataset.emoji === card2.dataset.emoji) {
    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
      matchedPairs++;
      if (memoryPairs) memoryPairs.textContent = matchedPairs;
      flippedCards = [];
      
      if (matchedPairs === emojis.length) {
        endMemory(true);
      }
    }, 500);
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card1.classList.add("hidden");
      card2.classList.remove("flipped");
      card2.classList.add("hidden");
      flippedCards = [];
    }, 1000);
  }
}

function endMemory(won) {
  memoryGameActive = false;
  clearInterval(memoryTimer);
  
  if (memoryResult) {
    if (won) {
      memoryResult.textContent = `🎉 ¡Ganaste! Encontraste todos los pares con ${memoryTimeLeft}s restantes.`;
    } else {
      memoryResult.textContent = "⏰ ¡Se acabó el tiempo! Intenta de nuevo.";
    }
  }
}

if (memoryReset) {
  memoryReset.addEventListener("click", initMemory);
}

/* =========================================================
   JUEGO 2: ADIVINA EL NÚMERO
========================================================= */
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const guessResult = document.getElementById("guessResult");
const attemptsDisplay = document.getElementById("attempts");
const guessReset = document.getElementById("guessReset");

let secretNumber = Math.floor(Math.random() * 100) + 1;
let guessAttempts = 0;

function makeGuess() {
  if (!guessInput) return;
  
  const guess = parseInt(guessInput.value);
  
  if (isNaN(guess) || guess < 1 || guess > 100) {
    if (guessResult) guessResult.textContent = "Por favor, ingresa un número válido entre 1 y 100.";
    return;
  }
  
  guessAttempts++;
  if (attemptsDisplay) attemptsDisplay.textContent = guessAttempts;
  
  if (guess === secretNumber) {
    if (guessResult) guessResult.textContent = `🎉 ¡Correcto! El número era ${secretNumber}. Lo adivinaste en ${guessAttempts} intentos.`;
    if (guessBtn) guessBtn.style.display = "none";
    if (guessReset) guessReset.style.display = "inline-block";
  } else if (guess < secretNumber) {
    if (guessResult) guessResult.textContent = "📈 Más alto... ¡Intenta con un número mayor!";
  } else {
    if (guessResult) guessResult.textContent = "📉 Más bajo... ¡Intenta con un número menor!";
  }
  
  guessInput.value = "";
  guessInput.focus();
}

function resetGuess() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  guessAttempts = 0;
  if (attemptsDisplay) attemptsDisplay.textContent = guessAttempts;
  if (guessResult) guessResult.textContent = "¡Escribe un número y adivina!";
  if (guessBtn) guessBtn.style.display = "inline-block";
  if (guessReset) guessReset.style.display = "none";
  guessInput.value = "";
}

if (guessBtn) {
  guessBtn.addEventListener("click", makeGuess);
}

if (guessInput) {
  guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") makeGuess();
  });
}

if (guessReset) {
  guessReset.addEventListener("click", resetGuess);
}

/* =========================================================
   JUEGO 3: TIC TAC TOE
========================================================= */
const tttBoard = document.getElementById("tttBoard");
const tttStatus = document.getElementById("tttStatus");
const tttReset = document.getElementById("tttReset");
const tttCells = document.querySelectorAll(".ttt-cell");

let tttBoardState = ["", "", "", "", "", "", "", "", ""];
let tttCurrentPlayer = "X";
let tttGameActive = true;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.index);
  
  if (tttBoardState[index] !== "" || !tttGameActive || tttCurrentPlayer !== "X") {
    return;
  }
  
  tttBoardState[index] = "X";
  cell.textContent = "X";
  cell.classList.add("x");
  
  checkTttResult();
  
  if (tttGameActive) {
    tttCurrentPlayer = "O";
    if (tttStatus) tttStatus.textContent = "Turno de la computadora...";
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  if (!tttGameActive) return;
  
  let move = findBestMove("O");
  if (move === -1) {
    move = findBestMove("X");
  }
  if (move === -1) {
    const available = tttBoardState.map((cell, i) => cell === "" ? i : null).filter(i => i !== null);
    move = available[Math.floor(Math.random() * available.length)];
  }
  
  tttBoardState[move] = "O";
  const cell = tttCells[move];
  if (cell) {
    cell.textContent = "O";
    cell.classList.add("o");
  }
  
  checkTttResult();
  
  if (tttGameActive) {
    tttCurrentPlayer = "X";
    if (tttStatus) tttStatus.textContent = "Tu turno (X)";
  }
}

function findBestMove(player) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    const cells = [tttBoardState[a], tttBoardState[b], tttBoardState[c]];
    const emptyIndex = cells.indexOf("");
    
    if (emptyIndex !== -1) {
      const filled = cells.filter(c => c === player).length;
      if (filled === 2) {
        return condition[emptyIndex];
      }
    }
  }
  return -1;
}

function checkTttResult() {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (tttBoardState[a] && tttBoardState[a] === tttBoardState[b] && tttBoardState[a] === tttBoardState[c]) {
      tttGameActive = false;
      condition.forEach(i => {
        if (tttCells[i]) tttCells[i].classList.add("winner");
      });
      
      if (tttBoardState[a] === "X") {
        if (tttStatus) tttStatus.textContent = "🎉 ¡Ganaste!";
      } else {
        if (tttStatus) tttStatus.textContent = "😅 La computadora ganó.";
      }
      return;
    }
  }
  
  if (!tttBoardState.includes("")) {
    tttGameActive = false;
    if (tttStatus) tttStatus.textContent = "🤝 ¡Empate!";
  }
}

function resetTtt() {
  tttBoardState = ["", "", "", "", "", "", "", "", ""];
  tttCurrentPlayer = "X";
  tttGameActive = true;
  if (tttStatus) tttStatus.textContent = "Tu turno (X)";
  
  tttCells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner");
  });
}

tttCells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

if (tttReset) {
  tttReset.addEventListener("click", resetTtt);
}

/* =========================================================
   JUEGO 4: QUIZ
========================================================= */
const quizContainer = document.getElementById("quizContainer");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizCurrent = document.getElementById("quizCurrent");
const quizTotal = document.getElementById("quizTotal");
const quizResult = document.getElementById("quizResult");
const quizReset = document.getElementById("quizReset");

const quizData = [
  {
    question: "¿Cómo se llama el mundo donde ocurre la historia de Genshin Impact?",
    options: ["Eldoria", "Teyvat", "Celestia", "Abyssia"],
    correct: 1
  },
  {
    question: "¿Qué Arconte gobierna Mondstadt?",
    options: ["Morax", "Barbatos", "Beelzebul", "Focalors"],
    correct: 1
  },
  {
    question: "¿Cuál es el nombre real del Arconte Geo?",
    options: ["Morax", "Rex Lapis", "Zhongli", "Azhdaha"],
    correct: 0
  },
  {
    question: "¿Qué elemento representa el Arconte de Fontaine?",
    options: ["Cryo", "Hydro", "Electro", "Anemo"],
    correct: 1
  },
  {
    question: "¿Qué material se obtiene al derrotar a Azhdaha?",
    options: ["Corona del Señor Dragón", "Rama de jade de sangre", "Momento fundido", "Mariposa infernal"],
    correct: 1
  },
  {
    question: "¿Cuál es la rareza máxima de los artefactos?",
    options: ["4 estrellas", "5 estrellas", "6 estrellas", "7 estrellas"],
    correct: 1
  },
  {
    question: "¿Qué reacción elemental ocurre entre Hydro y Electro?",
    options: ["Vaporizado", "Sobrecarga", "Electrocargado", "Congelado"],
    correct: 2
  },
  {
    question: "¿Qué personaje usa la habilidad definitiva 'Caída del planeta'?",
    options: ["Raiden Shogun", "Zhongli", "Xiao", "Tartaglia"],
    correct: 1
  },
  {
    question: "¿Cuál es el nombre del dragón que atacó Mondstadt en el prólogo?",
    options: ["Dvalin", "Apep", "Azhdaha", "Durin"],
    correct: 0
  },
  {
    question: "¿Qué organización lidera Ningguang?",
    options: ["Caballeros de Favonius", "Qixing de Liyue", "Fatui", "Adeptus"],
    correct: 1
  },
  {
    question: "¿Cómo se llaman los hermanos protagonistas del juego?",
    options: ["Aether y Lumine", "Kaeya y Diluc", "Lyney y Lynette", "Albedo y Klee"],
    correct: 0
  },
  {
    question: "¿Qué jefe semanal entrega el material 'Campana de Daka'?",
    options: ["Signora", "Raiden Shogun", "Scaramouche", "Tartaglia"],
    correct: 2
  },
  {
    question: "¿Cuál es el nombre del país inspirado en Japón?",
    options: ["Natlan", "Inazuma", "Sumeru", "Fontaine"],
    correct: 1
  },
  {
    question: "¿Qué reacción elemental ocurre entre Cryo y Hydro?",
    options: ["Congelado", "Superconductor", "Derretido", "Florecimiento"],
    correct: 0
  },
  {
    question: "¿Cuál de estos personajes pertenece a los Heraldos Fatui?",
    options: ["Tartaglia", "Xingqiu", "Albedo", "Kazuha"],
    correct: 0
  },
  {
    question: "¿Cuál es el elemento del personaje Nahida?",
    options: ["Anemo", "Dendro", "Hydro", "Electro"],
    correct: 1
  },
  {
    question: "¿Qué tipo de arma usa Hu Tao?",
    options: ["Espada", "Catalizador", "Lanza", "Mandoble"],
    correct: 2
  },
  {
    question: "¿Cuál es el nombre del árbol que conecta el conocimiento del mundo en Sumeru?",
    options: ["Irminsul", "Árbol ley", "Nexo dendro", "Raíz celestial"],
    correct: 0
  },
  {
    question: "¿Cuál es la reacción elemental entre Dendro y Hydro?",
    options: ["Florecimiento", "Quemadura", "Estimulación", "Propagación"],
    correct: 0
  },
  {
    question: "¿Qué objeto se usa para subir talentos al nivel máximo?",
    options: ["Solvente onírico", "Corona de la sabiduría", "Prototipo del norte", "Resina frágil"],
    correct: 1
  },
  {
    question: "¿Cuál es el nombre del dragón Dendro en Sumeru?",
    options: ["Apep", "Azhdaha", "Dvalin", "Durin"],
    correct: 0
  },
  {
    question: "¿Cuál es el arma característica de Raiden Shogun?",
    options: ["Relámpago envolvente", "Báculo de Homa", "Lanza alada de jade primordial", "Espina celestial"],
    correct: 0
  },
  {
    question: "¿Cómo se llaman las misiones diarias del juego?",
    options: ["Tareas del aventurero", "Comisiones diarias", "Misiones del gremio", "Encargos del viajero"],
    correct: 1
  },
  {
    question: "¿Qué elemento usa Furina?",
    options: ["Hydro", "Cryo", "Electro", "Anemo"],
    correct: 0
  },
  {
    question: "¿Cuál es el nombre del dragón corrupto creado por el Abismo en Mondstadt?",
    options: ["Durin", "Dvalin", "Apep", "Azhdaha"],
    correct: 0
  },
  {
    question: "¿Qué reacción elemental ocurre entre Pyro y Hydro?",
    options: ["Vaporizado", "Sobrecarga", "Derretido", "Congelado"],
    correct: 0
  },
  {
    question: "¿Qué organización dirige Jean en Mondstadt?",
    options: ["Caballeros de Favonius", "Qixing", "Fatui", "Adeptus"],
    correct: 0
  },
  {
    question: "¿Cuál es el elemento del personaje Xiao?",
    options: ["Geo", "Anemo", "Electro", "Cryo"],
    correct: 1
  },
  {
    question: "¿Cómo se llama la moneda principal del juego?",
    options: ["Mora", "Primo", "Resina", "Sigilo"],
    correct: 0
  },
  {
    question: "¿Qué organización secreta es antagonista en gran parte de la historia?",
    options: ["Fatui", "Caballeros de Favonius", "Adeptus", "Eruditos de Sumeru"],
    correct: 0
  }
];

let currentQuestion = 0;
let quizScore = 0;

function loadQuestion() {
  if (!quizQuestion || !quizOptions) return;
  
  const q = quizData[currentQuestion];
  quizQuestion.textContent = q.question;
  quizOptions.innerHTML = "";
  
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(index));
    quizOptions.appendChild(btn);
  });
  
  if (quizCurrent) quizCurrent.textContent = currentQuestion + 1;
  if (quizTotal) quizTotal.textContent = quizData.length;
}

function checkAnswer(selected) {
  const q = quizData[currentQuestion];
  const options = quizOptions.querySelectorAll(".quiz-option");
  
  options.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correct) {
      btn.classList.add("correct");
    } else if (index === selected && index !== q.correct) {
      btn.classList.add("wrong");
    }
  });
  
  if (selected === q.correct) {
    quizScore++;
  }
  
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
      loadQuestion();
    } else {
      showQuizResult();
    }
  }, 1500);
}

function showQuizResult() {
  if (quizContainer) quizContainer.style.display = "none";
  if (quizResult) quizResult.style.display = "block";
  if (quizReset) quizReset.style.display = "inline-block";
  
  const percentage = (quizScore / quizData.length) * 100;
  let message = "";
  
  if (percentage === 100) {
    message = "Pura suerte, hacker.";
  } else if (percentage >= 60) {
    message = "Bueno, puede ser mejor";
  } else {
    message = "Uyyy que poco lore conocesss";
  }
  
  if (quizResult) quizResult.textContent = `${message}\nPuntuación: ${quizScore}/${quizData.length}`;
}

function resetQuiz() {
  currentQuestion = 0;
  quizScore = 0;
  if (quizContainer) quizContainer.style.display = "block";
  if (quizResult) quizResult.style.display = "none";
  if (quizReset) quizReset.style.display = "none";
  loadQuestion();
}

if (quizReset) {
  quizReset.addEventListener("click", resetQuiz);
}

if (quizQuestion && quizOptions) {
  loadQuestion();
}

/* =========================================================
   JUEGO 5: CLICKER
========================================================= */
const clickerArea = document.getElementById("clickerArea");
const clickerScore = document.getElementById("clickerScore");
const clickerTime = document.getElementById("clickerTime");
const clickerStart = document.getElementById("clickerStart");
const clickerResult = document.getElementById("clickerResult");

let clickerPoints = 0;
let clickerTimeLeft = 20;
let clickerGameActive = false;
let clickerTimer = null;
let heartSpawner = null;

function startClicker() {
  clickerPoints = 0;
  clickerTimeLeft = 20;
  clickerGameActive = true;
  if (clickerScore) clickerScore.textContent = clickerPoints;
  if (clickerTime) clickerTime.textContent = clickerTimeLeft;
  if (clickerResult) clickerResult.textContent = "";
  if (clickerArea) clickerArea.innerHTML = "";
  if (clickerStart) clickerStart.style.display = "none";
  
  clickerTimer = setInterval(() => {
    clickerTimeLeft--;
    if (clickerTime) clickerTime.textContent = clickerTimeLeft;
    if (clickerTimeLeft <= 0) {
      endClicker();
    }
  }, 1000);
  
  heartSpawner = setInterval(spawnHeart, 600);
}

function spawnHeart() {
  if (!clickerGameActive || !clickerArea) return;
  
  const heart = document.createElement("div");
  heart.className = "clicker-heart";
  heart.textContent = ["💕", "💖", "💗", "💓", "💝"][Math.floor(Math.random() * 5)];
  
  const maxX = clickerArea.clientWidth - 40;
  const maxY = clickerArea.clientHeight - 40;
  
  heart.style.left = Math.random() * maxX + "px";
  heart.style.top = Math.random() * maxY + "px";
  
  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!clickerGameActive) return;
    clickerPoints++;
    if (clickerScore) clickerScore.textContent = clickerPoints;
    heart.style.transform = "scale(1.5)";
    setTimeout(() => heart.remove(), 100);
  });
  
  clickerArea.appendChild(heart);
  
  setTimeout(() => {
    if (heart.parentNode) heart.remove();
  }, 1500);
}

function endClicker() {
  clickerGameActive = false;
  clearInterval(clickerTimer);
  clearInterval(heartSpawner);
  if (clickerArea) clickerArea.innerHTML = "";
  if (clickerStart) clickerStart.style.display = "inline-block";
  
  let message = "";
  if (clickerPoints >= 20) {
    message = "Pero que pro wtf";
  } else if (clickerPoints >= 10) {
    message = "Bienn";
  } else {
    message = "Casi";
  }
  
  if (clickerResult) clickerResult.textContent = `${message} Puntos: ${clickerPoints}`;
}

if (clickerStart) {
  clickerStart.addEventListener("click", startClicker);
}

/* =========================================================
   JUEGO 6: ROMPECABEZAS
========================================================= */
const puzzleGrid = document.getElementById("puzzleGrid");
const puzzleShuffle = document.getElementById("puzzleShuffle");
const puzzleResult = document.getElementById("puzzleResult");

let puzzleState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function renderPuzzle() {
  if (!puzzleGrid) return;
  
  puzzleGrid.innerHTML = "";
  
  puzzleState.forEach((num, index) => {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";
    
    if (num === 0) {
      piece.classList.add("empty");
    } else {
      piece.textContent = num;
      if (num === index + 1) {
        piece.classList.add("correct");
      }
      piece.addEventListener("click", () => movePiece(index));
    }
    
    puzzleGrid.appendChild(piece);
  });
  
  checkPuzzleWin();
}

function movePiece(index) {
  const emptyIndex = puzzleState.indexOf(0);
  
  const row = Math.floor(index / 3);
  const col = index % 3;
  const emptyRow = Math.floor(emptyIndex / 3);
  const emptyCol = emptyIndex % 3;
  
  const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
  
  if (isAdjacent) {
    [puzzleState[index], puzzleState[emptyIndex]] = [puzzleState[emptyIndex], puzzleState[index]];
    renderPuzzle();
  }
}

function shufflePuzzle() {
  for (let i = 0; i < 100; i++) {
    const emptyIndex = puzzleState.indexOf(0);
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
    
    const moves = [];
    if (row > 0) moves.push(emptyIndex - 3);
    if (row < 2) moves.push(emptyIndex + 3);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < 2) moves.push(emptyIndex + 1);
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    [puzzleState[emptyIndex], puzzleState[randomMove]] = [puzzleState[randomMove], puzzleState[emptyIndex]];
  }
  
  if (puzzleResult) puzzleResult.textContent = "";
  renderPuzzle();
}

function checkPuzzleWin() {
  const isWin = puzzleState.every((num, index) => num === (index + 1) % 9);
  if (isWin && puzzleState[8] === 0) {
    if (puzzleResult) puzzleResult.textContent = "🎉 Completado!";
  }
}

if (puzzleShuffle) {
  puzzleShuffle.addEventListener("click", shufflePuzzle);
}

if (puzzleGrid) {
  shufflePuzzle();
}

/* =========================================================
   CARTA POPUP
========================================================= */
const openLetterBtn = document.getElementById("openLetterBtn");
const letterModal = document.getElementById("letterModal");
const closeLetter = document.getElementById("closeLetter");
const closeLetterBtn2 = document.getElementById("closeLetterBtn2");
const copyLetterBtn = document.getElementById("copyLetterBtn");
const letterContent = document.getElementById("letterContent");

function openLetter() {
  if (letterModal) {
    letterModal.classList.add("show");
    letterModal.setAttribute("aria-hidden", "false");
  }
}

function closeLetterModal() {
  if (letterModal) {
    letterModal.classList.remove("show");
    letterModal.setAttribute("aria-hidden", "true");
  }
}

async function copyLetter() {
  if (!letterContent) return;
  
  const text = letterContent.innerText;
  try {
    await navigator.clipboard.writeText(text);
    if (copyLetterBtn) {
      copyLetterBtn.textContent = "¡Copiado! ✓";
      setTimeout(() => {
        copyLetterBtn.textContent = "Copiar carta";
      }, 2000);
    }
  } catch (err) {
    if (copyLetterBtn) {
      copyLetterBtn.textContent = "No se pudo copiar";
    }
  }
}

if (openLetterBtn) {
  openLetterBtn.addEventListener("click", openLetter);
}

if (closeLetter) {
  closeLetter.addEventListener("click", closeLetterModal);
}

if (closeLetterBtn2) {
  closeLetterBtn2.addEventListener("click", closeLetterModal);
}

if (copyLetterBtn) {
  copyLetterBtn.addEventListener("click", copyLetter);
}

if (letterModal) {
  letterModal.addEventListener("click", (e) => {
    if (e.target === letterModal) closeLetterModal();
  });
}

// Inicializar juego de memoria al cargar
if (memoryGrid) {
  initMemory();
}