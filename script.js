const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const backgroundMusic = new Audio('audio/background_music.wav');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;
backgroundMusic.play();

const collisionSound = new Audio('audio/collision_sound.wav');
const pointSound = new Audio('audio/slow.wav');

const ballRadius = 10;
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 5,
  dy: -5
};

const paddleHeight = 60;
const paddleWidth = 10;
const paddleSpeed = 10;
let paddleA = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  score: 0
};
let paddleB = {
  x: canvas.width - 20,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
  score: 0
};

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(x, y) {
  ctx.beginPath();
  ctx.rect(x, y, paddleWidth, paddleHeight);
  ctx.fillStyle = 'limegreen';
  ctx.fill();
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
  // update ball position
  ball.x += ball.dx;
  ball.y += ball.dy;

  // detect collisions with walls
  if (ball.y - ballRadius < 0 || ball.y + ballRadius > canvas.height) {
    ball.dy = -ball.dy;

  }

  // detect collisions with paddles
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
  
  // update paddle scores and reset ball
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

  // update paddle positions
  paddleA.y += paddleA.dy;
  paddleB.y += paddleB.dy;

  // restrict paddle positions to canvas boundaries
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
  ctx.fillText(paddleA.score, 200, 50);
  ctx.fillText(paddleB.score, canvas.width - 200, 50);
}

function drawFrame() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw objects
  drawNet();
  drawPaddle(paddleA.x, paddleA.y);
  drawPaddle(paddleB.x, paddleB.y);
  drawBall();
  drawScore();

  // update object positions
  updateObjects();

  // request next frame
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
      paddleB.dy = -paddleSpeed;
      break;
    case 'ArrowDown':
      paddleB.dy = paddleSpeed;
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
      paddleB.dy = 0;
      break;
    case 'ArrowDown':
      paddleB.dy = 0;
      break;
  }
}

// add event listeners
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// start the game loop
requestAnimationFrame(drawFrame);