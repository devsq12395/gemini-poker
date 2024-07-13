

class GameHandler {
    constructor (){
        this.players = [];
        this.pot = 0;
        this.curBet = 0;
        this.curTurn = null;
        this.curBtn = -1;

        this.handHistory = [];
        this.deck = [];
        this.board = [];

        this.isGameOver = false;
        this.rankings = [];

        this.playersCountBeforeSwitch = 0;
        this.phase = 'pre-flop';
        this.lastPlay = 'bet';

        this.expectedAnswers = [];
    }

    init () {
        // Setup other scripts
        apiGet.setup();
        domController.setup ();
        domPopup.setup ();
        domPopup.hidePopup ();
        domTutorial.setup ();
        domHeader.setup ();
        domWin.setup ();
        domTable.setup ();
        preloader.preload ();

        // Create players
        this.createPlayer ('User', false, 0);
        this.createPlayer ('Gemini', true, 1);
        this.createPlayer ('Bob', true, 2);

        this.startNewGame ();
    }

    createPlayer (name, isAI, index) {
        let newPlayer = new Player (name, isAI, index);
        this.players.push (newPlayer);

        domTable.createPlayer (name, index);
    }

    startNewGame (){
        this.isGameOver = false;
        this.rankings = [];
        this.curBtn = -1;

        this.players.forEach ((player) => {
            player.stack = _GLOBALS.STARTING_STACK;
        });

        this.startNewHand ();

        if (!this.curTurn.id.isAI) {
            domController.showDisplay ();
        }
    }

    shuffleDeck () {
        // Create a new deck
        this.deck = [];
        this.handHistoryAI = [];

        let values = ['A', 'K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2'],
            suits = ['H', 'D', 'C', 'S'];

        suits.forEach ((suit) => {
            let cardsInSuit = values.map ((value) => value + suit);
            this.deck.push (...cardsInSuit);
        });
        
        // Shuffle the deck
        let currentIndex = this.deck.length;
        let temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor (Math.random() * currentIndex);
            currentIndex--;

            temporaryValue = this.deck [currentIndex];
            this.deck [currentIndex] = this.deck [randomIndex];
            this.deck [randomIndex] = temporaryValue;
        }
    }

    startNewHand () { 
        this.addHandHistory (`Starting a new hand.`);

        this.shuffleDeck ();
        this.phase = 'pre-flop';

        this.board = [];
        domTable.removeAllPlayerCards ();
        domTable.removeAllCardsOnBoard ();
        domTable.hideWin ();

        this.players.forEach ((player) => {
            if (player.stack <= 0) {
                player.hand = [];
                return;
            }

            player.sidePotToWin = 0;

            player.hand = this.dealCard (2);
            player.hand.forEach ((card) => {
                domTable.createCardForPlayer (player, (player.isAI) ? 'back' : card);
            })

            player.handHistoryAI = [];
            this.addHandHistory_AI (player, `You are dealt ${player.hand[0]} & ${player.hand[1]}`, false);
        });
        this.playersCountBeforeSwitch = this.countPlayersToPlay ();
        this.assignPositions ();

        this.updateAllPlayerTextsInDom ();
        domController.changeControlSituation ();
    }

    dealCard (amount) { 
        return this.deck.splice (0, amount);
    }

    assignPositions () {
        this.curBtn++;
        if (this.curBtn >= this.players.length) this.curBtn = 0;

        let pCount = this.countPlayersToPlay (),
            positions = (pCount > 2) ? ['BTN', 'SB', 'BB'] : ['BTN', 'BB'],
            curPlayerToAssign = this.curBtn,
            pSB = null, pBB = null;
        
        while (positions.length > 0) {
            let curPlayer = this.players [curPlayerToAssign];
            if (curPlayer.stack <= 0) {
                curPlayerToAssign++;
                if (curPlayerToAssign > this.players.length - 1) curPlayerToAssign = 0;

                continue;
            }

            this.addHandHistory_AI (curPlayer, `{player} position: ${positions[0]} has ${curPlayer.stack} chips`);
            curPlayer.pos = positions [0];

            switch (curPlayer.pos) {
                case 'SB': 
                    pSB = curPlayer; 
                    break;
                case 'BB': 
                    pBB = curPlayer; 
                    this.curTurn = curPlayer; 
                    break;
            }

            positions.splice (0, 1);
            curPlayerToAssign++;
            if (curPlayerToAssign > this.players.length - 1) curPlayerToAssign = 0;
        }

        if (pSB) this.player_putBlind (pSB, _GLOBALS.SMALL_BLIND);
        if (pBB) this.player_putBlind (pBB, _GLOBALS.BIG_BLIND);
        this.changeTurn ();
    }

    player_putBlind (player, amount){
        if (player.stack < amount) {
            amount = player.stack;
        }
        player.betCur = amount;
        player.stack -= amount;

        this.addHandHistory_AI (player, `{player} puts a blind of ${amount}. {pot-stat}`);
        this.addHandHistory (`${player.name} puts a blind of ${amount}.`);

        this.curBet = amount;
        
        domTable.setBetForPlayer (player);
    }

    player_doAction (player, action, amount) {
        if (typeof (player) === "string") {
            player = this.players.find (obj => obj.name === player);
        }
        amount = (isNaN (amount) ? 0 : Number (amount));

        switch (action) {

            case 'check': case 'checks':
                this.addHandHistory_AI (player, `{player} checks`);
                this.addHandHistory (`${player.name} checks`);

                this.playersCountBeforeSwitch--;
                
                domTextEffect.createTextEffect ('check', player);
                break;

            case 'bet': 
                if (amount > player.stack) {
                    amount = player.stack;
                    this.playersCountBeforeSwitch = this.countPlayersToPlay ();

                    player.sidePotToWin = amount;
                } else {
                    this.playersCountBeforeSwitch = this.countPlayersToPlay () - 1;
                }
                player.betCur = amount;
                player.stack -= amount;

                this.addHandHistory_AI (player, `{player} bets: ${amount}. {pot-stat}`);
                this.addHandHistory (`${player.name} bets: ${amount}.`);

                this.lastPlay = 'bet';
                this.curBet = amount;
                
                domTable.setBetForPlayer (player);
                domTextEffect.createTextEffect ('bet', player);
                break;

            case 'raise': 
                let maxRaise = player.stack + player.betCur,
                    actualRaise = Math.min(amount, maxRaise);
                this.curBet += actualRaise;
            
                let amountToRaise = this.curBet - player.betCur;
                player.betCur += amountToRaise;
                player.stack -= amountToRaise;
            
                if (amount > player.stack) {
                    player.sidePotToWin = amount;
                    this.playersCountBeforeSwitch = this.countPlayersToPlay();
                } else {
                    this.playersCountBeforeSwitch = this.countPlayersToPlay() - 1;
                }
                
                this.addHandHistory_AI(player, `${player.name} raised to ${this.curBet} chips. {pot-stat}`);
                this.addHandHistory(`${player.name} raised to ${this.curBet} chips.`);
                domTable.setBetForPlayer(player);
            
                this.lastPlay = 'raise';
                domTextEffect.createTextEffect ('raise', player);
                break;

            case 'call': case 'calls':
                if (this.curBet > player.stack) {
                    player.betCur += player.stack;
                    player.stack = 0;
                } else {
                    player.stack -= this.curBet - player.betCur;
                    player.betCur = this.curBet;
                }

                this.addHandHistory_AI (player, `{player} called. {pot-stat}`);
                this.addHandHistory (`${player.name} called.`);

                domTable.setBetForPlayer (player);

                this.playersCountBeforeSwitch--;
                domTextEffect.createTextEffect ('call', player);
                break;

            case 'fold':case 'folds':
                player.hand = [];
                domTable.removeCardsForPlayer (player);

                this.addHandHistory_AI (player, `{player} folds.`);
                this.addHandHistory (`${player.name} folds.`);

                this.playersCountBeforeSwitch--;
                domTextEffect.createTextEffect ('fold', player);
                break;

        }

        this.updateAllPlayerTextsInDom ();

        this.changeTurn ();
        domController.changeControlSituation ();
    }

    changeTurn () { 
        let playersLeft = this.players.filter ((player)=>player.hand.length > 0).length;

        if (playersLeft > 1) {
            if (this.playersCountBeforeSwitch > 0) {
                this.switchCurTurn ();
            } else {
                this.changePhase ();
            }
        } else {
            this.awardPot ();
        }
    }

    changePhase () { 
        // Collect the pot
        this.players.forEach ((player) => {
            this.pot += player.betCur;
            player.betCur = 0;
        });
        domTable.updatePotAndBoard (this.pot, this.board.join (', '));
        this.curBet = 0;

        // Change Phase
        let phases = ['pre-flop', 'flop', 'turn', 'river', 'showdown'];
        this.phase = phases [phases.indexOf (this.phase) + 1];

        switch (this.phase) {
            case 'flop': 

                this.board.push (...this.dealCard (3)); 
                
                this.addHandHistory_AI (null, `Flop is ${this.board.join (', ')}`);
                this.addHandHistory (`Flop is ${this.board.join (', ')}`);
                
                this.playersCountBeforeSwitch = this.players.filter ((player)=>player.hand.length > 0 && player.stack > 0).length;
                this.curTurn = this.players.find ((player) => player.pos === 'BB');
                this.switchCurTurn ();
                break;

            case 'turn': 

                this.board.push (...this.dealCard (1)); 
                
                this.addHandHistory_AI (null, `Turn is ${this.board [3]}`);
                this.addHandHistory (`Turn is ${this.board [3]}`);
                
                this.playersCountBeforeSwitch = this.players.filter ((player)=>player.hand.length > 0 && player.stack > 0).length;
                this.curTurn = this.players.find ((player) => player.pos === 'BB');
                this.switchCurTurn ();

                break;

            case 'river':

                this.board.push (...this.dealCard (1));

                this.addHandHistory_AI (null, `River is ${this.board [4]}`);
                this.addHandHistory (`River is ${this.board [4]}`);

                this.playersCountBeforeSwitch = this.players.filter ((player)=>player.hand.length > 0 && player.stack > 0).length;
                this.curTurn = this.players.find ((player) => player.pos === 'BB');
                this.switchCurTurn ();
                break;

            case 'showdown':
                this.addHandHistory (`Showdown`);

                this.revealAllHand ();
                let winningPlayers = handEvaluator.compareHands ();
                this.awardPot (winningPlayers);
                break;
        }

        this.updateAllPlayerTextsInDom ();
        domController.changeControlSituation ();
        domTable.setBetForPlayers ();
    }

    async switchCurTurn () { 
        let curIndex = this.players.indexOf (this.curTurn),
            isChangePhase = false;

        curIndex++; if (curIndex >= this.players.length) curIndex = 0;
        while (this.players[curIndex].hand.length <= 0 || this.players[curIndex].stack <= 0 || curIndex === this.players.indexOf (this.curTurn)) {
            curIndex++; if (curIndex >= this.players.length) curIndex = 0;

            if (curIndex === this.players.indexOf (this.curTurn)) {
                isChangePhase = true;
                break;
            }
        }

        if (!isChangePhase && this.players.filter ((player)=>player.hand.length > 0).length > 1) {
            this.curTurn = this.players [curIndex];

            this.updateAllPlayerTextsInDom ();

            /* PUT AI CODES HERE */
            if (this.curTurn.isAI) {
                domController.hideDisplay ();
                let response = await this.askAIForDecision (),
                    data = response.split (' ').filter ((val, ind) => ind < 2),
                    explanation = response.split (' ').filter ((val, ind) => ind >= 2).join (' ');

                domController.showDisplay ();
                
                this.player_doAction (this.curTurn, data[0].toLowerCase (), data[1]);
            }
        } else {
            this.changePhase ();
        }
    }

    async askAIForDecision (){
        let msg = `Let's play poker, situation: `;
        msg += `${this.curTurn.handHistoryAI.join (', ')}. You are only allowed to reply with any of your current options: `;
        msg += (this.curBet === 0) ? `CHECK, BET [amount].` : `CALL, RAISE [total bet, call chips + raise chips], FOLD. Then add an explanation seperated by :.`;
        msg += `Sample response: ${(this.curBet === 0) ? `BET 5` : `RAISE 5`} : [Explanation] `;

        this.expectedAnswers = [];
        if (this.curBet === 0) {
            this.expectedAnswers = ['CHECK', 'BET'];
        } else {
            this.expectedAnswers = ['CALL', 'RAISE', 'FOLD'];
        }

        console.log ('Sending message to AI:');
        console.log (msg);

        await new Promise(resolve => setTimeout(resolve, 1000));

        let response = await window.apiHandler.sendMessage (msg);
        console.log (`Received response: ${response}`);

        if (response && this.expectedAnswers.includes (response.split (' ')[0])) {
            return response;
        } else {
            console.log ('Response invalid. Will ask AI again...');
            return this.askAIForDecision ();
        }
    }

    revealAllHand (){
        domTable.removeAllPlayerCards ();

        this.players.forEach ((player) => {
            if (player.hand.length > 0) {
                player.hand.forEach ((card, ind) => domTable.createCardForPlayer (player, player.hand [ind]));
            }
        });
    }

    async awardPot (winners) {
        let winner = null;
        if (!winners || winners.length === 1) {
            if (!winners){
                winner = this.players.filter ((player)=>player.hand.length > 0)[0];
                winners = [winner];
            } else {
                winner = winners[0];
            }
            
            this.addHandHistory (`Hand is done, winner is ${winner.name}`);

            this.players.forEach ((player) => {
                this.pot += player.betCur;
                player.betCur = 0;
            });

            if (winner.sidePot > 0) {
                let sidePotWin = winner.sidePot * 2;

                if (this.pot > sidePotWin) {
                    this.pot -= sidePotWin;
                    winner.stack += sidePotWin;
                    domTable.showWin ([winner]);
                    this.awardPot (winners);
                }
            } else {
                winner.stack += this.pot;
            }
            
        } else if (winners.length > 1) {
            this.addHandHistory (`Chopped pot.`);

            this.players.forEach ((player) => {
                this.pot += player.betCur;
                player.betCur = 0;
            });

            let chop = this.pot / winners.length;
            winners.forEach ((player) => {
                player.stack += Math.round (chop);
            });

        }

        this.pot = 0;
        
        domTable.setBetForPlayers ();

        this.updateAllPlayerTextsInDom ();
        domController.hideDisplay ();
        domTable.showWin (winners);

        this.players.filter ((player) => player.stack <= 0).forEach ((player) => {
            if (!this.rankings.includes (player)) {
                this.rankings.unshift (player);

                if (player.id === 0) {
                    this.endGame ();
                }
            }
        });
        
        if (!this.isGameOver) {
            if (this.countPlayersStillPlaying () > 1) {
                this.addHandHistory (`Next hand starts in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
    
                domController.showDisplay ();
                this.startNewHand ();
            } else {
                this.endGame ();
            }
        }
    }

    endGame (){
        this.isGameOver = true;
        
        let rankingPlayer = this.rankings.indexOf (this.players [0]);
        if (rankingPlayer === -1) rankingPlayer = 0;
        rankingPlayer += this.players.filter ((player)=>player.stack > 0 && player.id !== 0).length;
        domWin.show (rankingPlayer);
    }

    addHandHistory (action) {
        this.handHistory.push (action);
    }

    addHandHistory_AI (playerDoingAction, action, addToNotPlayer = true) {
        let actionOrig = action;

        this.players.forEach ((playerToAddHistory) => {
            if (playerDoingAction === null) playerDoingAction = playerToAddHistory;
            if (!addToNotPlayer && playerDoingAction.id !== playerToAddHistory.id) return;

            action = actionOrig;
            action = action.replace ('0S', '10S');
            action = action.replace ('0H', '10H');
            action = action.replace ('0D', '10D');
            action = action.replace ('0C', '10C');
            action = action.replace (/{pot-stat}/g, `({player} cur chips: ${playerDoingAction.stack})`);
            action = action.replace (/{player}/g, (playerDoingAction.id === playerToAddHistory.id) ? 'You' : playerDoingAction.name);

            playerToAddHistory.handHistoryAI.push (action);
        });
    }

    updateAllPlayerTextsInDom (){
        this.players.forEach ((player) => {
            domTable.updatePlayerBox (player);
        });
        domTable.updatePotAndBoard (this.pot, this.board.join (', '));

        domTable.removeAllCardsOnBoard ();
        this.board.forEach ((card) => domTable.createCardToBoard (card));
    }

    countPlayersToPlay (){ return this.players.filter ((player)=>player.hand.length > 0 && player.stack > 0).length; }
    countPlayersStillPlaying (){ return this.players.filter ((player)=>player.stack > 0).length; }
}

window.gameHandler = new GameHandler ();