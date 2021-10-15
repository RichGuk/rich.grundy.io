import GLightbox from 'glightbox'
import toggleNav from './modules/toggle-nav'

function loader () {
  GLightbox({
    selector: '.js-glightbox'
  })

  toggleNav()
}

if (document.readyState !== 'loading') {
  loader()
} else {
  window.addEventListener('DOMContentLoaded', loader)
}
