import GLightbox from 'glightbox';

function loader() {
  GLightbox({
    selector: '.js-glightbox',
  });
}

if (document.readyState !== 'loading') {
  loader();
} else {
  window.addEventListener('DOMContentLoaded', loader);
}
