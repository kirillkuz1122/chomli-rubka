/* ТЕМА: загрузка предпочтения, переключение и сохранение */
const themeToggle = document.getElementById("themeToggle");

function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}
function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    themeToggle?.setAttribute("aria-pressed", t === "light");
}
document.addEventListener("DOMContentLoaded", () =>
    setTheme(getPreferredTheme())
);

themeToggle?.addEventListener("click", () => {
    const next =
        document.documentElement.getAttribute("data-theme") === "light"
            ? "dark"
            : "light";
    setTheme(next);
});

/* (необязательно) если пользователь не задавал тему — реагировать на смену системной */
if (!localStorage.getItem("theme") && window.matchMedia) {
    window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", (e) => {
            setTheme(e.matches ? "light" : "dark");
        });
}
/* синхронизация подписи кнопки темы в меню */
function updateThemeButtons() {
    const t =
        document.documentElement.getAttribute("data-theme") === "light"
            ? "Тёмная тема"
            : "Светлая тема";
    document
        .querySelectorAll('[data-role="theme-btn"]')
        .forEach((b) => (b.textContent = t));
}
document.addEventListener("DOMContentLoaded", updateThemeButtons);

/* если setTheme уже есть — дополним её вызовом обновления лейбла */
const __oldSetTheme = window.setTheme;
window.setTheme = function (t) {
    __oldSetTheme
        ? __oldSetTheme(t)
        : document.documentElement.setAttribute("data-theme", t);
    updateThemeButtons();
};

/* кнопка темы в меню */
const themeToggleDrawer = document.getElementById("themeToggleDrawer");
themeToggleDrawer?.addEventListener("click", () => {
    const next =
        document.documentElement.getAttribute("data-theme") === "light"
            ? "dark"
            : "light";
    setTheme(next);
});

/* по клику «Войти» в меню откроем твою модалку входа */
document.getElementById("drawerLogin")?.addEventListener("click", () => {
    closeDrawer?.(); // закроем меню (ф-ция у тебя уже есть)
    openModal?.(); // откроем модалку входа
});
// Иконка темы в меню
const themeToggleDrawerIcon = document.getElementById("themeToggleDrawerIcon");
themeToggleDrawerIcon?.addEventListener("click", () => {
    const next =
        document.documentElement.getAttribute("data-theme") === "light"
            ? "dark"
            : "light";
    setTheme(next); // используем твою существующую функцию
});

// Header padding sync
function syncHeaderPad() {
    const h = document.querySelector(".header")?.offsetHeight || 56;
    document.documentElement.style.setProperty("--header-h", h + "px");
    document.body.style.paddingTop = "var(--header-h)";
}
window.addEventListener("resize", syncHeaderPad, { passive: true });
document.addEventListener("DOMContentLoaded", syncHeaderPad);

// Robust 100vh on mobile
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", setVH, { passive: true });
window.addEventListener("orientationchange", setVH);
document.addEventListener("DOMContentLoaded", setVH);

// Drawer
const drawerClose = document.getElementById("drawerClose");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerNav = document.getElementById("drawerNav");
const drawer = document.getElementById("drawer");
const panel = drawer?.querySelector(".drawer__panel");
const burger = document.getElementById("burger");

function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    // если закрывалось ранее — уберём служебный класс
    drawer.classList.remove("drawer--closing");
    requestAnimationFrame(() => drawer.classList.add("drawer--open"));
    burger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
}
function closeDrawer() {
    if (!drawer) return;
    // меняем состояние на "закрывается"
    drawer.classList.remove("drawer--open");
    drawer.classList.add("drawer--closing");
    burger?.setAttribute("aria-expanded", "false");

    // когда панель доедет — полностью спрячем контейнер
    const onEnd = (e) => {
        if (e.target !== panel || e.propertyName !== "transform") return;
        drawer.classList.remove("drawer--closing");
        drawer.hidden = true;
        document.body.style.overflow = "";
        panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
}

burger?.addEventListener("click", openDrawer);
drawerClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);
drawerNav?.addEventListener("click", (e) => {
    if (e.target.matches("a")) closeDrawer();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && !drawer.hidden) closeDrawer();
});

// Side dots active
const dots = document.querySelectorAll(".side-nav__dot");
const sections = ["hero", "what", "tournaments", "top", "footer"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
const io = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const id = entry.target.id;
            const active =
                entry.isIntersecting && entry.intersectionRatio > 0.3;
            const link = [...dots].find(
                (a) => a.getAttribute("href") === `#${id}`
            );
            if (link) link.classList.toggle("active", active);
        });
    },
    { threshold: [0.3, 0.6] }
);
sections.forEach((sec) => io.observe(sec));

// Reveal on scroll
const revealEls = document.querySelectorAll("[data-reveal]");
const ioReveal = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                ioReveal.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => ioReveal.observe(el));

// Modal
const loginModal = document.getElementById("loginModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const openLogin = document.getElementById("openLogin");
let lastFocus = null;
function openModal() {
    lastFocus = document.activeElement;
    loginModal.hidden = false;
    requestAnimationFrame(() => loginModal.classList.add("modal--open"));
    document.body.style.overflow = "hidden";
    const first = loginModal.querySelector(".modal__body .btn");
    first?.focus();
}
function closeModal() {
    loginModal.classList.remove("modal--open");
    loginModal.addEventListener(
        "transitionend",
        () => {
            loginModal.hidden = true;
            document.body.style.overflow = "";
            lastFocus?.focus();
        },
        { once: true }
    );
}
openLogin?.addEventListener("click", openModal);
modalBackdrop?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !loginModal.hidden) closeModal();
    if (e.key === "Tab" && !loginModal.hidden) {
        const focusables = loginModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0],
            last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
        }
    }
});

// Horizontal scroll buttons
const hs = document.getElementById("hscroll");
const hsLeft = document.getElementById("hsLeft");
const hsRight = document.getElementById("hsRight");
hsLeft?.addEventListener(
    "click",
    () =>
        hs &&
        hs.scrollBy({
            left: -hs.clientWidth * 0.9,
            behavior: "smooth",
        })
);
hsRight?.addEventListener(
    "click",
    () =>
        hs &&
        hs.scrollBy({
            left: hs.clientWidth * 0.9,
            behavior: "smooth",
        })
);

/* Fit the word to one line */
function fitWord() {
    const el = document.getElementById("word");
    if (!el) return;
    const parent = el.parentElement;
    const maxW = Math.min(parent.clientWidth, window.innerWidth) - 24;
    const minPx = 48,
        maxPx = 240;
    el.style.fontSize = maxPx + "px";
    el.style.whiteSpace = "nowrap";
    let w = el.scrollWidth;
    let fs = parseFloat(getComputedStyle(el).fontSize);
    if (w > 0) {
        const ratio = (maxW * 0.98) / w;
        const next = Math.max(
            minPx,
            Math.min(maxPx, Math.floor(fs * Math.min(1, ratio)))
        );
        el.style.fontSize = next + "px";
    }
}
window.addEventListener("resize", fitWord, { passive: true });
window.addEventListener("orientationchange", fitWord);
document.addEventListener("DOMContentLoaded", () => {
    fitWord();
    setTimeout(fitWord, 50);
});

// ===== Qubit extras: modals DOM, validation, disabled buttons, code 8 cells, eyes, persistence, drawer flash fix =====
(function () {
    if (window.__QUBIT_BUNDLE__) return;
    window.__QUBIT_BUNDLE__ = true;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // Inject modals (без удаления твоего loginModal)
    function mountModals() {
        const wrap = document.createElement("div");
        wrap.innerHTML = `
      <!-- Регистрация -->
      <div id="regModal" class="modal" hidden>
        <div class="modal__backdrop" data-close="regModal"></div>
        <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="regTitle">
          <div class="modal__head">
            <div id="regTitle" class="modal__title">Регистрация</div>
            <button class="modal__close" data-close="regModal" aria-label="Закрыть">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <form class="modal__form" id="regForm" novalidate>
            <div class="field"><label>Логин</label><input class="input" name="login" placeholder="vasyaSO" data-required><div class="error" data-error-for="login"></div></div>
            <div class="field"><label>Почта</label><input class="input" type="email" name="email" data-required data-type="email"><div class="error" data-error-for="email"></div></div>
            <div class="field input-group"><label>Пароль</label><input class="input" type="password" name="pass" placeholder="********" minlength="8" data-required data-type="passrule"><button type="button" class="input-toggle" aria-label="Показать пароль"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg></button><div class="error" data-error-for="pass"></div></div>
            <div class="field input-group" data-for="pass2"><label>Повторите пароль</label><input class="input" type="password" name="pass2" placeholder="********" data-required data-type="match:pass"><button type="button" class="input-toggle" aria-label="Показать пароль"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg></button><div class="error" data-error-for="pass2"></div></div>
            <label class="checkbox"><input type="checkbox" name="agree" data-required-check><span>Принимаю условия пользовательского соглашения на обработку персональных данных</span></label>
            <div class="error" data-form-error></div>
            <button class="btn btn--accent btn--block is-disabled" type="submit" disabled>Зарегистрироваться</button>
            <div class="form__links"><a href="#" data-open="authModal">Войти в аккаунт</a></div>
          </form>
        </div>
      </div>

      <!-- О себе -->
      <div id="profileModal" class="modal" hidden>
        <div class="modal__backdrop" data-close="profileModal"></div>
        <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="profileTitle">
          <div class="modal__head">
            <div id="profileTitle" class="modal__title">О себе</div>
            <button class="modal__close" data-close="profileModal" aria-label="Закрыть">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <form class="modal__form" id="profileForm" novalidate>
            <div class="field"><label>Фамилия</label><input class="input" name="lastName" data-required></div>
            <div class="field"><label>Имя</label><input class="input" name="firstName" data-required></div>
            <div class="field"><label>Отчество</label><input class="input" name="middleName"></div>
            <div class="field"><label>Город</label><input class="input" name="city" data-required></div>
            <div class="field"><label>Место обучения</label><input class="input" name="place" data-required></div>
            <div class="field"><label>Класс/группа/курс</label><input class="input" name="class" data-required></div>
            <div class="error" data-form-error></div>
            <button class="btn btn--accent btn--block is-disabled" type="submit" disabled>Продолжить</button>
          </form>
        </div>
      </div>

      <!-- Авторизация -->
      <div id="authModal" class="modal" hidden>
        <div class="modal__backdrop" data-close="authModal"></div>
        <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="authTitle">
          <div class="modal__head">
            <div id="authTitle" class="modal__title">Авторизация</div>
            <button class="modal__close" data-close="authModal" aria-label="Закрыть">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <form class="modal__form" id="authForm" novalidate>
            <div class="field"><label>Логин</label><input class="input" name="login" data-required></div>
            <div class="field input-group"><label>Пароль</label><input class="input" type="password" name="pass" data-required><button type="button" class="input-toggle" aria-label="Показать пароль"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a18.9 18.9 0 0 1 4.19-4.86M7 7a10.7 10.7 0 0 1 5-2c7 0 11 7 11 7a18.9 18.9 0 0 1-4.1 4.75M1 1l22 22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"></path></svg></button></div>
            <button class="btn btn--accent btn--block is-disabled" type="submit" disabled>Войти</button>
            <div class="form__links">
              <a href="#" data-open="regModal">Создать аккаунт</a>
              <a href="#" data-open="forgotModal">Забыл пароль</a>
            </div>
          </form>
        </div>
      </div>

      <!-- Вход по коду — 8 ячеек -->
      <div id="codeModal" class="modal" hidden>
        <div class="modal__backdrop" data-close="codeModal"></div>
        <div class="modal__panel modal__panel--code" role="dialog" aria-modal="true" aria-labelledby="codeTitle">
          <div class="modal__head">
            <div id="codeTitle" class="modal__title">Вход по коду</div>
            <button class="modal__close" data-close="codeModal" aria-label="Закрыть">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <form class="modal__form" id="codeForm" novalidate>
            <div class="code-grid">
              <input class="input code-cell" maxlength="1" inputmode="latin" pattern="[A-Za-z0-9]" autocomplete="one-time-code" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <div class="code-sep">—</div>
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
              <input class="input code-cell" maxlength="1" pattern="[A-Za-z0-9]" />
            </div>
            <input type="hidden" name="code" value="">
            <button class="btn btn--accent btn--block is-disabled" type="submit" disabled>Войти</button>
          </form>
        </div>
      </div>

      <!-- Забыл пароль -->
      <div id="forgotModal" class="modal" hidden>
        <div class="modal__backdrop" data-close="forgotModal"></div>
        <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="forgotTitle">
          <div class="modal__head">
            <div id="forgotTitle" class="modal__title">Восстановление пароля</div>
            <button class="modal__close" data-close="forgotModal" aria-label="Закрыть">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <form class="modal__form" id="forgotForm" novalidate>
            <div class="field"><label>Почта</label><input class="input" type="email" name="email" placeholder="you@mail.ru" data-required data-type="email"><div class="error" data-error-for="email"></div></div>
            <button class="btn btn--accent btn--block is-disabled" type="submit" disabled>Сбросить пароль</button>
          </form>
        </div>
      </div>
    `;
        document.body.appendChild(wrap);
    }

    // helpers
    function isValidEmail(v) {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test((v || "").trim());
    }
    function hasOnlyLatin(s) {
        return !/[А-Яа-яЁё]/.test(s || "");
    }
    function passRuleOk(s) {
        return (s || "").length >= 8 && hasOnlyLatin(s) && /[A-Za-z]/.test(s);
    }

    function updateSubmitState(form) {
        const submit = form.querySelector('button[type="submit"]');
        if (!submit) return;
        let ok = true;

        form.querySelectorAll("[data-required]").forEach((el) => {
            if (!(el.value || "").trim()) ok = false;
        });
        form.querySelectorAll('[data-type="email"]').forEach((el) => {
            if (!isValidEmail(el.value)) ok = false;
        });
        form.querySelectorAll("[data-required-check]").forEach((ch) => {
            if (!ch.checked) ok = false;
        });
        const pass = form.querySelector('input[name="pass"]');
        if (pass && pass.hasAttribute("data-type")) {
            ok = ok && passRuleOk(pass.value);
        }
        const mismatch = form.querySelector('[data-type^="match:"]');
        if (mismatch) {
            const target = mismatch.dataset.type.split(":")[1];
            const other = form.querySelector(`[name="${target}"]`);
            if (other && mismatch.value !== other.value) ok = false;
        }

        // code form: require 8 cells
        if (form.id === "codeForm") {
            const cells = Array.from(form.querySelectorAll(".code-cell"));
            const code = cells.map((i) => (i.value || "").trim()).join("");
            form.querySelector('input[name="code"]').value = code
                .slice(0, 8)
                .toUpperCase();
            if (code.length !== 8) ok = false;
        }

        submit.disabled = !ok;
        submit.classList.toggle("is-disabled", !ok);
    }

    function persistForm(form) {
        const key = "form:" + (form.id || "noid");
        try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            Object.entries(data).forEach(([name, val]) => {
                const el = form.elements[name];
                if (!el) return;
                if (el.type === "checkbox") el.checked = !!val;
                else el.value = val;
            });
        } catch {}
        const save = () => {
            const obj = {};
            Array.from(form.elements).forEach((el) => {
                if (el.name)
                    obj[el.name] =
                        el.type === "checkbox" ? el.checked : el.value;
            });
            try {
                localStorage.setItem(key, JSON.stringify(obj));
            } catch {}
            updateSubmitState(form);
        };
        form.addEventListener("input", save);
        form.addEventListener("change", save);
    }

    function addEyes(form) {
        form.querySelectorAll(".input-group .input-toggle").forEach((btn) => {
            const inp = btn.parentElement.querySelector(
                'input[type="password"]'
            );
            if (!inp) return;
            btn.addEventListener("click", () => {
                inp.type = inp.type === "password" ? "text" : "password";
            });
        });
    }

    function bindErrors(form) {
        // live mismatch message under pass2
        const pass2Box = form.querySelector('[data-error-for="pass2"]');
        const pass = form.querySelector('input[name="pass"]');
        const pass2 = form.querySelector('input[name="pass2"]');
        const formErr = form.querySelector("[data-form-error]");
        const setPass2Msg = () => {
            if (!pass2Box) return;
            if ((pass2?.value || "") && pass && pass2.value !== pass.value)
                pass2Box.textContent = "Пароли не совпадают";
            else pass2Box.textContent = "";
        };
        pass?.addEventListener("input", setPass2Msg);
        pass2?.addEventListener("input", setPass2Msg);

        form.addEventListener("submit", (e) => {
            if (formErr) formErr.textContent = "";
            // explicit errors
            if (
                pass &&
                pass.hasAttribute("data-type") &&
                !passRuleOk(pass.value)
            ) {
                e.preventDefault();
                if (formErr)
                    formErr.textContent =
                        "Пароль: минимум 8 символов и латинские буквы";
                return;
            }
            if (pass2 && pass && pass2.value !== pass.value) {
                e.preventDefault();
                setPass2Msg();
                return;
            }
            const submit = form.querySelector('button[type="submit"]');
            if (submit && submit.disabled) {
                e.preventDefault();
                return;
            }
        });
    }

    // code 8 inputs UX
    function bindCodeForm(form) {
        const cells = Array.from(form.querySelectorAll(".code-cell"));
        cells.forEach((inp, idx) => {
            inp.addEventListener("input", (e) => {
                let v = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                inp.value = v.slice(0, 1);
                if (inp.value && idx < cells.length - 1) cells[idx + 1].focus();
                updateSubmitState(form);
            });
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && !inp.value && idx > 0) {
                    cells[idx - 1].focus();
                }
                if (e.key === "-" && idx === 3) {
                    cells[4].focus();
                    e.preventDefault();
                }
            });
            inp.addEventListener("paste", (e) => {
                const data = (e.clipboardData.getData("text") || "")
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                if (!data) return;
                e.preventDefault();
                for (let i = 0; i < Math.min(8, data.length); i++) {
                    cells[i].value = data[i];
                }
                cells[data.length < 8 ? data.length : 7].focus();
                updateSubmitState(form);
            });
        });
    }

    // Open/close helpers (also used by your code)
    function closeAnyModals() {
        document.querySelectorAll(".modal").forEach((m) => {
            if (!m.hidden) {
                m.classList.remove("modal--open");
                m.addEventListener("transitionend", () => (m.hidden = true), {
                    once: true,
                });
            }
        });
        document.body.style.overflow = "";
    }
    function openModalById(id) {
        const m = document.getElementById(id);
        if (!m) return;
        closeAnyModals();
        m.hidden = false;
        requestAnimationFrame(() => m.classList.add("modal--open"));
        document.body.style.overflow = "hidden";
        const first = m.querySelector(
            'input,button,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        first && first.focus();
    }
    function closeModalById(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.remove("modal--open");
        m.addEventListener(
            "transitionend",
            () => {
                m.hidden = true;
                document.body.style.overflow = "";
            },
            { once: true }
        );
    }
    window.openModalById = openModalById;
    window.closeModalById = closeModalById;
    window.closeAnyModals = closeAnyModals;

    document.addEventListener("DOMContentLoaded", () => {
        mountModals();

        // hook your existing Login modal three buttons if present
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
            const btns = loginModal.querySelectorAll(".modal__body .btn");
            const [btnCode, btnLogin, btnReg] = btns;
            btnCode?.addEventListener("click", () => {
                closeModalById("loginModal");
                openModalById("codeModal");
            });
            btnLogin?.addEventListener("click", () => {
                closeModalById("loginModal");
                openModalById("authModal");
            });
            btnReg?.addEventListener("click", () => {
                closeModalById("loginModal");
                openModalById("regModal");
            });
        }

        // forms enhance
        [
            "regForm",
            "profileForm",
            "authForm",
            "codeForm",
            "forgotForm",
        ].forEach((id) => {
            const f = document.getElementById(id);
            if (!f) return;
            persistForm(f);
            addEyes(f);
            bindErrors(f);
            if (id === "codeForm") bindCodeForm(f);
            // initial button state
            updateSubmitState(f);
        });

        // global key ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const open = Array.from(
                    document.querySelectorAll(".modal")
                ).find((m) => !m.hidden);
                if (open) closeAnyModals();
            }
        });

        // data-open / data-close (works also on nested SVG)
        document.body.addEventListener(
            "click",
            (e) => {
                const closeEl = e.target.closest?.("[data-close]");
                if (closeEl) {
                    closeModalById(closeEl.getAttribute("data-close"));
                    e.preventDefault();
                    return;
                }
                const openEl = e.target.closest?.("[data-open]");
                if (openEl) {
                    openModalById(openEl.getAttribute("data-open"));
                    e.preventDefault();
                }
            },
            true
        );
    });
})();
// ===== PATCH • 2025-10-05 =====
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // email/пароль — проверки
    const isValidEmail = (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
    const noCyrillic = (s) => !/[А-Яа-яЁё]/.test(s || "");
    const passRuleOk = (s) =>
        (s || "").length >= 8 && noCyrillic(s) && /[A-Za-z]/.test(s);

    // Обновление доступности кнопки формы
    function updateSubmitState(form) {
        const submit = form.querySelector('button[type="submit"]');
        if (!submit) return;

        let ok = true;
        form.querySelectorAll("[data-required]").forEach((el) => {
            if (!(el.value || "").trim()) ok = false;
        });
        form.querySelectorAll('[data-type="email"]').forEach((el) => {
            if (!isValidEmail(el.value)) ok = false;
        });
        form.querySelectorAll("[data-required-check]").forEach((ch) => {
            if (!ch.checked) ok = false;
        });

        // Правила пароля + live-ошибка
        const pass = form.querySelector('input[name="pass"][data-type]');
        const passMsg = form.querySelector('[data-error-for="pass"]');
        if (pass) {
            const good = passRuleOk(pass.value);
            if (!good) {
                ok = false;
                if (passMsg)
                    passMsg.textContent =
                        "Минимум 8 символов и латинские буквы";
            } else if (passMsg) passMsg.textContent = "";
        }

        // Совпадение паролей + сообщение под вторым полем
        const pass2 = form.querySelector('input[name="pass2"]');
        const pass2Msg = form.querySelector('[data-error-for="pass2"]');
        if (pass && pass2) {
            if (pass2.value && pass2.value !== pass.value) {
                ok = false;
                if (pass2Msg) pass2Msg.textContent = "Пароли не совпадают";
            } else if (pass2Msg) pass2Msg.textContent = "";
        }

        // Код (8 символов в 8 ячейках)
        if (form.id === "codeForm") {
            const cells = Array.from(form.querySelectorAll(".code-cell"));
            const code = cells.map((i) => (i.value || "").trim()).join("");
            const hidden = form.querySelector('input[name="code"]');
            if (hidden) hidden.value = code.slice(0, 8).toUpperCase();
            if (code.length !== 8) ok = false;
        }

        submit.disabled = !ok;
        submit.classList.toggle("is-disabled", !ok);
    }
    window.__QUBIT_updateSubmitState = updateSubmitState;

    // Навешиваем обработчики на формы (если уже есть/добавлены динамически)
    function enhanceForm(id) {
        const f = document.getElementById(id);
        if (!f) return;
        const onAny = () => updateSubmitState(f);
        f.addEventListener("input", onAny);
        f.addEventListener("change", onAny);
        f.addEventListener("keyup", onAny);

        // "Глаз": состояние + диагональная черта, чтобы видно открыто/закрыто
        f.querySelectorAll(".input-group .input-toggle").forEach((btn) => {
            const inp = btn.parentElement.querySelector(
                'input[type="password"], input[type="text"]'
            );
            if (!inp) return;
            const sync = () => {
                const open = inp.type !== "password";
                btn.dataset.open = open ? "true" : "false";
                btn.classList.toggle("line", !open);
            };
            btn.addEventListener("click", () => {
                inp.type = inp.type === "password" ? "text" : "password";
                sync();
                onAny();
            });
            sync();
        });

        // Живое сообщение под повтором пароля
        const pass = f.querySelector('input[name="pass"]');
        const pass2 = f.querySelector('input[name="pass2"]');
        const pass2Msg = f.querySelector('[data-error-for="pass2"]');
        const syncPass2 = () => {
            if (!pass2Msg) return;
            if ((pass2?.value || "") && pass && pass2.value !== pass.value)
                pass2Msg.textContent = "Пароли не совпадают";
            else pass2Msg.textContent = "";
        };
        pass?.addEventListener("input", syncPass2);
        pass2?.addEventListener("input", syncPass2);

        // Блокируем submit, если disabled (на всякий случай)
        f.addEventListener("submit", (e) => {
            const s = f.querySelector('button[type="submit"]');
            if (s && s.disabled) e.preventDefault();
        });

        // Инициализация
        updateSubmitState(f);
    }

    // Применяем ко всем нашим формам (если они у тебя уже в DOM)
    ["regForm", "profileForm", "authForm", "codeForm", "forgotForm"].forEach(
        enhanceForm
    );

    // Если формы монтируются динамически твоим кодом позже — вызови:
    //   window.__QUBIT_updateSubmitState(document.getElementById('regForm'))
})();
// ===== PATCH • 2025-10-05 =====
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // Иконки глаза
    const EYE_CLOSE =
        '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg>';
    const EYE_OPEN =
        '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a18.9 18.9 0 0 1 4.19-4.86M7 7a10.7 10.7 0 0 1 5-2c7 0 11 7 11 7a18.9 18.9 0 0 1-4.1 4.75M1 1l22 22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

    // Валидаторы
    const isValidEmail = (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
    const noCyrillic = (s) => !/[А-Яа-яЁё]/.test(s || "");
    const passRuleOk = (s) =>
        (s || "").length >= 8 && noCyrillic(s) && /[A-Za-z]/.test(s);

    // Обновление доступности сабмита
    function updateSubmitState(form) {
        const submit = form.querySelector('button[type="submit"]');
        if (!submit) return;
        let ok = true;

        // required: поддерживаем data-required и native required
        form.querySelectorAll("[data-required], [required]").forEach((el) => {
            if (!(el.value || "").trim()) ok = false;
        });
        // email: data-type="email" или type=email
        form.querySelectorAll(
            '[data-type="email"], input[type="email"]'
        ).forEach((el) => {
            if (!isValidEmail(el.value)) ok = false;
        });
        // чекбокс
        form.querySelectorAll(
            '[data-required-check], input[type="checkbox"][required]'
        ).forEach((ch) => {
            if (!ch.checked) ok = false;
        });

        // пароль + подсказка
        const pass = form.querySelector('input[name="pass"]');
        const passMsg = form.querySelector('[data-error-for="pass"]');
        if (pass) {
            const good = passRuleOk(pass.value);
            if (!good) {
                ok = false;
                if (passMsg)
                    passMsg.textContent =
                        "Минимум 8 символов и латинские буквы";
            } else if (passMsg) passMsg.textContent = "";
        }

        // повтор пароля + подсказка под вторым полем
        const pass2 = form.querySelector('input[name="pass2"]');
        const pass2Msg = form.querySelector('[data-error-for="pass2"]');
        if (pass && pass2) {
            if (pass2.value && pass2.value !== pass.value) {
                ok = false;
                if (pass2Msg) pass2Msg.textContent = "Пароли не совпадают";
            } else if (pass2Msg) pass2Msg.textContent = "";
        }

        // форма кода — 8 ячеек
        if (form.id === "codeForm") {
            const cells = Array.from(form.querySelectorAll(".code-cell"));
            const code = cells.map((i) => (i.value || "").trim()).join("");
            const hidden = form.querySelector('input[name="code"]');
            if (hidden) hidden.value = code.slice(0, 8).toUpperCase();
            if (code.length !== 8) ok = false;
        }

        submit.disabled = !ok;
        submit.classList.toggle("is-disabled", !ok);
    }
    window.__QUBIT_updateSubmitState = updateSubmitState;

    // Переключатель глаза: меняем SVG и aria-label
    function bindEyes(form) {
        form.querySelectorAll(".input-group .input-toggle").forEach((btn) => {
            const inp = btn.parentElement.querySelector(
                'input[type="password"], input[type="text"]'
            );
            if (!inp) return;
            const sync = () => {
                const open = inp.type !== "password";
                btn.innerHTML = open ? EYE_CLOSE : EYE_OPEN;
                btn.setAttribute(
                    "aria-label",
                    open ? "Скрыть пароль" : "Показать пароль"
                );
            };
            btn.addEventListener("click", () => {
                inp.type = inp.type === "password" ? "text" : "password";
                sync();
            });
            sync();
        });
    }

    function enhanceForm(id) {
        const f = document.getElementById(id);
        if (!f) return;
        const any = () => updateSubmitState(f);
        f.addEventListener("input", any);
        f.addEventListener("change", any);
        f.addEventListener("keyup", any);
        bindEyes(f);
        f.addEventListener("submit", (e) => {
            const s = f.querySelector('button[type="submit"]');
            if (s && s.disabled) e.preventDefault();
        });
        updateSubmitState(f);
    }

    // Удаляем «Войти по коду» из авторизации (если внезапно появится)
    function removeCodeLinkEverywhere() {
        document.querySelectorAll(".form__links a").forEach((a) => {
            if ((a.textContent || "").toLowerCase().includes("код")) a.remove();
        });
    }

    // При закрытии модалки очищаем форму и ошибки (и ничего не сохраняем)
    const prevCloseById = window.closeModalById;
    const prevCloseAny = window.closeAnyModals;
    function resetFormsIn(el) {
        el.querySelectorAll("form").forEach((f) => {
            f.reset();
            f.querySelectorAll("[data-form-error],[data-error-for]").forEach(
                (n) => (n.textContent = "")
            );
            const s = f.querySelector('button[type="submit"]');
            if (s) {
                s.disabled = true;
                s.classList.add("is-disabled");
            }
        });
    }
    window.closeModalById = function (id) {
        const m = document.getElementById(id);
        if (!m) {
            return prevCloseById && prevCloseById(id);
        }
        m.classList.remove("modal--open");
        m.addEventListener(
            "transitionend",
            () => {
                m.hidden = true;
                resetFormsIn(m);
                document.body.style.overflow = "";
            },
            { once: true }
        );
    };
    window.closeAnyModals = function () {
        document.querySelectorAll(".modal").forEach((m) => {
            if (!m.hidden) {
                m.classList.remove("modal--open");
                m.addEventListener(
                    "transitionend",
                    () => {
                        m.hidden = true;
                        resetFormsIn(m);
                    },
                    { once: true }
                );
            }
        });
        document.body.style.overflow = "";
    };

    document.addEventListener("DOMContentLoaded", () => {
        [
            "regForm",
            "profileForm",
            "authForm",
            "codeForm",
            "forgotForm",
        ].forEach(enhanceForm);
        removeCodeLinkEverywhere(); // ещё раз на всякий случай
    });
})();

// ===== FIX v3 — 2025‑10‑05 =====
(function () {
    if (window.QUBIT_FIX_V3) return;
    window.QUBIT_FIX_V3 = true;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // 0) Убираем любое сохранение форм "form:*" и чистим старые записи
    try {
        const _setItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function (k, v) {
            if (String(k).startsWith("form:")) return;
            return _setItem(k, v);
        };
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith("form:")) localStorage.removeItem(k);
        }
    } catch {}

    // 1) Валидаторы
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
    const noCyr = (s) => !/[А-Яа-яЁё]/.test(s || "");
    const passOK = (s) =>
        (s || "").length >= 8 && noCyr(s) && /[A-Za-z]/.test(s);

    function updateSubmitState(form) {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        let ok = true;

        form.querySelectorAll("[data-required], [required]").forEach((el) => {
            if (!(el.value || "").trim()) ok = false;
        });
        form.querySelectorAll(
            '[data-type="email"], input[type="email"]'
        ).forEach((el) => {
            if (!isEmail(el.value)) ok = false;
        });
        form.querySelectorAll(
            '[data-required-check], input[type="checkbox"][required]'
        ).forEach((ch) => {
            if (!ch.checked) ok = false;
        });

        const p = form.querySelector('input[name="pass"]');
        const p2 = form.querySelector('input[name="pass2"]');
        const msgP = form.querySelector('[data-error-for="pass"]');
        const msgP2 = form.querySelector('[data-error-for="pass2"]');

        if (p) {
            const okP = passOK(p.value);
            if (!okP) {
                ok = false;
                if (msgP)
                    msgP.textContent = "Минимум 8 символов и латинские буквы";
            } else if (msgP) msgP.textContent = "";
        }
        if (p && p2) {
            if (p2.value && p2.value !== p.value) {
                ok = false;
                if (msgP2) msgP2.textContent = "Пароли не совпадают";
            } else if (msgP2) msgP2.textContent = "";
        }

        if (form.id === "codeForm") {
            const cells = Array.from(form.querySelectorAll(".code-cell"));
            const code = cells.map((i) => (i.value || "").trim()).join("");
            const hidden = form.querySelector('input[name="code"]');
            if (hidden) hidden.value = code.slice(0, 8).toUpperCase();
            if (code.length !== 8) ok = false;
        }

        btn.disabled = !ok;
        btn.classList.toggle("is-disabled", !ok);
    }
    window.__QUBIT_updateSubmitState = updateSubmitState;

    // 2) Глазики: кликаются и меняют иконку (открыт/закрыт)
    const EYE_CLOSE =
        '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg>';
    const EYE_OPEN =
        '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a18.9 18.9 0 0 1 4.19-4.86M7 7a10.7 10.7 0 0 1 5-2c7 0 11 7 11 7a18.9 18.9 0 0 1-4.1 4.75M1 1l22 22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    function bindEyes(form) {
        form.querySelectorAll(".input-group .input-toggle").forEach((btn) => {
            const inp = btn.closest(".input-group").querySelector("input");
            if (!inp) return;
            const sync = () => {
                const open = inp.type !== "password";
                btn.innerHTML = open ? EYE_CLOSE : EYE_OPEN;
                btn.setAttribute(
                    "aria-label",
                    open ? "Скрыть пароль" : "Показать пароль"
                );
            };
            btn.addEventListener("click", () => {
                inp.type = inp.type === "password" ? "text" : "password";
                sync();
            });
            sync();
        });
    }

    // 3) Улучшаем формы
    function enhanceForm(id) {
        const f = document.getElementById(id);
        if (!f) return;
        const any = () => updateSubmitState(f);
        f.addEventListener("input", any);
        f.addEventListener("change", any);
        f.addEventListener("keyup", any);
        f.addEventListener("submit", (e) => {
            const s = f.querySelector('button[type="submit"]');
            if (s && s.disabled) {
                e.preventDefault();
                return;
            }
        });
        bindEyes(f);
        updateSubmitState(f);
    }

    // 4) Сброс форм при закрытии модалки (и быстрая смена между модалками)
    function resetFormsIn(el) {
        el.querySelectorAll("form").forEach((f) => {
            f.reset();
            f.querySelectorAll("[data-form-error],[data-error-for]").forEach(
                (n) => (n.textContent = "")
            );
            const s = f.querySelector('button[type="submit"]');
            if (s) {
                s.disabled = true;
                s.classList.add("is-disabled");
            }
        });
    }
    window.swapModal = function (fromId, toId) {
        const fm = document.getElementById(fromId);
        if (fm && !fm.hidden) {
            fm.hidden = true;
            fm.classList.remove("modal--open");
        }
        // тело остаётся заблокированным
        document.body.style.overflow = "hidden";
        const tm = document.getElementById(toId);
        if (tm) {
            tm.hidden = false;
            requestAnimationFrame(() => tm.classList.add("modal--open"));
        }
    };

    // 5) Drag‑scroll для турниров (+убираем выделение текста при перетаскивании)
    (function () {
        const scroller = document.getElementById("hscroll");
        if (!scroller) return;
        let isDown = false,
            startX = 0,
            startLeft = 0,
            moved = false;
        const onDown = (e) => {
            isDown = true;
            moved = false;
            startX = e.touches ? e.touches[0].pageX : e.pageX;
            startLeft = scroller.scrollLeft;
            scroller.classList.add("dragging");
        };
        const onMove = (e) => {
            if (!isDown) return;
            const x = e.touches ? e.touches[0].pageX : e.pageX;
            const dx = x - startX;
            if (Math.abs(dx) > 3) moved = true;
            scroller.scrollLeft = startLeft - dx;
            e.preventDefault();
        };
        const onUp = () => {
            isDown = false;
            scroller.classList.remove("dragging");
        };
        scroller.addEventListener("mousedown", onDown);
        scroller.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        scroller.addEventListener("touchstart", onDown, { passive: false });
        scroller.addEventListener("touchmove", onMove, { passive: false });
        scroller.addEventListener("touchend", onUp);
        // блокируем клики по карточкам если это был drag
        scroller.addEventListener(
            "click",
            (e) => {
                if (moved) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            true
        );
    })();

    // 6) Поведение модалок/форм
    document.addEventListener("DOMContentLoaded", () => {
        // формочки из наших модалок (если они уже смонтированы твоим кодом)
        [
            "regForm",
            "profileForm",
            "authForm",
            "codeForm",
            "forgotForm",
        ].forEach(enhanceForm);

        // Login modal кнопки (если есть)
        const loginModal = $("#loginModal");
        if (loginModal) {
            const btns = loginModal.querySelectorAll(".modal__body .btn");
            const [btnCode, btnLogin, btnReg] = btns;
            btnCode &&
                btnCode.addEventListener("click", () =>
                    swapModal("loginModal", "codeModal")
                );
            btnLogin &&
                btnLogin.addEventListener("click", () =>
                    swapModal("loginModal", "authModal")
                );
            btnReg &&
                btnReg.addEventListener("click", () =>
                    swapModal("loginModal", "regModal")
                );
        }

        // После успешной регистрации — сразу "О себе" (без мерцаний)
        const regForm = $("#regForm");
        regForm &&
            regForm.addEventListener("submit", (e) => {
                const btn = regForm.querySelector('button[type="submit"]');
                if (btn && btn.disabled) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                resetFormsIn(regForm.closest(".modal"));
                swapModal("regModal", "profileModal");
            });

        // При закрытии любой модалки — очищаем её поля
        document.body.addEventListener(
            "click",
            (e) => {
                const closer = e.target.closest?.("[data-close]");
                if (closer) {
                    const id = closer.getAttribute("data-close");
                    const m = document.getElementById(id);
                    if (m) {
                        m.classList.remove("modal--open");
                        m.addEventListener(
                            "transitionend",
                            () => {
                                m.hidden = true;
                                resetFormsIn(m);
                                document.body.style.overflow = "";
                            },
                            { once: true }
                        );
                        e.preventDefault();
                    }
                }
            },
            true
        );
    });
})();
// === Регистрация: валидация полей ===
const $ = (s, r = document) => r.querySelector(s);

const regLogin = $("#regLogin");
const regEmail = $("#regEmail");
const regPass = $("#regPass");
const regPass2 = $("#regPass2");
const regBtn = $("#regSubmit"); // id на кнопке "Зарегистрироваться"
const eLogin = $('[data-error-for="login"]');
const eEmail = $('[data-error-for="email"]');
const ePass = $('[data-error-for="pass"]');
const ePass2 = $('[data-error-for="pass2"]');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const passRe = /^(?=.*[A-Za-z]).{8,}$/; // ≥8 символов и хотя бы 1 латинская буква

function validateRegForm() {
    let ok = true;

    // Логин
    const loginVal = (regLogin?.value || "").trim();
    if (loginVal.length < 2) {
        eLogin.textContent = "Логин должен быть не короче 2 символов";
        ok = false;
    } else {
        eLogin.textContent = "";
    }

    // Почта
    const emailVal = (regEmail?.value || "").trim();
    console.log(emailVal);
    const validateEmail = (emailVal) => {
        return String(emailVal)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };
    console.log(validateEmail);
    if (validateEmail) {
        eEmail.textContent =
            "Введите корректный e-mail (например, name@mail.ru)";
        ok = false;
    } else {
        eEmail.textContent = "";
    }

    // Пароль: правила
    const p1 = regPass?.value || "";
    if (!passRe.test(p1)) {
        ePass.textContent = "Минимум 8 символов и хотя бы 1 английская буква";
        ok = false;
    } else {
        ePass.textContent = "";
    }

    // Совпадение паролей
    const p2 = regPass2?.value || "";
    if (p1 !== p2) {
        ePass2.textContent = "Пароли не совпадают";
        ok = false;
    } else {
        ePass2.textContent = "";
    }

    // Кнопка: серая, пока форма невалидна (используем ваш стиль disabled)
    if (regBtn) {
        regBtn.disabled = !ok;
        regBtn.classList.toggle("is-disabled", !ok);
    }
    return ok;
}

// Обновляем ошибки на вводе/потере фокуса
[regLogin, regEmail, regPass, regPass2].forEach((el) => {
    if (!el) return;
    ["input", "blur"].forEach((ev) => el.addEventListener(ev, validateRegForm));
});

// Защита при submit
const regForm = $("#regForm"); // поставьте id="regForm" вашей форме регистрации
if (regForm) {
    regForm.addEventListener("submit", (e) => {
        if (!validateRegForm()) e.preventDefault();
    });
}

// === Показать/скрыть пароль с «перечёркиванием» глаза ===
function wireEye(input, toggleBtn) {
    if (!input || !toggleBtn) return;
    const eyePath = toggleBtn.querySelector("svg path"); // подхватите нужный элемент
    const lineClass = "line"; // в CSS для .input-toggle.line добавлена диагональная черта

    toggleBtn.addEventListener("click", () => {
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        toggleBtn.classList.toggle(lineClass, !isHidden);
    });
}
wireEye(regPass, $("#regPassToggle"));
wireEye(regPass2, $("#regPass2Toggle"));
