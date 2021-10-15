import themeSwitcher from './modules/themeswitch'
import toggleNav from './modules/toggle-nav'
// import Carousel from './carousel';

function loader () {
  themeSwitcher()
  toggleNav()
  // Carousel();
}

if (document.readyState !== 'loading') {
  loader()
} else {
  window.addEventListener('DOMContentLoaded', loader)
}
