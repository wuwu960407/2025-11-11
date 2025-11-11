let menuVisible = false;
let menuItems = ["主頁", "測驗", "筆記", "作業", "教育科技系"];
let currentPage = "主頁";
let questions = [];
let allQuestions = [];
let currentQuestion = 0;
let selectedAnswer = null;
let score = 0;
let quizFinished = false;
let answers = []; // 記錄每題的答案
let circles = [];

const BASE_W = 400;
const BASE_H = 400;
let uiScale = 1;

// 新增主頁背景所需變數（使用比例座標以填滿整個視窗）
let homeStars = [];
let homeNoiseOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  computeScale();
  loadQuestions();
  initCircles();
  initHomeBackground(); // 初始化主頁背景
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeScale();
  initHomeBackground(); // 窗口變更時重建背景元素
}

function computeScale() {
  uiScale = min(width / BASE_W, height / BASE_H);
}

function draw() {
  // 使用縮放後的滑鼠座標判斷是否顯示菜單（基準 UI 判斷）
  let mx = mouseX / uiScale;
  if (mx < 80) {
    menuVisible = true;
  } else {
    menuVisible = false;
  }

  // 清除整個畫布（真實像素）
  background(220);

  // 如果是主頁，先繪製「全畫面」動態背景（不使用基準縮放）
  if (currentPage === "主頁") {
    drawHomeBackgroundFull();
    drawHomeUIFull();
    // 主頁上也要顯示隱藏式菜單（以基準座標繪製在左上角）
    if (menuVisible) {
      push();
      scale(uiScale);
      drawMenu();
      pop();
    }
    return;
  }

  // 如果是作業頁面，也用全畫面模式（與主頁同樣放大）
  if (currentPage === "作業") {
    drawHomeworkFull();
    // 作業頁面也顯示隱藏式菜單（以基準座標繪製）
    if (menuVisible) {
      push();
      scale(uiScale);
      drawMenu();
      pop();
    }
    return;
  }

  // 其他頁面使用既有基準縮放系統
  push();
  scale(uiScale);

  // 畫布背景區域（讓各頁可以用自己的背景色）
  fill(220);
  noStroke();
  rect(0, 0, BASE_W, BASE_H);

  if (currentPage === "測驗") {
    if (quizFinished) {
      drawScorePage();
    } else {
      drawQuizPage();
    }
  } else if (currentPage === "主頁") {
    drawHomePage(); // 如有需要（保留）
  } else if (currentPage === "教育科技系") {
    drawEducationPage();
  }

  // 畫出隱藏式菜單（基準座標）
  if (menuVisible) {
    drawMenu();
  }

  pop();
}

/////////////////////////
// 主頁：全畫面動態背景
/////////////////////////
function initHomeBackground() {
  homeStars = [];
  let count = 120; // 星星數量（可調）
  for (let i = 0; i < count; i++) {
    homeStars.push({
      xr: random(), // x 比例 0..1
      yr: random(), // y 比例 0..1
      sizeR: random(0.002, 0.01), // 相對於最小邊長的大小比例
      baseAlpha: random(60, 240),
      twinkleSpeed: random(0.01, 0.06),
      vyNorm: random(0.0005, 0.0025), // 每幀上移的比例（相對於高度）
      hueOffset: random(1000)
    });
  }
  homeNoiseOffset = random(1000);
}

function drawHomeBackgroundFull() {
  // 使用真實畫布大小繪製背景（填滿整個視窗）
  let W = width;
  let H = height;
  // 漸層背景
  noStroke();
  for (let y = 0; y < H; y += 6) {
    let t = y / H;
    let n = sin((frameCount * 0.006) + t * 6 + homeNoiseOffset) * 0.04;
    // 深藜到淺藍
    let c1 = color(12, 44, 120);
    let c2 = color(120, 190, 255);
    let col = lerpColor(c1, c2, constrain(t + n, 0, 1));
    fill(col);
    rect(0, y, W, 6);
  }

  // 星星與光帶（使用加法混色）
  push();
  blendMode(ADD);
  for (let s of homeStars) {
    let sx = s.xr * W;
    let sy = s.yr * H;
    let size = s.sizeR * min(W, H);
    let a = s.baseAlpha + sin(frameCount * s.twinkleSpeed + s.hueOffset) * 80;
    a = constrain(a, 20, 255);
    fill(255, 230, 200, a * 0.9);
    noStroke();
    ellipse(sx, sy, size, size);
    fill(200, 220, 255, a * 0.12);
    ellipse(sx, sy, size * 6, size * 6);

    // 更新位置（比例）
    s.yr -= s.vyNorm;
    if (s.yr < -0.02) {
      s.yr = 1.02;
      s.xr = random();
      s.sizeR = random(0.002, 0.01);
      s.vyNorm = random(0.0005, 0.0025);
    }
  }

  // 流動光帶
  let bandCount = 3;
  for (let i = 0; i < bandCount; i++) {
    let offset = sin((frameCount * 0.008) + i * 1.3 + homeNoiseOffset) * (W * 0.08);
    fill(120, 200, 255, 30);
    noStroke();
    ellipse(W * 0.5 + offset, H * (0.18 + i * 0.26), W * 1.4, H * 0.6);
  }
  pop();

  // 漸進偏移量
  homeNoiseOffset += 0.002;
}

// 主頁上疊 UI（全文寬置中文字）
function drawHomeUIFull() {
  let W = width;
  let H = height;
  push();
  // 文字外觀
  textAlign(CENTER, CENTER);
  stroke(0, 90);
  strokeWeight(1.2);
  fill(255);
  textSize(min(W, H) * 0.07); // 隨畫面縮放文字
  text("主頁", W / 2, H * 0.12);

  noStroke();
  fill(255);
  textSize(min(W, H) * 0.05);
  text("414730696吳盛偉", W / 2, H / 2);
  pop();
}

/////////////////////////
// 其餘既有函式（不變）
/////////////////////////
function drawHomePage() {
  // 保留以防在基準縮放情況下需要（通常不會使用）
  drawHomeBackground();
  fill(255, 240);
  stroke(0, 80);
  strokeWeight(1);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("主頁", BASE_W / 2, 70);

  noStroke();
  textSize(20);
  text("414730696吳盛偉", BASE_W / 2, BASE_H / 2 + 10);
}

function drawQuizPage() {
  fill(0);
  textSize(20);
  textAlign(CENTER, TOP);
  
  if (questions.length === 0) {
    text("題目載入中...", 200, 50);
    return;
  }
  
  let q = questions[currentQuestion];
  
  // 顯示題目進度
  text("第 " + (currentQuestion + 1) + " / " + questions.length + " 題", 200, 20);
  
  // 顯示題目
  textSize(16);
  text(q.題目, 220, 80, 160, 100);
  
  // 顯示選項
  textSize(14);
  textAlign(LEFT, CENTER);
  let options = [q.選項A, q.選項B, q.選項C, q.選項D];
  let labels = ["A", "B", "C", "D"];
  
  for (let i = 0; i < 4; i++) {
    fill(selectedAnswer === i ? 100 : 200);
    rect(150, 200 + i * 40, 150, 35);
    fill(0);
    text(labels[i] + ". " + options[i], 160, 217 + i * 40);
  }
  
  // 上一題按鈕
  fill(150);
  rect(150, 360, 70, 30);
  fill(0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("上一題", 185, 375);
  
  // 下一題按鈕
  fill(150);
  rect(230, 360, 70, 30);
  fill(0);
  text("下一題", 265, 375);
}

function drawScorePage() {
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("測驗結束", 200, 60);
  
  // 計算得分
  let correctCount = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] !== null && answers[i] + 1 === parseInt(questions[i].答案)) {
      correctCount++;
    }
  }
  
  let percentage = Math.round((correctCount / questions.length) * 100);
  
  // 顯示成績
  textSize(24);
  text("得分：" + correctCount + " / " + questions.length, 200, 150);
  
  textSize(20);
  text("百分比：" + percentage + "%", 200, 200);
  
  // 評語
  textSize(16);
  let feedback = "";
  if (percentage >= 90) {
    feedback = "優秀！";
  } else if (percentage >= 80) {
    feedback = "很好！";
  } else if (percentage >= 70) {
    feedback = "不錯！";
  } else if (percentage >= 60) {
    feedback = "及格！";
  } else {
    feedback = "需要加強！";
  }
  text(feedback, 200, 250);
  
  // 返回主頁按鈕
  fill(100);
  rect(150, 310, 100, 40);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("返回主頁", 200, 330);
}

// 新增：作業分頁全畫面渲染（使用 uiScale 映射 base 座標到全畫面）
function drawHomeworkFull() {
  let W = width;
  let H = height;
  // 背景填滿整個畫面
  noStroke();
  fill('#bde0fe');
  rect(0, 0, W, H);

  // 更新並繪製每個圓（以 base 座標為來源，顯示時乘以 uiScale）
  for (let c of circles) {
    // 檢查是否到達爆破位置（使用 base 座標判斷）
    if (!c.exploding && dist(c.x, c.y, c.explodeX, c.explodeY) < c.d * 1.2) {
      c.exploding = true;
      c.explodeFrame = 0;
    }

    // 計算畫面座標與尺寸
    let sx = c.x * uiScale;
    let sy = c.y * uiScale;
    let sd = c.d * uiScale;

    if (c.exploding) {
      // 爆破動畫（以畫面座標繪製）
      noStroke();
      fill(c.color[0], c.color[1], c.color[2], c.alpha);
      ellipse(sx, sy, sd, sd);
      push();
      for (let i = 0; i < 24; i++) {
        let angle = TWO_PI * i / 24;
        let r = sd * 0.7 + c.explodeFrame * 3 * uiScale;
        let ex = sx + cos(angle) * r;
        let ey = sy + sin(angle) * r;
        fill(255, 255, 80, 220 - c.explodeFrame * 10);
        ellipse(ex, ey, sd * 0.22 + c.explodeFrame * 0.2 * uiScale);
      }
      pop();
      c.explodeFrame++;
      if (c.explodeFrame > 16) {
        // 爆破結束，重設圓到下方（重置 base 座標）
        c.y = BASE_H + c.d / 2;
        c.x = random(BASE_W);
        c.d = random(30, 120);
        c.alpha = random(50, 255);
        c.vy = random(-1, -3);
        c.color = [random(255), random(255), random(255)];
        c.explodeX = random(BASE_W);
        c.explodeY = random(BASE_H * 0.2, BASE_H * 0.8);
        c.exploding = false;
        c.explodeFrame = 0;
      }
    } else {
      // 非爆破狀態更新 base y（保持原本邏輯）
      c.y += c.vy;
      if (c.y + c.d / 2 < 0) {
        c.y = BASE_H + c.d / 2;
        c.x = random(BASE_W);
        c.d = random(30, 120);
        c.alpha = random(50, 255);
        c.vy = random(-1, -3);
        c.color = [random(255), random(255), random(255)];
        c.explodeX = random(BASE_W);
        c.explodeY = random(BASE_H * 0.2, BASE_H * 0.8);
        c.exploding = false;
        c.explodeFrame = 0;
      }
    }

    // 實際繪製（非爆破時有星星）
    if (!c.exploding) {
      noStroke();
      fill(c.color[0], c.color[1], c.color[2], c.alpha);
      ellipse(sx, sy, sd, sd);
      // 星星相對尺寸與位置也乘 uiScale
      let starSize = c.d * 0.22 * uiScale;
      let starX = sx - sd / 2 + starSize * 0.5;
      let starY = sy - sd / 2 + starSize * 0.5;
      push();
      translate(starX, starY);
      noStroke();
      fill(255, 230, 80, 220);
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5 - HALF_PI;
        let x = cos(angle) * starSize * 0.5;
        let y = sin(angle) * starSize * 0.5;
        vertex(x, y);
        angle += TWO_PI / 10;
        x = cos(angle) * starSize * 0.22;
        y = sin(angle) * starSize * 0.22;
        vertex(x, y);
      }
      endShape(CLOSE);
      pop();
    }
  }
}

function drawMenu() {
  // 菜單背景（基準寬度）
  fill(50);
  rect(0, 0, 150, BASE_H);

  // 菜單項目
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);

  if (currentPage === "作業") {
    // 作業頁面只顯示「返回主頁」
    text("返回主頁", 15, 50);
  } else {
    for (let i = 0; i < menuItems.length; i++) {
      text(menuItems[i], 15, 50 + i * 40);
    }
  }
}

function loadQuestions() {
  // 所有題目
  allQuestions = [
    { 題目: "JavaScript 中，以下哪個是正確的變數宣告?", 選項A: "var x = 1", 選項B: "let x = 1", 選項C: "const x = 1", 選項D: "以上皆是", 答案: "4" },
    { 題目: "p5.js 中，createCanvas() 函數的作用是什麼?", 選項A: "設定背景色", 選項B: "建立畫布", 選項C: "改變文字大小", 選項D: "繪製圖形", 答案: "2" },
    { 題目: "以下哪個運算子用於比較兩個值是否相等?", 選項A: "==", 選項B: "=", 選項C: "===", 選項D: "!=", 答案: "1" },
    { 題目: "函數 setup() 在 p5.js 中執行幾次?", 選項A: "一次", 選項B: "每幀執行一次", 選項C: "十次", 選項D: "取決於使用者", 答案: "1" },
    { 題目: "迴圈中 break 語句的作用是什麼?", 選項A: "暫停迴圈", 選項B: "跳過當前迭代", 選項C: "中止迴圈", 選項D: "重新開始迴圈", 答案: "3" },
    { 題目: "陣列的 length 屬性表示什麼?", 選項A: "陣列的寬度", 選項B: "陣列中元素的數量", 選項C: "陣列的高度", 選項D: "陣列的類型", 答案: "2" },
    { 題目: "以下哪個方法用於向陣列末尾添加元素?", 選項A: "shift()", 選項B: "unshift()", 選項C: "push()", 選項D: "pop()", 答案: "3" },
    { 題目: "函數 draw() 在 p5.js 中的執行頻率是多少?", 選項A: "每秒一次", 選項B: "每幀執行一次", 選項C: "每毫秒執行一次", 選項D: "僅執行一次", 答案: "2" },
    { 題目: "以下哪個是 JavaScript 的註解符號?", 選項A: "# 單行註解", 選項B: "// 單行註解", 選項C: "<!-- 單行註解 -->", 選項D: "-- 單行註解", 答案: "2" },
    { 題目: "物件的屬性如何訪問?", 選項A: "物件[屬性]", 選項B: "物件.屬性", 選項C: "物件->屬性", 選項D: "以上皆是", 答案: "4" },
    { 題目: "typeof 運算子的用途是什麼?", 選項A: "檢查數據類型", 選項B: "轉換數據類型", 選項C: "比較數據", 選項D: "刪除數據", 答案: "1" },
    { 題目: "console.log() 的主要作用是什麼?", 選項A: "輸出到控制台", 選項B: "保存文件", 選項C: "創建畫布", 選項D: "計算結果", 答案: "1" }
  ];
}

function initCircles() {
  circles = [];
  for (let i = 0; i < 30; i++) {
    let x = random(BASE_W);
    let y = random(BASE_H);
    let circle = {
      x: x,
      y: y,
      d: random(30, 120),
      alpha: random(50, 255),
      vy: random(-1, -3),
      color: [random(255), random(255), random(255)],
      explodeX: random(BASE_W),
      explodeY: random(BASE_H * 0.1, BASE_H * 0.9),
      exploding: false,
      explodeFrame: 0
    };
    circles.push(circle);
  }

  for (let i = 0; i < circles.length; i += 5) {
    let group = circles.slice(i, i + 5);
    let idxs = [];
    while (idxs.length < 2) {
      let r = floor(random(group.length));
      if (!idxs.includes(r)) idxs.push(r);
    }
    for (let idx of idxs) {
      let c = group[idx];
      c.explodeX = c.x;
      c.explodeY = c.y;
    }
  }
}

function startQuiz() {
  // 隨機選擇十題
  let shuffled = allQuestions.sort(() => 0.5 - Math.random());
  questions = shuffled.slice(0, 10);
  currentQuestion = 0;
  selectedAnswer = null;
  score = 0;
  quizFinished = false;
  answers = new Array(10).fill(null);
}

// 改為使用縮放後的滑鼠座標處理互動
function mousePressed() {
  let mx = mouseX / uiScale;
  let my = mouseY / uiScale;

  // 菜單項目點擊
  if (menuVisible && mx < 150) {
    // 作業頁面：單一選項「返回主頁」
    if (currentPage === "作業") {
      if (my > 30 && my < 70) {
        currentPage = "主頁";
        return;
      }
    } else {
      let menuIndex = floor((my - 50) / 40);
      if (menuIndex >= 0 && menuIndex < menuItems.length) {
        let selectedMenu = menuItems[menuIndex];

        // 點擊筆記時開啟外部連結
        if (selectedMenu === "筆記") {
          window.open("https://hackmd.io/@3jQ4lKIrR6GwPADkuJhsew/rJbMtOyhxx", "_blank");
          return;
        }

        // 點擊教育科技系時開啟外部連結
        if (selectedMenu === "教育科技系") {
          window.open("https://www.et.tku.edu.tw/main.aspx", "_blank");
          return;
        }

        currentPage = selectedMenu;
        if (currentPage === "測驗") {
          startQuiz();
        }
      }
    }
  }

  // 測驗選項點擊（使用基準座標）
  if (currentPage === "測驗" && !quizFinished) {
    for (let i = 0; i < 4; i++) {
      if (mx > 150 && mx < 300 && my > 200 + i * 40 && my < 235 + i * 40) {
        selectedAnswer = i;
        answers[currentQuestion] = i;
      }
    }

    // 上一題按鈕
    if (mx > 150 && mx < 220 && my > 360 && my < 390) {
      if (currentQuestion > 0) {
        currentQuestion--;
        selectedAnswer = answers[currentQuestion];
      }
    }

    // 下一題按鈕
    if (mx > 230 && mx < 300 && my > 360 && my < 390) {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        selectedAnswer = answers[currentQuestion];
      } else {
        quizFinished = true;
      }
    }
  }

  // 成績頁面 - 返回主頁按鈕（基準座標）
  if (quizFinished && mx > 150 && mx < 250 && my > 310 && my < 350) {
    currentPage = "主頁";
    quizFinished = false;
  }
}

function drawEducationPage() {
  // 使用基準座標系繪製簡單頁面（與其他分頁一致）
  noStroke();
  fill(245);
  rect(0, 0, BASE_W, BASE_H);

  fill(20);
  textAlign(CENTER, TOP);
  textSize(24);
  text("教育科技系", BASE_W / 2, 60);

  textSize(14);
  textAlign(LEFT, TOP);
  let info = "歡迎來到教育科技系頁面。\n\n" +
             "這裡可以放置系所簡介、連結或其他資源。\n\n" +
             "請告訴我想要放哪些內容，我會幫您補上。";
  text(info, 40, 110, BASE_W - 80, BASE_H - 140);
}
