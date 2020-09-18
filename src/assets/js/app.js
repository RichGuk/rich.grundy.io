import GLightbox from 'glightbox';
import themeSwitcher from './themeswitch.js';

function loader() {
  themeSwitcher();

  GLightbox({
    selector: ".js-glightbox",
  });
}

if (document.readyState !== 'loading') {
  loader();
} else {
  window.addEventListener('DOMContentLoaded',  loader);
}
