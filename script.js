gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);

const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");
const overlay = document.querySelector(".menu-overlay");

console.log(window.innerWidth)

gsap.set(".title, .subtitle", { force3D: true });

function toggleMenu() {
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
  overlay.classList.toggle("active");
}

hamburger.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

/* =========================
   1) ANIMAÇÃO DE ENTRADA
   ========================= */

function sizeX() {
  const w = window.innerWidth;

  if (w >= 481 && w < 770) {
    return 950;
  }

  if (w < 480) {
    return 25;
  }

  return 1550;
}

function sizePhone() {
  const h = window.innerHeight;
  const w = window.innerWidth;

  if (w <= 425) {
    return "+=" + h * 3.55;  
  }

  if (w <= 768) {
    return "+=" + h * 4;  
  }

  if (w === 1024) {
    return "+=" + h * 4;  
  }

  if (w === 1440) {
    return "+=" + h * 4;  
  }

  if (w >= 2560 ){
    return "+=" + h * 3;  
  }

  return "+=" + h * 3.34;
}

function sizeXHome() {
  if (window.innerWidth < 380) {
    return 10;
  }

  return -1300;
}

function scaleHome() {
  return window.innerWidth < 480 ? 2 : 8;
}

function createRippleEffect(button) {
  button.addEventListener("mousemove", e => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("div");
    ripple.classList.add("ripple");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    gsap.to(ripple, {
      scale: 10,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    });
  });
}

const intro = gsap.timeline({
  default: { duration: 0.5, ease: "power2.out" }
});

intro
  .from(".home", {
    width: 2500,
    overflowX: "hidden",
    duration: 1,
    opacity: 0.8,
  })
  .from(".navigation img", {
    y: -300,
    duration: 0.5,
    opacity: 0,
  })
  .from(".navbutton", {
    y: 100,
    opacity: 0,
    stagger: 0.2
  })
  .fromTo(".title", { x: -100, opacity: 0, scale: 1 }, { x: 0, opacity: 1, scale: 1, duration: 0.8 })
  .fromTo(".subtitle", { x: -100, opacity: 0, scale: 1 }, { x: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.4")
  .fromTo(".btn-meet", { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 1 });

/* =========================
   2) SCROLL ANIMATION
   ========================= */
intro.eventCallback("onComplete", () => {
  gsap.set("html, body", { overflowX: "hidden" });
  const split = new SplitText(".text-about", { type: "chars" });

  let endVal = window.innerHeight * 2.05;
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".home",
      start: "top top",
      end: sizePhone,
      scrub: 1.5,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,

    }
  });

  // animações da home (mantive suas valores)
  scrollTl.to(".home .bg", {
    x: sizeXHome(),
    scale: 8,
    ease: "none"
  }, 0);
  scrollTl.to(".btn-meet", { opacity: 0, y: 50, ease: "none" }, 0);
  scrollTl.to(".title", {
    scale: 8,
    x: sizeX(),
    opacity: 0.4,
    ease: "none"
  }, 0);
  scrollTl.to(".subtitle", {
    scale: 8,
    x: sizeX(),
    opacity: 0.1,
    ease: "none"
  }, 0);

  // takeover: faz section-inner crescer SOBRE a home (usa translateY + scale + opacity)
  // 0.35 é o ponto da timeline onde começa; ajuste se quiser mais cedo/tarde
  scrollTl.from(".section-inner", {
    opacity: 0,
    y: 0,
    scale: 1,
    ease: "power3.out",
    onStart: () => {
      // ativa pointer events quando começar a entrar
      document.querySelector(".section-inner").style.pointerEvents = "auto";
    }
  }, 0.01);

});

// =========================================================
//  CATÁLOGO  —  1 ScrollTrigger + 1 Timeline
// =========================================================
const scrollSectionContainer = document.querySelector(".section-next");
const scrollImages = gsap.utils.toArray(".scroll-image");
const textBlocks = gsap.utils.toArray(".text-block");
const numBlocks = textBlocks.length;

// estado inicial limpo
scrollImages.forEach(im => gsap.set(im, { opacity: 0 }));
textBlocks.forEach(tb => gsap.set(tb, { opacity: 0 }));

// PRIMEIRO item visível desde o início
gsap.set(scrollImages[0], { opacity: 1 });
gsap.set(textBlocks[0], { opacity: 1 });

// CONFIGURAÇÕES (estas aqui foram calibradas à mão)
const stepDuration = 1.0;       // fade-in e fade-out mais longos
const betweenSteps = 2.0;       // quanto scroll precisa para trocar
const endDistance = numBlocks * 350;  // espaço total de scroll (bem longo)
const scrubSpeed = 1.2;

let tl = gsap.timeline({
  scrollTrigger: {
    trigger: scrollSectionContainer,
    start: "top top",
    end: `+=${endDistance}vh`,
    scrub: scrubSpeed,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    // markers: true,
  }
});

// -----------------------------------------------------
// SYSTEM PERFEITO DE TROCA SUAVE (Apple/Tesla level)
// -----------------------------------------------------
for (let i = 1; i < numBlocks; i++) {

  // 1) espaço de scroll antes da troca
  tl.to({}, { duration: betweenSteps });

  // 2) crossfade (fade-out do anterior + fade-in do novo)
  tl.to(scrollImages[i - 1], {
    opacity: 0,
    
    duration: stepDuration,
    ease: "power2.out"
  });

  tl.to(textBlocks[i - 1], {
    opacity: 0,
    duration: stepDuration,
    ease: "power2.out"
  }, "<");

  tl.to(scrollImages[i], {
    opacity: 1,
    duration: stepDuration + 0.2,
    ease: "power3.out"
  }, "<");

  tl.to(textBlocks[i], {
    opacity: 1,
    duration: stepDuration + 0.3,
    ease: "power3.out"
  }, "<");
}

// fimzinho só pra suavizar
tl.to({}, { duration: 1 });

const split = new SplitText(".text-about", { type: "chars" });

const aboutTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".about",
    start: "top 50%",
    end: "bottom 50%",
    scrub: 1.5
  }
})

aboutTL
  .to(".about", {
    backgroundColor:" #061513ff",
    duration: 0.8,
    ease: "none"
  })
  .from(".about-initial", {
    opacity: 0,
    y: -300,
  }, '-=2')
  .to(".name-company", {
    color: "#F0C460",
    durarion: 0.1
  }, 0)
  .from(".star1", {
    opacity: 0,
    // duration: 0.5
  }, 0)
  .to(split.chars, {
    color: "#e2e3e2d2", // cor final
    stagger: 0.02,
    ease: "none",
  })
  .from(".star2", {
    opacity: 0
  })

const finalyTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".finaly",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5
  }
})

finalyTL.from('.finaly img', {
  opacity: 0.2,
  durarion: 0.5
})


// aplica nos dois botões
document.querySelectorAll(".btn-talkUs, .btn-meet, .btn-know").forEach(btn => {
  createRippleEffect(btn);
});

document.querySelector(".nav-about").addEventListener("click", () => {
  document.querySelector(".about").scrollIntoView({
    behavior: "smooth"
  });
});

document.querySelector(".nav-product").addEventListener("click", () => {
  document.querySelector(".section-inner").scrollIntoView({
    behavior: "smooth"
  });
});

document.querySelector(".nav-home").addEventListener("click", () => {
  document.querySelector(".home").scrollIntoView({
    behavior: "smooth"
  });
});