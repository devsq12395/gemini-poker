

class TextEffect {

    imgs = {
        check: 'media/graphics/',
    }

    constructor (text, pos){
        this.div = document.createElement ('div');

        this.div.classList.add ('text-effect');
        this.div.style.backgroundImage = `url('media/imgs/texts-${text}.png')`;
        this.div.style.left = `${pos.left - 30}px`;
        this.div.style.top = `${pos.top-15}px`;

        setTimeout (()=>this.animate (), 10);
        setTimeout (()=>this.fadeOut (), 700);

        document.body.appendChild (this.div);
    }

    animate (){
        this.div.style.transform = 'translateY(-20px)';

        setTimeout (()=>{
            this.div.remove ();
        }, 1000);
    }

    fadeOut (){
        this.div.style.opacity = '0';
    }
};

const domTextEffect = {
    createTextEffect (text, player) { 
        new TextEffect (text, {
            top: domTable.playerDivs [player.name].elems.avatar.getBoundingClientRect().top,
            left: domTable.playerDivs [player.name].elems.avatar.getBoundingClientRect().left
        });
    }
};