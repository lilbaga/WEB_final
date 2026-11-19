/* ==========================================================================
   HandsUp Fitness — vanilla JavaScript (Assignments 4 and 5)
   Sections:
     0. Helpers and shared state
     1. Day / Night theme switch              (A5: dynamic styles)
     2. Sound effects                         (A5: play sounds)
     3. Live date and time                    (A4 Task 5)
     4. Background colour changer             (A4 Task 4)
     5. Personal greeting + switch            (A5: attributes / switch)
     6. Popup form                            (A4 Task 3)
     7. Accordion                             (A4 Task 2)
     8. Keyboard navigation of the menu       (A5: keyboard events)
     9. Ratings, object with methods          (A5: DOM + objects)
    10. Trainer category filter (switch)      (A5: switch statement)
    11. Arrays, loops, higher-order functions (A5)
    12. Form validation                       (A4 Task 1)
    13. Async request with callbacks          (A5: callbacks)
   The jQuery part (Assignment 6) lives in js/script.js.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 0. Helpers and shared state ---------- */
    const storage = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
    };

    /* Re-trigger a CSS animation class on an element */
    function animate(element, className) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    /* ---------- 2. Sound effects (Web Audio API, no files needed) ---------- */
    let audioCtx = null;
    let isSoundPlaying = false;
    let soundEnabled = storage.get('handsup-sound') !== 'off';

    function playSound(frequency) {
        if (!soundEnabled || isSoundPlaying) return;       // no overlapping sounds
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const now = audioCtx.currentTime;
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency || 587.33, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            isSoundPlaying = true;
            oscillator.onended = function () { isSoundPlaying = false; };
            oscillator.start(now);
            oscillator.stop(now + 0.15);
        } catch (error) {
            isSoundPlaying = false;
        }
    }

    const soundToggle = document.getElementById('soundToggle');
    function renderSoundButton() {
        if (!soundToggle) return;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    }
    if (soundToggle) {
        renderSoundButton();
        soundToggle.addEventListener('click', function () {
            soundEnabled = !soundEnabled;
            storage.set('handsup-sound', soundEnabled ? 'on' : 'off');
            renderSoundButton();
            playSound(740);
        });
    }

    /* Click sound for the main buttons */
    document.querySelectorAll('.btn-primary, .btn-outline-primary, .btn-warning').forEach(function (button) {
        if (button.id === 'soundToggle') return;
        button.addEventListener('click', function () { playSound(); });
    });

    /* Shared API for js/script.js (jQuery part) */
    window.HandsUp = { playSound: playSound };

    /* ---------- 1. Day / Night theme ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    function currentTheme() { return root.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark'; }

    function renderThemeButton() {
        if (!themeToggle) return;
        const isDark = currentTheme() === 'dark';
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        themeToggle.title = isDark ? 'Включить дневную тему' : 'Включить ночную тему';
    }

    function setTheme(theme) {
        root.setAttribute('data-bs-theme', theme);
        storage.set('handsup-theme', theme);
        document.body.style.backgroundColor = '';          // reset colour picked by the colour changer
        renderThemeButton();
        document.dispatchEvent(new CustomEvent('handsup:themechange', { detail: { theme: theme } }));
    }

    if (themeToggle) {
        renderThemeButton();
        themeToggle.addEventListener('click', function () {
            setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
            animate(themeToggle, 'pulse');
            playSound(currentTheme() === 'dark' ? 440 : 784);
        });
    }

    /* ---------- 3. Live date and time (A4 Task 5) ---------- */
    const liveDateTime = document.getElementById('liveDateTime');
    if (liveDateTime) {
        const dateOptions = {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        const updateDateTime = function () {
            liveDateTime.textContent = new Date().toLocaleString('ru-RU', dateOptions);
        };
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    /* ---------- 4. Background colour changer (A4 Task 4) ---------- */
    const bgButton = document.getElementById('bgColorToggleBtn');
    if (bgButton) {
        const bgName = document.getElementById('bgColorName');
        const palettes = {
            dark: [
                { name: 'Ночной фиолетовый', value: '#0c0617' },
                { name: 'Глубокий индиго', value: '#1a1246' },
                { name: 'Бордовый', value: '#3a0d22' },
                { name: 'Морская волна', value: '#06323a' },
                { name: 'Лесной', value: '#0e3322' },
                { name: 'Графит', value: '#262626' }
            ],
            light: [
                { name: 'Розовая дымка', value: '#fff6fa' },
                { name: 'Лавандовый', value: '#efe7ff' },
                { name: 'Небесный', value: '#e3f2ff' },
                { name: 'Мятный', value: '#e2f8ec' },
                { name: 'Персиковый', value: '#ffeadb' },
                { name: 'Лимонный', value: '#fff9d6' }
            ]
        };
        let lastIndex = -1;
        bgButton.addEventListener('click', function () {
            const list = palettes[currentTheme()];
            let index;
            do { index = Math.floor(Math.random() * list.length); } while (index === lastIndex && list.length > 1);
            lastIndex = index;
            document.body.style.backgroundColor = list[index].value;
            if (bgName) bgName.textContent = 'Цвет: ' + list[index].name + ' (' + list[index].value + ')';
            animate(bgButton, 'pulse');
        });
        document.addEventListener('handsup:themechange', function () { if (bgName) bgName.textContent = ''; lastIndex = -1; });
    }

    /* ---------- 5. Personal greeting (getElementById, textContent, switch) ---------- */
    const greetingText = document.getElementById('greetingText');
    const greetingForm = document.getElementById('greetingForm');

    function getDayPart(hour) {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 23) return 'evening';
        return 'night';
    }

    function buildGreeting(name) {
        let hello;
        switch (getDayPart(new Date().getHours())) {
            case 'morning': hello = 'Доброе утро'; break;
            case 'afternoon': hello = 'Добрый день'; break;
            case 'evening': hello = 'Добрый вечер'; break;
            default: hello = 'Доброй ночи';
        }
        return name ? hello + ', ' + name + '! Время потренироваться 💪' : hello + '! Добро пожаловать в HandsUp 💪';
    }

    function showGreeting(name) {
        greetingText.classList.add('swap');
        setTimeout(function () {
            greetingText.textContent = buildGreeting(name);
            greetingText.classList.remove('swap');
        }, 250);
    }

    if (greetingText && greetingForm) {
        const nameInput = document.getElementById('greetingName');
        const savedName = storage.get('handsup-name');
        greetingText.textContent = buildGreeting(savedName || '');
        if (savedName) nameInput.value = savedName;

        greetingForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const value = nameInput.value.trim();
            const feedback = nameInput.parentElement.querySelector('.invalid-feedback');
            const valid = Validators.name(value) === '';
            nameInput.classList.toggle('is-invalid', !valid);
            if (feedback) { feedback.textContent = valid ? '' : Validators.name(value); feedback.classList.toggle('show', !valid); }
            if (!valid) return;
            storage.set('handsup-name', value);
            showGreeting(value);
            playSound(660);
        });
    }

    /* ---------- 6. Popup form (A4 Task 3) ---------- */
    const overlay = document.getElementById('subscriptionPopupOverlay');
    const openPopupBtn = document.getElementById('openPopupBtn');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popupForm = document.getElementById('popupContactForm');
    let popupOpener = null;

    function openPopup() {
        popupOpener = document.activeElement;
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        const first = overlay.querySelector('input');
        if (first) first.focus();
    }
    function closePopup() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        if (popupOpener) popupOpener.focus();
    }

    if (overlay && openPopupBtn) {
        openPopupBtn.addEventListener('click', openPopup);
        if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closePopup();           // click outside the window
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && overlay.classList.contains('open')) closePopup();
        });
    }

    /* ---------- 7. Accordion (A4 Task 2) ---------- */
    document.querySelectorAll('.custom-accordion-header').forEach(function (header) {
        const content = header.nextElementSibling;
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');

        function toggle() {
            const isOpen = header.classList.toggle('active');
            header.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) {
                content.style.maxHeight = (content.scrollHeight + 40) + 'px';
                content.style.opacity = '1';
            } else {
                content.style.maxHeight = '0px';
                content.style.opacity = '0';
            }
        }
        header.addEventListener('click', toggle);
        header.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
    });

    /* ---------- 8. Keyboard navigation of the menu (switch) ---------- */
    const navList = document.querySelector('.navbar-nav');
    const navLinks = Array.from(document.querySelectorAll('.navbar-nav .nav-link'));
    if (navList && navLinks.length) {
        navList.addEventListener('keydown', function (event) {
            const current = navLinks.indexOf(document.activeElement);
            if (current === -1) return;
            let next = current;
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown': next = (current + 1) % navLinks.length; break;
                case 'ArrowLeft':
                case 'ArrowUp': next = (current - 1 + navLinks.length) % navLinks.length; break;
                case 'Home': next = 0; break;
                case 'End': next = navLinks.length - 1; break;
                default: return;
            }
            event.preventDefault();
            navLinks[next].focus();
        });
    }

    /* ---------- 9. Ratings: object with methods (trainers.html) ---------- */
    const ratingStore = {
        ratings: {},
        setRating(trainer, value) { this.ratings[trainer] = value; },
        getAverage() {
            const values = Object.values(this.ratings);
            let sum = 0;
            for (let i = 0; i < values.length; i++) sum += values[i];
            return values.length ? (sum / values.length).toFixed(1) : null;
        },
        render(target) {
            const average = this.getAverage();
            target.textContent = average === null ? '' :
                'Ваша средняя оценка тренеров: ' + average + ' из 5 (оценено тренеров: ' + Object.keys(this.ratings).length + ')';
        }
    };
    const averageRating = document.getElementById('averageRating');

    document.querySelectorAll('.rating-stars').forEach(function (container) {
        const stars = container.querySelectorAll('.star');

        function paint(count, hover) {
            stars.forEach(function (star, i) {
                const on = i < count;
                star.classList.toggle(hover ? 'hover' : 'selected', on);
                if (!hover) star.textContent = on ? '★' : '☆';
            });
        }
        function clearHover() { stars.forEach(function (s) { s.classList.remove('hover'); }); }

        stars.forEach(function (star, index) {
            star.setAttribute('role', 'button');
            star.setAttribute('tabindex', '0');
            star.setAttribute('aria-label', 'Оценка ' + (index + 1) + ' из 5');

            function choose() {
                playSound(520 + index * 60);
                clearHover();
                paint(index + 1, false);
                animate(star, 'pop');
                ratingStore.setRating(container.dataset.trainer || 'тренер', index + 1);
                if (averageRating) ratingStore.render(averageRating);
            }
            star.addEventListener('click', choose);
            star.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
            });
            star.addEventListener('mouseenter', function () { clearHover(); paint(index + 1, true); });
        });
        container.addEventListener('mouseleave', clearHover);
    });

    /* ---------- 10. Trainer category filter with switch ---------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const category = this.dataset.category;
            filterButtons.forEach(function (b) { b.classList.remove('active-filter'); });
            this.classList.add('active-filter');

            document.querySelectorAll('.trainer-card-col').forEach(function (card) {
                let show;
                switch (category) {
                    case 'all': show = true; break;
                    case 'strength':
                    case 'yoga':
                    case 'crossfit': show = card.dataset.category === category; break;
                    default: show = true;
                }
                card.style.display = show ? '' : 'none';
            });
        });
    });

    /* ---------- 11. Arrays, loops and higher-order functions ---------- */
    const fitnessTips = [
        { title: 'Пейте воду', desc: 'Выпивайте не менее 2 литров чистой воды во время тренировок.' },
        { title: 'Разминка обязательна', desc: 'Уделяйте 10 минут разминке перед началом работы с весами.' },
        { title: 'Сон и восстановление', desc: 'Мышцы растут во время отдыха, спите не менее 7–8 часов.' }
    ];
    const tipsContainer = document.getElementById('dynamicTipsContainer');
    if (tipsContainer) {
        tipsContainer.innerHTML = fitnessTips.map(function (tip) {          // map = higher-order function
            return '<div class="col-md-4 mb-3"><div class="p-3 border rounded h-100">' +
                '<h5 class="text-brand">' + tip.title + '</h5>' +
                '<p class="small text-body-secondary mb-0">' + tip.desc + '</p></div></div>';
        }).join('');
    }

    /* ---------- 12. Form validation (A4 Task 1) ---------- */
    /* Each validator returns an error text, or '' when the value is valid. */
    const Validators = {
        name(value) {
            const v = value.trim();
            if (!v) return 'Пожалуйста, введите ваше имя.';
            if (v.length < 2) return 'Имя должно содержать минимум 2 символа.';
            if (v.length > 50) return 'Имя не должно быть длиннее 50 символов.';
            if (!/^\p{L}[\p{L}' -]*$/u.test(v)) return 'Имя может содержать только буквы, пробел, дефис и апостроф.';
            return '';
        },
        email(value) {
            const v = value.trim();
            if (!v) return 'Пожалуйста, введите email.';
            if (v.length > 100) return 'Email слишком длинный (максимум 100 символов).';
            if (v.indexOf('@') === -1) return 'В email должен быть символ «@».';
            // local part @ domain with at least one dot and a 2+ letter top-level domain (.com, .kz ...)
            const pattern = /^[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z0-9]+(-[A-Za-z0-9]+)*)*\.[A-Za-z]{2,}$/;
            if (!pattern.test(v)) return 'Введите корректный email в формате name@domain.com (домен обязателен).';
            return '';
        },
        phone(value) {
            const digits = value.replace(/\D/g, '');
            if (!digits) return 'Пожалуйста, введите номер телефона.';
            if (digits.length < 10) return 'Номер слишком короткий: нужно ровно 10 цифр (сейчас ' + digits.length + ').';
            if (digits.length > 10) return 'Номер слишком длинный: нужно ровно 10 цифр.';
            if (!/^[2-9]/.test(digits)) return 'Номер не может начинаться с 0 или 1.';
            if (/^(\d)\1{9}$/.test(digits)) return 'Номер не может состоять из одинаковых цифр.';
            return '';
        },
        password(value) {
            if (!value) return 'Пожалуйста, придумайте пароль.';
            if (value.length < 8) return 'Пароль должен содержать минимум 8 символов.';
            if (value.length > 64) return 'Пароль не должен быть длиннее 64 символов.';
            if (/\s/.test(value)) return 'Пароль не должен содержать пробелов.';
            if (!/[a-z]/.test(value)) return 'Добавьте строчную латинскую букву.';
            if (!/[A-Z]/.test(value)) return 'Добавьте заглавную латинскую букву.';
            if (!/\d/.test(value)) return 'Добавьте хотя бы одну цифру.';
            if (!/[^A-Za-z0-9\s]/.test(value)) return 'Добавьте специальный символ, например ! или @.';
            return '';
        },
        confirm(value, form) {
            if (!value) return 'Пожалуйста, повторите пароль.';
            const original = form.querySelector('[data-validate="password"]');
            if (original && value !== original.value) return 'Пароли не совпадают.';
            return '';
        },
        message(value) {
            return value.length > 300 ? 'Сообщение не должно быть длиннее 300 символов.' : '';
        },
        agree(_value, _form, field) {
            return field.checked ? '' : 'Необходимо согласие на обработку данных.';
        }
    };

    function getFeedback(field) {
        let node = field.parentElement;
        for (let i = 0; i < 3 && node; i++, node = node.parentElement) {
            const found = node.querySelector(':scope > .invalid-feedback');
            if (found) return found;
        }
        return null;
    }

    /* Validate one field, update its classes and message. Returns true when valid. */
    function validateField(field, form) {
        const rule = Validators[field.dataset.validate];
        if (!rule) return true;
        const message = rule(field.value, form, field);
        const feedback = getFeedback(field);
        field.classList.toggle('is-invalid', message !== '');
        field.classList.toggle('is-valid', message === '' && field.type !== 'checkbox' && field.value !== '');
        field.setAttribute('aria-invalid', String(message !== ''));
        if (feedback) {
            feedback.textContent = message;
            feedback.classList.toggle('show', message !== '');
        }
        return message === '';
    }

    function validateForm(form) {
        let firstInvalid = null;
        form.querySelectorAll('[data-validate]').forEach(function (field) {
            if (!validateField(field, form) && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) firstInvalid.focus();
        return firstInvalid === null;
    }

    function clearValidation(form) {
        form.querySelectorAll('[data-validate]').forEach(function (field) {
            field.classList.remove('is-invalid', 'is-valid');
            field.removeAttribute('aria-invalid');
            const feedback = getFeedback(field);
            if (feedback) { feedback.textContent = ''; feedback.classList.remove('show'); }
        });
    }

    /* Phone mask: keeps only digits, max 10, formats as (XXX) XXX-XX-XX while typing */
    function formatPhone(raw) {
        const d = raw.replace(/\D/g, '').slice(0, 10);
        let out = '';
        if (d.length > 0) out += '(' + d.slice(0, 3);
        if (d.length >= 3) out += ') ';
        if (d.length > 3) out += d.slice(3, 6);
        if (d.length > 6) out += '-' + d.slice(6, 8);
        if (d.length > 8) out += '-' + d.slice(8, 10);
        return out;
    }

    function enhanceForm(form) {
        const touched = new Set();

        form.querySelectorAll('[data-validate]').forEach(function (field) {
            const markTouched = function () { touched.add(field); };
            const isCheck = field.type === 'checkbox';

            if (field.dataset.validate === 'phone') {
                field.addEventListener('input', function () { field.value = formatPhone(field.value); });
                field.addEventListener('paste', function (event) {
                    event.preventDefault();
                    const text = (event.clipboardData || window.clipboardData).getData('text');
                    let digits = text.replace(/\D/g, '');
                    if (digits.length === 11 && /^[78]/.test(digits)) digits = digits.slice(1);   // +7 / 8 prefix
                    field.value = formatPhone(digits);
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
            field.addEventListener('blur', function () { markTouched(); validateField(field, form); });
            field.addEventListener(isCheck ? 'change' : 'input', function () {
                if (touched.has(field) || field.classList.contains('is-invalid') || isCheck) validateField(field, form);
                // changing the password must re-check the confirmation
                if (field.dataset.validate === 'password') {
                    const confirmField = form.querySelector('[data-validate="confirm"]');
                    if (confirmField && confirmField.value) validateField(confirmField, form);
                }
            });
        });

        form.addEventListener('reset', function () {
            touched.clear();
            setTimeout(function () { clearValidation(form); }, 0);
        });
    }

    document.querySelectorAll('form').forEach(function (form) {
        if (form.querySelector('[data-validate]')) enhanceForm(form);
    });

    /* Password helpers: show/hide button and strength meter */
    document.querySelectorAll('.password-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
            const input = document.getElementById(button.dataset.toggleFor);
            const hidden = input.type === 'password';
            input.type = hidden ? 'text' : 'password';
            button.textContent = hidden ? '🙈' : '👁';
            button.setAttribute('aria-label', hidden ? 'Скрыть пароль' : 'Показать пароль');
        });
    });

    const passwordField = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    if (passwordField && strengthBar) {
        passwordField.addEventListener('input', function () {
            const v = passwordField.value;
            const checks = [v.length >= 8, /[a-zа-яё]/.test(v) && /[A-ZА-ЯЁ]/.test(v), /\d/.test(v), /[^A-Za-zА-Яа-яЁё0-9]/.test(v), v.length >= 12];
            const score = checks.filter(Boolean).length;             // filter = higher-order function
            const levels = [
                { text: 'Надёжность пароля', color: '#dc3545' },
                { text: 'Очень слабый', color: '#dc3545' },
                { text: 'Слабый', color: '#fd7e14' },
                { text: 'Средний', color: '#ffc107' },
                { text: 'Хороший', color: '#7ac943' },
                { text: 'Отличный', color: '#28a745' }
            ];
            const level = v ? levels[score] : levels[0];
            strengthBar.style.width = (v ? Math.max(score, 1) * 20 : 0) + '%';
            strengthBar.style.backgroundColor = level.color;
            strengthLabel.textContent = level.text;
        });
        document.getElementById('bookingForm').addEventListener('reset', function () {
            strengthBar.style.width = '0'; strengthLabel.textContent = 'Надёжность пароля';
            const counter = document.getElementById('messageCounter');
            if (counter) { counter.textContent = '0 / 300'; counter.classList.remove('limit'); }
            // passwords back to hidden
            document.querySelectorAll('.password-toggle').forEach(function (b) {
                document.getElementById(b.dataset.toggleFor).type = 'password';
                b.textContent = '👁';
            });
        });
    }

    /* Character counter for the message box */
    const messageField = document.getElementById('message');
    const messageCounter = document.getElementById('messageCounter');
    if (messageField && messageCounter) {
        messageField.addEventListener('input', function () {
            const length = messageField.value.length;
            messageCounter.textContent = length + ' / 300';
            messageCounter.classList.toggle('limit', length >= 300);
        });
    }

    /* Booking form: validate, then hand over to js/script.js (spinner) via a custom event */
    const bookingForm = document.getElementById('bookingForm');
    const formResult = document.getElementById('form-result');
    if (bookingForm && formResult) {
        bookingForm.addEventListener('submit', function (event) {
            event.preventDefault();
            formResult.innerHTML = '';
            if (!validateForm(bookingForm)) {
                playSound(220);
                return;
            }
            const branch = document.getElementById('branch');
            bookingForm.dispatchEvent(new CustomEvent('handsup:validsubmit', {
                detail: {
                    name: document.getElementById('username').value.trim(),
                    branchName: branch.options[branch.selectedIndex].text
                }
            }));
        });
        bookingForm.addEventListener('reset', function () { formResult.innerHTML = ''; });
    }

    /* ---------- 13. Async request with callbacks (A5) ---------- */
    function sendContactRequest(data, onSuccess, onError) {
        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(onSuccess)
            .catch(onError);
    }

    function showMessage(container, type, text) {
        const box = document.createElement('div');
        box.className = 'alert alert-' + type + ' mb-0';
        box.setAttribute('role', 'alert');
        box.textContent = text;
        container.replaceChildren(box);
    }

    if (popupForm) {
        const popupResult = document.getElementById('popupResult');
        popupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!validateForm(popupForm)) { playSound(220); return; }

            const submitButton = popupForm.querySelector('[type="submit"]');
            const clientName = document.getElementById('clientName').value.trim();
            const clientPhone = '+7' + document.getElementById('clientPhone').value.replace(/\D/g, '');

            submitButton.disabled = true;
            popupResult.textContent = 'Отправляем заявку...';

            sendContactRequest({ name: clientName, phone: clientPhone },
                function (response) {                                   // success callback
                    showMessage(popupResult, 'success', 'Спасибо, ' + clientName + '! Заявка №' + response.id + ' принята. Мы свяжемся с вами.');
                    playSound(784);
                    popupForm.reset();
                    submitButton.disabled = false;
                    document.dispatchEvent(new CustomEvent('handsup:toast', { detail: { message: 'Заявка на консультацию отправлена!' } }));
                    setTimeout(function () { closePopup(); popupResult.textContent = ''; }, 2500);
                },
                function () {                                           // error callback
                    showMessage(popupResult, 'danger', 'Не удалось отправить заявку. Проверьте подключение и попробуйте снова.');
                    submitButton.disabled = false;
                });
        });
    }
});
