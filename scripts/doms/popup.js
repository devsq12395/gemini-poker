




const domPopup = {
    divPopup: document.querySelector ('.popup'),
    txtTitle: document.querySelector ('.popup-title'),
    txtMsg: document.querySelector ('.popup-msg'),
    btnOk: document.querySelector ('.popup-btn-ok'),

    setup () {
        this.btnOk.addEventListener ('click', function (){
            this.hidePopup ();
        }.bind (this));
    },

    showPopup (title, msg) {
        this.divPopup.style.display = 'flex';
        this.txtTitle.innerHTML = title;
        this.txtMsg.innerHTML = msg;
    },

    hidePopup (){
        this.divPopup.style.display = 'none';
    },

    async askAI (){
        this.btnOk.style.display = 'none';

        let msg = `Reply within 250 characters only. Only use HTML tags and never any other special characters. Use <br> instead of creating a new line. Do not use any special characters except HTML tags. I'm new in poker who barely understands the basics. What would you do in this poker situation, and give advice: `;
        msg += `${window.gameHandler.players[0].handHistoryAI.join (', ')}.`;
        msg += ``

        console.log ('Sending message to AI:');
        console.log (msg);

        await new Promise(resolve => setTimeout(resolve, 500));

        let response = await window.apiHandler.sendMessage (msg);
        response = response.replace(/\*/g, '');
        console.log (`Received response: ${response}`);

        this.txtMsg.innerHTML = `AI says:<br><br>${response}`;
        this.btnOk.style.display = 'block';
    }
};