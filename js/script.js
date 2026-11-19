$(document).ready(function () {
    console.log("jQuery is ready!");

    function showToast(message, type) {
        let $box = $("#toast-container");
        if (!$box.length) {
            $box = $('<div id="toast-container"></div>').appendTo("body");
        }
        const $toast = $('<div class="toast-msg"></div>')
            .addClass(type || "success")
            .text(message)
            .hide();
        $box.append($toast);
        $toast.fadeIn(250).delay(2500).fadeOut(400, function () {
            $(this).remove();
        });
    }

    /* Task 1 + 2: Live search and autocomplete (trainers.html) */
    const $search = $("#trainerSearch");
    if ($search.length) {
        const $cards = $(".trainer-card-col");
        const $suggest = $("#suggestions");
        const $empty = $("#noResults");
        const pool = [];

        $cards.each(function () {
            const $card = $(this);
            const name = $card.find("h1, h2, h3, h4, h5, h6").first().text().trim();
            const spec = $card.find("strong").filter(function () {
                return $(this).text().indexOf("Специализация") !== -1;
            }).parent().text().replace("Специализация:", "").trim();
            const $clean = $card.clone();
            $clean.find(".btn, button, .rating-stars, .custom-accordion-header, img").remove();
            const text = $clean.text().replace(/Оценить тренера:?/g, "").replace(/\s+/g, " ").toLowerCase();
            $card.data("search", text);
            if (name && pool.indexOf(name) === -1) pool.push(name);
            if (spec && pool.indexOf(spec) === -1) pool.push(spec);
        });

        function applyFilter(query) {
            const q = query.trim().toLowerCase();
            $cards.each(function () {
                const match = $(this).data("search").indexOf(q) !== -1;
                $(this).toggleClass("search-hidden", !match);
            });
            $empty.toggle($cards.not(".search-hidden").length === 0);
        }

        function renderSuggestions(query) {
            const q = query.trim().toLowerCase();
            $suggest.empty();
            if (!q) {
                $suggest.hide();
                return;
            }
            const matches = pool.filter(function (item) {
                return item.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 6);
            if (!matches.length) {
                $suggest.hide();
                return;
            }
            $.each(matches, function (_, item) {
                $("<li></li>").addClass("suggest-item").text(item).appendTo($suggest);
            });
            $suggest.show();
        }

        $search.on("keyup input", function (e) {
            if ($.inArray(e.key, ["ArrowDown", "ArrowUp", "Enter", "Escape"]) !== -1) return;
            applyFilter($(this).val());
            renderSuggestions($(this).val());
        });

        $search.on("keydown", function (e) {
            const $items = $suggest.children();
            const $active = $items.filter(".active");
            let index = $items.index($active);
            if (e.key === "ArrowDown") {
                e.preventDefault();
                index = (index + 1) % $items.length;
                $items.removeClass("active").eq(index).addClass("active");
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                index = index <= 0 ? $items.length - 1 : index - 1;
                $items.removeClass("active").eq(index).addClass("active");
            } else if (e.key === "Enter" && $active.length) {
                e.preventDefault();
                $active.trigger("mousedown");
            } else if (e.key === "Escape") {
                $suggest.hide();
            }
        });

        $suggest.on("mousedown", ".suggest-item", function (e) {
            e.preventDefault();
            $search.val($(this).text());
            applyFilter($search.val());
            $suggest.hide();
        });

        $search.on("blur", function () {
            $suggest.hide();
        });
    }

    /* Task 3: Search highlighting (pricing.html FAQ) */
    const $faq = $("#faq");
    if ($faq.length) {
        const $faqInput = $("#faqSearch");
        const $faqCount = $("#faqCount");
        const $faqItems = $faq.find(".faq-item");

        function clearHighlight() {
            $faq.find("mark.hl").replaceWith(function () {
                return document.createTextNode($(this).text());
            });
            $faq.get(0).normalize();
        }

        function highlight(regex) {
            $faq.find("*").addBack().contents().filter(function () {
                return this.nodeType === 3 && this.nodeValue.trim() !== "";
            }).each(function () {
                if (this.nodeValue.search(regex) === -1) return;
                const safe = $("<div>").text(this.nodeValue).html();
                const marked = safe.replace(regex, '<mark class="hl">$1</mark>');
                $(this).replaceWith($("<span>").html(marked).contents());
            });
        }

        $faqInput.on("input", function () {
            const query = $(this).val().trim();
            clearHighlight();
            if (!query) {
                $faqItems.show();
                $faqCount.text("");
                return;
            }
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp("(" + escaped + ")", "gi");
            highlight(regex);
            $faqItems.each(function () {
                $(this).toggle($(this).find("mark.hl").length > 0);
            });
            const found = $faq.find("mark.hl").length;
            $faqCount.text(found ? "Совпадений: " + found : "Ничего не найдено");
        });
    }

    /* Task 4: Scroll progress bar (all pages) */
    $('<div id="scroll-progress"><div id="scroll-progress-bar"></div></div>').prependTo("body");
    const $bar = $("#scroll-progress-bar");

    function updateProgress() {
        const total = $(document).height() - $(window).height();
        const percent = total > 0 ? ($(window).scrollTop() / total) * 100 : 0;
        $bar.css("width", percent + "%");
    }
    $(window).on("scroll resize", updateProgress);
    updateProgress();

    /* Task 5: Animated number counter (index.html) */
    const $counters = $(".counter");

    function inView($el) {
        const top = $(window).scrollTop();
        const bottom = top + $(window).height();
        const elTop = $el.offset().top;
        return elTop < bottom - 40 && elTop + $el.outerHeight() > top;
    }

    function runCounter($el) {
        if ($el.data("done")) return;
        $el.data("done", true);
        const target = parseInt($el.data("target"), 10);
        const suffix = $el.data("suffix") || "";
        $({ value: 0 }).animate({ value: target }, {
            duration: 2000,
            easing: "swing",
            step: function (now) {
                $el.text(Math.floor(now).toLocaleString("ru-RU") + suffix);
            },
            complete: function () {
                $el.text(target.toLocaleString("ru-RU") + suffix);
            }
        });
    }

    function checkCounters() {
        $counters.each(function () {
            if (inView($(this))) runCounter($(this));
        });
    }
    if ($counters.length) {
        $(window).on("scroll resize", checkCounters);
        checkCounters();
    }

    /* Task 6: Loading spinner on submit (profile.html)
       js/main.js validates the form first and then fires "handsup:validsubmit". */
    const $bookingForm = $("#bookingForm");
    if ($bookingForm.length) {
        $bookingForm.on("handsup:validsubmit", function (e) {
            const detail = e.originalEvent.detail;
            const $btn = $bookingForm.find('[type="submit"]');
            if ($btn.prop("disabled")) return;                    // block repeated clicks
            const original = $btn.html();
            const $result = $("#form-result").empty();

            $btn.prop("disabled", true).html(
                '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Пожалуйста, подождите...'
            );

            setTimeout(function () {                              // simulated server call
                $btn.prop("disabled", false).html(original);
                $bookingForm.get(0).reset();
                $result.html(
                    $('<div class="alert alert-success" role="alert"></div>')
                        .text("Спасибо, " + detail.name + "! Заявка в филиал " + detail.branchName + " успешно отправлена.")
                ).hide().fadeIn(300);
                showToast("Заявка успешно отправлена!");
                if (window.HandsUp) window.HandsUp.playSound(784);
            }, 2000);
        });
    }

    /* Toasts requested by vanilla code (popup form) */
    $(document).on("handsup:toast", function (e) {
        showToast(e.originalEvent.detail.message);
    });

    /* Task 7: Notifications */
    $(document).on("click", ".rating-stars .star", function () {
        const rating = $(this).closest(".rating-stars").find(".star").index(this) + 1;
        showToast("Спасибо за оценку: " + rating + " из 5");
    });

    $("table tbody .btn").on("click", function () {
        const plan = $(this).closest("tr").find("th").first().text().trim();
        showToast("Абонемент выбран: " + plan);
    });

    /* Task 8: Copy to clipboard (pricing.html promo code) */
    $(".copy-snippet").after(
        '<button type="button" class="copy-btn" aria-label="Копировать">' +
        '<span class="copy-icon">📋</span>' +
        '<span class="copy-tip">Скопировано в буфер обмена!</span></button>'
    );

    function legacyCopy(text) {
        return new Promise(function (resolve, reject) {
            const $area = $("<textarea></textarea>").val(text)
                .css({ position: "fixed", opacity: 0 }).appendTo("body");
            $area.get(0).select();
            let ok = false;
            try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
            $area.remove();
            ok ? resolve() : reject();
        });
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
        }
        return legacyCopy(text);
    }

    $(document).on("click", ".copy-btn", function () {
        const $btn = $(this);
        const text = $btn.prev(".copy-snippet").text().trim();
        copyText(text).then(function () {
            $btn.addClass("copied").find(".copy-icon").text("✅");
            showToast("Промокод скопирован: " + text);
            setTimeout(function () {
                $btn.removeClass("copied").find(".copy-icon").text("📋");
            }, 2000);
        }).catch(function () {
            showToast("Не удалось скопировать", "error");
        });
    });

    $(document).on("copy", ".copy-snippet", function () {
        showToast("Текст скопирован");
    });

    /* Task 9: Image lazy loading */
    const $lazy = $("img.lazy");

    function loadImage($img) {
        if (!$img.length || $img.data("loaded")) return;
        $img.data("loaded", true)
            .one("load", function () {
                $img.addClass("loaded");
            })
            .attr("src", $img.data("src"));
    }

    function loadVisibleImages() {
        const limit = $(window).scrollTop() + $(window).height() + 150;
        $lazy.each(function () {
            const $img = $(this);
            if ($img.data("loaded") || !$img.is(":visible")) return;
            if ($img.offset().top < limit) loadImage($img);
        });
    }

    if ($lazy.length) {
        $(window).on("scroll resize load", loadVisibleImages);
        $(document).on("click", ".filter-btn", function () {
            setTimeout(loadVisibleImages, 0);
        });
        const gallery = document.getElementById("gallery");
        if (gallery) {
            gallery.addEventListener("slide.bs.carousel", function (e) {
                loadImage($(e.relatedTarget).find("img.lazy"));
            });
        }
        loadVisibleImages();
    }
});
