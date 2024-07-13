


const domController = {
    divControl:             document.querySelector ('.control'),
    betInput:               document.querySelector ('#bet-input'),
    btns: {
        check:          document.querySelector ('#btn-check'),
        call:           document.querySelector ('#btn-call'),
        bet:            document.querySelector ('#btn-bet'),
        raise:           document.querySelector ('#btn-raise'),
        fold:           document.querySelector ('#btn-fold'),

        askAI:           document.querySelector ('#btn-ask'),
    },

    labelChips:         document.querySelector ('#label-chips'),
    isRaising: false,

    setup (){
        // Buttons
        this.btns.check.addEventListener ('click', this.callbackCheck.bind (this));
        this.btns.call.addEventListener ('click', this.callbackCall.bind (this));
        this.btns.bet.addEventListener ('click', this.callbackBet.bind (this));
        this.btns.raise.addEventListener ('click', this.callbackRaise.bind (this));
        this.btns.fold.addEventListener ('click', this.callbackFold.bind (this));
        this.btns.askAI.addEventListener ('click', this.callbackAsk.bind (this));

        // Bet input
        this.betInput.addEventListener ('input', function() {
            this.updateBetLabel ();
        }.bind (this));
    },

    updateBetLabel (){
        let inputValue = this.betInput.value,
            chips = Number (window.gameHandler.curBet) + Number (inputValue);
        this.labelChips.innerHTML = `${chips} chips`;
    },

    callbackCheck (){
        let curTurn = window.gameHandler.curTurn;
        window.gameHandler.player_doAction (`${curTurn.name}`, 'check', 0);
    },

    callbackCall (){
        let val = Number (this.betInput.value),
            curTurn = window.gameHandler.curTurn;
        window.gameHandler.player_doAction (`${curTurn.name}`, 'call', val);
    },

    callbackBet (){
        let val = Number (this.betInput.value),
            curTurn = window.gameHandler.curTurn;
        window.gameHandler.player_doAction (`${curTurn.name}`, 'bet', val);
    },

    callbackRaise (){
        if (this.betInput.value <= 0) {
            alert ('Raise must be higher than the bet.');
            return;
        }

        let val = Number (this.betInput.value),
            curTurn = window.gameHandler.curTurn;
        window.gameHandler.player_doAction (`${curTurn.name}`, 'raise', val);
    },

    callbackFold (){
        let curTurn = window.gameHandler.curTurn;
        window.gameHandler.player_doAction (`${curTurn.name}`, 'fold', 0);
    },

    callbackAsk (){
        domPopup.showPopup ('Ask Gemini', 'Asking the AI...');
        domPopup.askAI ();
    },

    hideDisplay (){
        this.divControl.style.display = 'none';
    },

    showDisplay (){
        this.divControl.style.display = 'flex';
        this.updateBetLabel ();
        this.changeControlSituation ();
    },

    changeControlSituation (){
        if (window.gameHandler.curTurn.pos === 'BB' && window.gameHandler.curBet === _GLOBALS.BIG_BLIND) {
            this.btns.check.style.display = 'block';
            this.btns.call.style.display = 'none';
            this.btns.bet.style.display = 'none';
            this.btns.raise.style.display = 'block';
            this.btns.fold.style.display = 'none';

            this.isRaising = false;

        }else if (window.gameHandler.curBet === 0) {

            this.btns.check.style.display = 'block';
            this.btns.call.style.display = 'none';
            this.btns.bet.style.display = 'block';
            this.btns.raise.style.display = 'none';
            this.btns.fold.style.display = 'none';

            this.isRaising = false;
        } else if (window.gameHandler.lastPlay === 'bet' || window.gameHandler.lastPlay === 'raise') { 

            this.btns.check.style.display = 'none';
            this.btns.call.style.display = 'block';
            this.btns.bet.style.display = 'none';
            this.btns.raise.style.display = 'block';
            this.btns.fold.style.display = 'block';

            this.isRaising = true;
        }

        let inputMax = window.gameHandler.curTurn.stack + window.gameHandler.curTurn.betCur - window.gameHandler.curBet;
        if (inputMax <= 0) {
            this.btns.bet.style.display = 'none';
            this.btns.raise.style.display = 'none';
            this.betInput.style.display = 'none';
        } else {
            this.betInput.style.display = 'block';
            this.betInput.max = inputMax;
        }
        this.betInput.value = 0;
        this.updateBetLabel ();
    }

    
}