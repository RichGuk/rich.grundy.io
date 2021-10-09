export default function () {
  const leftButton = document.querySelector('.js-carousel-left');
  const rightButton = document.querySelector('.js-carousel-right');
  const container = document.querySelector('.js-carousel-photos');
  const firstPhoto = container.querySelector('li:first-child');
  const lastPhoto = container.querySelector('li:last-child');

  let widthOfPhoto = firstPhoto.offsetWidth;
  let photoGap = parseInt(window.getComputedStyle(container).rowGap, 10);
  let translatePos = 0;

  leftButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (leftButton.classList.contains('-disabled')) {
      return;
    }

    widthOfPhoto = firstPhoto.offsetWidth;
    photoGap = parseInt(window.getComputedStyle(container).rowGap, 10);

    translatePos = translatePos + (widthOfPhoto + photoGap);
    container.style.transform = `translateX(${translatePos}px)`;

    if (translatePos == 0) {
      leftButton.classList.add('-disabled');
    }
    rightButton.classList.remove('-disabled');
  });

  rightButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (rightButton.classList.contains('-disabled')) {
      return;
    }

    widthOfPhoto = firstPhoto.offsetWidth;
    photoGap = parseInt(window.getComputedStyle(container).rowGap, 10);

    translatePos = translatePos - (widthOfPhoto + photoGap);
    container.style.transform = `translateX(${translatePos}px)`;

    if (
      lastPhoto.getBoundingClientRect().right - widthOfPhoto * 1.5 <
      container.offsetLeft + container.offsetWidth
    ) {
      rightButton.classList.add('-disabled');
    }
    leftButton.classList.remove('-disabled');
  });
}
