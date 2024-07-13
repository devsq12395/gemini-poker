const apiGet = {
  divApiGet:                document.querySelector ('.api-get'),

  btnSubmit:                document.querySelector ('.btn-api-get-submit'),
  inputApiKey:              document.querySelector ('#input-apikey'),

  setup (){
    this.btnSubmit.addEventListener ('click', this.callbackSubmit.bind (this));
  },

  callbackSubmit (){
    const apiKey = this.inputApiKey.value;
    localStorage.setItem ('apiKey', apiKey);
    this.divApiGet.style.display = 'none';
  }
}