document.body.classList.add("js-ready");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

const tabs = document.querySelectorAll(".skill-tab");
const panels = document.querySelectorAll(".skill-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));

    tab.classList.add("active");

    const activePanel = document.getElementById(tab.dataset.tab);
    if (activePanel) {
      activePanel.classList.add("active");
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

// Premium interactive layer
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
});

const cursorGlow = document.createElement("div");
cursorGlow.className = "cursor-glow";
document.body.appendChild(cursorGlow);

const cursorTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const cursorCurrent = { x: cursorTarget.x, y: cursorTarget.y };

window.addEventListener("mousemove", (event) => {
  cursorTarget.x = event.clientX;
  cursorTarget.y = event.clientY;
});

function animateCursorGlow() {
  if (prefersReducedMotion) {
    cursorGlow.style.left = `${cursorTarget.x}px`;
    cursorGlow.style.top = `${cursorTarget.y}px`;
    return;
  }

  cursorCurrent.x += (cursorTarget.x - cursorCurrent.x) * 0.14;
  cursorCurrent.y += (cursorTarget.y - cursorCurrent.y) * 0.14;

  cursorGlow.style.left = `${cursorCurrent.x}px`;
  cursorGlow.style.top = `${cursorCurrent.y}px`;

  requestAnimationFrame(animateCursorGlow);
}

requestAnimationFrame(animateCursorGlow);

const sectionIds = ["about", "skills", "projects", "training", "certifications", "contact"];
const navAnchors = document.querySelectorAll(".nav-links a");
const navIndicator = document.getElementById("navIndicator");
const navLinksContainer = document.getElementById("navLinks");

function moveNavIndicator() {
  if (!navIndicator || !navLinksContainer) {
    return;
  }

  const activeLink = navLinksContainer.querySelector("a.active");

  if (!activeLink || window.innerWidth <= 920) {
    navIndicator.classList.remove("ready");
    return;
  }

  const containerRect = navLinksContainer.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();

  navIndicator.style.left = `${linkRect.left - containerRect.left - 12}px`;
  navIndicator.style.width = `${linkRect.width + 24}px`;
  navIndicator.classList.add("ready");
}

function updateActiveNav() {
  let current = "";

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) {
      return;
    }

    const rect = section.getBoundingClientRect();

    if (rect.top <= 170 && rect.bottom >= 170) {
      current = id;
    }
  });

  const scrolledToBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;

  if (scrolledToBottom) {
    current = "contact";
  }

  navAnchors.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });

  moveNavIndicator();
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("resize", moveNavIndicator);
updateActiveNav();

const projectCard = document.querySelector(".project-card");

if (projectCard) {
  projectCard.addEventListener("mousemove", (event) => {
    const rect = projectCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -4;
    const rotateY = ((x / rect.width) - 0.5) * 4;

    projectCard.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  projectCard.addEventListener("mouseleave", () => {
    projectCard.style.transform = "";
  });
}

const allCards = document.querySelectorAll(".card, .skill-category, .compact-project-card, .cert-card");

allCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

// Skills search filter
const skillSearchInput = document.getElementById("skillSearchInput");

if (skillSearchInput) {
  const skillCategories = document.querySelectorAll("#skills .skill-category");
  const skillPills = document.querySelectorAll("#skills .skill-pills span");

  skillSearchInput.addEventListener("input", () => {
    const query = skillSearchInput.value.trim().toLowerCase();

    skillPills.forEach((pill) => {
      pill.classList.remove("skill-match", "skill-dim");
    });

    skillCategories.forEach((category) => {
      category.classList.remove("skill-dim", "skill-category-has-match");
    });

    if (!query) {
      return;
    }

    skillCategories.forEach((category) => {
      const pills = category.querySelectorAll(".skill-pills span");
      let categoryHasMatch = false;

      pills.forEach((pill) => {
        const text = pill.textContent.trim().toLowerCase();
        const isMatch = text.includes(query);

        if (isMatch) {
          pill.classList.add("skill-match");
          categoryHasMatch = true;
        } else {
          pill.classList.add("skill-dim");
        }
      });

      if (categoryHasMatch) {
        category.classList.add("skill-category-has-match");
      } else {
        category.classList.add("skill-dim");
      }
    });
  });
}

// Hero role: typewriter entrance with blinking caret
const roleElement = document.querySelector(".hero .role");

if (roleElement && !prefersReducedMotion) {
  const fullRoleText = roleElement.textContent.trim();

  roleElement.textContent = "";
  roleElement.classList.add("typing");

  setTimeout(() => {
    let charIndex = 0;

    const typeTimer = setInterval(() => {
      charIndex += 1;
      roleElement.textContent = fullRoleText.slice(0, charIndex);

      if (charIndex >= fullRoleText.length) {
        clearInterval(typeTimer);
        setTimeout(() => roleElement.classList.remove("typing"), 2200);
      }
    }, 42);
  }, 700);
}

// Animated counters for project metrics
const metricNumbers = document.querySelectorAll(".compact-metrics strong");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const el = entry.target;
      counterObserver.unobserve(el);

      const raw = el.textContent.trim();

      if (!/^\d+$/.test(raw) || prefersReducedMotion) {
        return;
      }

      const target = parseInt(raw, 10);
      const duration = 1400;
      const startTime = performance.now();

      el.classList.add("counting");

      function tickCounter(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        el.textContent = `${Math.round(target * eased)}`;

        if (progress < 1) {
          requestAnimationFrame(tickCounter);
        } else {
          el.textContent = `${target}`;
          el.classList.remove("counting");
        }
      }

      requestAnimationFrame(tickCounter);
    });
  },
  { threshold: 0.4 }
);

metricNumbers.forEach((el) => counterObserver.observe(el));

// Stagger index for skill pills entrance
document.querySelectorAll("#skills .skill-pills").forEach((group) => {
  group.querySelectorAll("span").forEach((pill, index) => {
    pill.style.setProperty("--pill-i", index);
  });
});

// Cyber network particle background
if (!prefersReducedMotion && window.innerWidth > 768) {
  const netCanvas = document.createElement("canvas");
  netCanvas.className = "net-canvas";
  document.body.appendChild(netCanvas);

  const netCtx = netCanvas.getContext("2d");
  const netMouse = { x: -9999, y: -9999 };
  let netParticles = [];
  let netRunning = true;

  function sizeNetCanvas() {
    netCanvas.width = window.innerWidth;
    netCanvas.height = window.innerHeight;
  }

  function initNetParticles() {
    const count = Math.min(85, Math.floor(window.innerWidth / 17));

    netParticles = Array.from({ length: count }, () => ({
      x: Math.random() * netCanvas.width,
      y: Math.random() * netCanvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.6
    }));
  }

  sizeNetCanvas();
  initNetParticles();

  window.addEventListener("resize", () => {
    sizeNetCanvas();
    initNetParticles();
  });

  window.addEventListener("mousemove", (event) => {
    netMouse.x = event.clientX;
    netMouse.y = event.clientY;
  });

  document.addEventListener("visibilitychange", () => {
    const wasRunning = netRunning;
    netRunning = !document.hidden;

    if (netRunning && !wasRunning) {
      requestAnimationFrame(drawNet);
    }
  });

  const LINK_DIST = 135;
  const MOUSE_DIST = 180;

  function drawNet() {
    if (!netRunning) {
      return;
    }

    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);

    netParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > netCanvas.width) {
        p.vx *= -1;
      }

      if (p.y < 0 || p.y > netCanvas.height) {
        p.vy *= -1;
      }

      netCtx.beginPath();
      netCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      netCtx.fillStyle = "rgba(122,167,255,0.55)";
      netCtx.fill();
    });

    for (let i = 0; i < netParticles.length; i++) {
      for (let j = i + 1; j < netParticles.length; j++) {
        const dx = netParticles[i].x - netParticles[j].x;
        const dy = netParticles[i].y - netParticles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < LINK_DIST) {
          netCtx.strokeStyle = `rgba(122,167,255,${0.15 * (1 - dist / LINK_DIST)})`;
          netCtx.lineWidth = 1;
          netCtx.beginPath();
          netCtx.moveTo(netParticles[i].x, netParticles[i].y);
          netCtx.lineTo(netParticles[j].x, netParticles[j].y);
          netCtx.stroke();
        }
      }

      const dxm = netParticles[i].x - netMouse.x;
      const dym = netParticles[i].y - netMouse.y;
      const dm = Math.hypot(dxm, dym);

      if (dm < MOUSE_DIST) {
        netCtx.strokeStyle = `rgba(167,139,250,${0.22 * (1 - dm / MOUSE_DIST)})`;
        netCtx.lineWidth = 1;
        netCtx.beginPath();
        netCtx.moveTo(netParticles[i].x, netParticles[i].y);
        netCtx.lineTo(netMouse.x, netMouse.y);
        netCtx.stroke();
      }
    }

    requestAnimationFrame(drawNet);
  }

  requestAnimationFrame(drawNet);
}

// 3D tilt on showcase cards
if (!prefersReducedMotion) {
  document.querySelectorAll(".cert-card, .profile-card, .compact-project-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(900px) rotateX(${py * -4}deg) rotateY(${px * 4}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Back to top button
const backToTop = document.createElement("a");
backToTop.className = "back-to-top";
backToTop.href = "#home";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.textContent = "↑";
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 600);
});

// Magnetic buttons
if (!prefersReducedMotion) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px) translateY(-2px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// Hero orbs parallax
const heroOrbs = document.querySelector(".hero-orbs");
const heroSection = document.getElementById("home");

if (heroOrbs && heroSection && !prefersReducedMotion) {
  heroSection.addEventListener("mousemove", (event) => {
    if (window.innerWidth <= 768) {
      return;
    }

    const rect = heroSection.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    heroOrbs.style.transform = `translate3d(${px * -30}px, ${py * -24}px, 0)`;
  });

  heroSection.addEventListener("mouseleave", () => {
    heroOrbs.style.transform = "translate3d(0, 0, 0)";
  });
}
