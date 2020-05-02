const homepageEl = document.querySelector('.js-homepage');

if (homepageEl) {
  const typewriterEl = document.querySelector('.js-homepage-typewriter');
  const loadedContent = document.querySelectorAll('.js-loaded-content');

  if (localStorage.getItem('loadedHomepageBefore') == 'true') {
    homepageEl.classList.add('-is-done');

    for (var i = 0; i < loadedContent.length; i++) {
      var el = loadedContent[i];
      el.classList.add('-is-done')
    }
  }

  // After type event move the content up (transitionend listener is triggered
  // when that is done).
  typewriterEl.addEventListener('animationend', () => {
    setTimeout(() => {
      homepageEl.classList.add('-is-done');

      for (var i = 0; i < loadedContent.length; i++) {
        var el = loadedContent[i];
        el.classList.add('-is-done')
      }

      localStorage.setItem('loadedHomepageBefore', true);
    }, 300);

    setTimeout(() => typewriterEl.classList.add('-is-done'), 1200);
  });
}
