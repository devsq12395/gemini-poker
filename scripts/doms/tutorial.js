



const domTutorial = {
    divTutorial:                document.querySelector ('.tutorial'),
    img:                        document.querySelector ('.tutorial-image'),

    btnNext:                    document.querySelector ('.btn-tutorial-next'),

    images: [],
    imagesPort: [], imagesLandscape: [],

    curPage: 0,
    spawnOnStart: false,

    setup () {
        let imgsCount = 0;
        while (imgsCount < 6) {
            this.imagesLandscape.push (`media/imgs/tut-0${imgsCount + 1}.png`);
            this.imagesPort.push (`media/imgs/tut-portrait-0${imgsCount + 1}.png`);
            imgsCount++;
        }
        
        if (this.spawnOnStart) {
            this.show ();
        } else {
            this.divTutorial.style.display = 'none';
        }

        this.btnNext.addEventListener ('click', this.callbackNext.bind (this));
        window.addEventListener ('resize', this.mediaQueryEvent.bind (this));
    },

    mediaQueryEvent (){
        if (window.innerWidth <= 876) {
            this.images = this.imagesPort;
        } else {
            this.images = this.imagesLandscape;
        }
        this.updateImage ();
    },

    show (page = 0){
        this.curPage = page;
        this.mediaQueryEvent ();
        this.divTutorial.style.display = 'flex';
    },

    updateImage (){
        this.img.src = this.images [this.curPage];
    },

    callbackNext (){
        this.curPage++;

        if (this.curPage < this.images.length) {
            this.updateImage ();
        } else {
            this.divTutorial.style.display = 'none';
        }
    }
};