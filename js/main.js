/* =============================================
   HERO — TIME-BASED CNC ANIMATION
   ============================================= */

(function () {
    const heroCNC = document.getElementById('heroCNC');
    const heroTag = document.getElementById('heroTag');
    const heroSum = document.getElementById('heroSum');
    const heroCue = document.getElementById('heroCue');
    if (!heroCNC) return;

    const cncLogo = document.getElementById('heroCNCLogo');
    const keys  = heroCNC.querySelectorAll('.hero__cnc-key');
    const words = heroCNC.querySelectorAll('.hero__cnc-word');
    words.forEach(w => { w.dataset.original = w.textContent.trim(); });

    const timers = [];
    window._introTimers = timers;
    const schedule = (ms, fn) => timers.push(setTimeout(fn, ms));

    function typewriter(el, speed) {
        const text = el.textContent.trim();
        const typingDur = `${(text.length * speed) / 1000}s`;
        el.style.setProperty('--typing-dur', typingDur);
        el.textContent = '';
        el.style.opacity = '1';
        el.classList.add('typing');

        const cursor = document.createElement('span');
        cursor.className = 'hero__cnc-cursor';
        el.appendChild(cursor);

        let i = 0;
        const id = setInterval(() => {
            el.insertBefore(document.createTextNode(text[i++]), cursor);
            if (i >= text.length) {
                clearInterval(id);
                setTimeout(() => {
                    cursor.style.opacity = '0';
                    setTimeout(() => cursor.remove(), 350);
                }, 420);
            }
        }, speed);
    }

    // 로고 클립 reveal
    schedule(80, () => { if (cncLogo) cncLogo.classList.add('on'); });

    // 로고 완전히 올라온 이후 C/N/C 라인 순차 등장
    schedule(1100, () => keys[0].classList.add('on'));
    schedule(1900, () => typewriter(words[0], 100));
    schedule(3300, () => keys[1].classList.add('on'));
    schedule(4100, () => typewriter(words[1], 100));
    schedule(5500, () => keys[2].classList.add('on'));
    schedule(6300, () => typewriter(words[2], 90));

    // Phase 2: 태그라인 등장
    schedule(9800,  () => heroCNC.classList.add('out'));
    schedule(10400, () => { if (heroTag) heroTag.classList.add('on'); });

    // Phase 3: 브랜드 서머리
    schedule(13300, () => { if (heroTag) heroTag.classList.add('out'); });
    schedule(14000, () => { if (heroSum) heroSum.classList.add('on'); });
    schedule(16000, () => { if (heroCue) heroCue.classList.add('on'); });
    schedule(17000, () => {
        if (heroCue) heroCue.classList.add('bob');
        window._introComplete = true;
        const rewindBtn = document.getElementById('rewindBtn');
        if (rewindBtn) rewindBtn.classList.add('visible');
    });

    // 스크롤 시 스크롤 큐 숨김
    window.addEventListener('scroll', function onScrollCue() {
        if (window.scrollY > 80 && heroCue) {
            heroCue.style.opacity = '0';
            heroCue.style.pointerEvents = 'none';
            window.removeEventListener('scroll', onScrollCue);
        }
    }, { passive: true });
})();

/* =============================================
   NAVIGATION — SCROLL BEHAVIOR
   ============================================= */

const nav = document.getElementById('nav');

// scroll handled by lenis.on('scroll') above

/* =============================================
   MOBILE MENU
   ============================================= */

const menuBtn    = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

const toggleMenu = (state) => {
    menuOpen = state;
    mobileMenu.classList.toggle('open', menuOpen);
    menuBtn.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
};

menuBtn.addEventListener('click', () => toggleMenu(!menuOpen));
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

/* =============================================
   LENIS — SMOOTH SCROLL
   ============================================= */

const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', () => onScroll());

(function rafLoop(time) {
    lenis.raf(time);
    requestAnimationFrame(rafLoop);
})(0);


/* =============================================
   UNIFIED SCROLL HANDLER
   ============================================= */

let scrollDir = 'down';
let _lastScrollY = window.scrollY;

function onScroll() {
    const y = window.scrollY;
    if (y !== _lastScrollY) scrollDir = y > _lastScrollY ? 'down' : 'up';
    _lastScrollY = y;
    nav.classList.toggle('scrolled', y > 20);
}

/* =============================================
   SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================= */

/* =============================================
   TEXT SCRAMBLE
   ============================================= */

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function scramble(el) {
    const original = el.dataset.original || el.textContent;
    el.dataset.original = original;
    const chars = original.split('');
    const nonSpaceCount = chars.filter(c => c !== ' ').length;
    let frame = 0;
    const totalFrames = nonSpaceCount * 2;
    let prev = [];

    const id = setInterval(() => {
        const result = chars.map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < Math.floor(frame / 2)) return ch;
            // 짝수 프레임에만 새 랜덤값, 홀수 프레임은 직전 값 유지
            if (frame % 2 === 0) {
                return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            return prev[i] || SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        });
        prev = result.slice();
        el.textContent = result.join('');
        if (++frame > totalFrames) {
            el.textContent = original;
            clearInterval(id);
        }
    }, 36);
}

/* =============================================
   SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================= */

const revealEls = document.querySelectorAll('.reveal-up, .reveal-up-light');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* =============================================
   LOGO STRIP — PAUSE ON HOVER
   ============================================= */

const logoTrack = document.querySelector('.logo-strip__track');
if (logoTrack) {
    logoTrack.addEventListener('mouseenter', () => {
        logoTrack.style.animationPlayState = 'paused';
    });
    logoTrack.addEventListener('mouseleave', () => {
        logoTrack.style.animationPlayState = 'running';
    });
}

/* =============================================
   WHAT WE DO — SEQUENTIAL SVC REVEAL
   ============================================= */

(function () {
    const svcList = document.querySelector('.svc-list');
    if (!svcList) return;

    const svcs = Array.from(svcList.querySelectorAll('.svc'));
    const STEP = 0.85;

    const allSvcEls = svcs.flatMap(svc => [
        svc.querySelector('.svc__num'),
        svc.querySelector('.svc__title'),
        svc.querySelector('.svc__desc'),
        svc.querySelector('.svc__media'),
        svc.querySelector('.agency-platform'),
    ].filter(Boolean));

    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const n = svcs.length;
            svcs.forEach((svc, i) => {
                const base = (scrollDir === 'up' ? (n - 1 - i) : i) * STEP;
                const map = [
                    [svc.querySelector('.svc__num'),        base],
                    [svc.querySelector('.svc__title'),      base],
                    [svc.querySelector('.svc__desc'),       base + 0.30],
                    [svc.querySelector('.svc__media'),      base + 0.52],
                    [svc.querySelector('.agency-platform'), base + 0.66],
                ];
                map.forEach(([el, delay]) => {
                    if (!el) return;
                    el.style.setProperty('--delay', `${delay}s`);
                    el.classList.add('visible');
                });
            });
        } else {
            allSvcEls.forEach(el => {
                el.style.setProperty('--delay', '0s');
                el.classList.remove('visible');
            });
        }
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

    obs.observe(svcList);
})();

/* =============================================
   OUR WORKS — SEQUENTIAL REVEAL
   ============================================= */

(function () {
    const worksList = document.getElementById('worksList');
    if (!worksList) return;

    const cats = Array.from(worksList.querySelectorAll('.work-cat'));
    const STEP = 0.85;

    const allCatEls = cats.flatMap(cat => [
        cat.querySelector('.work-cat__num'),
        cat.querySelector('.work-cat__title'),
        cat.querySelector('.work-cat__lead'),
        cat.querySelector('.work-cases'),
    ].filter(Boolean));

    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const n = cats.length;
            cats.forEach((cat, i) => {
                const base = (scrollDir === 'up' ? (n - 1 - i) : i) * STEP;
                const map = [
                    [cat.querySelector('.work-cat__num'),   base],
                    [cat.querySelector('.work-cat__title'), base],
                    [cat.querySelector('.work-cat__lead'),  base + 0.30],
                    [cat.querySelector('.work-cases'),      base + 0.52],
                ];
                map.forEach(([el, delay]) => {
                    if (!el) return;
                    el.style.setProperty('--delay', `${delay}s`);
                    el.classList.add('visible');
                });
            });
        } else {
            allCatEls.forEach(el => {
                el.style.setProperty('--delay', '0s');
                el.classList.remove('visible');
            });
        }
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

    obs.observe(worksList);
})();

/* =============================================
   SMOOTH SCROLL — ANCHOR LINKS
   ============================================= */

/* =============================================
   REWIND BUTTON + SCROLL-UP REPLAY
   ============================================= */

(function () {
    const btn = document.getElementById('rewindBtn');
    if (!btn) return;

    let wasScrolledDown = false;

    function doReplay() {
        if (!window._introReplay) return;
        wasScrolledDown = false;
        window._introReplay.reset();
        setTimeout(() => window._introReplay.play(), 120);
    }

    // 애니메이션 완료 후, 스크롤 다운했다가 맨 위로 돌아오면 즉시 재생
    lenis.on('scroll', () => {
        if (!window._introComplete) return; // 애니메이션 중 차단

        const sy = window.scrollY;
        if (sy > 80) wasScrolledDown = true;

        if (sy < 30 && wasScrolledDown) doReplay();
    });

    btn.addEventListener('click', doReplay);
})();

/* =============================================
   COLOR VARIATION WIDGET (TEMP)
   ============================================= */

(function () {
    // ── 배경 컬러 배리에이션 — 여기서 수정하세요 ────────────────
    const BG_VARIANTS = [
        // 솔리드 컬러: { type: 'solid', color: '#hex' }
        { type: 'solid',    color: '#b4b4d6' },   // A: 기본 라벤더
        { type: 'solid',    color: '#9f9ded' },   // B: 웜 오프화이트
        { type: 'solid',    color: '#98a7f4' },   // C: 세이지 그린

        // 그라데이션: { type: 'gradient', from, [mid,] to, angle, fromStop(%), [midStop([%, %]),] toStop(%) }
        // angle    — 방향 각도 (0=위→아래, 90=좌→우, 135=대각선 등)
        // midStop  — 숫자 하나: 단일 지점 / 배열 둘: [시작%, 끝%] → mid 컬러가 그 구간을 유지
        { type: 'gradient', from: '#6f90e2', mid: '#c2c0ff', to: '#6f90e2', angle: 90, fromStop: -10, midStop: [5, 85], toStop: 105 },  // D (3점, 4분기)
        { type: 'gradient', from: '#7ba7ff', to: '#b4b4d6', angle: 90, fromStop: -10, toStop: 10 },  // E (2점)
    ];
    // ─────────────────────────────────────────────────────────────

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function buildGrad(v, alpha) {
        const fmt = (color) => alpha != null ? hexToRgba(color, alpha) : color;
        const stop = (color, pct) => fmt(color) + (pct != null ? ` ${pct}%` : '');
        const stops = [stop(v.from, v.fromStop)];
        if (v.mid != null) {
            if (Array.isArray(v.midStop)) {
                stops.push(stop(v.mid, v.midStop[0]));
                stops.push(stop(v.mid, v.midStop[1]));
            } else {
                stops.push(stop(v.mid, v.midStop));
            }
        }
        stops.push(stop(v.to, v.toStop));
        return `linear-gradient(${v.angle}deg, ${stops.join(', ')})`;
    }

    function updateNav(variant) {
        let styleEl = document.getElementById('_navBgOverride');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = '_navBgOverride';
            document.head.appendChild(styleEl);
        }
        if (variant.type === 'solid') {
            styleEl.textContent =
                `.nav.scrolled{background-color:${hexToRgba(variant.color, 0.75)}!important;` +
                `border-bottom-color:${hexToRgba(variant.color, 0.4)}!important}`;
        } else {
            styleEl.textContent =
                `.nav.scrolled{background-color:transparent!important;` +
                `background-image:${buildGrad(variant, 0.75)}!important;` +
                `border-bottom-color:${hexToRgba(variant.from, 0.4)}!important}`;
        }
    }

    function applyBg(variant) {
        const body = document.body;
        const mm = document.getElementById('mobileMenu');
        if (variant.type === 'solid') {
            body.style.backgroundImage = '';
            body.style.backgroundColor = variant.color;
            if (mm) { mm.style.backgroundImage = ''; mm.style.backgroundColor = variant.color; }
        } else {
            const grad = buildGrad(variant);
            body.style.backgroundColor = 'transparent';
            body.style.backgroundImage = grad;
            body.style.backgroundAttachment = 'fixed';
            if (mm) { mm.style.backgroundImage = grad; mm.style.backgroundColor = ''; }
        }
        updateNav(variant);
    }

    const container = document.getElementById('colorSwatches');
    if (!container) return;

    BG_VARIANTS.forEach((variant, i) => {
        const btn = document.createElement('button');
        btn.className = 'color-picker__swatch' + (i === 0 ? ' active' : '');
        if (variant.type === 'solid') {
            btn.style.backgroundColor = variant.color;
            btn.title = variant.color;
        } else {
            btn.style.background = buildGrad(variant);
            btn.title = variant.mid
                ? `${variant.from} → ${variant.mid} → ${variant.to}`
                : `${variant.from} → ${variant.to}`;
        }
        btn.addEventListener('click', () => {
            container.querySelectorAll('.color-picker__swatch')
                .forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            applyBg(variant);
        });
        container.appendChild(btn);
    });
})();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 60;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* =============================================
   NAV LOGO — REPLAY INTRO
   ============================================= */

(function () {
    const navLogo = document.querySelector('.nav__logo');
    if (!navLogo) return;

    const heroCNC = document.getElementById('heroCNC');
    const heroTag = document.getElementById('heroTag');
    const heroSum = document.getElementById('heroSum');
    const heroCue = document.getElementById('heroCue');
    const cncLogo = document.getElementById('heroCNCLogo');
    if (!heroCNC) return;

    const keys  = heroCNC.querySelectorAll('.hero__cnc-key');
    const words = heroCNC.querySelectorAll('.hero__cnc-word');

    let replayTimers = [];

    function scheduleR(ms, fn) {
        replayTimers.push(setTimeout(fn, ms));
    }

    function typewriterR(el, speed) {
        const text = el.dataset.original || '';
        el.style.setProperty('--typing-dur', `${(text.length * speed) / 1000}s`);
        el.textContent = '';
        el.style.opacity = '1';
        el.classList.add('typing');
        const cursor = document.createElement('span');
        cursor.className = 'hero__cnc-cursor';
        el.appendChild(cursor);
        let i = 0;
        const id = setInterval(() => {
            el.insertBefore(document.createTextNode(text[i++]), cursor);
            if (i >= text.length) {
                clearInterval(id);
                setTimeout(() => {
                    cursor.style.opacity = '0';
                    setTimeout(() => cursor.remove(), 350);
                }, 420);
            }
        }, speed);
    }

    function resetHero() {
        // 초기 로드 타이머 + 이전 리플레이 타이머 모두 취소
        if (window._introTimers) {
            window._introTimers.forEach(clearTimeout);
            window._introTimers.length = 0;
        }
        replayTimers.forEach(clearTimeout);
        replayTimers = [];

        // heroCNC 즉시 숨김
        heroCNC.classList.remove('out');
        heroCNC.style.opacity  = '0';
        heroCNC.style.filter   = '';
        heroCNC.style.transform = '';

        // 로고 리셋
        if (cncLogo) cncLogo.classList.remove('on');

        // 키 리셋
        keys.forEach(k => {
            k.classList.remove('on');
            k.style.opacity   = '';
            k.style.transform = '';
            k.style.filter    = '';
        });

        // 단어 리셋
        words.forEach(w => {
            w.classList.remove('typing');
            w.style.opacity = '0';
            w.style.filter  = '';
            const cursor = w.querySelector('.hero__cnc-cursor');
            if (cursor) cursor.remove();
            w.textContent = w.dataset.original || '';
        });

        if (heroTag) heroTag.classList.remove('on', 'out');
        if (heroSum) heroSum.classList.remove('on');
        if (heroCue) {
            heroCue.classList.remove('on', 'bob');
            heroCue.style.opacity      = '';
            heroCue.style.pointerEvents = '';
        }
        const rewindBtn = document.getElementById('rewindBtn');
        if (rewindBtn) rewindBtn.classList.remove('visible');
    }

    function playIntro() {
        heroCNC.style.opacity = '';
        window._introTimers = replayTimers;
        window._introComplete = false;

        scheduleR(80,    () => { if (cncLogo) cncLogo.classList.add('on'); });
        scheduleR(1100,  () => keys[0].classList.add('on'));
        scheduleR(1900,  () => typewriterR(words[0], 100));
        scheduleR(3300,  () => keys[1].classList.add('on'));
        scheduleR(4100,  () => typewriterR(words[1], 100));
        scheduleR(5500,  () => keys[2].classList.add('on'));
        scheduleR(6300,  () => typewriterR(words[2], 90));
        scheduleR(9800,  () => heroCNC.classList.add('out'));
        scheduleR(10400, () => { if (heroTag) heroTag.classList.add('on'); });
        scheduleR(13300, () => { if (heroTag) heroTag.classList.add('out'); });
        scheduleR(14000, () => { if (heroSum)  heroSum.classList.add('on'); });
        scheduleR(16000, () => { if (heroCue)  heroCue.classList.add('on'); });
        scheduleR(17000, () => {
            if (heroCue) heroCue.classList.add('bob');
            window._introComplete = true;
            const rewindBtn = document.getElementById('rewindBtn');
            if (rewindBtn) rewindBtn.classList.add('visible');
        });
    }

    window._introReplay = { reset: resetHero, play: playIntro };

    navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        resetHero();

        if (window.scrollY < 5) {
            setTimeout(playIntro, 120);
        } else {
            lenis.scrollTo(0, {
                duration: 3.0,
                onComplete: () => playIntro(),
            });
        }
    });
})();

