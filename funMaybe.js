let video, faceapi, detections = [];
let mouthX = 0, mouthY = 0;
let wordStyles = [];
let words = [
    "summer", "friend", "school", "first", "kiss", "song", "rain", "smile",
    "letter", "bike", "memory", "child", "game", "snow", "family", "walk",
    "sunset", "beach", "window", "dream", "laugh", "book", "gift", "hug",
    "secret", "night", "fire", "hope", "goodbye", "hello",
    "blanket", "warmth", "candle", "comfort", "gentle", "old", "soft",
    "nostalgia", "heartbeat", "touch", "home", "fireplace", "lantern",
    "promise", "reunion", "distance", "wish", "glow", "songbird"
];
let mouthOpen = false;
let mouthHeight = 0;

let animState = 0;
let animItems = [];
let container;

let fallingWords = [];
let collectedWords = [];
let score = 0;

let startTime;
let gameOver = false;

let eatSound;

function preload() {
    eatSound = loadSound('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('sketch-holder'); container = {
        x: width * 0.35,
        y: height * 0.6,
        w: width * 0.3,
        h: height * 0.3
    };
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    wordStyles = Array.from({ length: 20 }, () => ({
        size: random([20, 24, 28, 32, 36]),
        color: color(random(100, 255), random(100, 255), random(100, 255)),
        weight: random(["normal", "bold"])
    }));

    const options = { withLandmarks: true, withDescriptors: false };
    faceapi = ml5.faceApi(video, options, modelReady);

    startTime = millis();
}

function modelReady() {
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) return console.error(err);
    detections = result;
    faceapi.detect(gotResults);
}

function draw() {
    if (!gameOver) {
        background(0);
        push();
        translate(width, 0);
        scale(-1, 1);
        image(video, 0, 0, width, height);
        pop();

        drawMouthMirrored();
        updateWords();
        drawScore();
        drawEatenWords();

        if (millis() - startTime >= 30000) {
            gameOver = true;
        }
    } else {
        if (animState === 0) {
            setupAnim();
            animState = 1;
        }
        background(240);
        updateAnim();
        if (animState === 2) {
            drawArtScreen();
        }
    }
}

function drawMouthMirrored() {
    if (detections.length > 0 && detections[0].landmarks) {
        const mouth = detections[0].landmarks.getMouth();
        const upperLip = mouth[3];
        const lowerLip = mouth[9];
        let rawX = (upperLip._x + lowerLip._x) / 2;
        let rawY = (upperLip._y + lowerLip._y) / 2;
        let mirroredX = width - rawX;
        mouthHeight = lowerLip._y - upperLip._y;
        mouthOpen = mouthHeight > 15;
        fill(mouthOpen ? color(0, 255, 0, 200) : color(255, 0, 0, 200));
        noStroke();
        ellipse(mirroredX, rawY, 20, 20);
        mouthX = mirroredX;
        mouthY = rawY;
    }
}

function updateWords() {
    if (frameCount % 20 === 0 && words.length > 0 && fallingWords.length < 100) {
        const word = words.shift();
        const style = random(wordStyles);
        fallingWords.push({ x: random(100, width - 100), y: 0, text: word, style });
    }
    for (let i = fallingWords.length - 1; i >= 0; i--) {
        let w = fallingWords[i];
        fill(w.style.color);
        textSize(w.style.size);
        textStyle(w.style.weight);
        textAlign(CENTER);
        text(w.text, w.x, w.y);
        w.y += 3;
        if (dist(w.x, w.y, mouthX, mouthY) < 30 && mouthOpen) {
            collectedWords.push(w.text);
            fallingWords.splice(i, 1);
            score++;
            eatSound.play();
        }
    }
}

function drawScore() {
    const timeLeft = Math.ceil((30000 - (millis() - startTime)) / 1000);
    fill(0, 0, 0, 180);
    noStroke();
    rect(10, 10, 120, 36, 8);
    fill(255, 220, 0);
    textSize(18);
    textAlign(LEFT, CENTER);
    text(`⏱ ${timeLeft}s`, 22, 28);
    fill(0, 0, 0, 180);
    rect(142, 10, 100, 36, 8);
    fill(0, 200, 255);
    text(`⭐ ${score}`, 154, 28);
}

function drawEatenWords() {
    const listX = windowWidth-150;
    const listY = 30;
    fill(0, 0, 0, 180);
    noStroke();
    rect(listX, listY - 20, 130, 260, 10);
    fill(255);
    textSize(14);
    textAlign(LEFT);
    text("🍽 Ate:", listX, listY);
    textSize(12);
    for (let i = 0; i < min(collectedWords.length, 12); i++) {
        text(collectedWords[i], listX, listY + 20 + i * 20);
    }
}

function setupAnim() {
    animItems = collectedWords.map(w => {
        let col = random([color(228, 26, 28), color(55, 126, 184), color(77, 175, 74), color(152, 78, 163), color(255, 127, 0)]);
        let sz = random(24, 48);
        return {
            text: w,
            x: random(container.x, container.x + container.w),
            y: -random(50, 200),
            targetY: random(container.y + 20, container.y + container.h - 20),
            speed: random(2, 6),
            col,
            size: sz,
            ang: random(-PI / 6, PI / 6)
        };
    });
}

function updateAnim() {
    let done = true;
    for (let it of animItems) {
        if (it.y < it.targetY) {
            it.y += it.speed;
            done = false;
        }
        push();
        translate(it.x, it.y);
        rotate(it.ang);
        fill(it.col);
        textSize(it.size);
        textAlign(CENTER, CENTER);
        text(it.text, 0, 0);
        pop();
    }
    if (done) animState = 2;
}
function drawArtScreen() {
    background(240);
    textAlign(CENTER, CENTER);
    textFont('Georgia');
    textSize(48);
    fill(0);
    text('🍽 Memories You Caught', width / 2, height * 0.1);
    textSize(24);
    text('Every word is a piece of your memory.', width / 2, height * 0.17);

    if (collectedWords.length >= 3) {
        let [m1, m2, m3] = collectedWords;
        let sentence = `You remember a ${m1} afternoon, a ${m2} in the air, and a ${m3} smiling next to you.`;
        fill(50);
        textSize(40);
        text(sentence, width / 2, height / 2);
    }

    drawReturnButton(); // 버튼 호출
}
function drawReturnButton() {
    const btnW = 160;
    const btnH = 45;
    const x = width / 2 - btnW / 2;
    const y = height - 60;

    fill(255);
    stroke(180);
    strokeWeight(1.5);
    rect(x, y, btnW, btnH, 10);

    noStroke();
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("← 돌아가기", width / 2, y + btnH / 2);

    if (mouseIsPressed &&
        mouseX > x && mouseX < x + btnW &&
        mouseY > y && mouseY < y + btnH) {
        window.location.href = "index.html";
    }
}
