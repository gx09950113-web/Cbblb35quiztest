/**
 * 顯示題目與選項
 * @param {string} questionText 題目內容
 * @param {Array} options 包含 {label, text} 的陣列
 */
function displayQuestionUI(questionText, options) {
    const questionEl = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    
    // 渲染題目
    questionEl.innerText = questionText;
    
    // 清空並渲染選項
    container.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        // 如果玩家之前選過這一題的選項，標記為選中
        if (userAnswers.includes(opt.label)) {
            btn.classList.add('selected');
        }
        
        btn.innerText = opt.text;
        btn.onclick = () => toggleOption(btn, opt.label);
        container.appendChild(btn);
    });

    // 更新控制按鈕狀態
    updateNavButtons();
}

/**
 * 處理複選切換
 */
function toggleOption(element, label) {
    const index = userAnswers.indexOf(label);
    if (index > -1) {
        userAnswers.splice(index, 1); // 取消選中
        element.classList.remove('selected');
    } else {
        userAnswers.push(label); // 加入選中
        element.classList.add('selected');
    }
}

/**
 * 更新導覽按鈕 (上一題/下一題)
 */
function updateNavButtons() {
    const navContainer = document.querySelector('.nav-controls');
    navContainer.innerHTML = `
        <button class="nav-btn" onclick="prevQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>上一題</button>
        <button class="nav-btn" onclick="handleNextStep()">
            ${currentQuestionIndex === 4 ? '提交結算' : '下一題'}
        </button>
    `;
}

// 供 game.js 調用的跳轉邏輯
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        // 在跳回前，我們先保存當前題目的答案（game.js 需要支援暫存）
        saveCurrentProgress(); 
        currentQuestionIndex--;
        renderQuestion();
    }
}

function handleNextStep() {
    saveCurrentProgress(); // 保存當前勾選狀態
    if (currentQuestionIndex < 4) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        finishGame(); // 觸發結算
    }
}
