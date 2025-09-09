/* =========================================================
   Kurayoshi Kita HS LP - script.js (Hall Theme Ready, merged)
   - Section title reveal
   - Back-to-top button
   - LIFE CINEMA v3 (theme-hall対応)
     * 1枚表示 / ドット / 矢印（data-arrows="on|off"）/ キー左右
     * ドラッグ/スワイプ / ホイール横移動
     * オートプレイ（停止: ホバー/フォーカス/画面外）
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  sectionTitleReveal();
  initBackToTop();
  initLifeCinemaV3(); // #life の v3/theme-hall スライダー
});

/* ------------------------------------------
 * 1) Section title: fade-up on enter
 * ---------------------------------------- */
function sectionTitleReveal() {
  const titles = document.querySelectorAll(".section-title");
  if (!titles.length) return;

  const show = (el) => el.classList.add("is-visible");
  const io = new IntersectionObserver(
    (ents) =>
      ents.forEach((e) => {
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      }),
    { threshold: 0, rootMargin: "0px 0px -12% 0px" }
  );

  titles.forEach((t) => {
    const r = t.getBoundingClientRect();
    if (r.top < innerHeight * 0.88 && r.bottom > 0) show(t);
    else io.observe(t);
  });
}

/* ------------------------------------------
 * 2) Back-to-top button
 * ---------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  const onScroll = () =>
    btn.classList.toggle("is-visible", window.scrollY > 300);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* =========================================================
 * 3) LIFE CINEMA v3 / theme-hall  — 1枚表示を強制
 *    - トラック: gap/padding=0, overflow:hidden, flex化
 *    - スライド: flex-basis:100%
 *    - 矢印/ドット/ドラッグ/キー/ホイール/オートプレイ対応
========================================================= */
function initLifeCinemaV3() {
  const blocks = document.querySelectorAll(".life-cinema.v3");
  if (!blocks.length) return;

  blocks.forEach((block) => setupCinema(block));

  function setupCinema(block) {
    if (block.dataset.initialized === "v3-single") return;
    block.dataset.initialized = "v3-single";

    const track =
      block.querySelector(".lc3-track") || block.querySelector("#lifeCinema");
    const slides = Array.from(block.querySelectorAll(".lc3-slide"));
    if (!track || !slides.length) return;

    /* --- ★ 1枚表示のためのスタイルをJSで強制 --- */
    Object.assign(track.style, {
      display: "flex",
      gap: "0px",
      padding: "0px",
      overflow: "hidden",
      scrollSnapType: "none",
      willChange: "transform",
      transition: "transform 420ms cubic-bezier(.22,1,.36,1)",
    });
    slides.forEach((s) => {
      s.style.flex = "0 0 100%";     // 幅100%固定
      s.style.width = "100%";
      s.style.margin = "0";
    });

    /* --- 矢印（data-arrowsで出し分け） --- */
    const arrowsPref = (block.dataset.arrows || "on").toLowerCase() !== "off";
    let prevBtn = block.querySelector(".lc3-nav.prev");
    let nextBtn = block.querySelector(".lc3-nav.next");
    const makeBtn = (cls, label, d) => {
      const b = document.createElement("button");
      b.className = `lc3-nav ${cls}`;
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
      return b;
    };
    if (!prevBtn) { prevBtn = makeBtn("prev","前へ","M15 19L8 12L15 5"); block.appendChild(prevBtn); }
    if (!nextBtn) { nextBtn = makeBtn("next","次へ","M9 5l7 7-7 7"); block.appendChild(nextBtn); }
    if (!arrowsPref) { prevBtn.style.display="none"; nextBtn.style.display="none"; }

    /* --- ドット生成 --- */
    let dots = block.querySelector(".lc3-dots") || block.querySelector("#lifeDots");
    if (!dots) { dots = document.createElement("ol"); dots.className="lc3-dots"; dots.setAttribute("aria-label","スライドナビ"); block.appendChild(dots); }
    dots.innerHTML = "";
    slides.forEach((s,i)=>{
      const li=document.createElement("li");
      li.role="button"; li.tabIndex=0;
      li.setAttribute("aria-label",`${i+1}枚目：${s.dataset.title || s.querySelector("h3")?.textContent || `スライド${i+1}`}`);
      li.addEventListener("click",()=>goTo(i));
      li.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); goTo(i); }});
      dots.appendChild(li);
    });

    /* --- ロジック（transformで水平移動） --- */
    let index = 0;
    const applyX = (pct) => { track.style.transform = `translateX(${pct}%)`; };
    const setActive = (i)=>{
      slides.forEach((s,j)=>s.classList.toggle("is-active", j===i));
      [...dots.children].forEach((d,j)=>{
        if(j===i){ d.setAttribute("aria-current","true"); d.style.width="48px"; d.style.background="linear-gradient(90deg,#62a2af,#f4a72c)"; d.style.transform="translateY(-1px)"; }
        else{ d.removeAttribute("aria-current"); d.style.width="30px"; d.style.background="#e5ecf0"; d.style.transform="translateY(0)"; }
      });
      prevBtn.disabled = (i===0);
      nextBtn.disabled = (i===slides.length-1);
    };
    const goTo = (to)=>{
      const last = slides.length-1;
      if (to < 0) to = last;
      if (to > last) to = 0;
      index = to;
      track.style.transition = "transform 420ms cubic-bezier(.22,1,.36,1)";
      applyX(-index*100);
      setActive(index);
      restartAutoplay();
    };

    /* --- 入力: 矢印/キー/ドラッグ/ホイール --- */
    prevBtn.addEventListener("click",()=>goTo(index-1));
    nextBtn.addEventListener("click",()=>goTo(index+1));

    track.setAttribute("tabindex", track.getAttribute("tabindex") || "0");
    track.addEventListener("keydown",(e)=>{
      if(e.key==="ArrowRight"){ e.preventDefault(); goTo(index+1); }
      if(e.key==="ArrowLeft"){  e.preventDefault(); goTo(index-1); }
    });

    let dragging=false, startX=0, moved=0;
    track.addEventListener("pointerdown",(e)=>{
      dragging=true; startX=e.clientX; moved=0; track.setPointerCapture(e.pointerId);
      track.style.transition = "none";
    });
    track.addEventListener("pointermove",(e)=>{
      if(!dragging) return;
      moved = e.clientX - startX;
      applyX((-index*100) + (moved/track.clientWidth)*100);
    });
    const endDrag=()=>{
      if(!dragging) return;
      dragging=false; track.style.transition="";
      if(Math.abs(moved) > track.clientWidth*0.15) goTo(moved<0 ? index+1 : index-1);
      else goTo(index);
    };
    window.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    // 横ホイール（横成分が強い時のみ）
    track.addEventListener("wheel",(e)=>{
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){
        e.preventDefault();
        goTo(e.deltaX>0 ? index+1 : index-1);
      }
    },{passive:false});

    // 画像ロード/リサイズで位置調整
    const settle = ()=>goTo(0);
    let wait=0;
    slides.forEach(s=>{
      const img=s.querySelector("img");
      if(img && !img.complete){ wait++; img.addEventListener("load",()=>{ if(--wait===0) settle(); },{once:true}); }
    });
    if(wait===0) settle();
    addEventListener("resize", ()=>{
      track.style.transition="none";
      applyX(-index*100);
      requestAnimationFrame(()=> track.style.transition="transform 420ms cubic-bezier(.22,1,.36,1)");
    });

    /* --- オートプレイ（デフォルト on） --- */
    const autoPref = (block.dataset.autoplay || "on").toLowerCase() !== "off";
    const intervalMs = parseInt(block.dataset.interval || "4000",10);
    let timer=null;
    const startAuto=()=>{ if(!autoPref || timer) return; timer=setInterval(()=>goTo(index+1), intervalMs); };
    const stopAuto =()=>{ if(timer){ clearInterval(timer); timer=null; } };
    const restartAutoplay=()=>{ stopAuto(); startAuto(); };

    if(autoPref) startAuto();
    block.addEventListener("mouseenter", stopAuto);
    block.addEventListener("mouseleave", startAuto);
    block.addEventListener("focusin",  stopAuto);
    block.addEventListener("focusout", startAuto);
    const io=new IntersectionObserver((ents)=>ents.forEach(e=> e.isIntersecting ? startAuto() : stopAuto()),{threshold:0.25});
    io.observe(block);
  }
}

// すでにある DOMContentLoaded の処理の中 or 下に追記
document.addEventListener("DOMContentLoaded", () => {
  initFacilitiesStyleCarousels(); // 施設・寮 & スクールライフ 両方に適用
});

/* 施設スライダー型（.facilities-slider）を共通で初期化 */
function initFacilitiesStyleCarousels() {
  const carousels = document.querySelectorAll('.facilities-slider');
  if (!carousels.length) return;

  carousels.forEach(block => {
    const track = block.querySelector('.facilities-track');
    const prev  = block.querySelector('.facilities-nav.prev');
    const next  = block.querySelector('.facilities-nav.next');
    if (!track || !prev || !next) return;

    // スクロール1回分（スライド幅＋gap）
    const getStep = () => {
      const first = track.querySelector('.facility-slide');
      if (!first) return track.clientWidth * 0.8;
      const rect = first.getBoundingClientRect();
      const gap  = parseFloat(getComputedStyle(track).gap || '0');
      return rect.width + gap;
    };

    const scrollByStep = (dir) => {
      track.scrollBy({ left: dir * getStep(), behavior: 'smooth' });
    };

    // 端でボタン無効化
    const clamp = () => {
      const max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    };

    // 操作
    prev.addEventListener('click', () => scrollByStep(-1));
    next.addEventListener('click', () => scrollByStep(1));

    // キーボード操作
    track.setAttribute('tabindex', track.getAttribute('tabindex') || '0');
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByStep(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
    });

    // マウスホイールで横移動（横成分が強いときのみ）
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        scrollByStep(e.deltaX > 0 ? 1 : -1);
      }
    }, { passive: false });

    // ドラッグ/スワイプ
    let dragging = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      dragging = true; startX = e.clientX; startLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      track.scrollLeft = startLeft - dx;
    });
    const endDrag = () => { dragging = false; };
    window.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // 監視
    track.addEventListener('scroll', clamp, { passive: true });
    window.addEventListener('resize', clamp, { passive: true });

    // 初期状態
    clamp();
  });
}
