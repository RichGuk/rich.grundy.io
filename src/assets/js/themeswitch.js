export default function () {
  const wantsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeSwitcher = document.querySelector('.js-themeswitcher');
  let darkMode = false;
  let storedPreference = localStorage.getItem('theme');

  function setDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeSwitcher.classList.remove('-light')
    themeSwitcher.classList.add('-dark');
  }

  function setLightMode() {
    document.documentElement.setAttribute('data-theme', 'light');
    themeSwitcher.classList.remove('-dark')
    themeSwitcher.classList.add('-light');
  }

  if (storedPreference == 'dark' || (!storedPreference && wantsDark)) {
    darkMode = true;
    setDarkMode();
  } else {
    setLightMode();
  }

  themeSwitcher.addEventListener('click', (e) => {
    if (darkMode) {
      darkMode = false;
      localStorage.setItem('theme', 'light');
      setLightMode();
    } else {
      darkMode = true;
      localStorage.setItem('theme', 'dark');
      setDarkMode();
    }
  });
};
