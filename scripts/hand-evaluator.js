

let handEvaluator = {

    compareHands (){
        let winningPlayers = [], winningPlayer = null;
        window.gameHandler.players.forEach ((player) => {
            if (player.hand.length <= 0) return;

			let handValueCalc = this.getHandValue ([...player.hand, ...window.gameHandler.board]);
            player.handValue = handValueCalc.value;
			window.gameHandler.addHandHistory (`${player.name} has ${handValueCalc.valueStr}`);
			
            if (winningPlayer === null) {
                winningPlayer = player;
                winningPlayers = [player];

            } else if (winningPlayer.handValue === player.handValue){
                winningPlayers.push (player);

            } else if (winningPlayer.handValue < player.handValue){
                winningPlayer = player;
                winningPlayers = [player];

            }
        });

        return winningPlayers;
    },

    getHandValue (hand) {
		console.log (`input hand:`);
		console.log (hand);
        let valuesNum = ['2','3','4','5','6','7','8','9','0','J','Q','K','A'];
		

        let values = hand.map ((card) => valuesNum.indexOf (card.split ('')[0])),
            suits = hand.map ((card) => card.split('')[1]);
        let value = 0, valueStr = '';

        // High card
        value = values.reduce ((acc, curVal) => Math.max (acc, curVal));
		valueStr = `High Card: ${valueStr}`;

        // Pairs
        let pairs = 0,
            pairsValue = 0, pairsValue2 = 0,
            counts = {};
        values.forEach ((val) => {
            counts [val] = counts [val] ? counts [val] + 1 : 1;
        });
        Object.entries(counts).forEach(([val, count]) => {
            if (count === 2) {
                pairs++;
                if (pairsValue === 0) {
                    pairsValue = parseInt (val);
                } else {
                    if (pairsValue > parseInt (val)) {
                        pairsValue2 = Math.max(pairsValue2, parseInt (val));
                    } else {
                        let twoPairTemp = pairsValue;
                        pairsValue = parseInt (val);
                        pairsValue2 = twoPairTemp;
                    }
                }
                
            }
        });
        if (pairs === 1) {
            value = Math.max (value, pairsValue * 100 + 10000);
			valueStr = `One Pair`;
        } else if (pairs >= 2) {
            value = Math.max (value, pairsValue * 100 + pairsValue2 * 10 + 40000);
			valueStr = `Two Pair`;
        }
        // Count kickers - Pairs and High Card
        values.forEach ((val) => {
            if (val != pairsValue) {
                value += parseInt (val);
            }
            console.log (`value with kicker is ${value}`);
        });

        // Three-of-a-kind
        let trips = 0,
            tripsValue = 0;
        Object.entries(counts).forEach(([val, count]) => {
            if (count === 3) {
                trips++;
                tripsValue = Math.max(tripsValue, parseInt (val));
				valueStr = `Three-of-a-kind`;
            }
        });
        if (trips >= 1) {
            value = Math.max (value, tripsValue + 100000);
            // Count kickers - Three-of-a-kind
            values.forEach ((val) => {
                if (counts [val] < 3) {
                    value += parseInt (val);
                }
            });
        }

        // Straight
        let strMaxVal = 0,
            strChain = 1;
        values.sort((a, b) => a - b);
        values.forEach((val, index, arr) => {
            if (val === arr[index + 1]) return;

            if (index < arr.length - 1 && val + 1 === arr[index + 1]) {
                strChain++;
                strMaxVal = arr[index + 1];
            } else {
                if (strChain < 5) {
                    strChain = 1;
                    strMaxVal = 0;
                }
            }
        });
        if (strChain >= 5) {
            value = 1000000 + strMaxVal;
			valueStr = `Straight`;
        }

        // Flush
        let suitsCount = {'H': 0, 'D': 0, 'C': 0, 'S': 0},
            flushSuit = '',
            flushHighestVal = 0,
            isFlush = false;
        suits.forEach ((suit) => {
            suitsCount [suit]++;

            if (suitsCount [suit] >= 5) {
                flushSuit = suit;
            }
        });
        if (flushSuit !== '') {
            hand.forEach ((card) => {
                let cardSplit = card.split ('');
                if (cardSplit[1] === flushSuit) {
                    if (valuesNum.indexOf (cardSplit [0]) > flushHighestVal) {
                        flushHighestVal = valuesNum.indexOf (cardSplit [0]);
                    }
                }
            });
			
			valueStr = `Flush`;
            value = 10000000 + flushHighestVal;
            isFlush = true;
        }

        // Full House
        if (pairs >= 1 && trips >= 1){
            value = 100000000 + tripsValue * 100000 + pairsValue;
			valueStr = `Full House`;
        }

        // Four-of-a-kind
        let quads = 0,
            quadsValue = 0;
        Object.entries(counts).forEach(([val, count]) => {
            if (count === 4) {
                quads++;
                quadsValue = Math.max(quadsValue, parseInt (val));
				valueStr = `Four-of-a-kind`;
            }
        });
        if (quads >= 1) {
            value = Math.max (value, quadsValue + 1000000000);
        }

        // Straight Flush
        if (isFlush) {
            let cardsInSuit = hand.filter ((card) => card.split('')[1] === flushSuit),
                sfValues = cardsInSuit.map ((card) => valuesNum.indexOf (card.split ('')[0]));

            sfValues.sort((a, b) => a - b);

            let strFlushMaxVal = 0,
                strFlushChain = 1;
            sfValues.sort((a, b) => a - b);
            sfValues.forEach((val, index, arr) => {
                if (index < arr.length - 1 && val + 1 === arr[index + 1]) {
                    strFlushChain++;
                    strFlushMaxVal = arr[index + 1];
                } else {
                    if (strFlushChain < 5) {
                        strFlushChain = 1;
                        strFlushMaxVal = 0;
                    }
                }
            });
            if (strFlushChain >= 5) {
                value = 1000000000000 + strFlushMaxVal;
				valueStr = `Straight Flush`;
            }
        }
		
		console.log (`this hand's value is ${value}`);
		console.log (`this hand has ${valueStr}`);
        return {value, valueStr};
    }
}