import themeSwitcher from './modules/themeswitch';
// import Carousel from './carousel';

function loader() {
  themeSwitcher();
  // Carousel();
}

if (document.readyState !== 'loading') {
  loader();
} else {
  window.addEventListener('DOMContentLoaded', loader);
}
