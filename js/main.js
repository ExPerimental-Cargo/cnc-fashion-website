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
    schedule(900,  () => keys[0].classList.add('on'));
    schedule(1500, () => typewriter(words[0], 62));
    schedule(2240, () => keys[1].classList.add('on'));
    schedule(2840, () => typewriter(words[1], 62));
    schedule(3580, () => keys[2].classList.add('on'));
    schedule(4220, () => typewriter(words[2], 58));

    // Phase 2: 태그라인 등장
    schedule(6100, () => heroCNC.classList.add('out'));
    schedule(6500, () => { if (heroTag) heroTag.classList.add('on'); });

    // Phase 3: 브랜드 서머리
    schedule(8800, () => { if (heroTag) heroTag.classList.add('out'); });
    schedule(9400, () => { if (heroSum) heroSum.classList.add('on'); });
    schedule(11000, () => { if (heroCue) heroCue.classList.add('on'); });
    schedule(11700, () => { if (heroCue) heroCue.classList.add('bob'); });

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

function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
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
    const STEP = 0.85; // 항목 간 간격(s)

    const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;

        svcs.forEach((svc, i) => {
            const base = i * STEP;
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

        obs.disconnect();
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

    const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;

        cats.forEach((cat, i) => {
            const base = i * STEP;
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

        obs.disconnect();
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

    obs.observe(worksList);
})();

/* =============================================
   SMOOTH SCROLL — ANCHOR LINKS
   ============================================= */

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
    }

    function playIntro() {
        heroCNC.style.opacity = '';
        window._introTimers = replayTimers;

        scheduleR(80,    () => { if (cncLogo) cncLogo.classList.add('on'); });
        scheduleR(900,   () => keys[0].classList.add('on'));
        scheduleR(1500,  () => typewriterR(words[0], 62));
        scheduleR(2240,  () => keys[1].classList.add('on'));
        scheduleR(2840,  () => typewriterR(words[1], 62));
        scheduleR(3580,  () => keys[2].classList.add('on'));
        scheduleR(4220,  () => typewriterR(words[2], 58));
        scheduleR(6100,  () => heroCNC.classList.add('out'));
        scheduleR(6500,  () => { if (heroTag) heroTag.classList.add('on'); });
        scheduleR(8800,  () => { if (heroTag) heroTag.classList.add('out'); });
        scheduleR(9400,  () => { if (heroSum)  heroSum.classList.add('on'); });
        scheduleR(11000, () => { if (heroCue)  heroCue.classList.add('on'); });
        scheduleR(11700, () => { if (heroCue)  heroCue.classList.add('bob'); });
    }

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

