import GLightbox from 'glightbox';
import themeSwitcher from './themeswitch';
// import Carousel from './carousel';

function loader() {
  themeSwitcher();
  // Carousel();

  GLightbox({
    selector: '.js-glightbox',
  });
}

if (document.readyState !== 'loading') {
  loader();
} else {
  window.addEventListener('DOMContentLoaded', loader);
}
