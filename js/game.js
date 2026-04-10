/**
 * game.js - 核心遊戲邏輯
 */

// 遊戲設定
const GAME_CONFIG = {
    totalQuestionsToPick: 5,        // 每次玩抽 5 題
    dailyLimit: 5,                 // 每日限玩 5 次
    jsonPath: './data/quiz35.json' // JSON 檔案路徑
};

// 遊戲狀態變數
let allQuestions = [];      // 原始 150 題題庫
let currentQuizSet = [];    // 當前抽出的 5 題內容
let answersTempRecord = [[], [], [], [], []]; // 紀錄玩家在 5 題中分別選了什麼
let currentQuestionIndex = 0;
let userAnswers = [];       // 當前題目玩家勾選的標籤 (例如 ['A', 'C'])

/**
 * 1. 頁面載入後初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

async function initGame() {
    // 檢查今日剩餘次數 (調用 storage.js)
    const remainingChances = checkDailyChances(GAME_CONFIG.dailyLimit);
    
    // 如果還有剩餘次數，則載入題庫
    try {
        const response = await fetch(GAME_CONFIG.jsonPath);
        allQuestions = await response.json();
        
        // 若次數沒了，雖然載入題庫但鎖定開始按鈕 (這部分可配合 UI 顯示)
        if (remainingChances <= 0) {
            document.getElementById('question-text').innerText = "今日遊玩次數已達上限，請明天再試！";
            document.getElementById('options-container').innerHTML = "";
            return;
        }

        startNewChallenge();
    } catch (error) {
        console.error("題庫載入失敗:", error);
        document.getElementById('question-text').innerText = "題庫連線失敗，請檢查 data/quiz35.json 是否存在。";
    }
}

/**
 * 2. 開始一場新的挑戰
 */
function startNewChallenge() {
    // 從題庫中隨機抽出 5 題
    currentQuizSet = getRandomQuestions(allQuestions, GAME_CONFIG.totalQuestionsToPick);
    
    // 重置遊戲狀態
    currentQuestionIndex = 0;
    answersTempRecord = [[], [], [], [], []];
    
    renderQuestion();
}

/**
 * 3. 隨機抽題與打亂邏輯 (Fisher-Yates Shuffle)
 */
function getRandomQuestions(array, n) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

/**
 * 4. 渲染題目 (由 UI 調用)
 */
function renderQuestion() {
    const questionData = currentQuizSet[currentQuestionIndex];
    
    // 讀取這題之前的勾選紀錄 (如果是從下一題點「上一題」回來的)
    userAnswers = [...answersTempRecord[currentQuestionIndex]];
    
    // 準備選項並打亂
    let options = [
        { label: 'A', text: questionData.選項A },
        { label: 'B', text: questionData.選項B },
        { label: 'C', text: questionData.選項C },
        { label: 'D', text: questionData.選項D }
    ];
    options = options.sort(() => 0.5 - Math.random());

    // 呼叫 ui.js 的渲染功能
    if (typeof displayQuestionUI === 'function') {
        displayQuestionUI(questionData.題目, options);
    }
}

/**
 * 5. 保存當前進度 (當點擊上一題或下一題時呼叫)
 */
function saveCurrentProgress() {
    answersTempRecord[currentQuestionIndex] = [...userAnswers];
}

/**
 * 6. 返回上一題
 */
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        saveCurrentProgress();
        currentQuestionIndex--;
        renderQuestion();
    }
}

/**
 * 7. 進入下一題或提交
 */
function handleNextStep() {
    saveCurrentProgress();
    
    if (currentQuestionIndex < GAME_CONFIG.totalQuestionsToPick - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        // 最後一題提交，執行結算
        finishGame();
    }
}

/**
 * 8. 最終結算邏輯
 */
function finishGame() {
    let correctTotal = 0;

    // 逐題比對答案
    currentQuizSet.forEach((question, index) => {
        const playerAns = answersTempRecord[index]; // 玩家選的 ['A', 'C']
        const correctAns = question.正確答案.split(',').map(s => s.trim()); // 正確的 ['A', 'C']
        
        // 判定標準：必須全選對（長度一致且標籤完全吻合）
        const isAllCorrect = 
            playerAns.length === correctAns.length &&
            playerAns.every(val => correctAns.includes(val));
            
        if (isAllCorrect) {
            correctTotal++;
        }
    });

    // 執行資料儲存 (調用 storage.js)
    reduceChance();
    addTokens(correctTotal);

    // 顯示結果 (不顯示正確答案，只顯示獲得代幣)
    alert(`挑戰結束！\n本次答對題數：${correctTotal} 題\n獲得代幣：${correctTotal} 個\n\n感謝參與，請明天再來！`);
    
    // 回到主畫面或重新整理
    location.reload();
}
