export default function () {
  document.querySelector('.js-themeswitcher').addEventListener('click', () => {
    const transition = 'color 350ms ease 0s, background 350ms ease 0s';
    document.getElementsByTagName('body')[0].style.transition = transition;
    const hero = document.querySelector('.article__header.-hero');
    if (hero) {
      hero.style.transition = transition;
    }

    if (document.documentElement.getAttribute('data-theme') == 'light') {
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });
}
