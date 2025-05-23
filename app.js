const API_KEY = `abc65e18e010a95f49af0bd3241e7992`
const image_path = `https://image.tmdb.org/t/p/w1280`

const input = document.querySelector('.search input')
const btn = document.querySelector('.search button')
const main_grid_title = document.querySelector('.favorites h1')
const main_grid = document.querySelector('.favorites .movies-grid')

const trending_el = document.querySelector('.trending .movies-grid')
const popup_container = document.querySelector('.popup-container')

// Carrossel
const sliders = document.querySelector(".carrosselBox");
let scrollAmount = 0;
let scrollPerClick = 100;
const imagePadding = 20;

function sliderScrollLeft() {
  scrollAmount = Math.max(0, scrollAmount - scrollPerClick);
  sliders.scrollTo({
    top: 0,
    left: scrollAmount,
    behavior: "smooth",
  });
}

function sliderScrollRight() {
  const maxScrollLeft = sliders.scrollWidth - sliders.clientWidth;
  if (scrollAmount < maxScrollLeft) {
    scrollAmount = Math.min(maxScrollLeft, scrollAmount + scrollPerClick);
    sliders.scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: "smooth",
    });
  }
}

async function showMovieData() {
  const apiKey = "abc65e18e010a95f49af0bd3241e7992";

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`
    );

    const movies = response.data.results;

    movies.forEach((movie, index) => {
      sliders.insertAdjacentHTML(
        "beforeend",
        `<img 
          class="img-${index} slider-img" 
          src="https://image.tmdb.org/t/p/w300/${movie.poster_path}" 
          data-id="${movie.id}"
        />`
      );
    });

    const sliderImgs = document.querySelectorAll(".slider-img");
    sliderImgs.forEach(img => {
      img.addEventListener("click", () => {
        const movieId = img.getAttribute("data-id");
        show_popup({ getAttribute: () => movieId });
      });
    });

  } catch (error) {
    console.error("erro ao buscar filme", error);
  }
}

showMovieData();

// Funções principais

function add_click_effect_to_card(cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => show_popup(card))
    })
}

async function get_movie_by_search(search_term) {
    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search_term}`)
    const respData = await resp.json()
    return respData.results
}

btn.addEventListener('click', add_searched_movies_to_dom)

async function add_searched_movies_to_dom() {
    const data = await get_movie_by_search(input.value)

    main_grid_title.innerText = `Search Results...`
    main_grid.innerHTML = data.map(e => {
        return `
            <div class="card" data-id="${e.id}">
                <div class="img">
                    <img src="${image_path + e.poster_path}">
                </div>
                <div class="info">
                    <h2>${e.title}</h2>
                    <div class="single-info">
                        <span>Rate: </span>
                        <span>${e.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date: </span>
                        <span>${e.release_date}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')

    const cards = document.querySelectorAll('.card')
    add_click_effect_to_card(cards)
}

// POPUP
async function get_movie_by_id(id) {
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData
}

async function get_movie_trailer(id) {
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData.results[0]?.key
}

async function show_popup(card) {
    const movie_id = card.getAttribute('data-id')
    const movie = await get_movie_by_id(movie_id)
    const movie_trailer = await get_movie_trailer(movie_id)

    popup_container.classList.add('show-popup')
    popup_container.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${image_path + movie.poster_path})`

    popup_container.innerHTML = `
        <span class="x-icon">&#10006;</span>
        <div class="content">
            <div class="left">
                <div class="poster-img">
                    <img src="${image_path + movie.poster_path}" alt="">
                </div>
                <div class="single-info">
                    <span>Add to favorites:</span>
                    <span class="heart-icon">&#9829;</span>
                </div>
            </div>
            <div class="right">
                <h1>${movie.title}</h1>
                <h3>${movie.tagline}</h3>
                <div class="single-info-container">
                    <div class="single-info">
                        <span>Language:</span>
                        <span>${movie.spoken_languages[0]?.name}</span>
                    </div>
                    <div class="single-info">
                        <span>Length:</span>
                        <span>${movie.runtime} minutes</span>
                    </div>
                    <div class="single-info">
                        <span>Rate:</span>
                        <span>${movie.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Budget:</span>
                        <span>$ ${movie.budget}</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date:</span>
                        <span>${movie.release_date}</span>
                    </div>
                </div>
                <div class="genres">
                    <h2>Genres</h2>
                    <ul>
                        ${movie.genres.map(e => `<li>${e.name}</li>`).join('')}
                    </ul>
                </div>
                <div class="overview">
                    <h2>Overview</h2>
                    <p>${movie.overview}</p>
                </div>
                ${movie_trailer ? `
                <div class="trailer">
                    <h2>Trailer</h2>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${movie_trailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>` : ''}
            </div>
        </div>
    `

    const x_icon = document.querySelector('.x-icon')
    x_icon.addEventListener('click', () => popup_container.classList.remove('show-popup'))

    const heart_icon = popup_container.querySelector('.heart-icon')
    const movie_ids = get_LS()
    if (movie_ids.includes(movie_id)) {
        heart_icon.classList.add('change-color')
    }

    heart_icon.addEventListener('click', () => {
        if (heart_icon.classList.contains('change-color')) {
            remove_LS(movie_id)
            heart_icon.classList.remove('change-color')
        } else {
            add_to_LS(movie_id)
            heart_icon.classList.add('change-color')
        }
        fetch_favorite_movies()
    })
}

// Local Storage
function get_LS() {
    const movie_ids = JSON.parse(localStorage.getItem('movie-id'))
    return movie_ids === null ? [] : movie_ids
}
function add_to_LS(id) {
    const movie_ids = get_LS()
    if (!movie_ids.includes(id)) {
        localStorage.setItem('movie-id', JSON.stringify([...movie_ids, id]))
    }
}
function remove_LS(id) {
    const movie_ids = get_LS()
    localStorage.setItem('movie-id', JSON.stringify(movie_ids.filter(e => e !== id)))
}

// Favorite Movies
fetch_favorite_movies()
async function fetch_favorite_movies() {
    main_grid.innerHTML = ''
    main_grid_title.innerText = 'Favorite Movies'

    const movies_LS = get_LS()
    const promises = movies_LS.map(id => get_movie_by_id(id))
    const movies = await Promise.all(promises)

    main_grid.innerHTML = movies.map(movie_data => {
        return `
            <div class="card" data-id="${movie_data.id}">
                <div class="img">
                    <img src="${image_path + movie_data.poster_path}">
                </div>
                <div class="info">
                    <h2>${movie_data.title}</h2>
                    <div class="single-info">
                        <span>Rate: </span>
                        <span>${movie_data.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date: </span>
                        <span>${movie_data.release_date}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')

    const cards = document.querySelectorAll('.card')
    add_click_effect_to_card(cards)
}

// Trending Movies
get_trending_movies()
async function get_trending_movies() {
    const resp = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData.results
}

add_to_dom_trending()
async function add_to_dom_trending() {
    const data = await get_trending_movies()

    trending_el.innerHTML = data.slice(0, 10).map(e => {
        return `
            <div class="card" data-id="${e.id}">
                <div class="img">
                    <img src="${image_path + e.poster_path}">
                </div>
                <div class="info">
                    <h2>${e.title || e.name}</h2>
                    <div class="single-info">
                        <span>Rate: </span>
                        <span>${e.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date: </span>
                        <span>${e.release_date || e.first_air_date}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')

    const cards = document.querySelectorAll('.trending .card')
    add_click_effect_to_card(cards)
}

fetch('http://localhost:3000/perfil')
  .then(res => res.json())
  .then(perfil => {
    document.getElementById('nomeUsuario').textContent = perfil.nome;
    document.getElementById('emailUsuario').textContent = perfil.email;
    // etc.
  });


  fetch('http://localhost:3000/perfil')
  .then(res => res.json())
  .then(perfil => {
    document.getElementById('nomePerfil').textContent = perfil.nome;
    document.getElementById('minibioPerfil').textContent = perfil.minibio;
    document.getElementById('cursoTurma').textContent = `${perfil.curso} - ${perfil.turma}`;
    document.getElementById('linkedinPerfil').textContent = `LinkedIn: ${perfil.linkedin}`;
    document.getElementById('githubPerfil').textContent = `GitHub: ${perfil.github}`;
    document.getElementById('instagramPerfil').textContent = `Instagram: ${perfil.instagram}`;
  });
