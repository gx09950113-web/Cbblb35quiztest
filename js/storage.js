// 定義儲存的 Key 名稱
const STORAGE_KEYS = {
    USER_DATA: 'quiz_game_user_data'
};

// 初始資料結構
const defaultData = {
    lastUpdate: "", // 用來判斷是否為同一天
    chancesUsed: 0, // 今日已玩次數
    tokens: 0       // 累積代幣總數
};

/**
 * 取得或初始化使用者資料
 */
function getPlayerData() {
    const savedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const today = new Date().toLocaleDateString(); // 格式如 "2026/4/11"

    if (!savedData) {
        // 全新玩家
        const newData = { ...defaultData, lastUpdate: today };
        savePlayerData(newData);
        return newData;
    }

    let data = JSON.parse(savedData);

    // 跨日檢查：如果紀錄的日期不是今天，重置次數
    if (data.lastUpdate !== today) {
        data.lastUpdate = today;
        data.chancesUsed = 0;
        savePlayerData(data);
    }

    return data;
}

/**
 * 儲存資料到 localStorage
 */
function savePlayerData(data) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
}

/**
 * 檢查剩餘次數 (給 game.js 使用)
 * @param {number} limit - 每日上限
 * @returns {number} - 剩餘次數
 */
function checkDailyChances(limit) {
    const data = getPlayerData();
    const remaining = limit - data.chancesUsed;
    return remaining > 0 ? remaining : 0;
}

/**
 * 增加已玩次數 (遊戲結束時呼叫)
 */
function reduceChance() {
    const data = getPlayerData();
    data.chancesUsed += 1;
    savePlayerData(data);
    updateStatusUI(); // 通知 UI 更新顯示
}

/**
 * 增加代幣 (根據答對題數)
 * @param {number} amount - 獲得數量
 */
function addTokens(amount) {
    if (amount <= 0) return;
    const data = getPlayerData();
    data.tokens += amount;
    savePlayerData(data);
    updateStatusUI(); // 通知 UI 更新顯示
}

/**
 * 更新網頁上的次數與代幣顯示
 */
function updateStatusUI() {
    const data = getPlayerData();
    const limit = 5; // 這裡要跟 game.js 的設定一致
    
    const chanceElement = document.getElementById('chance-count');
    const tokenElement = document.getElementById('token-balance');

    if (chanceElement) chanceElement.innerText = limit - data.chancesUsed;
    if (tokenElement) tokenElement.innerText = data.tokens;
}

// 頁面載入時先執行一次 UI 更新
document.addEventListener('DOMContentLoaded', () => {
    updateStatusUI();
});
