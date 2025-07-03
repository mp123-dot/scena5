// -------------------------------------------------------------
//                   KONFIGURACJA
// -------------------------------------------------------------
const OPCJE = [
  { txt: "Chciałabym awansować",        ok: false },
  { txt: "Chciałabym dostać podwyżkę",  ok: false },
  { txt: "Już czas na urlop macierzyński", ok: true }
];

const BORDER_COL   = '#e1a4e9';
const FILL_COL     = '#f3e8ff';
const BTN_W        = 300;
const BTN_H        = 60;
const BTN_RADIUS   = 30;
const BTN_GAP      = 20;

// ---------------- KOREKTY UKŁADU -----------------------------
// mniejsza wartość = przyciski wyżej względem środka
const BUTTON_Y_OFFSET = 20;   // px
// odstęp pomiędzy listą a komunikatem zwrotnym
const TEXT_Y_OFFSET   = 30;   // px
//--------------------------------------------------------------

const BTN_DIAMETER = 90;
const HOVER_SCALE  = 1.05;

let scene = 4;
let selectedIndex = -1;
let feedbackMessage = '';
let tloKolor, rawDalejImg, dalejImg, flowerMouse, font, clickSound;
let glitterParticles = [];

// -------------------------------------------------------------
//                         PRELOAD
// -------------------------------------------------------------
function preload() {
  tloKolor    = loadImage('t.awans.png');
  rawDalejImg = loadImage('PrzyciskDALEJ.png');
  flowerMouse = loadImage('flowerMouse.png');
  font        = loadFont('futura.ttf');
  clickSound  = loadSound('glimmer.wav');
}

// -------------------------------------------------------------
//                          SETUP
// -------------------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont(font);
  noCursor();

  // maska przycisku "DALEJ" (koło)
  const s = min(rawDalejImg.width, rawDalejImg.height);
  dalejImg = createImage(s, s);
  rawDalejImg.loadPixels();
  dalejImg.copy(
    rawDalejImg,
    (rawDalejImg.width  - s) / 2,
    (rawDalejImg.height - s) / 2,
    s, s,
    0, 0, s, s
  );
  const maskG = createGraphics(s, s);
  maskG.noStroke(); maskG.fill(255);
  maskG.circle(s/2, s/2, s);
  dalejImg.mask(maskG);
}

// -------------------------------------------------------------
//                          DRAW
// -------------------------------------------------------------
function draw() {
  background(255);
  image(tloKolor, 0, 0, width, height);

  if (scene === 4) drawScene4();

  // animacja drobinek
  for (let i = glitterParticles.length - 1; i >= 0; i--) {
    glitterParticles[i].update();
    glitterParticles[i].show();
    if (glitterParticles[i].finished()) glitterParticles.splice(i, 1);
  }

  // kursor – kwiatek
  if (flowerMouse) {
    imageMode(CENTER);
    image(flowerMouse, mouseX, mouseY, 32, 32);
    imageMode(CORNER);
  }
}

// -------------------------------------------------------------
//                     SCENA 4: OPCJE
// -------------------------------------------------------------
function drawScene4() {
  // 1. Obliczenia układu przycisków
  const totalHeight = OPCJE.length * BTN_H + (OPCJE.length - 1) * BTN_GAP;
  const startY      = height / 2 - totalHeight / 2 + BUTTON_Y_OFFSET; // górny przycisk
  const bottomY     = startY + totalHeight; // dolny brzeg listy


  // 3. Przyciski
  drawOptions(startY);

  // 4. Komunikat zwrotny
  if (feedbackMessage) {
    fill(feedbackMessage.ok ? '#2e7d32' : '#d32f2f');
    textSize(20);
    text(feedbackMessage.msg, width/2, bottomY + TEXT_Y_OFFSET);
  }

  // 5. Przycisk DALEJ (po wybraniu 3. opcji)
  if (selectedIndex === 2) {
    drawDalejButton(width/2, height - 40);
  }
}

// -------------------------------------------------------------
//                     OPCJE (PRZYCISKI)
// -------------------------------------------------------------
function drawOptions(startY) {
  for (let i = 0; i < OPCJE.length; i++) {
    const x = width / 2;
    const y = startY + i * (BTN_H + BTN_GAP);

    const over = (
      mouseX > x - BTN_W/2 && mouseX < x + BTN_W/2 &&
      mouseY > y - BTN_H/2 && mouseY < y + BTN_H/2
    );

    stroke(BORDER_COL); strokeWeight(2);
    fill(i === selectedIndex ? FILL_COL : 'transparent');
    rectMode(CENTER);
    rect(x, y, BTN_W * (over ? HOVER_SCALE : 1), BTN_H * (over ? HOVER_SCALE : 1), BTN_RADIUS);

    noStroke();
    fill('#000');
    textSize(20);
    text(OPCJE[i].txt, x, y);
  }
}

// -------------------------------------------------------------
//                     PRZYCISK DALEJ (KOŁO)
// -------------------------------------------------------------
function drawDalejButton(x, y) {
  const r = BTN_DIAMETER / 2;
  const over = dist(mouseX, mouseY, x, y) < r;
  const size = over ? BTN_DIAMETER * HOVER_SCALE : BTN_DIAMETER;

  imageMode(CENTER);
  image(dalejImg, x, y, size, size);
  imageMode(CORNER);
}

// -------------------------------------------------------------
//                     OBSŁUGA KLIKNIĘĆ
// -------------------------------------------------------------
function mousePressed() {
  for (let i = 0; i < 18; i++) glitterParticles.push(new Glitter(mouseX, mouseY));

  if (scene === 4) {
    const totalHeight = OPCJE.length * BTN_H + (OPCJE.length - 1) * BTN_GAP;
    const startY = height / 2 - totalHeight / 2 + BUTTON_Y_OFFSET;

    // klik w opcję
    for (let i = 0; i < OPCJE.length; i++) {
      const x = width/2;
      const y = startY + i * (BTN_H + BTN_GAP);
      if (
        mouseX > x - BTN_W/2 && mouseX < x + BTN_W/2 &&
        mouseY > y - BTN_H/2 && mouseY < y + BTN_H/2
      ) {
        selectedIndex = i;
        if (clickSound && clickSound.isLoaded()) clickSound.play();
        feedbackMessage = OPCJE[i].ok
          ? {msg: 'Pewnie chcesz 800+', ok: true}
          : {msg: 'A nie wolisz dziecka? Zegar tyka...', ok: false};
        return;
      }
    }

   // klik w przycisk DALEJ
    if (selectedIndex === 2) {
      const x = width/2;
      const y = height - 40;
      const r = BTN_DIAMETER / 2;
      if (dist(mouseX, mouseY, x, y) < r) {
        if (clickSound && clickSound.isLoaded()) clickSound.play();
        // Przeniesienie do scena6
        window.location.href = "https://mp123-dot.github.io/scena6/";
        return;
      }
    }
  }
}

// -------------------------------------------------------------
//                        KLASA GLITTER
// -------------------------------------------------------------
class Glitter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle   = random(TWO_PI);
    this.life    = 0;
    this.maxLife = random(20, 40);
    this.size    = random(3, 7);
    this.color   = color(
      random(180, 255),
      random(120, 200),
      random(200, 255),
      200
    );
  }

  update() {
    this.life++;
    this.x += cos(this.angle) * 1.5;
    this.y += sin(this.angle) * 1.5;
  }

  finished() {
    return this.life > this.maxLife;
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
}

// -------------------------------------------------------------
//                     RESPONSYWNOŚĆ
// -------------------------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}