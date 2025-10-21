/* =========================================================
   Kurayoshi Kita HS LP - script.js (Fixed Version)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize all site functions ---
  sectionTitleReveal();
  initBackToTop();
  initDraggableCarousels();
  initMobileHeroSlider();
  initPerspectiveCarousel(); 
  initClubSliders();
  initRevealCards();
  initSideRail();
});


/* ------------------------------------------
 * 1) Section title: fade-up on enter
 * ---------------------------------------- */
function sectionTitleReveal() {
  const titles = document.querySelectorAll(".section-title");
  if (!titles.length) return;

  const show = (el) => el.classList.add("is-visible");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
  );

  titles.forEach((title) => observer.observe(title));
}


/* ------------------------------------------
 * 2) Back-to-top button
 * ---------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle("is-visible", window.scrollY > 400);
  };
  
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


/* ------------------------------------------
 * 3) Draggable carousels (.facilities-slider)
 * ---------------------------------------- */
function initDraggableCarousels() {
  const carousels = document.querySelectorAll('.facilities-slider');
  if (!carousels.length) return;

  carousels.forEach(block => {
    const track = block.querySelector('.facilities-track');
    const prevBtn = block.querySelector('.facilities-nav.prev');
    const nextBtn = block.querySelector('.facilities-nav.next');
    if (!track || !prevBtn || !nextBtn) return;

    let isDragging = false;
    let startX, scrollLeft;

    const getStep = () => {
      const firstSlide = track.querySelector('.facility-slide');
      if (!firstSlide) return track.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(track).gap) || 18;
      return firstSlide.offsetWidth + gap;
    };

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft < 1;
      nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
    };

    prevBtn.addEventListener('click', () => track.scrollBy({ left: -getStep(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left: getStep(), behavior: 'smooth' }));

    track.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
      track.setPointerCapture(e.pointerId);
    });

    const stopDragging = () => {
      isDragging = false;
      track.style.cursor = 'grab';
    };

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointerleave', stopDragging);
    track.addEventListener('pointercancel', stopDragging);

    track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
    updateButtons();
  });
}


/* ------------------------------------------
 * 4) Mobile Hero Image Fade Slider (.fade-slider)
 * ---------------------------------------- */
function initMobileHeroSlider() {
  if (window.innerWidth > 768) return;
  const slides = document.querySelectorAll(".fade-slider .slide");
  if (slides.length <= 1) return;
  
  let current = 0;
  const showSlide = (index) => {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  };
  const nextSlide = () => {
      current = (current + 1) % slides.length;
      showSlide(current);
  };
  showSlide(current);
  setInterval(nextSlide, 5000);
}


/* ------------------------------------------
 * 5) Cover Flow Photo Gallery Carousel (with Loop)
 * ---------------------------------------- */
function initPerspectiveCarousel() {
  const carousel = document.querySelector(".perspective-carousel");
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const originalSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-button.prev');
  const nextBtn = carousel.querySelector('.carousel-button.next');
  if (originalSlides.length === 0) return;

  const cloneCount = 2;
  for (let i = 0; i < cloneCount; i++) {
    const firstClone = originalSlides[i].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1 - i].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);
  }

  const allSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  let currentIndex = cloneCount;
  let isTransitioning = false;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    originalSlides.forEach((_, i) => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', `Go to slide ${i + 1}`);
      button.addEventListener('click', () => updateCarousel(i + cloneCount));
      dotsContainer.appendChild(button);
    });
  }
  const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

  const updateCarousel = (newIndex, instant = false) => {
    if (isTransitioning && !instant) return;
    isTransitioning = !instant;
    currentIndex = newIndex;

    const currentSlide = allSlides[currentIndex];
    const trackContainer = carousel.querySelector('.carousel-track-container');
    if (!currentSlide || !trackContainer) return;

    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    }

    const offset = (trackContainer.offsetWidth / 2) - (currentSlide.offsetLeft + currentSlide.offsetWidth / 2);
    track.style.transform = `translateX(${offset}px)`;

    allSlides.forEach((slide, i) => {
      const diff = i - currentIndex;
      let transform, zIndex = allSlides.length - Math.abs(diff);
      if (diff === 0) {
        transform = `rotateY(0) scale(1)`;
        zIndex = allSlides.length + 1;
      } else {
        const scale = 1 - Math.abs(diff) * 0.15;
        const rotateY = -diff * 15;
        transform = `scale(${scale}) rotateY(${rotateY}deg)`;
      }
      slide.style.transform = transform;
      slide.style.zIndex = zIndex;
    });

    if (dots.length > 0) {
      const dotIndex = (currentIndex - cloneCount + originalSlides.length) % originalSlides.length;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === dotIndex));
    }
  };
  
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIndex < cloneCount) {
      currentIndex += originalSlides.length;
      updateCarousel(currentIndex, true);
    } else if (currentIndex >= cloneCount + originalSlides.length) {
      currentIndex -= originalSlides.length;
      updateCarousel(currentIndex, true);
    }
  });

  prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
  nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));
  
  allSlides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
        if (i !== currentIndex) {
            updateCarousel(i);
        }
    });
  });
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => updateCarousel(currentIndex, true), 200);
  });
  
  const initLoad = () => {
    updateCarousel(currentIndex, true);
    carousel.style.opacity = 1;
    carousel.style.transition = 'opacity 0.3s ease';
    window.removeEventListener('load', initLoad);
  };
  carousel.style.opacity = 0;
  window.addEventListener('load', initLoad);
}


/* ------------------------------------------
 * 6) Club Sliders - 修正版（リンククリック対応）
 * ---------------------------------------- */
function initClubSliders() {
  const wraps = document.querySelectorAll('.club-slider-wrap');
  if (!wraps.length) return;

  wraps.forEach((wrap) => {
    const track = wrap.querySelector('.club-slider');
    const prevBtn = wrap.querySelector('.club-prev');
    const nextBtn = wrap.querySelector('.club-next');
    if (!track || !prevBtn || !nextBtn) return;

    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carousel');
    if (!track.hasAttribute('tabindex')) track.setAttribute('tabindex', '0');

    const atStart = () => track.scrollLeft < 5;
    const atEnd = () => track.scrollLeft + track.clientWidth > track.scrollWidth - 5;
    const getGap = () => parseFloat(getComputedStyle(track).gap) || 16;
    const updateButtons = () => {
      prevBtn.disabled = atStart();
      nextBtn.disabled = atEnd();
    };

    const calcStepPx = () => {
      const stepCards = Math.max(1, parseInt(wrap.dataset.step || "3", 10));
      const firstCard = track.querySelector('.club-card');
      if (!firstCard) return track.clientWidth * 0.8;
      return stepCards * (firstCard.getBoundingClientRect().width + getGap());
    };

    const scrollByStep = (px) => {
      track.scrollBy({ left: px, behavior: 'smooth' });
    };

    let stepPx = calcStepPx();
    const recalc = () => { 
      stepPx = calcStepPx(); 
      updateButtons(); 
    };

    prevBtn.addEventListener('click', () => scrollByStep(-stepPx));
    nextBtn.addEventListener('click', () => scrollByStep(stepPx));

    track.addEventListener('wheel', (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }, { passive: false });

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasMoved = false;
    
    track.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      
      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.style.cursor = 'grabbing';
      track.style.userSelect = 'none';
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      
      const dx = e.clientX - startX;
      
      if (Math.abs(dx) > 5) {
        hasMoved = true;
        e.preventDefault();
        track.scrollLeft = scrollStart - dx;
      }
    });

    const endDrag = () => {
      if (!isDown) return;
      
      isDown = false;
      track.style.cursor = 'grab';
      track.style.userSelect = '';
      
      if (hasMoved) {
        const links = track.querySelectorAll('.club-card a');
        links.forEach(link => {
          link.style.pointerEvents = 'none';
          setTimeout(() => {
            link.style.pointerEvents = '';
          }, 100);
        });
      }
      
      hasMoved = false;
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.addEventListener('keydown', (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      
      if (e.key === 'ArrowLeft')  scrollByStep(-stepPx);
      if (e.key === 'ArrowRight') scrollByStep(stepPx);
      if (e.key === 'Home') track.scrollTo({ left: 0, behavior: 'smooth' });
      if (e.key === 'End')  track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    new ResizeObserver(recalc).observe(track);
    updateButtons();
  });
}


/* ------------------------------------------
 * 7) Reveal-up animation for cards
 * ---------------------------------------- */
function initRevealCards() {
  const targets = document.querySelectorAll('.reveal-up');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

  targets.forEach(el => io.observe(el));
}


/* ------------------------------------------
 * 8) Side Rail - Show after scrolling past FV (PC only)
 *    モバイルは常に表示、PCのみスクロール後に表示
 * ---------------------------------------- */
function initSideRail() {
  const sideRail = document.querySelector('.side-rail');
  if (!sideRail) return;

  // モバイル判定
  const isMobile = () => window.innerWidth <= 768;

  const heroSection = document.querySelector('.hero-split-bg');
  const triggerHeight = heroSection ? heroSection.offsetHeight * 0.6 : 500;

  const checkScroll = () => {
    // モバイルの場合は何もしない（常に表示）
    if (isMobile()) {
      sideRail.classList.remove('side-rail-hidden');
      sideRail.classList.remove('side-rail-visible');
      return;
    }

    // PC時のみスクロール制御
    const scrolled = window.scrollY || window.pageYOffset;
    
    if (scrolled > triggerHeight) {
      sideRail.classList.add('side-rail-visible');
      sideRail.classList.remove('side-rail-hidden');
    } else {
      sideRail.classList.add('side-rail-hidden');
      sideRail.classList.remove('side-rail-visible');
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // リサイズ時に再チェック
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      checkScroll();
    }, 200);
  }, { passive: true });

  checkScroll();
  
  console.log('Side rail initialized. Mode:', isMobile() ? 'Mobile (always visible)' : 'Desktop (scroll-triggered)');
}