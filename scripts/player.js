

class Player {
    constructor (name, isAI, id){
        this.name = name;
        this.id = id;
        this.stack = _GLOBALS.STARTING_STACK;
        this.betCur = 0;
        this.pos = '';
        
        this.sidePotToWin = 0;

        this.hand = [];
        this.handValue = 0;
        this.handHistoryAI = [];

        this.isAI = isAI;
    }
}