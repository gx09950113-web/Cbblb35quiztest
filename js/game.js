// 遊戲狀態設定
const GAME_CONFIG = {
    totalQuestionsToPick: 5,        // 每次玩抽 5 題
    dailyLimit: 5,                 // 每日限玩 5 次
    jsonPath: './data/quiz35.json' // JSON 檔案路徑
};

let currentQuizSet = []; // 當前抽出的 5 題
let userAnswers = [];    // 玩家在某一題勾選的選項
let correctCount = 0;    // 玩家答對的題數
let currentQuestionIndex = 0;

// 1. 初始化遊戲：檢查次數並載入題庫
async function initGame() {
    // 檢查今日剩餘次數 (調用 storage.js 的功能)
    const remainingChances = checkDailyChances(GAME_CONFIG.dailyLimit);
    if (remainingChances <= 0) {
        alert("今日遊玩次數已達上限，請明天再試！");
        return;
    }

    try {
        const response = await fetch(GAME_CONFIG.jsonPath);
        const allQuestions = await response.json();
        
        // 從 150 題中隨機抽 5 題
        currentQuizSet = getRandomQuestions(allQuestions, GAME_CONFIG.totalQuestionsToPick);
        
        startQuiz();
    } catch (error) {
        console.error("題庫載入失敗:", error);
    }
}

// 2. 隨機抽題邏輯
function getRandomQuestions(array, n) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// 3. 開始挑戰
function startQuiz() {
    currentQuestionIndex = 0;
    correctCount = 0;
    renderQuestion();
}

// 4. 渲染題目與「打亂選項」
function renderQuestion() {
    const questionData = currentQuizSet[currentQuestionIndex];
    userAnswers = []; // 清空上一題的答案
    
    // 準備選項：將 A,B,C,D 內容與其原始標籤(A/B/C/D)綁定
    let options = [
        { label: 'A', text: questionData.選項A },
        { label: 'B', text: questionData.選項B },
        { label: 'C', text: questionData.選項C },
        { label: 'D', text: questionData.選項D }
    ];

    // 打亂選項順序
    options = options.sort(() => 0.5 - Math.random());

    // 調用 UI 渲染函數 (預計寫在 ui.js)
    displayQuestionUI(questionData.題目, options);
}

// 5. 驗證答案：【核心修改：需全對才算對】
function submitAnswer() {
    const questionData = currentQuizSet[currentQuestionIndex];
    
    // 取得正確答案陣列，例如 "A,C" -> ["A", "C"]
    const correctLabels = questionData.正確答案.split(',').map(s => s.trim());
    
    // 驗證邏輯：
    // 1. 玩家選的數量要跟正確答案數量一致
    // 2. 玩家選的每一個標籤都要在正確答案清單裡
    const isAllCorrect = 
        userAnswers.length === correctLabels.length &&
        userAnswers.every(val => correctLabels.includes(val));

    if (isAllCorrect) {
        correctCount++;
    }

    // 進入下一題或結算
    if (currentQuestionIndex < GAME_CONFIG.totalQuestionsToPick - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        finishGame();
    }
}

// 6. 遊戲結束與結算
function finishGame() {
    // 扣除一次每日次數
    reduceChance();
    
    // 根據答對題數發放代幣 (1-5個)
    const tokensEarned = correctCount; 
    addTokens(tokensEarned);

    alert(`遊戲結束！你答對了 ${correctCount} 題，獲得 ${tokensEarned} 個代幣。`);
    location.reload(); // 重新整理頁面回到初始狀態
}
