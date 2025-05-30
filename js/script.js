// Game Variables
let playerScore = 0;
let computerScore = 0;
let roundNumber = 0;
let gameHistory = [];
let isAnimating = false;
let currentTheme = 'default';
let soundEnabled = true;
let animationSpeed = 1; // 0: Slow, 1: Normal, 2: Fast
let soundVolume = 0.5; // 0 to 1
let difficulty = 'easy';

// DOM Elements
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const roundNumberElement = document.getElementById('round-number');
const statusMessageElement = document.getElementById('status-message');
const playerChoiceDisplay = document.getElementById('player-choice-display');
const computerChoiceDisplay = document.getElementById('computer-choice-display');
const rockButton = document.getElementById('rock');
const paperButton = document.getElementById('paper');
const scissorsButton = document.getElementById('scissors');
const resetButton = document.getElementById('reset-btn');
const historyButton = document.getElementById('history-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const settingsBtn = document.getElementById('settings-btn');
const resultAnimation = document.getElementById('result-animation');
const resultText = document.querySelector('.result-text');
const historyTableBody = document.getElementById('history-table-body');
const totalGamesElement = document.getElementById('total-games');
const totalWinsElement = document.getElementById('total-wins');
const totalLossesElement = document.getElementById('total-losses');
const totalDrawsElement = document.getElementById('total-draws');
const saveSettingsBtn = document.getElementById('save-settings');
const clearHistoryBtn = document.getElementById('clear-history');
const animationSpeedSlider = document.getElementById('animation-speed');
const soundVolumeSlider = document.getElementById('sound-volume');
const speedValueDisplay = document.getElementById('speed-value');
const volumeValueDisplay = document.getElementById('volume-value');
const themeOptions = document.querySelectorAll('.theme-option');
const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');

// Sound Effects
const sounds = {
    rock: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    paper: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    scissors: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    lose: new Audio('https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3'),
    draw: new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'),
    reset: new Audio('https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3')
};

// Initialize Game
function initGame() {
    // Load saved game data from localStorage if available
    loadGameData();
    
    // Update UI
    updateScoreBoard();
    updateHistoryStats();
    updateHistoryTable();
    
    // Set initial animation speed
    updateAnimationSpeed();
    
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Set up event listeners
    setupEventListeners();
}

// Load Game Data from localStorage
function loadGameData() {
    if (localStorage.getItem('rpsGameData')) {
        const gameData = JSON.parse(localStorage.getItem('rpsGameData'));
        playerScore = gameData.playerScore || 0;
        computerScore = gameData.computerScore || 0;
        roundNumber = gameData.roundNumber || 0;
        gameHistory = gameData.gameHistory || [];
        currentTheme = gameData.theme || 'default';
        soundEnabled = gameData.soundEnabled !== undefined ? gameData.soundEnabled : true;
        animationSpeed = gameData.animationSpeed !== undefined ? gameData.animationSpeed : 1;
        soundVolume = gameData.soundVolume !== undefined ? gameData.soundVolume : 0.5;
        difficulty = gameData.difficulty || 'easy';
        
        // Update UI controls to match loaded settings
        animationSpeedSlider.value = animationSpeed;
        soundVolumeSlider.value = soundVolume * 100;
        updateSpeedValueDisplay();
        updateVolumeValueDisplay();
        
        // Update sound toggle button
        if (!soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        
        // Update sound toggle checkbox
        const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
        if (soundToggleCheckbox) {
            soundToggleCheckbox.checked = soundEnabled;
        }
        
        // Update theme toggle button
        if (currentTheme === 'dark' || currentTheme === 'neon') {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Update difficulty radio buttons
        document.querySelector(`input[value="${difficulty}"]`).checked = true;
        
        // Mark active theme in theme cards
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            if (card.dataset.theme === currentTheme) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
}

// Save Game Data to localStorage
function saveGameData() {
    const gameData = {
        playerScore,
        computerScore,
        roundNumber,
        gameHistory,
        theme: currentTheme,
        soundEnabled,
        animationSpeed,
        soundVolume,
        difficulty
    };
    
    localStorage.setItem('rpsGameData', JSON.stringify(gameData));
}

// Set up Event Listeners
function setupEventListeners() {
    // Choice buttons
    rockButton.addEventListener('click', () => handlePlayerChoice('rock'));
    paperButton.addEventListener('click', () => handlePlayerChoice('paper'));
    scissorsButton.addEventListener('click', () => handlePlayerChoice('scissors'));
    
    // Reset button
    resetButton.addEventListener('click', resetGame);
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Sound toggle
    soundToggleBtn.addEventListener('click', toggleSound);
    
    // Clear history
    const clearHistoryBtns = document.querySelectorAll('#clear-history');
    clearHistoryBtns.forEach(btn => {
        btn.addEventListener('click', clearHistory);
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Animation speed slider
    animationSpeedSlider.addEventListener('input', updateSpeedValueDisplay);
    
    // Sound volume slider
    soundVolumeSlider.addEventListener('input', updateVolumeValueDisplay);
    
    // History filter
    const historyFilter = document.getElementById('history-filter');
    if (historyFilter) {
        historyFilter.addEventListener('change', () => {
            updateHistoryTable(historyFilter.value);
        });
    }
    
    // Settings Modal Tabs
    const navItems = document.querySelectorAll('.settings-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all tabs and nav items
            document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked nav item
            item.classList.add('active');
            
            // Show corresponding tab
            const tabName = item.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Theme cards
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all theme cards
            themeCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');
        });
    });
    
    // Sound toggle checkbox
    const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
    soundToggleCheckbox.addEventListener('change', () => {
        soundEnabled = soundToggleCheckbox.checked;
        
        // Update sound toggle button icon
        if (soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    });
}

// Handle Player Choice
function handlePlayerChoice(choice) {
    // Prevent multiple clicks during animation
    if (isAnimating) return;
    isAnimating = true;
    
    // Play click sound
    playSound('click');
    
    // Increment round number
    roundNumber++;
    
    // Get computer choice based on difficulty
    const computerChoice = getComputerChoice();
    
    // Update displays
    updateChoiceDisplays(choice, computerChoice);
    
    // Determine winner after a delay for animation
    setTimeout(() => {
        const result = determineWinner(choice, computerChoice);
        updateScore(result);
        updateGameHistory(choice, computerChoice, result);
        saveGameData();
        isAnimating = false;
    }, getAnimationDuration());
}

// Get Computer Choice based on difficulty
function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    
    switch (difficulty) {
        case 'easy':
            // Random choice
            return choices[Math.floor(Math.random() * choices.length)];
            
        case 'medium':
            // Some strategy - slightly favor countering the player's most common choice
            if (gameHistory.length > 5) {
                const playerChoices = gameHistory.map(game => game.playerChoice);
                const choiceCounts = {
                    rock: playerChoices.filter(c => c === 'rock').length,
                    paper: playerChoices.filter(c => c === 'paper').length,
                    scissors: playerChoices.filter(c => c === 'scissors').length
                };
                
                // Find most common player choice
                let mostCommonChoice = 'rock';
                if (choiceCounts.paper > choiceCounts[mostCommonChoice]) mostCommonChoice = 'paper';
                if (choiceCounts.scissors > choiceCounts[mostCommonChoice]) mostCommonChoice = 'scissors';
                
                // 60% chance to counter most common choice, 40% random
                if (Math.random() < 0.6) {
                    // Return counter to most common choice
                    if (mostCommonChoice === 'rock') return 'paper';
                    if (mostCommonChoice === 'paper') return 'scissors';
                    if (mostCommonChoice === 'scissors') return 'rock';
                }
            }
            return choices[Math.floor(Math.random() * choices.length)];
            
        case 'hard':
            // Adaptive strategy - analyze patterns in player's choices
            if (gameHistory.length > 3) {
                const lastThreeChoices = gameHistory.slice(-3).map(game => game.playerChoice);
                
                // Check if player repeats patterns
                if (lastThreeChoices[0] === lastThreeChoices[2]) {
                    // Player might repeat again, counter that
                    if (lastThreeChoices[2] === 'rock') return 'paper';
                    if (lastThreeChoices[2] === 'paper') return 'scissors';
                    if (lastThreeChoices[2] === 'scissors') return 'rock';
                }
                
                // Check if player is cycling through choices
                const isAscending = lastThreeChoices[0] === 'rock' && lastThreeChoices[1] === 'paper' && lastThreeChoices[2] === 'scissors';
                const isDescending = lastThreeChoices[0] === 'scissors' && lastThreeChoices[1] === 'paper' && lastThreeChoices[2] === 'rock';
                
                if (isAscending) return 'rock'; // Counter next expected move (rock)
                if (isDescending) return 'scissors'; // Counter next expected move (scissors)
                
                // Counter last choice as fallback
                if (lastThreeChoices[2] === 'rock') return 'paper';
                if (lastThreeChoices[2] === 'paper') return 'scissors';
                if (lastThreeChoices[2] === 'scissors') return 'rock';
            }
            return choices[Math.floor(Math.random() * choices.length)];
            
        default:
            return choices[Math.floor(Math.random() * choices.length)];
    }
}

// Update Choice Displays with Animation
function updateChoiceDisplays(playerChoice, computerChoice) {
    // Play choice sounds
    playSound(playerChoice);
    
    // Animation for player choice
    playerChoiceDisplay.innerHTML = `<i class="fas fa-hand-${playerChoice}"></i>`;
    playerChoiceDisplay.classList.add('bounce');
    
    // Animation for computer choice (spinning question mark first)
    computerChoiceDisplay.innerHTML = `<i class="fas fa-question"></i>`;
    computerChoiceDisplay.classList.add('spin');
    
    // After a delay, show computer's choice
    setTimeout(() => {
        computerChoiceDisplay.classList.remove('spin');
        computerChoiceDisplay.innerHTML = `<i class="fas fa-hand-${computerChoice}"></i>`;
        computerChoiceDisplay.classList.add('bounce');
        
        // Remove animation classes after they complete
        setTimeout(() => {
            playerChoiceDisplay.classList.remove('bounce');
            computerChoiceDisplay.classList.remove('bounce');
        }, getAnimationDuration());
    }, getAnimationDuration());
}

// Determine Winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        return 'win';
    }
    
    return 'lose';
}

// Update Score
function updateScore(result) {
    switch (result) {
        case 'win':
            playerScore++;
            statusMessageElement.textContent = 'You win this round!';
            showResultAnimation('WIN!', 'win-text');
            playSound('win');
            break;
        case 'lose':
            computerScore++;
            statusMessageElement.textContent = 'Computer wins this round!';
            showResultAnimation('LOSE!', 'lose-text');
            playSound('lose');
            break;
        case 'draw':
            statusMessageElement.textContent = 'It\'s a draw!';
            showResultAnimation('DRAW!', 'draw-text');
            playSound('draw');
            break;
    }
    
    updateScoreBoard();
}

// Update Score Board
function updateScoreBoard() {
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    roundNumberElement.textContent = roundNumber;
}

// Show Result Animation
function showResultAnimation(text, className) {
    resultText.textContent = text;
    resultText.className = 'result-text ' + className;
    resultAnimation.classList.add('active');
    
    setTimeout(() => {
        resultAnimation.classList.remove('active');
    }, 1500);
}

// Update Game History
function updateGameHistory(playerChoice, computerChoice, result) {
    gameHistory.push({
        round: roundNumber,
        playerChoice,
        computerChoice,
        result
    });
    
    updateHistoryTable();
    updateHistoryStats();
    updateMatchRounds();
}

// Update Match Rounds in the left panel
function updateMatchRounds() {
    const matchRoundsElement = document.getElementById('match-rounds');
    if (!matchRoundsElement) return;
    
    // Clear the empty message if it exists
    const emptyMessage = matchRoundsElement.querySelector('.empty-match-message');
    if (emptyMessage && gameHistory.length > 0) {
        emptyMessage.style.display = 'none';
    }
    
    // Get the last 10 rounds (most recent first)
    const recentRounds = [...gameHistory].sort((a, b) => b.round - a.round).slice(0, 10);
    
    // Create HTML for each round
    let roundsHTML = '';
    recentRounds.forEach(round => {
        const outcomeClass = `${round.result}-outcome`;
        const outcomeText = round.result === 'win' ? 'You won!' : 
                           (round.result === 'lose' ? 'Computer won!' : 'It\'s a draw!');
        
        roundsHTML += `
            <div class="match-round">
                <div class="round-number">${round.round}</div>
                <div class="round-result">
                    <div class="round-choices">
                        You: <i class="fas fa-hand-${round.playerChoice}"></i> vs 
                        Computer: <i class="fas fa-hand-${round.computerChoice}"></i>
                    </div>
                    <div class="round-outcome ${outcomeClass}">${outcomeText}</div>
                </div>
            </div>
        `;
    });
    
    // Update the match rounds container
    // We're prepending new rounds to show most recent at the top
    // but only if there are new rounds to add
    if (recentRounds.length > 0) {
        // Remove all existing rounds
        const existingRounds = matchRoundsElement.querySelectorAll('.match-round');
        existingRounds.forEach(round => round.remove());
        
        // Add the new rounds
        matchRoundsElement.insertAdjacentHTML('afterbegin', roundsHTML);
    }
}

// Update History Table
function updateHistoryTable(filter = 'all') {
    historyTableBody.innerHTML = '';
    
    // Filter history based on selected filter
    let filteredHistory = [...gameHistory];
    if (filter !== 'all') {
        filteredHistory = gameHistory.filter(game => game.result === filter);
    }
    
    // Check if history is empty
    const emptyHistoryMessage = document.getElementById('empty-history-message');
    if (filteredHistory.length === 0) {
        emptyHistoryMessage.style.display = 'block';
    } else {
        emptyHistoryMessage.style.display = 'none';
    }
    
    // Sort by round number (descending)
    filteredHistory.sort((a, b) => b.round - a.round);
    
    filteredHistory.forEach(game => {
        const row = document.createElement('tr');
        
        const roundCell = document.createElement('td');
        roundCell.textContent = game.round;
        
        const playerChoiceCell = document.createElement('td');
        playerChoiceCell.innerHTML = `<i class="fas fa-hand-${game.playerChoice}"></i> ${capitalizeFirstLetter(game.playerChoice)}`;
        
        const computerChoiceCell = document.createElement('td');
        computerChoiceCell.innerHTML = `<i class="fas fa-hand-${game.computerChoice}"></i> ${capitalizeFirstLetter(game.computerChoice)}`;
        
        const resultCell = document.createElement('td');
        resultCell.textContent = capitalizeFirstLetter(game.result);
        resultCell.classList.add(`${game.result}-result-cell`);
        
        row.appendChild(roundCell);
        row.appendChild(playerChoiceCell);
        row.appendChild(computerChoiceCell);
        row.appendChild(resultCell);
        
        historyTableBody.appendChild(row);
    });
    
    // Update recent games list
    updateRecentGamesList();
}

// Update Recent Games List
function updateRecentGamesList() {
    const recentGamesList = document.getElementById('recent-games-list');
    if (!recentGamesList) return;
    
    recentGamesList.innerHTML = '';
    
    // Show only the last 5 rounds
    const recentHistory = [...gameHistory].sort((a, b) => b.round - a.round).slice(0, 5);
    
    if (recentHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center py-3';
        emptyMessage.innerHTML = '<p class="text-muted">No games played yet</p>';
        recentGamesList.appendChild(emptyMessage);
        return;
    }
    
    recentHistory.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'recent-game-item';
        
        const resultIcon = game.result === 'win' ? 'W' : (game.result === 'lose' ? 'L' : 'D');
        
        gameItem.innerHTML = `
            <div class="recent-game-result ${game.result}-result">${resultIcon}</div>
            <div class="recent-game-info">
                <p>You: <i class="fas fa-hand-${game.playerChoice}"></i> vs Computer: <i class="fas fa-hand-${game.computerChoice}"></i></p>
                <span class="recent-game-round">Round ${game.round}</span>
            </div>
        `;
        
        recentGamesList.appendChild(gameItem);
    });
}

// Update History Stats and Chart
function updateHistoryStats() {
    const totalGames = gameHistory.length;
    const wins = gameHistory.filter(game => game.result === 'win').length;
    const losses = gameHistory.filter(game => game.result === 'lose').length;
    const draws = gameHistory.filter(game => game.result === 'draw').length;
    
    // Update stat numbers
    totalGamesElement.textContent = totalGames;
    totalWinsElement.textContent = wins;
    totalLossesElement.textContent = losses;
    totalDrawsElement.textContent = draws;
    
    // Calculate win rate
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const winRateElement = document.getElementById('win-rate-percentage');
    if (winRateElement) {
        winRateElement.textContent = `${winRate}%`;
    }
    
    // Update donut chart segments
    updateDonutChart(wins, losses, draws, totalGames);
}

// Update Donut Chart
function updateDonutChart(wins, losses, draws, totalGames) {
    if (totalGames === 0) return;
    
    const winSegment = document.querySelector('.win-segment');
    const lossSegment = document.querySelector('.loss-segment');
    const drawSegment = document.querySelector('.draw-segment');
    
    if (!winSegment || !lossSegment || !drawSegment) return;
    
    const winPercentage = (wins / totalGames) * 360;
    const lossPercentage = (losses / totalGames) * 360;
    const drawPercentage = (draws / totalGames) * 360;
    
    // Reset segments
    winSegment.style.transform = 'rotate(0deg)';
    lossSegment.style.transform = 'rotate(0deg)';
    drawSegment.style.transform = 'rotate(0deg)';
    
    winSegment.style.clip = 'rect(0, 75px, 150px, 0)';
    lossSegment.style.clip = 'rect(0, 75px, 150px, 0)';
    drawSegment.style.clip = 'rect(0, 75px, 150px, 0)';
    
    // Position segments
    if (winPercentage > 0) {
        if (winPercentage > 180) {
            winSegment.style.clip = 'rect(0, 150px, 150px, 0)';
        } else {
            winSegment.style.clip = 'rect(0, 75px, 150px, 0)';
        }
    }
    
    if (lossPercentage > 0) {
        lossSegment.style.transform = `rotate(${winPercentage}deg)`;
        if (lossPercentage > 180) {
            lossSegment.style.clip = 'rect(0, 150px, 150px, 0)';
        } else {
            lossSegment.style.clip = 'rect(0, 75px, 150px, 0)';
        }
    }
    
    if (drawPercentage > 0) {
        drawSegment.style.transform = `rotate(${winPercentage + lossPercentage}deg)`;
        if (drawPercentage > 180) {
            drawSegment.style.clip = 'rect(0, 150px, 150px, 0)';
        } else {
            drawSegment.style.clip = 'rect(0, 75px, 150px, 0)';
        }
    }
}

// Reset Game
function resetGame() {
    playSound('reset');
    
    // Reset scores
    playerScore = 0;
    computerScore = 0;
    roundNumber = 0;
    
    // Reset displays
    playerChoiceDisplay.innerHTML = '<i class="fas fa-question"></i>';
    computerChoiceDisplay.innerHTML = '<i class="fas fa-question"></i>';
    statusMessageElement.textContent = 'Choose your weapon!';
    
    // Reset match rounds in left panel
    const matchRoundsElement = document.getElementById('match-rounds');
    if (matchRoundsElement) {
        matchRoundsElement.innerHTML = '<div class="empty-match-message"><p>Make your first move to start the game!</p></div>';
    }
    
    // Update UI
    updateScoreBoard();
    saveGameData();
}

// Clear History
function clearHistory() {
    playSound('reset');
    
    // Clear history array
    gameHistory = [];
    
    // Update UI
    updateHistoryTable();
    updateHistoryStats();
    saveGameData();
}

// Toggle Theme
function toggleTheme() {
    playSound('click');
    
    if (currentTheme === 'default' || currentTheme === 'pastel') {
        // Switch to dark theme
        applyTheme('dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        // Switch to light theme
        applyTheme('default');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    saveGameData();
}

// Apply Theme
function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('default-theme', 'neon-theme', 'pastel-theme', 'dark-theme');
    
    // Add selected theme class
    document.body.classList.add(`${theme}-theme`);
    
    // Update current theme
    currentTheme = theme;
    
    // Update theme options in settings
    themeOptions.forEach(option => {
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Toggle Sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    saveGameData();
}

// Play Sound
function playSound(soundName) {
    if (!soundEnabled) return;
    
    const sound = sounds[soundName];
    if (sound) {
        sound.volume = soundVolume;
        sound.currentTime = 0;
        sound.play().catch(error => console.log('Error playing sound:', error));
    }
}

// Save Settings
function saveSettings() {
    // Get selected theme from theme cards
    let selectedTheme = 'default';
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        if (card.classList.contains('active')) {
            selectedTheme = card.dataset.theme;
        }
    });
    
    // Apply theme
    applyTheme(selectedTheme);
    
    // Update theme toggle button
    if (selectedTheme === 'dark' || selectedTheme === 'neon') {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Get animation speed
    animationSpeed = parseInt(animationSpeedSlider.value);
    updateAnimationSpeed();
    
    // Get sound volume
    soundVolume = parseInt(soundVolumeSlider.value) / 100;
    
    // Get sound enabled state from checkbox
    soundEnabled = document.getElementById('sound-toggle-checkbox').checked;
    
    // Update sound toggle button
    if (soundEnabled) {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    // Get difficulty
    difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    // Save settings
    saveGameData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
    
    // Play confirmation sound
    playSound('click');
    
    // Show settings saved notification
    showNotification('Settings saved successfully!');
}

// Update Animation Speed
function updateAnimationSpeed() {
    const speedValues = ['slow', 'normal', 'fast'];
    const durationValues = ['1s', '0.5s', '0.25s'];
    
    document.documentElement.style.setProperty('--animation-speed', durationValues[animationSpeed]);
}

// Get Animation Duration in milliseconds
function getAnimationDuration() {
    const durations = [1000, 500, 250]; // slow, normal, fast
    return durations[animationSpeed];
}

// Update Speed Value Display
function updateSpeedValueDisplay() {
    const speedValues = ['Slow', 'Normal', 'Fast'];
    speedValueDisplay.textContent = speedValues[animationSpeedSlider.value];
}

// Update Volume Value Display
function updateVolumeValueDisplay() {
    volumeValueDisplay.textContent = `${soundVolumeSlider.value}%`;
}

// Show Notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
        
        // Add CSS for notification
        const style = document.createElement('style');
        style.textContent = `
            #notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                color: white;
                padding: 12px 24px;
                border-radius: 30px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                font-weight: 600;
                display: flex;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
            }
            #notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            #notification i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set notification content
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
