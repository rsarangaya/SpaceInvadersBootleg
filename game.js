const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = 400;
const HEIGHT = 450;

// Game state
let state = "start"; // start, playing, gameover, victory
let level = 1;

// Player
let player = { x: 180, y: 390, w: 30, h: 20, speed: 0 };
let sunRotation = 0;
let lasers = [];

// Invaders
let invaders = [];
let invaderDX = 0.8; 
let invaderDY = 10;
const INVADER_ROWS = 5;
const INVADER_COLS = 8;
const INVADER_RADIUS = 8;

function initInvaders() {
  invaders = [];
  for (let row = 0; row < INVADER_ROWS; row++) {
    for (let col = 0; col < INVADER_COLS; col++) {
      invaders.push({
        x: 40 + col * 40,
        y: 60 + row * 35,
        r: INVADER_RADIUS
      });
    }
  }
}

initInvaders();

// Controls
document.addEventListener("keydown", (e) => {
  if (state === "start" && e.key === "Enter") {
    state = "playing";
  } else if (state === "gameover" || state === "victory") {
    if (e.key === "r") {
        level = 1;
        resetGame();
    }
    if (e.key === "e") state = "start";
  } else if (state === "playing") {
    if (e.key === "ArrowLeft") player.speed = -5;
    if (e.key === "ArrowRight") player.speed = 5;
    if (e.key === " ") {
      lasers.push({
        x: player.x + player.w / 2,
        y: player.y,
        w: 3,
        h: 8,
        speed: -8
      });
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (state === "playing") {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.speed = 0;
  }
});

function hit(a, b) {
  return (
    a.x < b.x + b.r &&
    a.x + a.w > b.x - b.r &&
    a.y < b.y + b.r &&
    a.y + a.h > b.y - b.r
  );
}

function resetGame() {
  player.x = 180;
  player.y = 390;
  lasers = [];
  player.speed = 0;
  // Increase speed based on level
  invaderDX = (0.8 + (level - 1) * 0.6) * (invaderDX < 0 ? -1 : 1);
  invaderDY = 10 + (level - 1) * 3;
  initInvaders();
  state = "playing";
}

function drawPlayer() {
  let cx = player.x + player.w / 2;
  let cy = player.y + player.h / 2;

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(cx, player.y);
  ctx.lineTo(player.x, player.y + player.h);
  ctx.lineTo(player.x + player.w, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x + 2, player.y + 2, 10, 10);

  ctx.save();
  ctx.translate(player.x + 7, player.y + 7);
  ctx.rotate(sunRotation);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    let angle = (i * Math.PI) / 6;
    let x1 = Math.cos(angle) * 3;
    let y1 = Math.sin(angle) * 3;
    let x2 = Math.cos(angle + Math.PI / 12) * 1.5;
    let y2 = Math.sin(angle + Math.PI / 12) * 1.5;
    ctx.moveTo(0, 0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.fill();
  ctx.restore();
  sunRotation += 0.05;

  ctx.fillStyle = "gray";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y + player.h);
  ctx.lineTo(player.x - 4, player.y + player.h + 8);
  ctx.lineTo(player.x + 8, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(player.x + player.w, player.y + player.h);
  ctx.lineTo(player.x + player.w + 4, player.y + player.h + 8);
  ctx.lineTo(player.x + player.w - 8, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(cx - 4, player.y + player.h);
  ctx.lineTo(cx + 4, player.y + player.h);
  ctx.lineTo(cx, player.y + player.h + 8);
  ctx.closePath();
  ctx.fill();
}

function drawInvader(inv) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(inv.x, inv.y, inv.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(inv.x, inv.y - 3);
  for (let i = 1; i <= 5; i++) {
    let angle = i * (Math.PI * 2) / 5 - Math.PI / 2;
    let x = inv.x + Math.cos(angle) * 1.5;
    let y = inv.y + Math.sin(angle) * 1.5;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function update() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (state === "start") {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "28px Arial";
    ctx.fillText("SPACE INVADERS", WIDTH/2, 150);
    ctx.font = "18px Arial";
    ctx.fillText("Press ENTER to Start", WIDTH/2, 250);
  }

  if (state === "playing") {
    player.x += player.speed;
    player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));

    for (let i = lasers.length - 1; i >= 0; i--) {
      let laser = lasers[i];
      laser.y += laser.speed;
      if (laser.y + laser.h < 0) {
        lasers.splice(i, 1);
        continue;
      }
      for (let j = 0; j < invaders.length; j++) {
        if (hit(laser, invaders[j])) {
          invaders.splice(j, 1);
          lasers.splice(i, 1);
          break;
        }
      }
    }

    let hitEdge = false;
    for (let inv of invaders) {
      inv.x += invaderDX;
      if (inv.x > WIDTH - INVADER_RADIUS || inv.x < INVADER_RADIUS) hitEdge = true;
      if (inv.y + inv.r >= HEIGHT) state = "gameover";
    }

    if (hitEdge) {
      invaderDX *= -1;
      for (let inv of invaders) inv.y += invaderDY;
    }

    // Progression Logic
    if (invaders.length === 0) {
        if (level < 3) {
            level++;
            resetGame();
        } else {
            state = "victory";
        }
    }

    for (let inv of invaders) {
      if (hit(player, inv)) state = "gameover";
    }

    drawPlayer();
    ctx.fillStyle = "lime";
    for (let laser of lasers) ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
    for (let inv of invaders) drawInvader(inv);
    
    // Level display
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Level: " + level, 10, 20);
  }

  if (state === "gameover") {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "28px Arial";
    ctx.fillText("You Tai-lost.", WIDTH/2, 200);
    ctx.font = "18px Arial";
    ctx.fillText("You are now part of China", WIDTH/2, 230);
    ctx.fillText("Press R to Restart", WIDTH/2, 260);
    ctx.fillText("Press E to Exit", WIDTH/2, 280);
  }

  if (state === "victory") {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "28px Arial";
    ctx.fillText("YOU TAI-WON", WIDTH/2, 200);
    ctx.font = "18px Arial";
    ctx.fillText("All 3 waves cleared!", WIDTH/2, 230);
    ctx.fillText("Press R to Restart", WIDTH/2, 260);
    ctx.fillText("Press E to Exit", WIDTH/2, 280);
  }

  requestAnimationFrame(update);
}

update();