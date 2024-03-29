'use strict';

const $ = x => document.querySelector(x);
const $$ = x => document.querySelectorAll(x);

const bottomTabTransition = 500;

const gameState = {
	scores: [0, 0],
	games: [0, 0],
}

const settings = {
	players: ['Player 1', 'Player 2'],
	firstTo: 11,
	winBy:   2,
	letLimit: null,
	maxGames: 5,
}

const RallyType = Object.freeze({
	REGULAR:    Symbol('regular'),
	DEUCE:      Symbol('deuce'),
	GAMEPOINT:  Symbol('gamepoint'),
	MATCHPOINT: Symbol('matchpoint'),
	GAME:       Symbol('game'),
	MATCH:      Symbol('match'),
});

const getRallyType = () => {
	const scores = gameState.scores;
	const max = Math.max(scores[0], scores[1]);
	const min = Math.min(scores[0], scores[1]);
	const diff = max - min;

	if (max >= settings.firstTo  && diff >= settings.winBy) {
		const maxGames = Math.max(gameState.games[0], gameState.games[1]);
		if (maxGames > settings.maxGames / 2) {
			return RallyType.MATCH;
		}
		return RallyType.GAME;
	}

	const gameThreshold = settings.firstTo - 1;

	if (max >= gameThreshold && min >= gameThreshold && diff < (settings.winBy - 1)) {
		return RallyType.DEUCE;
	}

	if (scores[0] >= gameThreshold && scores[0] > scores[1]) {
		if (gameState.games[0] + 1 > settings.maxGames / 2) {
			return RallyType.MATCHPOINT;
		}
		return RallyType.GAMEPOINT;
	}
	if (scores[1] >= gameThreshold && scores[1] > scores[0]) {
		if (gameState.games[1] + 1 > settings.maxGames / 2) {
			return RallyType.MATCHPOINT;
		}
		return RallyType.GAMEPOINT;
	}

	return RallyType.REGULAR;
};

let lastRallyType = RallyType.REGULAR;
const refreshScoreDisplay = () => {
	$('#score-1').innerText = gameState.scores[0];
	$('#score-2').innerText = gameState.scores[1];
	$('#games-1').innerText = gameState.games[0];
	$('#games-2').innerText = gameState.games[1];

	const state = getRallyType();
	const tabNode = $('#bottom-tab');
	const gamesCount = gameState.games[0] + gameState.games[1];

	if (state === RallyType.REGULAR) {
		tabNode.classList.add('hidden');
	} else {
		tabNode.classList.remove('hidden');
	}

	const updateTab = () => {
		switch (state) {
		case RallyType.GAMEPOINT:
			tabNode.innerText = 'GAME POINT';
			break;
		case RallyType.MATCHPOINT:
			tabNode.innerText = 'MATCH POINT';
			break;
		case RallyType.DEUCE:
			tabNode.innerText = 'DEUCE';
			break;
		case RallyType.GAME:
			tabNode.innerText = `GAME ${gamesCount} FINAL`;
			break;
		case RallyType.MATCH:
			tabNode.innerText = 'FINAL';
			break;
		}
	}

	if (lastRallyType === RallyType.REGULAR) {
		updateTab();
	} else if (state !== lastRallyType && state !== RallyType.REGULAR) {
		tabNode.classList.add('hidden');
		setTimeout(() => {
			tabNode.classList.remove('hidden');
			updateTab();
		}, bottomTabTransition);
	}

	lastRallyType = state;
}

const registerCounterEvents = () => {
	document.addEventListener('click', e => {
		if (getRallyType() === RallyType.MATCH) {
			return;
		}

		if (getRallyType() === RallyType.GAME) {
			gameState.scores.fill(0);
			refreshScoreDisplay();
			return;
		}

		const width = document.body.clientWidth;
		const idx = +(e.clientX > width / 2);
		gameState.scores[idx] += 1;

		if (getRallyType() === RallyType.GAME) {
			const winner = +(gameState.scores[1] > gameState.scores[0]);
			gameState.games[winner] += 1;
		}
		refreshScoreDisplay();
	});
}

const startGame = () => {
	$('#dashboard').classList.add('hidden');
	$('#score-wrapper').classList.remove('hidden');
}

const registerSettingsEvents = () => {
	$('#settings-player-1-name').addEventListener('change', function() { settings.players[0] = this.value; });
	$('#settings-player-2-name').addEventListener('change', function() { settings.players[1] = this.value; });
	$('#settings-first-to').addEventListener('change',      function() { settings.firstTo = this.value; });
	$('#settings-win-by').addEventListener('change',        function() { settings.winBy = this.value; });
	$('#settings-enable-let-limit').addEventListener('change', function() {
		$('#settings-let-limit').disabled = !this.checked;
		settings.letLimit = this.checked ? $('#settings-let-limit').value : null;
	});
	$('#settings-let-limit').addEventListener('change', function() { settings.letLimit = this.value; });
	$('#settings-max-games').addEventListener('change', function() { settings.maxGames = this.value; });
	$('#settings-start-game').addEventListener('click', startGame);
}

const main = () => {
	registerSettingsEvents();
	registerCounterEvents();
};