const clothes = ['👔', '👗', '👖', '👕', '👘', '🩳', '🧦', '🧥', '🧣', '🧢', '🩱', '👚', '🥋', '🗳️', '♻️'];

let gameStarted = false;
let selectedCards = [];
let score = 0;
let lives = 5;
let animationInProgress = false;
let timer = 60;

const timerElement = document.getElementById('timer');

const interval = setInterval(() => {
    timer--;
    timerElement.textContent = timer;
    if (timer === 0) {
        clearInterval(interval);
        handleTimeUp();
    }
}, 1000);

const pointsThresholds = [
    { threshold: 20, code: 'PROMO20' },
    { threshold: 40, code: 'PROMO40' },
    { threshold: 60, code: 'PROMO60' },
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function disableCardClick() {
    animationInProgress = true;
    setTimeout(() => {
        animationInProgress = false;
    }, 1000);
}

function showMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 3000);
}

function restartGame() {
    gameStarted = false;
    selectedCards = [];
    score = 0;
    lives = 5;
    updateScoreDisplay();
    updateLivesDisplay();
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    document.getElementById('start-button').disabled = false;
    document.getElementById('points-container').style.display = 'none';
}

function startGame() {
    gameStarted = true;
    selectedCards = [];
    createGameGrid();
    document.getElementById('start-button').disabled = true;
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.textContent = '?');
    }, 2000);
}

function createGameGrid() {
    score = 0;
    lives = 5;
    updateScoreDisplay();
    updateLivesDisplay();
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    const shuffledClothes = shuffleArray([...clothes, ...clothes]);

    shuffledClothes.forEach((clothing, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = clothing;
        card.dataset.clothing = clothing;

        if (index % 5 === 0) {
            card.classList.add('bonus-card');
        } else if (index % 6 === 0) {
            card.classList.add('malus-card');
        }

        card.addEventListener('click', handleCardClick);
        grid.appendChild(card);
    });
}

function handleCardClick() {
    if (!gameStarted || selectedCards.length >= 2 || selectedCards.includes(this) || animationInProgress) {
        return;
    }

    this.textContent = this.dataset.clothing;
    selectedCards.push(this);

    if (selectedCards.length === 2) {
        disableCardClick();
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

function checkMatch() {
    if (animationInProgress) {
        return;
    }

    const [card1, card2] = selectedCards;

    if (card1.dataset.clothing === card2.dataset.clothing) {
        selectedCards.forEach(card => {
            card.style.backgroundColor = 'lightgreen';
            card.removeEventListener('click', handleCardClick);
        });

        score += 1;
        updateScoreDisplay();

        if (score >= 28) {
            showMessage('Félicitations ! Vous avez atteint 100 points et gagné la partie !', 'victory-message');
            const restartConfirmed = confirm("Voulez-vous redémarrer le jeu ?");
            if (restartConfirmed) {
                restartGame();
            }
        }
    } else {
        selectedCards.forEach(card => {
            card.textContent = '';
        });

        lives--;
        updateLivesDisplay();

        if (lives === 0) {
            showMessage('Le jeu est terminé. Merci d\'avoir joué !', 'end-message');
            const restartConfirmed = confirm("Voulez-vous redémarrer le jeu ?");
            if (restartConfirmed) {
                restartGame();
            }
        }
    }

    selectedCards = [];

    if (document.querySelectorAll('.card').length === 0 && lives > 0) {
        let message = `Félicitations ! Vous avez terminé le jeu avec ${lives} vies restantes. Votre score : ${score}`;
        const eligiblePromotion = pointsThresholds.find(item => score >= item.threshold);
        
        if (eligiblePromotion) {
            message += `\nVous êtes éligible à un code promotionnel : ${eligiblePromotion.code}`;
            showPromotionMessage(eligiblePromotion.code);
            document.getElementById('promotion-code').textContent = eligiblePromotion.code;
        }

        showMessage(message, 'victory-message');
        document.getElementById('start-button').disabled = false;
    }

    if (document.querySelectorAll('.card').length === 0 && lives === 0) {
        showEndMessage();
        const restartConfirmed = confirm("Voulez-vous redémarrer le jeu ?");
        if (restartConfirmed) {
            restartGame();
        }
    }
}

document.getElementById('start-button').addEventListener('click', () => {
    const modal = document.getElementById('rules-modal');
    modal.style.display = 'none';
    startGame();
    document.getElementById('start-button').disabled = true;
});

document.getElementById('close-rules').addEventListener('click', () => {
    const modal = document.getElementById('rules-modal');
    modal.style.display = 'none';
    document.getElementById('start-button').disabled = false;
});

document.getElementById('send-email-link').addEventListener('click', handleSendEmailLinkClick);

function handleSendEmailLinkClick() {
    const emailSubject = encodeURIComponent('Score du jeu');
    const emailBody = encodeURIComponent(`Mon score au jeu est : ${score}`);
    const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

    if (confirm('Voulez-vous envoyer votre score par e-mail ?')) {
        window.location.href = mailtoLink;
    } else {
        restartGame();
    }
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

function updateLivesDisplay() {
    document.getElementById('lives').textContent = lives;
}

window.addEventListener('load', () => {
    const modal = document.getElementById('rules-modal');
    modal.style.display = 'block';

    const closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.style.display = '';
        startGame();
    });
});
