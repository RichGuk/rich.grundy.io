export default function () {
  const navToggleBtn = document.querySelector('.js-toggle-nav')
  const navIcon = navToggleBtn.querySelector('.nav-icon')
  const header = document.querySelector('.js-main-header')

  navToggleBtn.addEventListener('click', () => {
    navIcon.classList.toggle('-is-open')
    header.classList.toggle('-nav-open')
  })
}
