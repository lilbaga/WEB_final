# HandsUp Fitness — Final project

**Team Пупуня** · Group SE2502 · Shyndaly Bagnur, Aitzhanova Aigerim, Shamshidin Aruzhan.

A responsive multi-page fitness club website, adapted from the earlier Assignment 6 project. The original purple/pink design and existing interactions have been preserved.

## Open and deploy

1. Extract the entire `HandsUp_Final` folder.
2. Open with VS Code; install the **Live Server** extension and use **Open with Live Server** on `index.html`, or run `python -m http.server 8000` inside the project folder.
3. Visit `http://localhost:8000/index.html`.
4. To publish: upload the **contents** of this project folder to a GitHub repository (with `index.html` at the repository root), then enable **Settings → Pages → Deploy from branch → main → / (root)**. GitHub Pages gives a live URL after publishing. **Update the report's link fields only after you publish.**
5. Check the live URL and the repository URL. Test registration, login and all 8 core pages over HTTPS.

This is a frontend-only course project. Sign-up intentionally saves the password to localStorage as requested by the assignment; **never use a real password**. This is not real authentication or secure enough for production. No server/database is involved.

## Core pages (all connected via navbar)

| File | Purpose |
| --- | --- |
| `index.html` | Home, services, gallery and interactive elements |
| `pricing.html` | Plans, promo code, FAQ highlighting and popup |
| `schedule.html` | Class schedule + real Open-Meteo API weather |
| `branches.html` | Fitness club locations |
| `trainers.html` | Trainer cards + search, filters and autocomplete |
| `profile.html` | Profile information + original booking form |
| `signup.html` | Simulated registration, client-side validation |
| `login.html` | Simulated login, checks localStorage credentials |

Two optional older media-query demo pages remain in the folder.

## Where to edit before the presentation

| You want to change | File or ID |
| --- | --- |
| Brand purple / pink colors | `css/style.css` → `html[data-bs-theme="dark"]` and `html[data-bs-theme="light"]` |
| New form / weather styles | `css/final.css` → `.auth-form`, `.weather-panel`, `.weather-stat` |
| Navbar links on any page | `<a id="nav-home">`, `<a id="nav-pricing">`, ... `<a id="nav-login">` |
| Main heading on a page | `<h1 id="page-heading">` |
| Registration fields / submit button | `signup.html` → `signup-name`, `signup-email`, `signup-phone`, `signup-password`, `signup-submit-btn` |
| Login fields | `login.html` → `login-email`, `login-password`, `login-submit-btn` |
| Password rules | `js/final.js` → `validate.password()` |
| Sign-up behavior | `js/final.js` → `setupSignup()` |
| Login behavior | `js/final.js` → `setupLogin()` |
| Profile name/email/phone | `profile.html` → `profile-name`, `profile-email`, `profile-phone` |
| Logout | `profile.html` → `logout-btn`; `js/final.js` → `setupProfile()` |
| Weather API city and parameters | `js/final.js` → `WEATHER_API_URL` |
| API result text / refresh | `schedule.html` → `weather-section`; `js/final.js` → `loadWeather()` |
| Trainer filtering | `trainers.html` → `trainerSearch`; `js/script.js` → `applyFilter()` |
| Booking form, original validation | `profile.html` → `bookingForm`; `js/main.js` → `Validators`, `validateForm()` |
| FAQ highlighting | `pricing.html` → `faqSearch`; `js/script.js` → Task 3 |
| Light/dark switch | every page → `themeToggle`; `js/theme.js` + `js/main.js` |

**IDs** uniquely identify important elements *within a single page*. Use **classes** for shared styles and repeated items. Avoid assigning a random ID to every tag; that makes maintenance harder.

## Presentation demo (2–3 minutes)

1. Show `index.html` and switch light/dark mode, then navigate to another page: the choice is saved.
2. Resize to mobile; open the hamburger navbar and demonstrate link navigation.
3. On `signup.html`, submit an empty form (inline errors); then create a demo user: **Demo User**, `demo@example.com`, `+7 777 123 45 67`, `DemoPass1!`.
4. On `login.html`, try a wrong password and then log in correctly. `profile.html` shows the user's name/email/phone. Click **Выйти** to log out.
5. On `trainers.html`, use live search and suggestions; refresh, the search query remains.
6. On `schedule.html`, show loading, weather data, and refresh. If offline, show the retry/error message.
7. On `pricing.html`, demonstrate promo copy and FAQ search; on `profile.html`, booking validation and animated spinner.

## Original files preserved

- `css/style.css`, `js/main.js`, `js/script.js` — previous assignment interactions.
- `js/theme.js` — theme before page paint; `js/jquery.min.js` and Bootstrap are bundled locally to avoid CDN outages.
- `css/final.css`, `js/final.js` — new final-project code, isolated and commented.
- Images are local assets in `images/`.

## QA checklist

- [ ] All 8 core pages open and navigate correctly.
- [ ] Desktop 1440 px, tablet 768 px, mobile 390 px show no horizontal clipping.
- [ ] Both themes persist after a page change.
- [ ] Signup rejects bad email, weak password, mismatch, invalid phone and empty fields.
- [ ] Login rejects wrong credentials and opens profile with the right ones.
- [ ] Trainer search filters cards and saves its query.
- [ ] API displays loading / success / failure + retry.
- [ ] All links and images load after GitHub deployment.
- [ ] Paste real GitHub Pages and repository links into the final PDF report after publishing.

Additional quick-select IDs for live editing: `trainer-card-1` through `trainer-card-4`, `trainer-filter-all`, `trainer-filter-strength`, `trainer-filter-crossfit`, `trainer-filter-yoga`, `plan-row-1` through `plan-row-4`, and `plan-select-1` through `plan-select-4`.
