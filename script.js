import languageContent from './data.js';

const select = document.querySelector('select');
const title01 = document.getElementById('title01');

select.addEventListener('change', () => changeLanguage(select.value));

function changeLanguage(lang) {
  for (const key in languageContent[lang]) {
    document.getElementById(key).innerHTML = languageContent[lang][key];
  }
}
