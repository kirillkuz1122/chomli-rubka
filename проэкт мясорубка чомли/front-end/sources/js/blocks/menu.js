document.addEventListener("DOMContentLoaded", () => {
    // Находим все необходимые элементы в документе
    const burgerBtn = document.querySelector(".menu_burger");
    const closeBtn = document.querySelector(".menu-header_close");
    const navMenu = document.querySelector(".nav");

    // Проверяем, что все элементы существуют, чтобы избежать ошибок
    if (burgerBtn && closeBtn && navMenu) {
        // При клике на бургер добавляем класс, который покажет меню
        burgerBtn.addEventListener("click", () => {
            navMenu.classList.add("nav--open");
        });

        // При клике на крестик убираем класс, чтобы скрыть меню
        closeBtn.addEventListener("click", () => {
            navMenu.classList.remove("nav--open");
        });
    }
});
