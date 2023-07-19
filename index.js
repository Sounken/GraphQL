function validateForm() {  
  // Récupérez les données du formulaire à l'aide de FormData
  const form = document.querySelector('form');
  const formData = new FormData(form);
  
  // Récupérez les champs username et password à partir des données du formulaire
  const username = formData.get('username');
  const password = formData.get('password');
  
  // Vérifiez si les champs sont vides
  if (username === "" || password === "") {
    alert("Veuillez remplir tous les champs.");
    return;
  }
  const response = axios.post("https://zone01normandie.org/api/auth/signin", {},
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-type': 'application/json'
        }
      }).then(function (response) {
      var token = response.data;
      // Stockez le token dans le stockage local
      localStorage.setItem('jwt', token);
      // Redirigez vers la page d'accueil
     window.location.href = './home.html';
    })
    .catch(function (error) {
      console.log(error);
      alert(error)
    });

}
let form = document.querySelector('form');
form.addEventListener("submit", function (event) {
  event.preventDefault();
  validateForm();
});

window.onload = function() {
  // Récupérez les éléments à animer
  const button = document.querySelector('button');
  const inputs = document.querySelectorAll('input');

  // Ajoutez une animation au survol du bouton
  button.onmouseover = function() {
      this.style.transform = 'scale(1.1)';
      this.style.transition = 'transform 0.5s';
  };

  button.onmouseout = function() {
      this.style.transform = 'scale(1.0)';
      this.style.transition = 'transform 0.5s';
  };

  // Ajoutez une animation lorsque vous entrez dans les champs de texte
  inputs.forEach(input => {
      input.onfocus = function() {
          this.style.boxShadow = '0 0 10px #0f0';
          this.style.transition = 'box-shadow 0.5s';
      };

      input.onblur = function() {
          this.style.boxShadow = 'none';
          this.style.transition = 'box-shadow 0.5s';
      };
  });
};
