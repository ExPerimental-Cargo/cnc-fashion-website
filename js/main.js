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
    schedule(17200, () => { if (heroCue) heroCue.classList.add('on'); });
    schedule(17800, () => {
        if (heroCue) heroCue.classList.add('bob');
        window._introComplete = true;
    });
    schedule(17700, () => {
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
   LANGUAGE TOGGLE
   ============================================= */

(function () {
    const T = {
        ko: {
            'wwa-body':          'CNC는 자본(Capital), 글로벌 네트워크(Connect), 크리에이티브(Creativity)를 결합하여 패션 자산의 전 라이프사이클을 엔지니어링하는 크로스보더 비즈니스 빌더입니다.<br><br>밀라노와 서울을 다이렉트로 연결하는 독자적 인프라를 기반으로, 유망 브랜드 발굴부터 M&amp;A 연결 및 사후 밸류업(Value-up)까지 브랜드와 투자사의 양방향 성장을 실현합니다.',
            'svc1-desc':         '패션·라이프스타일 산업에 대한 깊은 통찰력을 바탕으로, 독보적 가치를 지닌 우수 브랜드만을 엄선하여 최적의 자본을 연결합니다. 브랜드에는 글로벌 시장 성장을 위한 자금과 실전 경영 파트너십을, 투자자에게는 검증된 Deal과 확실한 기업 가치 상승(Value-up)을 제공합니다.',
            'svc2-desc':         '브랜드가 한국, 이태리 등 글로벌 신시장으로 안전하게 진입하는 관문(Gateway)이자, 글로벌 프리미엄 자산이 새로운 시장에 안착하는 정교한 교두보 역할을 수행합니다. 시장 간 장벽을 낮추고 양방향(Two-Way) 스케일업 기회를 창출합니다.',
            'svc3-desc':         '브랜드 고유의 헤리티지와 디렉팅을 보존하면서, 전략적 라이선싱과 현지 핵심 인재 소싱을 통해 실질적인 브랜드 성장을 이끌어냅니다. 감성적 브랜딩에 머물지 않고 체계적인 상업화 구조를 설계하여 지속 가능한 비즈니스 확장을 완성합니다.',
            'svc4-desc':         '밀라노 현지 조인트 벤처(JV) 인프라를 풀 가동하여 크리에이티브 디렉팅부터 PR, 마케팅, 글로벌 홀세일까지 직접 실행합니다. 단순 자본 투자를 넘어 현지 거점에서 브랜드를 직접 밀착 관리하여 글로벌 탑티어로 끌어올리는 실질적인 밸류업을 실현합니다.',
            'works1-lead':       '브랜드 발굴, 자본 배치부터 인수 후 통합(PMI)까지 최적의 구조를 설계합니다.',
            'works1-case1-desc': '인수 브랜드 소싱 및 딜 완료 &amp; 밀라노 현지 글로벌 프리미엄 브랜드로서 현지화 전략, 인재 소싱, 조직 세팅 구조화',
            'works1-case2-desc': '국내 최초 독점 수입 계약 및 라이선싱 딜 구조화, 로컬라이징을 통한 시장 안착.',
            'works2-lead':       '밀라노-서울 직통 네트워크를 활용해 브랜드의 최상위 시장 포지셔닝을 완수합니다.',
            'works2-case1-desc': '글로벌 디렉터 파트너로서 한-이 마켓 간 브랜딩 정렬 및 마켓 전략 총괄.',
            'works3-lead':       "단순 유통을 넘어, 현지 안착을 위한 독보적인 '현지화(Localization)' 솔루션을 제공합니다.",
            'works3-case1-desc': '프리미엄 브랜드 포지셔닝을 구축하기 위한 전략적 브랜딩, 크리에이티브 디렉팅 및 마케팅 총괄',
        },
        en: {
            'wwa-body':          'CNC is a cross-border business builder that engineers the full lifecycle of fashion assets by seamlessly integrating Capital, Global Connectivity (Connect), and Creativity. <br><br>Leveraging our proprietary infrastructure connecting Milan and Seoul directly, we drive two-way growth for both brands and investors—ranging from identifying promising brands and facilitating M&As to post-investment value creation.',
            'svc1-desc':         'Based on deep insights into the fashion and lifestyle industries, we curate high-value brands and connect them with optimal capital. We empower brands with capital and hands-on operational execution for global scaling, while providing investors with vetted deal flow and clear corporate value appreciation.',
            'svc2-desc':         'We serve as a secure gateway for brands expanding into new global markets including Korea and Italy, and act as a sophisticated foothold for premium global assets to establish a presence in new regions. We eliminate cross-border barriers to unlock seamless, mutual scale-up opportunities.',
            'svc3-desc':         "While preserving a brand’s distinct heritage and creative direction, we unlock real growth through strategic licensing and key local talent sourcing. Moving beyond emotional branding, we design systematic commercialization models to achieve sustainable business expansion.",
            'svc4-desc':         'LWe fully mobilize local Joint Venture (JV) infrastructure in Milan to directly execute creative direction, PR, marketing, and global wholesale. Going beyond passive capital investment, we provide close, hands-on management directly from our local hub to elevate brands into top-tier global players.',
            'works1-lead':       'Designing optimal structures spanning brand sourcing and capital deployment to post-merger integration (PMI).',
            'works1-case1-desc': 'Sourced the acquisition brand and completed deal execution; structured Milan-based global localization strategy, key talent sourcing, and organizational setup.',
            'works1-case2-desc': "Structured Korea’s first exclusive import agreement and licensing deal, securing solid market settlement through strategic localization.",
            'works2-lead':       'Completing top-tier market positioning for brands by utilizing our direct Milan-Seoul network.',
            'works2-case1-desc': 'Served as a global director partner, overseeing branding alignment and market strategy between the Korean and Italian markets.',
            'works3-lead':       'Delivering proprietary localization solutions for seamless regional integration that goes far beyond simple distribution.',
            'works3-case1-desc': 'Directed strategic branding, creative direction, and marketing to position the brand as an Italian premium lifestyle brand.',
        }
    };

    function applyLang(lang) {
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
        localStorage.setItem('cnc-lang', lang);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (T[lang]?.[key] !== undefined) el.innerHTML = T[lang][key];
        });
    }

    function setLang(lang, animate) {
        if (!animate) { applyLang(lang); return; }
        const main = document.querySelector('main');
        main.classList.add('lang-fade');
        setTimeout(() => {
            applyLang(lang);
            main.classList.remove('lang-fade');
        }, 600);
    }

    function handleToggle(e) {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-lang') || 'ko';
        setLang(current === 'ko' ? 'en' : 'ko', true);
    }

    document.querySelectorAll('.lang-toggle').forEach(el => {
        el.addEventListener('click', handleToggle);
    });

    setLang(localStorage.getItem('cnc-lang') || 'ko', false);
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
        scheduleR(17200, () => { if (heroCue)  heroCue.classList.add('on'); });
        scheduleR(17800, () => {
            if (heroCue) heroCue.classList.add('bob');
            window._introComplete = true;
        });
        scheduleR(17700, () => {
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

