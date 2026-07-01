/* =============================================
   NAVIGATION — SCROLL BEHAVIOR
   ============================================= */

const nav = document.getElementById('nav');

window.addEventListener('scroll', onScroll, { passive: true });

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
   HERO — SNAP-SCROLL CNC ANIMATION
   =============================================

   Phase 0 (page load):
     - C, N, C fade in via CSS @keyframes
     - line 2 & 3 are shifted UP (translateY) to overlap line 1
     - Visually: "CNC FASHION co." on one row

   Snap 1 (scroll ≥ 20%):
     - N snaps to 2nd line position (spring easing)

   Snap 2 (scroll ≥ 38%):
     - C snaps to 3rd line position (spring easing)

   Phase 2 (scroll 50 → 74%):
     - onnect. / etwork. / reativity-Capital. reveal

   Phase 3 (scroll 82%+):
     - Badge and desc fade in
   ============================================= */

const heroSection  = document.querySelector('.hero-scroll');
const headline     = document.querySelector('.hero__headline');
const heroContent  = document.querySelector('.hero__content');
const heroSubtext  = document.querySelector('.hero__subtext');
const heroLogoSub  = document.querySelector('.hero__logo-sub');
const line1El      = document.querySelector('.hero__line--1');
const line2El      = document.querySelector('.hero__line--2');
const line3El      = document.querySelector('.hero__line--3');
const expand1      = document.querySelector('.hero__expand--1');
const expand2      = document.querySelector('.hero__expand--2');
const expand3      = document.querySelector('.hero__expand--3');

let lineH = 100;
let fullH  = 300;

/* ── Scroll thresholds ──────────────────────────────────────
   순서: CNC FASHION co.
         → FASHION co. fade out
         → C / NC (snap)
         → Connect. / NC (expand 1)
         → Connect. / Network. / C (expand 2 + C snap 동시)
         → Connect. / Network. / Creativity-Capital. (expand 3)
   ────────────────────────────────────────────────────── */
const LOGO_FADE_P  = 0.06;  // 이 지점부터 FASHION co. fade (CSS transition)
const SNAP_NC      = 0.20;  // N + C → line 2 (C/NC)
const EXPAND_1     = 0.30;  // onnect. reveal
const SNAP_C       = 0.46;  // C → line 3 (+ etwork. 동시)
const EXPAND_2     = 0.46;
const EXPAND_3     = 0.63;

/* ── Easings: 오버슈트 없는 부드러운 expo-out ── */
const SPRING_FWD   = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
const SPRING_REV   = 'transform 0.5s cubic-bezier(0.25, 0, 0.5, 1)';
const SPRING_H_FWD = 'max-height 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
const SPRING_H_REV = 'max-height 0.5s cubic-bezier(0.25, 0, 0.5, 1)';

/* ── 스냅 큐 상태 ─────────────────────────────────────────────
   스크롤 속도에 관계없이 반드시 N → C 순서로 한 줄씩 실행.
   목표(target*)와 현재(snapState*)를 분리하고,
   진행 중인 애니메이션이 끝난 후에만 다음 단계를 실행. */
let snapStateN = null;   // 현재 완료된 N 상태
let snapStateC = null;   // 현재 완료된 C 상태
let targetN    = false;  // 스크롤이 요구하는 N 목표
let targetC    = false;  // 스크롤이 요구하는 C 목표
let animatingN = false;
let animatingC = false;
let animTimerN = null;
let animTimerC = null;

/* headline + subtext 높이 갱신 */
function updateSnapLayout(fwd) {
    const th = snapStateC ? fullH : snapStateN ? fullH * 2 / 3 : fullH / 3;
    if (headline) {
        headline.style.transition = fwd ? SPRING_H_FWD : SPRING_H_REV;
        headline.style.maxHeight  = `${th}px`;
    }
}

/* N 라인 단독 애니메이션 (line2 + line3 동반) */
function snapAnimN(value) {
    animatingN = true;
    const fwd  = value;
    const ease = fwd ? SPRING_FWD : SPRING_REV;
    const dur  = fwd ? 960 : 540;

    if (line2El) { line2El.style.transition = ease; line2El.style.transform = value ? 'translateY(0)' : `translateY(${-lineH}px)`; }
    if (line3El) { line3El.style.transition = ease; line3El.style.transform = value ? `translateY(${-lineH}px)` : `translateY(${-lineH * 2}px)`; }
    snapStateN = value;
    updateSnapLayout(fwd);

    let settled = false;
    const done = () => {
        if (settled) return;
        settled    = true;
        animTimerN = null;
        animatingN = false;
        processSnapQueue();
    };
    animTimerN = setTimeout(done, dur + 80);
    if (line2El) {
        const cb = (e) => {
            if (e.propertyName !== 'transform') return;
            line2El.removeEventListener('transitionend', cb);
            clearTimeout(animTimerN);
            done();
        };
        line2El.addEventListener('transitionend', cb);
    }
}

/* C 라인 단독 애니메이션 (line3만) */
function snapAnimC(value) {
    animatingC = true;
    const fwd  = value;
    const ease = fwd ? SPRING_FWD : SPRING_REV;
    const dur  = fwd ? 960 : 540;

    if (line3El) { line3El.style.transition = ease; line3El.style.transform = value ? 'translateY(0)' : `translateY(${-lineH}px)`; }
    snapStateC = value;
    updateSnapLayout(fwd);

    let settled = false;
    const done = () => {
        if (settled) return;
        settled    = true;
        animTimerC = null;
        animatingC = false;
        processSnapQueue();
    };
    animTimerC = setTimeout(done, dur + 80);
    if (line3El) {
        const cb = (e) => {
            if (e.propertyName !== 'transform') return;
            line3El.removeEventListener('transitionend', cb);
            clearTimeout(animTimerC);
            done();
        };
        line3El.addEventListener('transitionend', cb);
    }
}

/* 큐 처리: 진행 중 애니메이션 없을 때만 다음 단계 실행
   forward: N 먼저 → C    (CNC → C/NC → C/N/C)
   reverse: C 먼저 → N    (C/N/C → C/NC → CNC) */
function processSnapQueue() {
    if (animatingN || animatingC) return;
    const nDone = snapStateN === targetN;
    const cDone = snapStateC === targetC;
    if (nDone && cDone) return;

    const goingDown = (targetN && !snapStateN) || (targetC && !snapStateC);
    if (goingDown) {
        if (!nDone) snapAnimN(targetN);
        else        snapAnimC(targetC);
    } else {
        if (!cDone) snapAnimC(targetC);
        else        snapAnimN(targetN);
    }
}

/* 외부 진입점 — updateHeroCNC에서 호출 */
function applySnapLines(n, c, animated) {
    if (!animated) {
        // init / resize: 즉시 적용, 진행 중 큐 취소
        clearTimeout(animTimerN);
        clearTimeout(animTimerC);
        animatingN = false;
        animatingC = false;
        snapStateN = targetN = n;
        snapStateC = targetC = c;

        const th = c ? fullH : n ? fullH * 2 / 3 : fullH / 3;
        if (line2El) { line2El.style.transition = 'none'; line2El.style.transform = n ? 'translateY(0)' : `translateY(${-lineH}px)`; }
        if (line3El) { line3El.style.transition = 'none'; line3El.style.transform = c ? 'translateY(0)' : n ? `translateY(${-lineH}px)` : `translateY(${-lineH * 2}px)`; }
        if (headline)  { headline.style.transition = 'none'; headline.style.maxHeight = `${th}px`; }
        return;
    }

    // 목표 상태만 갱신 → 큐가 알아서 순서대로 실행
    const changed = n !== targetN || c !== targetC;
    targetN = n;
    targetC = c;
    if (changed) processSnapQueue();
}

const heroSticky = document.querySelector('.hero-scroll__sticky');

/* Measure line height, full height, and collapse lines 2 & 3 onto line 1 */
function initHeroCNC() {
    if (!line1El || !line2El || !line3El || !headline) return;

    lineH = line1El.offsetHeight;

    const fontSize = parseFloat(getComputedStyle(line1El).fontSize) || lineH / 1.1;
    const pb = Math.ceil(fontSize * 0.45);
    headline.style.paddingBottom = `${pb}px`;

    headline.style.maxHeight = 'none';
    fullH = headline.scrollHeight;

    /* 1줄 상태에서 maxHeight = fullH/3 = lineH + pb/3
       → 텍스트 아래 pb/3 만큼의 빈 공간이 생김.
       sticky padding-bottom을 역산해 텍스트 하단이 뷰포트 하단에서 정확히 20px이 되도록 조정. */
    const extraBelow = fullH / 3 - lineH; // ≈ pb/3
    if (heroSticky) {
        heroSticky.style.paddingBottom = `${Math.max(0, Math.round(20 - extraBelow))}px`;
    }

    // hero__logo-sub: line3의 C 글자 바로 뒤에 위치
    if (heroLogoSub && line3El) {
        const letterEl3 = line3El.querySelector('.hero__letter');
        if (letterEl3) {
            heroLogoSub.style.left = letterEl3.offsetWidth + 'px';
        }
    }

    // 재측정 시 스냅 상태 초기화 → updateHeroCNC(false)가 즉시 재적용
    snapStateN = null;
    snapStateC = null;
}

function updateHeroCNC(animated = true) {
    if (!heroSection) return;

    const rect     = heroSection.getBoundingClientRect();
    const total    = heroSection.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;

    if (scrolled < 0 || total <= 0) {
        // 최상단: logo-sub 복원
        if (heroLogoSub && heroLogoSub.dataset.faded) {
            heroLogoSub.style.transition = 'opacity 0.5s ease';
            heroLogoSub.style.opacity    = '1';
            delete heroLogoSub.dataset.faded;
        }
        applySnapLines(false, false, false);
        return;
    }
    const p = Math.min(1, scrolled / total);

    /* ── FASHION co. fade: 스크롤 시작 직후 한 번만 CSS transition으로 부드럽게 ── */
    if (heroLogoSub) {
        const shouldFade = p >= LOGO_FADE_P;
        if (shouldFade && !heroLogoSub.dataset.faded) {
            heroLogoSub.style.transition = animated ? 'opacity 0.75s ease' : 'none';
            heroLogoSub.style.opacity    = '0';
            heroLogoSub.dataset.faded    = '1';
        } else if (!shouldFade && heroLogoSub.dataset.faded) {
            heroLogoSub.style.transition = 'opacity 0.5s ease';
            heroLogoSub.style.opacity    = '1';
            delete heroLogoSub.dataset.faded;
        }
    }

    /* ── 스냅: C/NC → C/N/C ── */
    applySnapLines(p >= SNAP_NC, p >= SNAP_C, animated);

    /* ── 단어 확장: Connect. → Network. → Creativity-Capital. ── */
    expand1?.classList.toggle('revealed', p >= EXPAND_1);
    expand2?.classList.toggle('revealed', p >= EXPAND_2);
    expand3?.classList.toggle('revealed', p >= EXPAND_3);

}

/* ─── Init ─────────────────────────────────────────────────── */
function setup() {
    initHeroCNC();
    updateHeroCNC(false);
}

if (document.readyState === 'complete') {
    setup();
} else {
    window.addEventListener('load', setup);
}

// 웹폰트 로드 완료 후 재측정 (폰트에 따라 lineH가 달라질 수 있음)
document.fonts.ready.then(() => {
    initHeroCNC();
    updateHeroCNC(false);
});

// 뷰포트 크기 변경 시 재측정
window.addEventListener('resize', () => {
    initHeroCNC();
    updateHeroCNC(false);
}, { passive: true });

/* =============================================
   UNIFIED SCROLL HANDLER
   ============================================= */

function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateHeroCNC();
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
    threshold: 0.06,
    rootMargin: '0px 0px -48px 0px'
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
