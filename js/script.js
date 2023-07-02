const wrapper = document.querySelector('.wrapper');
const input = wrapper.querySelector('.search-conteiner__input');
const searchConteiner = wrapper.querySelector('.search-conteiner__items');
const repositoriesContainer = wrapper.querySelector('.repositories-container__items');
const close = wrapper.querySelector('.repositories-container__item-close');

// debounce на поиск
function debounce(fn, ms) {
	let time;
	return function () {
		const callFunc = () => fn.apply(this, arguments);
		clearTimeout(time);
		time = setTimeout(callFunc, ms)
	}
}
// запрос из github api на имена репозитория
function getRepositoryFromApi(value) {
	return new Promise((resolve, reject) => {
		fetch(`https://api.github.com/search/repositories?q=${value}&per_page=5`)
		.then(response => response.json())
		.then(repository => resolve(repository))
		.catch(err => reject(err))
	})
}
// добавляем в разметку список по поиску
function showSearchFromRepositoryName(repository) {
	let nameRepo = repository.name;
	const elem = document.createElement('li');
	elem.classList.add('search-conteiner__item');
	elem.dataset.id = repository.id;
	elem.textContent = nameRepo;
	searchConteiner.appendChild(elem);
}
// запрос из github api на имя, логин, кол-во звёзд
function addDataFromRepository(id) {
	return new Promise((resolve, reject) => {
		fetch(`https://api.github.com/repositories/${id}`)
		.then(response => response.json())
		.then(repository => repository)
		.then(data => resolve(data))
		.catch(err => reject(err))
	})
}
// логика работы поиска
function searchInInput(e) {
	if (!input.value || e.code === 'Space') {
		searchConteiner.innerHTML = '';
		return;
	}
	getRepositoryFromApi(input.value)
	.then(data => {
		if (data.items.length === 0) {
			input.value = ''
			input.placeholder = 'Такого репозитория нет :('
		}
		searchConteiner.innerHTML = ''
		data.items.forEach(showSearchFromRepositoryName);
	})
}
const showResSearch = debounce(searchInInput, 420);
input.addEventListener('keyup', showResSearch);

// добавление результата по клику из списка поиска на старицу + очищение поиска
function addResSearch(e) {
	if (e.target.classList.contains('search-conteiner__item')) {
		addDataFromRepository(e.target.dataset.id)
		.then(data => {
			let nameRepo = data.name;
			let loginRepo = data.owner.login;
			let starRepo = data.stargazers_count;
			const elem = document.createElement('li');
			elem.classList.add('repositories-container__item');
			elem.insertAdjacentHTML('beforeend' ,`Name: ${nameRepo}<br>Owner: ${loginRepo}<br>Stars: ${starRepo}<span class="repositories-container__item-close"></span>`);
			repositoriesContainer.appendChild(elem);
			input.value = '';
			input.placeholder = '';
		})
	}
	if (e.target.classList.contains('repositories-container__item-close')) {
		e.target.parentElement.remove(e.target);
	}
	if (e.target === input) {
		input.placeholder = '';
	}
	searchConteiner.innerHTML = '';
}
wrapper.addEventListener('click', addResSearch);

