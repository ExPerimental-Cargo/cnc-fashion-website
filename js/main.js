/* =============================================
   HERO — TIME-BASED CNC ANIMATION
   ============================================= */

(function () {
    const heroCNC = document.getElementById('heroCNC');
    const heroTag = document.getElementById('heroTag');
    const heroSum = document.getElementById('heroSum');
    const heroCue = document.getElementById('heroCue');
    if (!heroCNC) return;

    const keys  = heroCNC.querySelectorAll('.hero__cnc-key');
    const words = heroCNC.querySelectorAll('.hero__cnc-word');

    const timers = [];
    const schedule = (ms, fn) => timers.push(setTimeout(fn, ms));

    function typewriter(el, speed) {
        const text = el.textContent.trim();
        el.textContent = '';
        el.style.opacity = '1';

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

    // Phase 1: CNC 세 줄 순차 등장
    schedule(380,  () => keys[0].classList.add('on'));
    schedule(980,  () => typewriter(words[0], 62));
    schedule(1720, () => keys[1].classList.add('on'));
    schedule(2320, () => typewriter(words[1], 62));
    schedule(3060, () => keys[2].classList.add('on'));
    schedule(3700, () => typewriter(words[2], 58));

    // Phase 2: 태그라인 등장
    schedule(5500, () => heroCNC.classList.add('out'));
    schedule(5900, () => { if (heroTag) heroTag.classList.add('on'); });

    // Phase 3: 브랜드 서머리
    schedule(8200, () => { if (heroTag) heroTag.classList.add('out'); });
    schedule(8800, () => { if (heroSum) heroSum.classList.add('on'); });
    schedule(10400, () => { if (heroCue) heroCue.classList.add('on'); });
    schedule(11100, () => { if (heroCue) heroCue.classList.add('bob'); });

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
   BACKGROUND COLOR — SCROLL INTERPOLATION
   #edecea → #b5b3ff
   ============================================= */

const BG_START = [237, 236, 234]; // #edecea
const BG_END   = [181, 179, 255]; // #b5b3ff

function updateBg() {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollMax <= 0) return;
    const t = Math.min(1, window.scrollY / scrollMax);
    const r = Math.round(BG_START[0] + (BG_END[0] - BG_START[0]) * t);
    const g = Math.round(BG_START[1] + (BG_END[1] - BG_START[1]) * t);
    const b = Math.round(BG_START[2] + (BG_END[2] - BG_START[2]) * t);
    document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
    if (nav) nav.style.backgroundColor = `rgba(${r},${g},${b},0.75)`;
    document.documentElement.style.setProperty('--bg-current', `rgb(${r},${g},${b})`);
}

/* =============================================
   UNIFIED SCROLL HANDLER
   ============================================= */

function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateBg();
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
   OUR WORKS — VERTICAL→HORIZONTAL SCROLL
   ============================================= */

(function () {
    const section = document.querySelector('.our-works');
    const list    = document.getElementById('worksList');
    if (!section || !list) return;

    const MOBILE_BP = 768;
    let cachedMax = 0;

    const edgeL = document.getElementById('worksEdgeLeft');
    const edgeR = document.getElementById('worksEdgeRight');

    function isMobile() { return window.innerWidth <= MOBILE_BP; }

    function calcMax() {
        const cards = list.children;
        if (cards.length < 2) return list.scrollWidth - list.clientWidth;
        const prev = list.style.transform;
        list.style.transform = '';
        const firstLeft = cards[0].getBoundingClientRect().left;
        const lastLeft  = cards[cards.length - 1].getBoundingClientRect().left;
        list.style.transform = prev;
        return lastLeft - firstLeft;
    }

    function setHeight() {
        if (isMobile()) { section.style.height = ''; return; }
        cachedMax = calcMax();
        section.style.height = `calc(100vh + ${cachedMax}px)`;
    }

    function update() {
        if (isMobile()) { list.style.transform = ''; return; }
        const top      = section.getBoundingClientRect().top;
        const progress = Math.max(0, Math.min(1, -top / cachedMax));
        list.style.transform = `translateX(${-progress * cachedMax}px)`;

        // 양쪽 페이드 opacity: 처음 15% / 마지막 15% 구간에서 부드럽게 전환
        if (edgeL) edgeL.style.opacity = Math.min(1, progress / 0.25);
        if (edgeR) edgeR.style.opacity = Math.min(1, (1 - progress) / 0.25);
    }

    setHeight();
    lenis.on('scroll', update);
    window.addEventListener('resize', () => { setHeight(); update(); });
    update();
})()

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
