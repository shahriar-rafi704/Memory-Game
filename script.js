let gameStarted = false;
const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')  

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    const emojis = ['😅', '🤣', '😇', '😍', '🥳', '🤪', '😘', '😁', '😂', '🤗']
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2) 
    const items = shuffle([...picks, ...picks])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}
const revealCards = () => {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('flipped');
        setTimeout(() => {
            card.classList.remove('flipped');
        }, 10000); // 10 seconds
    });
}

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    revealCards(); // Call the revealCards function

    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('flipped');
        });
        
        state.loop = setInterval(() => {
            state.totalTime++;

            selectors.moves.innerText = `${state.totalFlips} moves`;
            selectors.timer.innerText = `Time: ${state.totalTime} sec`;
        }, 1000);
    }, 10000); // Start timer after 10 seconds
};
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}
const checkLoseCondition = () => {
    if (state.totalFlips >= 50 || state.totalTime >= 120) { // 50 moves or 2 minutes
        clearInterval(state.loop);
        selectors.boardContainer.classList.add('flipped');
        selectors.win.innerHTML = `
            <span class="win-text">
                Game Over! You lose. Try again.
            </span>
        `;
    }
};

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
            checkLoseCondition(); // Check for losing condition
        }, 1000);
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;

            clearInterval(state.loop);
        }, 1000);
    }
};

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
    selectors.start.addEventListener('click', resetGame);

}
const resetGame = () => {
    clearInterval(state.loop);
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;

    // Reset the moves and timer display
    selectors.moves.innerText = '0 moves';
    selectors.timer.innerText = 'Time: 0 sec';

    // Clear the win message
    selectors.win.innerHTML = '';

    // Generate a new game and attach event listeners
    generateGame();
    attachEventListeners();
};

generateGame()
attachEventListeners()