const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let numPlayers = 2;
let player1Name = "Player 1";
let player2Name = "Player 2";
let player1PaddleColor = "#00ff00";
let player2PaddleColor = "#ff0000";
let paused = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const backgroundMusic = new Audio('audio/background_music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;
backgroundMusic.preload = "auto";
backgroundMusic.play();

const collisionSound = new Audio('audio/collision_sound.wav');
const pointSound = new Audio('audio/slow.wav');
const pausedSound = new Audio('audio/pause.wav')

const ballRadius = 10;
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 6.5,
  dy: -6.5
};

// adjust the paddle height and width
const paddleHeightPercentage = 9;
const paddleWidthPercentage = .8;
const paddleHeight = canvas.height*(paddleHeightPercentage / 100);
const paddleWidth = canvas.width*(paddleWidthPercentage / 100);
const paddleSpeed = 10;
let paddleA = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  score: 0
};
let paddleB = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  score: 0
};

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.closePath();
}

function drawPaddle(x, y, color) {
  ctx.beginPath();
  ctx.rect(x, y, paddleWidth, paddleHeight);
  ctx.fillStyle = color;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.closePath();
}

function drawNet() {
  ctx.beginPath();
  ctx.setLineDash([7, 15]);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'white';
  ctx.stroke();
  ctx.closePath();
}

function updateObjects() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ballRadius < 0 || ball.y + ballRadius > canvas.height) {
    ball.dy = -ball.dy;
  }

  if (ball.dx < 0 && ball.x - ballRadius <= paddleA.x + paddleWidth &&
      ball.y + ballRadius >= paddleA.y &&
      ball.y - ballRadius <= paddleA.y + paddleHeight) {
    ball.dx = -ball.dx;
    ball.x = paddleA.x + paddleWidth + ballRadius;
    collisionSound.play();
  }
  if (ball.dx > 0 && ball.x + ballRadius >= paddleB.x &&
      ball.y + ballRadius >= paddleB.y &&
      ball.y - ballRadius <= paddleB.y + paddleHeight) {
    ball.dx = -ball.dx;
    ball.x = paddleB.x - ballRadius;
    collisionSound.play();
  }
  
  if (ball.x - ballRadius < 0) {
    paddleB.score++;
    pointSound.play();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
  } else if (ball.x + ballRadius > canvas.width) {
    paddleA.score++;
    pointSound.play();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
  }

  if (numPlayers === 1) {
    movePaddleBWithAI();
  }
  paddleA.y += paddleA.dy;
  paddleB.y += paddleB.dy;

  if (paddleA.y < 0) {
    paddleA.y = 0;
  }
  if (paddleA.y + paddleHeight > canvas.height) {
    paddleA.y = canvas.height - paddleHeight;
  }
  if (paddleB.y < 0) {
    paddleB.y = 0;
  }
  if (paddleB.y + paddleHeight > canvas.height) {
    paddleB.y = canvas.height - paddleHeight;
  }
}

function drawScore() {
  ctx.font = "40px Arial";
  ctx.fillStyle = "white";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  
  // Calculate the width of the text for player 1
  var player1ScoreWidth = ctx.measureText(player1Name + ": " + paddleA.score).width;

  // Set the x-coordinate for the score for player 1
  var player1ScoreX = canvas.width/4 - player1ScoreWidth/2;
  
  // Draw the text for player 1
  ctx.fillText(player1Name + ": " + paddleA.score, player1ScoreX, 50);

  // Calculate the width of the text for player 2
  var player2ScoreWidth = ctx.measureText(player2Name + ": " + paddleB.score).width;

  // Set the x-coordinate for the score for player 2
  var player2ScoreX = canvas.width - canvas.width/4 - player2ScoreWidth/2;

  // Draw the text for player 2
  ctx.fillText(player2Name + ": " + paddleB.score, player2ScoreX, 50);

  // Reset the shadow properties
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (paused) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "white";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText("Paused", canvas.width/2-100, canvas.height/2);  
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    requestAnimationFrame(drawFrame);
    return;
  }
  // rest of the code for drawing the game
  drawNet();
  drawPaddle(paddleA.x, paddleA.y, player1PaddleColor);
  drawPaddle(paddleB.x, paddleB.y, player2PaddleColor);
  drawBall();
  drawScore();

  updateObjects();
  requestAnimationFrame(drawFrame);
}

function handleKeyDown(event) {
  switch (event.code) {
    case 'KeyW':
      paddleA.dy = -paddleSpeed;
      break;
    case 'KeyS':
      paddleA.dy = paddleSpeed;
      break;
    case 'ArrowUp':
      if (numPlayers === 2) {
        paddleB.dy = -paddleSpeed;
      } else {
        paddleA.dy = -paddleSpeed;
      }
      break;
    case 'ArrowDown':
      if (numPlayers === 2) {
        paddleB.dy = paddleSpeed;
      } else {
        paddleA.dy = paddleSpeed;
      }
      break;
    case 'Space':
      paused = !paused;
      pausedSound.play();
      break;
  }
}

function handleKeyUp(event) {
  switch (event.code) {
    case 'KeyW':
      paddleA.dy = 0;
      break;
    case 'KeyS':
      paddleA.dy = 0;
      break;
    case 'ArrowUp':
      if (numPlayers === 2) {
        paddleB.dy = 0;
      } else {
        paddleA.dy = 0;
      }
      break;
    case 'ArrowDown':
      if (numPlayers === 2) {
        paddleB.dy = 0;
      } else {
        paddleA.dy = 0;
      }
      break;
  }
}

function movePaddleBWithAI() {
  if (ball.dx > 0) {
    let randomness = ball.y * 0.12; // add some randomness
    let targetY = ball.y + Math.random() * 2 * randomness - randomness;
    if (targetY > paddleB.y + paddleHeight / 2) {
      paddleB.dy = paddleSpeed/1.6;
    } else if (targetY < paddleB.y + paddleHeight / 2) {
      paddleB.dy = -paddleSpeed/1.6;
    } else {
      paddleB.dy = 0;
    }
  } else {
    paddleB.dy = 0;
  }
}

function handlePlayer2ColorChange(event) {
  player2PaddleColor = event.target.value;
}

document.getElementById("start-game").addEventListener("click", function() {
  numPlayers = parseInt(document.getElementById("num-players").value);
  player1Name = document.getElementById("player1-name").value || "Player 1";
  player1PaddleColor = document.getElementById("player1-color").value;
  player2Name = document.getElementById("player2-name").value || "Player 2";
  player2PaddleColor = document.getElementById("player2-color").value;
  document.getElementById("menu").style.display = "none";
  requestAnimationFrame(drawFrame);
});

document.getElementById("player2-color").addEventListener("input", handlePlayer2ColorChange);

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);