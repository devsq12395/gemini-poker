






const domWin = {
    divPopup: document.querySelector ('.win-popup'),
    txtTitle: document.querySelector ('.win-title'),
    txtDesc: document.querySelector ('.win-desc'),

    btnRestart: document.querySelector ('.win-popup-btn-restart'),

    rankings: ['1st', '2nd', '3rd', '4th'],

    setup (){
        this.divPopup.style.display = 'none';
        this.btnRestart.addEventListener ('click', this.callbackRestart.bind (this));
    },

    show (placing){
        this.txtTitle.innerHTML = (placing < 1) ? 'You Win!' : 'You Lost!';
        this.txtDesc.innerHTML = `${(placing < 1) ? `Congratulations!` : `Better luck next time!`}<br><br>Ranking: ${this.rankings [placing]}`;

        this.divPopup.style.display = 'flex';
    },

    callbackRestart (){
        this.divPopup.style.display = 'none';
        window.gameHandler.startNewGame ();
    }
};