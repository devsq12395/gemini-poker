

const preloader = {

    preload () {
        const suits = ['H', 'C', 'D', 'S'];
        const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

        const cardURLs = [];
        values.forEach(value => {
            suits.forEach(suit => {
                cardURLs.push(`https://www.deckofcardsapi.com/static/img/${value}${suit}.png`);
            });
        });

        const cardImages = cardURLs.map(url => {
            const image = new Image();
            image.src = url;
            return image;
        });

        const backImage = new Image();
        backImage.src = 'https://www.deckofcardsapi.com/static/img/back.png';
        cardImages.push(backImage);

        // low prio - remove cardImages here
    }
};