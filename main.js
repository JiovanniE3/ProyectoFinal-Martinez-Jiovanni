const mainElement = document.querySelector('main');
const btnCarrito = document.getElementById("btnCarrito");
const carrito = document.querySelector(".carrito");
const carritoCompra = document.querySelector(".carritoCompra");
const carritoItems = [];
const publicKey = '385640fa87c936a853efecf275715932';
const privateKey = 'c7ce58fa0f3698adccbf3ce8762654d9c9d59180';
const baseUrl = 'https://gateway.marvel.com/v1/public';
const endpoint = '/comics';
const timestamp = Date.now();
const hash = CryptoJS.MD5(timestamp + privateKey + publicKey);
const url = `${baseUrl}${endpoint}?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&limit=30&titleStartsWith=Iron Man`;
let superheroBase = [];

fetch(url)
  .then(response => response.json())
  .then(data => {
    superheroBase = data.data.results;
    let html = "";
    superheroBase.forEach(superhero => {
      html += `
        <div class="carta"> 
          <h3>${superhero.title}</h3>
          <img src="${superhero.thumbnail.path}/portrait_incredible.${superhero.thumbnail.extension}" alt="${superhero.title}">
          <h4>Precio: $${superhero.prices[0].price}</h4>
          <button id="${superhero.id}" class="btn addCart">Add to Cart</button>
        </div>
      `;
    });

    console.log(superheroBase);
    mainElement.innerHTML = html;

    recoverStorage();
    addCartListeners();

  })
  .catch(error => {
    console.error(error);
  });

function addCartListeners() {
  const addCartButtons = document.querySelectorAll(".addCart");
  addCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const selectedItem = event.target;
      const selectedId = parseInt(selectedItem.id);
      const comicSelected = superheroBase.find(item => item.id === selectedId);

      const index = carritoItems.findIndex(item => item.comicSelected.id === comicSelected.id);
      if (index !== -1) {
        carritoItems[index].cantidad += 1;
      } else {
        carritoItems.push({ comicSelected, cantidad: 1 });
      }

      aviso ();
      saveStorage();
      mostrarItems();
    });
  });
}

btnCarrito.addEventListener("click", function () {
  if (btnCarrito.checked) {
    carrito.style.visibility = "visible";
  } else {
    carrito.style.visibility = "hidden";
  }
});

function mostrarItems() {
  let html = "";
  let totalPrecio = 0;

  carritoItems.forEach(item => {
    const superhero = item.comicSelected;
    let cantidad = item.cantidad;
    const precio = superhero.prices[0].price;
    const precioTotal = precio * cantidad;
    totalPrecio += precioTotal;

    html += `
      <div class="cartaCart"> 
        <h3>${superhero.title}</h3>
        <img src="${superhero.thumbnail.path}/portrait_incredible.${superhero.thumbnail.extension}" alt="${superhero.title}">
        <h4>Precio: $${superhero.prices[0].price}</h4>
        <p>${cantidad}</p>
        <button class="cartButton addMore material-icons" data-id="${superhero.id}">add</button>
        <button class="cartButton removeOne material-icons" data-id="${superhero.id}">remove</button>
      </div>
    `;
  });

  document.getElementById("totalPrecio").textContent = `Total: $${totalPrecio.toFixed(2)}`;

  carritoCompra.innerHTML = html;

  const addMoreButtons = document.querySelectorAll(".addMore");
  addMoreButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const selectedId = parseInt(event.target.getAttribute("data-id"));
      const index = carritoItems.findIndex(item => item.comicSelected.id === selectedId);
      if (index !== -1) {
        carritoItems[index].cantidad += 1;

        saveStorage();
        mostrarItems();
      }
    });
  });

  const removeOneButtons = document.querySelectorAll(".removeOne");
  removeOneButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const selectedId = parseInt(event.target.getAttribute("data-id"));
      const index = carritoItems.findIndex(item => item.comicSelected.id === selectedId);
      if (index !== -1) {
        carritoItems[index].cantidad -= 1;
        if (carritoItems[index].cantidad === 0) {
          carritoItems.splice(index, 1);
        }

        saveStorage();
        mostrarItems();
      }
    });
  });
}

function recoverStorage() {
  if (localStorage.getItem("carritoStorage")) {
    carritoItems.splice(0, carritoItems.length);
    const storedItems = JSON.parse(localStorage.getItem("carritoStorage"));
    storedItems.forEach(item => {
      carritoItems.push(item);
    });

    mostrarItems();
  }
}

function saveStorage() {
  localStorage.setItem("carritoStorage", JSON.stringify(carritoItems));
}

function aviso (){
  Swal.fire({
    title: '¡Se agregó al carrito!',
    icon: 'success',
    toast: true,
    position: 'top-start',
    showConfirmButton: false,
    timer: 1500,

  });
}