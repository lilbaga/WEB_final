/* ========================================================================
   HandsUp Fitness — FINAL PROJECT FEATURES
   Here you can edit sign up, log in, profile, weather API and saved search.
   Each feature is in a separate named function for an easy live demo.
   The rest of the existing website stays in main.js and script.js.
   ======================================================================== */
(function () {
    'use strict';

    // 1) Local demo database keys (easy to find during the presentation).
    const USERS_KEY = 'handsup-users-v1';
    const SESSION_KEY = 'handsup-session-v1';
    const TRAINER_SEARCH_KEY = 'handsup-trainer-search-v1';

    function readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (_) { return fallback; }
    }

    function saveStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (_) { return false; }
    }

    function getInput(id) { return document.getElementById(id); }
    function valueOf(id) { return getInput(id).value.trim(); }

    // 2) All form validation is written in JavaScript, not HTML attributes.
    const validate = {
        name(value) {
            if (!value) return 'Введите ваше имя.';
            if (value.length < 2) return 'Имя должно содержать минимум 2 символа.';
            if (value.length > 50) return 'Имя не должно превышать 50 символов.';
            if (!/^[\p{L}\s'-]+$/u.test(value)) return 'Используйте только буквы, пробелы и дефис.';
            return '';
        },
        email(value) {
            if (!value) return 'Введите электронную почту.';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'Введите email в формате name@example.com.';
            return '';
        },
        phone(value) {
            const digits = value.replace(/\D/g, '');
            if (!digits) return 'Введите номер телефона.';
            if (!/^(?:\+?7|8)?\d{10}$/.test(value.replace(/[\s()\-]/g, ''))) return 'Введите 10 цифр номера, например +7 777 123 45 67.';
            const local = digits.length === 11 ? digits.slice(1) : digits;
            if (local.length !== 10 || !/^7/.test(local)) return 'Для примера используйте казахстанский мобильный номер (+7 7XX...).';
            return '';
        },
        password(value) {
            if (!value) return 'Введите пароль.';
            if (value.length < 8) return 'Минимум 8 символов.';
            if (value.length > 64) return 'Не более 64 символов.';
            if (!/[a-z]/.test(value)) return 'Добавьте строчную латинскую букву.';
            if (!/[A-Z]/.test(value)) return 'Добавьте заглавную латинскую букву.';
            if (!/[0-9]/.test(value)) return 'Добавьте хотя бы одну цифру.';
            if (!/[^a-zA-Z0-9\s]/.test(value)) return 'Добавьте специальный символ, например ! или @.';
            if (/\s/.test(value)) return 'Уберите пробелы из пароля.';
            return '';
        }
    };

    function showFieldError(fieldId, message) {
        const field = getInput(fieldId);
        const error = getInput(fieldId + '-error');
        if (!field || !error) return;
        field.classList.toggle('is-invalid', Boolean(message));
        field.classList.toggle('is-valid', !message && Boolean(field.value));
        field.setAttribute('aria-invalid', String(Boolean(message)));
        error.textContent = message;
        error.style.display = message ? 'block' : 'none';
    }

    // Validation configuration is deliberately simple for classroom editing.
    function checkFields(config) {
        let firstInvalid = null;
        for (const item of config) {
            const message = item.rule(valueOf(item.id));
            showFieldError(item.id, message);
            if (message && !firstInvalid) firstInvalid = getInput(item.id);
        }
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }

    function showFormMessage(id, message, success) {
        const holder = getInput(id);
        holder.textContent = message;
        holder.className = message ? 'alert ' + (success ? 'alert-success' : 'alert-danger') + ' mb-3' : 'mb-3';
    }

    function attachLiveValidation(config) {
        config.forEach((item) => {
            const field = getInput(item.id);
            if (!field) return;
            field.addEventListener('blur', () => showFieldError(item.id, item.rule(valueOf(item.id))));
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) showFieldError(item.id, item.rule(valueOf(item.id)));
            });
        });
    }

    // 3) Registration — saves name, email, phone, and password in localStorage.
    function setupSignup() {
        const form = getInput('signup-form');
        if (!form) return;
        const fields = [
            { id: 'signup-name', rule: validate.name },
            { id: 'signup-email', rule: validate.email },
            { id: 'signup-phone', rule: validate.phone },
            { id: 'signup-password', rule: validate.password },
            { id: 'signup-confirm', rule: (v) => !v ? 'Повторите пароль.' : v !== valueOf('signup-password') ? 'Пароли не совпадают.' : '' }
        ];
        attachLiveValidation(fields);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            showFormMessage('signup-form-message', '', false);
            if (!checkFields(fields)) return;
            const users = readStorage(USERS_KEY, []);
            const email = valueOf('signup-email').toLowerCase();
            if (users.some((u) => u.email === email)) {
                showFieldError('signup-email', 'Этот email уже зарегистрирован. Войдите в аккаунт.');
                getInput('signup-email').focus();
                return;
            }
            users.push({
                name: valueOf('signup-name'),
                email,
                phone: valueOf('signup-phone'),
                password: getInput('signup-password').value
            });
            if (!saveStorage(USERS_KEY, users)) {
                showFormMessage('signup-form-message', 'Не удалось сохранить аккаунт. Проверьте настройки браузера.', false);
                return;
            }
            showFormMessage('signup-form-message', 'Аккаунт создан! Переходим ко входу...', true);
            // Keep the redirect clear and observable during the defence.
            window.setTimeout(() => { window.location.href = 'login.html'; }, 750);
        });
    }

    // 4) Login — checks stored credentials and redirects to profile.html.
    function setupLogin() {
        const form = getInput('login-form');
        if (!form) return;
        const fields = [
            { id: 'login-email', rule: validate.email },
            { id: 'login-password', rule: validate.password }
        ];
        attachLiveValidation(fields);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            showFormMessage('login-form-message', '', false);
            if (!checkFields(fields)) return;
            const email = valueOf('login-email').toLowerCase();
            const password = getInput('login-password').value;
            const user = readStorage(USERS_KEY, []).find((u) => u.email === email && u.password === password);
            if (!user) {
                showFormMessage('login-form-message', 'Неправильный email или пароль. Попробуйте снова.', false);
                return;
            }
            if (!saveStorage(SESSION_KEY, user.email)) {
                showFormMessage('login-form-message', 'Не удалось сохранить вход в этом браузере.', false);
                return;
            }
            window.location.href = 'profile.html';
        });
    }

    // 5) The profile is shown only for the currently logged-in demo user.
    function setupProfile() {
        const panel = getInput('account-panel');
        if (!panel) return;
        const email = readStorage(SESSION_KEY, null);
        const user = readStorage(USERS_KEY, []).find((u) => u.email === email);
        getInput('account-guest').hidden = Boolean(user);
        getInput('account-details').hidden = !user;
        getInput('logout-btn').hidden = !user;
        if (!user) return;
        getInput('profile-display-name').textContent = user.name;
        getInput('profile-name').textContent = user.name;
        getInput('profile-email').textContent = user.email;
        getInput('profile-phone').textContent = user.phone;
        getInput('logout-btn').addEventListener('click', () => {
            try { localStorage.removeItem(SESSION_KEY); } catch (_) { /* storage disabled */ }
            window.location.href = 'login.html';
        });
    }

    // 6) Real public API: Astana outdoor workout weather (Open-Meteo, no API key).
    // Change latitude/longitude here to demonstrate a different city.
    const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4491&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia%2FAlmaty';
    const WEATHER_LABELS = {
        0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Облачно с прояснениями', 3: 'Облачно',
        45: 'Туман', 48: 'Туман', 51: 'Морось', 53: 'Морось', 55: 'Морось',
        61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь', 71: 'Небольшой снег',
        73: 'Снег', 75: 'Сильный снег', 80: 'Ливень', 81: 'Ливень', 82: 'Сильный ливень',
        95: 'Гроза', 96: 'Гроза', 99: 'Гроза'
    };

    async function loadWeather() {
        if (!getInput('weather-section')) return;
        const loading = getInput('weather-loading');
        const errorBox = getInput('weather-error');
        const content = getInput('weather-content');
        const refresh = getInput('weather-refresh-btn');
        loading.hidden = false;
        errorBox.hidden = true;
        content.hidden = true;
        refresh.disabled = true;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(WEATHER_API_URL, { signal: controller.signal });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            if (!data.current || !Number.isFinite(data.current.temperature_2m)) throw new Error('Empty API data');
            const current = data.current;
            getInput('weather-temperature').textContent = Math.round(current.temperature_2m) + ' °C';
            getInput('weather-wind').textContent = Math.round(current.wind_speed_10m) + ' км/ч';
            getInput('weather-condition').textContent = WEATHER_LABELS[current.weather_code] || 'Переменная погода';
            getInput('weather-advice').textContent = current.temperature_2m < -10 || current.wind_speed_10m > 35
                ? 'Для тренировки на улице сейчас может быть слишком холодно или ветрено. Выбирайте зал.'
                : 'Перед активностью на улице проверьте условия и подберите подходящую одежду.';
            content.hidden = false;
        } catch (error) {
            errorBox.textContent = 'Не удалось загрузить погоду. Проверьте интернет и нажмите «Обновить погоду».';
            errorBox.hidden = false;
            getInput('weather-advice').textContent = '';
            console.warn('Open-Meteo:', error.message);
        } finally {
            clearTimeout(timeout);
            loading.hidden = true;
            refresh.disabled = false;
        }
    }

    function setupWeather() {
        if (!getInput('weather-section')) return;
        getInput('weather-refresh-btn').addEventListener('click', loadWeather);
        loadWeather();
    }

    // 7) Trainer search keeps its query after refresh; old jQuery filtering is preserved.
    function setupSavedTrainerSearch() {
        const input = getInput('trainerSearch');
        if (!input) return;
        try { input.value = localStorage.getItem(TRAINER_SEARCH_KEY) || ''; } catch (_) { /* do nothing */ }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.addEventListener('input', () => {
            try { localStorage.setItem(TRAINER_SEARCH_KEY, input.value); } catch (_) { /* do nothing */ }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupSignup();
        setupLogin();
        setupProfile();
        setupWeather();
        setupSavedTrainerSearch();
    });
})();
