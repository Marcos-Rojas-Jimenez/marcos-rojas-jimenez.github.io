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

  const dotsNav = document.querySelector(".side-dots");

  if (dotsNav) {
    const dotCurrent = window.scrollY < 400 && !current ? "home" : current;

    dotsNav.querySelectorAll("a").forEach((dot) => {
      dot.classList.toggle("active", dot.getAttribute("href") === `#${dotCurrent}`);
    });
  }

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

// Hero role: typewriter cycling through roles with blinking caret
const roleElement = document.querySelector(".hero .role");

if (roleElement && !prefersReducedMotion) {
  const roles = [
    roleElement.textContent.trim(),
    "SOC Analyst L1 · in training",
    "Blue Team Junior",
    "Email Security · SPF / DKIM / DMARC"
  ];

  roleElement.textContent = "";
  roleElement.classList.add("typing");

  let roleIndex = 0;

  function typeRole(text, done) {
    let i = 0;

    const t = setInterval(() => {
      i += 1;
      roleElement.textContent = text.slice(0, i);

      if (i >= text.length) {
        clearInterval(t);
        done();
      }
    }, 42);
  }

  function deleteRole(done) {
    const t = setInterval(() => {
      const current = roleElement.textContent;

      if (!current.length) {
        clearInterval(t);
        done();
        return;
      }

      roleElement.textContent = current.slice(0, -1);
    }, 20);
  }

  function cycleRoles() {
    typeRole(roles[roleIndex], () => {
      setTimeout(() => {
        deleteRole(() => {
          roleIndex = (roleIndex + 1) % roles.length;
          cycleRoles();
        });
      }, 2600);
    });
  }

  setTimeout(cycleRoles, 700);
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

// Header: transparent at top, frosted after scrolling
const headerEl = document.querySelector("header.topbar");

function updateHeaderState() {
  if (headerEl) {
    headerEl.classList.toggle("scrolled", window.scrollY > 24);
  }
}

window.addEventListener("scroll", updateHeaderState);
updateHeaderState();

// Page entrance veil (skipped when the boot intro runs instead)
let bootPending = false;

try {
  bootPending = !prefersReducedMotion && sessionStorage.getItem("bootShown") !== "1";
} catch (e) {
  bootPending = false;
}

if (!prefersReducedMotion && !bootPending) {
  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);
  setTimeout(() => veil.remove(), 1400);
}

// Boot intro: terminal-style system boot on first visit of the session
if (bootPending) {
  try {
    sessionStorage.setItem("bootShown", "1");
  } catch (e) { /* storage unavailable: intro still runs this once */ }

  const boot = document.createElement("div");
  boot.className = "boot-intro";

  const bootPre = document.createElement("pre");
  boot.appendChild(bootPre);
  document.body.appendChild(boot);

  const bootLines = [
    "> init portfolio --secure",
    "> verifying TLS session ........ OK",
    "> loading SOC modules .......... OK",
    "> mounting evidence store ...... OK",
    "> DMARC policy ................. p=reject",
    "> access granted — welcome"
  ];

  let bootIndex = 0;

  function endBoot() {
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 700);
  }

  const bootTimer = setInterval(() => {
    bootPre.textContent += (bootIndex ? "\n" : "") + bootLines[bootIndex];
    bootIndex += 1;

    if (bootIndex >= bootLines.length) {
      clearInterval(bootTimer);
      setTimeout(endBoot, 550);
    }
  }, 240);

  boot.addEventListener("click", () => {
    clearInterval(bootTimer);
    endBoot();
  });
}

// Simulated SOC live log feed
const socFeed = document.getElementById("socFeed");

if (socFeed) {
  const socEvents = [
    { level: "ok", text: "SPF check pass — mail from authorized relay" },
    { level: "ok", text: "DKIM signature valid — selector s2026" },
    { level: "block", text: "DMARC p=reject enforced — spoofed sender blocked" },
    { level: "warn", text: "SMTP AUTH failure — invalid credentials (3rd attempt)" },
    { level: "block", text: "Open relay probe rejected — relay access denied" },
    { level: "ok", text: "STARTTLS negotiated — TLS 1.3 session established" },
    { level: "warn", text: "Recipient unknown — address rejected" },
    { level: "block", text: "Spoofing attempt quarantined — evidence logged" },
    { level: "ok", text: "IMAPS login OK — TLS certificate verified" },
    { level: "ok", text: "TLS-RPT report generated — delivered to aggregator" }
  ];

  const SOC_MAX_LINES = 7;
  let socIndex = 0;

  function padTwo(n) {
    return String(n).padStart(2, "0");
  }

  function addSocLine() {
    const now = new Date();
    const stamp = `${padTwo(now.getHours())}:${padTwo(now.getMinutes())}:${padTwo(now.getSeconds())}`;
    const evt = socEvents[socIndex % socEvents.length];
    socIndex += 1;

    const line = document.createElement("p");
    line.className = `soc-line ${evt.level}`;

    const stampEl = document.createElement("span");
    stampEl.textContent = `[${stamp}]`;
    line.appendChild(stampEl);
    line.appendChild(document.createTextNode(` ${evt.text}`));

    socFeed.appendChild(line);

    while (socFeed.children.length > SOC_MAX_LINES) {
      socFeed.removeChild(socFeed.firstChild);
    }
  }

  for (let i = 0; i < 5; i += 1) {
    addSocLine();
  }

  let socTimer = null;

  if (!prefersReducedMotion) {
    socTimer = setInterval(addSocLine, 1700);
  }

  // Interactive shell: type real commands into the terminal
  const socTerminal = document.querySelector(".soc-terminal");
  const socBadge = document.querySelector(".soc-terminal-bar strong");

  if (socTerminal) {
    const promptRow = document.createElement("div");
    promptRow.className = "soc-prompt";

    const promptLabel = document.createElement("span");
    promptLabel.textContent = "guest@soc:~$";
    promptRow.appendChild(promptLabel);

    const socInput = document.createElement("input");
    socInput.type = "text";
    socInput.autocomplete = "off";
    socInput.spellcheck = false;
    socInput.setAttribute("aria-label", "Terminal command input");
    socInput.placeholder = "type 'help' and press Enter";
    promptRow.appendChild(socInput);

    socTerminal.appendChild(promptRow);

    socTerminal.addEventListener("click", () => socInput.focus());

    const TERM_MAX_LINES = 12;

    function printTerm(text, level) {
      const line = document.createElement("p");
      line.className = `soc-line ${level}`;
      line.textContent = text;
      socFeed.appendChild(line);

      while (socFeed.children.length > TERM_MAX_LINES) {
        socFeed.removeChild(socFeed.firstChild);
      }
    }

    function runMatrixRain(duration) {
      if (prefersReducedMotion || document.querySelector(".matrix-rain")) {
        return;
      }

      const rain = document.createElement("canvas");
      rain.className = "matrix-rain";
      document.body.appendChild(rain);

      const rainCtx = rain.getContext("2d");
      rain.width = window.innerWidth;
      rain.height = window.innerHeight;

      const fontSize = 16;
      const columns = Math.max(1, Math.floor(rain.width / fontSize));
      const drops = new Array(columns).fill(1);
      const glyphs = "アカサタナハマヤラワ0123456789ABCDEF$#@%&";

      const rainTimer = setInterval(() => {
        rainCtx.fillStyle = "rgba(4, 7, 15, 0.08)";
        rainCtx.fillRect(0, 0, rain.width, rain.height);
        rainCtx.fillStyle = "#4ade80";
        rainCtx.font = `${fontSize}px monospace`;

        drops.forEach((y, i) => {
          const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          rainCtx.fillText(ch, i * fontSize, y * fontSize);

          if (y * fontSize > rain.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i] += 1;
        });
      }, 50);

      setTimeout(() => {
        clearInterval(rainTimer);
        rain.classList.add("fade");
        setTimeout(() => rain.remove(), 900);
      }, duration);
    }

    window.__runMatrixRain = runMatrixRain;

    const termCommands = {
      help: () => [
        "available commands:",
        "  whoami    — who is behind this portfolio",
        "  skills    — core technical skills",
        "  project   — featured case study",
        "  contact   — how to reach me",
        "  clear     — clear the terminal",
        "hint: some commands are not listed. try 'sudo'."
      ],
      sudo: () => [
        "guest is not in the sudoers file. This incident will be reported."
      ],
      matrix: () => {
        if (prefersReducedMotion) {
          return ["animations are disabled on this device."];
        }

        runMatrixRain(6000);
        return ["wake up, Neo... (6s)"];
      },
      whoami: () => [
        "Marcos Rojas Jimenez — Junior Cybersecurity Analyst (SOC · Blue Team)"
      ],
      skills: () => [
        "SOC monitoring · log analysis · email security (SPF / DKIM / DMARC)",
        "Linux · Python · Bash · defensive validation · evidence handling"
      ],
      project: () => [
        "PhisDefense SOC & Email Security Lab — 270 tests · 190 SOC events · p=reject",
        "→ marcos-rojas-jimenez.github.io/phisdefense-email-security-soc"
      ],
      contact: () => [
        "email: marcosrojasjimenez2@gmail.com",
        "linkedin: linkedin.com/in/marcos-rojas-jimenez"
      ],
      clear: () => {
        socFeed.innerHTML = "";
        return [];
      }
    };

    socInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const raw = socInput.value.trim();
      socInput.value = "";

      if (!raw) {
        return;
      }

      if (socTimer) {
        clearInterval(socTimer);
        socTimer = null;

        if (socBadge) {
          socBadge.textContent = "SHELL";
        }
      }

      printTerm(`guest@soc:~$ ${raw}`, "echo");

      const cmd = raw.toLowerCase();

      if (termCommands[cmd]) {
        termCommands[cmd]().forEach((text) => printTerm(text, "cmd"));
      } else {
        printTerm(`command not found: ${cmd} — try 'help'`, "warn");
      }
    });
  }
}

// Decrypt-style text scramble on section kickers
if (!prefersReducedMotion) {
  const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&<>[]";

  function scrambleText(el, finalText, duration) {
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const settled = Math.floor(finalText.length * progress);
      let out = finalText.slice(0, settled);

      for (let i = settled; i < finalText.length; i += 1) {
        out += finalText[i] === " "
          ? " "
          : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }

      el.textContent = out;

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const scrambleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        scrambleObserver.unobserve(entry.target);
        scrambleText(entry.target, entry.target.dataset.scrambleText, 900);
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll(".kicker").forEach((el) => {
    el.dataset.scrambleText = el.textContent.trim();
    scrambleObserver.observe(el);
  });
}

// Back to top button with HUD progress ring
const backToTop = document.createElement("a");
backToTop.className = "back-to-top";
backToTop.href = "#home";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.innerHTML =
  '<svg viewBox="0 0 40 40" aria-hidden="true">' +
  '<circle class="ring-bg" cx="20" cy="20" r="17"></circle>' +
  '<circle class="ring-fill" cx="20" cy="20" r="17"></circle>' +
  "</svg><span>↑</span>";
document.body.appendChild(backToTop);

const ringFill = backToTop.querySelector(".ring-fill");
const RING_LENGTH = 2 * Math.PI * 17;

ringFill.style.strokeDasharray = `${RING_LENGTH}`;
ringFill.style.strokeDashoffset = `${RING_LENGTH}`;

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 600);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? window.scrollY / docHeight : 0;

  ringFill.style.strokeDashoffset = `${RING_LENGTH * (1 - progress)}`;
});

// Side dots navigation (desktop)
const sideDotSections = ["home", ...sectionIds];
const sideDots = document.createElement("nav");
sideDots.className = "side-dots";
sideDots.setAttribute("aria-label", "Section quick navigation");

sideDotSections.forEach((id) => {
  const dot = document.createElement("a");
  dot.href = `#${id}`;
  dot.dataset.label = id === "home" ? "Home" : id.charAt(0).toUpperCase() + id.slice(1);
  sideDots.appendChild(dot);
});

document.body.appendChild(sideDots);
updateActiveNav();

// Precision cursor ring (desktop pointers only)
if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  const cursorRing = document.createElement("div");
  cursorRing.className = "cursor-ring";
  document.body.appendChild(cursorRing);

  const ringTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: ringTarget.x, y: ringTarget.y };

  window.addEventListener("mousemove", (event) => {
    ringTarget.x = event.clientX;
    ringTarget.y = event.clientY;
  });

  (function animateRing() {
    ringPos.x += (ringTarget.x - ringPos.x) * 0.3;
    ringPos.y += (ringTarget.y - ringPos.y) * 0.3;
    cursorRing.style.left = `${ringPos.x}px`;
    cursorRing.style.top = `${ringPos.y}px`;
    requestAnimationFrame(animateRing);
  })();

  const HOVER_TARGETS = "a, button, input, summary, .skill-pills span";

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest(HOVER_TARGETS)) {
      cursorRing.classList.add("on");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest(HOVER_TARGETS)) {
      cursorRing.classList.remove("on");
    }
  });
}

// Skill radar: animated pentagon chart with rotating sweep
const radarCanvas = document.getElementById("skillRadar");

if (radarCanvas) {
  const rctx = radarCanvas.getContext("2d");
  const radarAxes = [
    { label: "Blue Team / SOC", value: 0.85 },
    { label: "Email Sec", value: 0.9 },
    { label: "Systems", value: 0.72 },
    { label: "Automation", value: 0.68 },
    { label: "Reporting", value: 0.8 },
    { label: "Red Team", value: 0.15 }
  ];

  const RADAR_W = 320;
  const RADAR_H = 300;
  const radarDpr = window.devicePixelRatio || 1;

  radarCanvas.width = RADAR_W * radarDpr;
  radarCanvas.height = RADAR_H * radarDpr;
  rctx.scale(radarDpr, radarDpr);

  const radarCx = RADAR_W / 2;
  const radarCy = RADAR_H / 2 + 8;
  const RADAR_R = 100;

  let radarProgress = prefersReducedMotion ? 1 : 0;
  let sweepAngle = -Math.PI / 2;
  let radarRunning = false;

  function radarPoint(index, radius) {
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / radarAxes.length);
    return [radarCx + Math.cos(angle) * radius, radarCy + Math.sin(angle) * radius];
  }

  function drawRadar() {
    rctx.clearRect(0, 0, RADAR_W, RADAR_H);

    for (let ring = 1; ring <= 4; ring += 1) {
      rctx.beginPath();

      for (let i = 0; i <= radarAxes.length; i += 1) {
        const [x, y] = radarPoint(i % radarAxes.length, (RADAR_R * ring) / 4);

        if (i === 0) {
          rctx.moveTo(x, y);
        } else {
          rctx.lineTo(x, y);
        }
      }

      rctx.strokeStyle = "rgba(122,167,255,0.14)";
      rctx.lineWidth = 1;
      rctx.stroke();
    }

    radarAxes.forEach((axis, i) => {
      const [x, y] = radarPoint(i, RADAR_R);
      rctx.beginPath();
      rctx.moveTo(radarCx, radarCy);
      rctx.lineTo(x, y);
      rctx.strokeStyle = "rgba(122,167,255,0.12)";
      rctx.stroke();

      const [lx, ly] = radarPoint(i, RADAR_R + 22);
      rctx.fillStyle = "#9fb4dd";
      rctx.font = "700 11px Inter, 'Segoe UI', sans-serif";
      rctx.textAlign = "center";
      rctx.textBaseline = "middle";
      rctx.fillText(axis.label, lx, ly);
    });

    rctx.beginPath();

    radarAxes.forEach((axis, i) => {
      const [x, y] = radarPoint(i, RADAR_R * axis.value * radarProgress);

      if (i === 0) {
        rctx.moveTo(x, y);
      } else {
        rctx.lineTo(x, y);
      }
    });

    rctx.closePath();

    const radarGrad = rctx.createLinearGradient(
      radarCx - RADAR_R, radarCy - RADAR_R,
      radarCx + RADAR_R, radarCy + RADAR_R
    );
    radarGrad.addColorStop(0, "rgba(122,167,255,0.32)");
    radarGrad.addColorStop(1, "rgba(167,139,250,0.26)");
    rctx.fillStyle = radarGrad;
    rctx.fill();
    rctx.strokeStyle = "rgba(122,167,255,0.85)";
    rctx.lineWidth = 2;
    rctx.stroke();

    radarAxes.forEach((axis, i) => {
      const [x, y] = radarPoint(i, RADAR_R * axis.value * radarProgress);
      rctx.beginPath();
      rctx.arc(x, y, 3.5, 0, Math.PI * 2);
      rctx.fillStyle = "#a9c2ff";
      rctx.fill();
    });

    if (!prefersReducedMotion) {
      rctx.save();
      rctx.beginPath();
      rctx.moveTo(radarCx, radarCy);
      rctx.arc(radarCx, radarCy, RADAR_R, sweepAngle - 0.5, sweepAngle);
      rctx.closePath();
      rctx.fillStyle = "rgba(94,234,212,0.10)";
      rctx.fill();

      rctx.beginPath();
      rctx.moveTo(radarCx, radarCy);
      rctx.lineTo(
        radarCx + Math.cos(sweepAngle) * RADAR_R,
        radarCy + Math.sin(sweepAngle) * RADAR_R
      );
      rctx.strokeStyle = "rgba(94,234,212,0.50)";
      rctx.lineWidth = 1.5;
      rctx.stroke();
      rctx.restore();
    }
  }

  function radarLoop() {
    if (!radarRunning) {
      return;
    }

    radarProgress = Math.min(radarProgress + 0.03, 1);
    sweepAngle += 0.018;
    drawRadar();
    requestAnimationFrame(radarLoop);
  }

  drawRadar();

  if (!prefersReducedMotion) {
    const radarObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!radarRunning) {
              radarRunning = true;
              requestAnimationFrame(radarLoop);
            }
          } else {
            radarRunning = false;
          }
        });
      },
      { threshold: 0.25 }
    );

    radarObserver.observe(radarCanvas);
  }
}

// Attack simulation: freeze SMIL animations under reduced motion
if (prefersReducedMotion) {
  document
    .querySelectorAll(".attack-sim animate, .attack-sim animateMotion")
    .forEach((node) => node.remove());
}

// Certification lightbox: click a certificate image to view it large
const certLightboxImages = document.querySelectorAll(".cert-image img");

if (certLightboxImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "cert-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-label", "Certificate viewer");

  const lbFigure = document.createElement("figure");
  const lbImg = document.createElement("img");
  const lbCaption = document.createElement("figcaption");
  const lbClose = document.createElement("span");

  lbClose.className = "cert-lightbox-close";
  lbClose.textContent = "✕";
  lbFigure.appendChild(lbImg);
  lbFigure.appendChild(lbCaption);
  lightbox.appendChild(lbFigure);
  lightbox.appendChild(lbClose);
  document.body.appendChild(lightbox);

  function closeLightbox() {
    lightbox.classList.remove("open");
  }

  certLightboxImages.forEach((img) => {
    img.style.cursor = "zoom-in";

    img.addEventListener("click", () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;

      const card = img.closest(".cert-card");
      const title = card ? card.querySelector("h3") : null;
      lbCaption.textContent = title ? title.textContent : "";

      lightbox.classList.add("open");
    });
  });

  lightbox.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

// Training timeline: spine fills with scroll, nodes light up as it passes
const trainingTimeline = document.getElementById("trainingTimeline");
const trainingFill = document.getElementById("trainingProgressFill");

if (trainingTimeline && trainingFill) {
  const trainingNodes = trainingTimeline.querySelectorAll(".training-node");

  function updateTrainingProgress() {
    const rect = trainingTimeline.getBoundingClientRect();
    const triggerY = window.innerHeight * 0.62;
    const passed = Math.min(Math.max(triggerY - rect.top, 0), rect.height);
    const pct = rect.height > 0 ? (passed / rect.height) * 100 : 0;

    trainingFill.style.height = `${pct}%`;

    trainingNodes.forEach((node) => {
      const nodeRect = node.getBoundingClientRect();
      const reached = nodeRect.top + nodeRect.height / 2 <= triggerY;

      node.classList.toggle("active", reached);

      const card = node.parentElement.querySelector(".training-clean-card");

      if (card) {
        card.classList.toggle("lit", reached);
      }
    });
  }

  window.addEventListener("scroll", updateTrainingProgress);
  window.addEventListener("resize", updateTrainingProgress);
  updateTrainingProgress();
}

// Giant watermark typography behind the hero with scroll parallax
const heroForWatermark = document.querySelector(".hero");

if (heroForWatermark) {
  const watermark = document.createElement("div");
  watermark.className = "hero-watermark";
  watermark.setAttribute("aria-hidden", "true");
  watermark.textContent = "DEFEND · DETECT · RESPOND";
  heroForWatermark.appendChild(watermark);

  if (!prefersReducedMotion) {
    window.addEventListener("scroll", () => {
      watermark.style.transform = `translateY(${window.scrollY * 0.22}px)`;
    });
  }
}

// Global HUD frame: corner brackets, UTC clock, scroll readout
const hudFrame = document.createElement("div");
hudFrame.className = "hud-frame";
hudFrame.setAttribute("aria-hidden", "true");
hudFrame.innerHTML =
  '<span class="hud-corner hud-tl"></span>' +
  '<span class="hud-corner hud-tr"></span>' +
  '<span class="hud-corner hud-bl"></span>' +
  '<span class="hud-corner hud-br"></span>' +
  '<span class="hud-read hud-id"></span>' +
  '<span class="hud-read hud-clock"></span>';
document.body.appendChild(hudFrame);

const hudId = hudFrame.querySelector(".hud-id");
const hudClock = hudFrame.querySelector(".hud-clock");

function hudPad(n) {
  return String(n).padStart(2, "0");
}

function updateHudClock() {
  const d = new Date();
  hudClock.textContent =
    `${hudPad(d.getUTCHours())}:${hudPad(d.getUTCMinutes())}:${hudPad(d.getUTCSeconds())} UTC`;
}

setInterval(updateHudClock, 1000);
updateHudClock();

function updateHudScroll() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;
  hudId.textContent = `MRJ · SOC CONSOLE · SCROLL ${String(pct).padStart(3, "0")}% · CTRL+K = COMMANDS`;
}

window.addEventListener("scroll", updateHudScroll);
updateHudScroll();

// Command palette (Ctrl+K or /)
const paletteActions = [
  { label: "Go to About", hint: "section", run: () => scrollToSection("#about") },
  { label: "Go to Skills", hint: "section", run: () => scrollToSection("#skills") },
  { label: "Go to Projects", hint: "section", run: () => scrollToSection("#projects") },
  { label: "Go to Training", hint: "section", run: () => scrollToSection("#training") },
  { label: "Go to Certifications", hint: "section", run: () => scrollToSection("#certifications") },
  { label: "Go to Contact", hint: "section", run: () => scrollToSection("#contact") },
  { label: "Download CV", hint: "pdf", run: () => window.open("assets/cv/marcos-rojas-jimenez-cv.pdf", "_blank", "noopener") },
  { label: "Open featured case study", hint: "link", run: () => window.open("https://marcos-rojas-jimenez.github.io/phisdefense-email-security-soc/", "_blank", "noopener") },
  { label: "Open LinkedIn", hint: "link", run: () => window.open("https://www.linkedin.com/in/marcos-rojas-jimenez", "_blank", "noopener") },
  { label: "Email me", hint: "mailto", run: () => { window.location.href = "mailto:marcosrojasjimenez2@gmail.com"; } },
  { label: "Enter the matrix", hint: "easter egg", run: () => { if (window.__runMatrixRain) window.__runMatrixRain(6000); } }
];

function scrollToSection(selector) {
  const target = document.querySelector(selector);

  if (target) {
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }
}

const palette = document.createElement("div");
palette.className = "cmd-palette";
palette.setAttribute("role", "dialog");
palette.setAttribute("aria-modal", "true");
palette.setAttribute("aria-label", "Command palette");
palette.innerHTML =
  '<div class="cmd-panel">' +
  '<input type="text" placeholder="Type a command or search..." aria-label="Search commands" />' +
  '<div class="cmd-list"></div>' +
  '<div class="cmd-footer"><span><kbd>↑↓</kbd> navigate</span><span><kbd>Enter</kbd> run</span><span><kbd>Esc</kbd> close</span></div>' +
  "</div>";
document.body.appendChild(palette);

const paletteInput = palette.querySelector("input");
const paletteList = palette.querySelector(".cmd-list");
let paletteOpen = false;
let paletteIndex = 0;
let paletteFiltered = paletteActions.slice();

function renderPalette() {
  const query = paletteInput.value.trim().toLowerCase();
  paletteFiltered = paletteActions.filter((a) => a.label.toLowerCase().includes(query));

  if (paletteIndex >= paletteFiltered.length) {
    paletteIndex = Math.max(0, paletteFiltered.length - 1);
  }

  paletteList.innerHTML = "";

  if (!paletteFiltered.length) {
    const empty = document.createElement("p");
    empty.className = "cmd-empty";
    empty.textContent = "No matching commands";
    paletteList.appendChild(empty);
    return;
  }

  paletteFiltered.forEach((action, i) => {
    const item = document.createElement("div");
    item.className = `cmd-item${i === paletteIndex ? " active" : ""}`;

    const label = document.createElement("span");
    label.textContent = action.label;
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = action.hint;

    item.appendChild(label);
    item.appendChild(hint);

    item.addEventListener("click", () => {
      togglePalette(false);
      action.run();
    });

    item.addEventListener("mousemove", () => {
      if (paletteIndex !== i) {
        paletteIndex = i;
        renderPalette();
      }
    });

    paletteList.appendChild(item);
  });
}

function togglePalette(open) {
  paletteOpen = open;
  palette.classList.toggle("open", open);

  if (open) {
    paletteInput.value = "";
    paletteIndex = 0;
    renderPalette();
    setTimeout(() => paletteInput.focus(), 30);
  } else {
    paletteInput.blur();
  }
}

paletteInput.addEventListener("input", () => {
  paletteIndex = 0;
  renderPalette();
});

paletteInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    paletteIndex = Math.min(paletteIndex + 1, paletteFiltered.length - 1);
    renderPalette();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    paletteIndex = Math.max(paletteIndex - 1, 0);
    renderPalette();
  } else if (event.key === "Enter") {
    const action = paletteFiltered[paletteIndex];

    if (action) {
      togglePalette(false);
      action.run();
    }
  }
});

palette.addEventListener("click", (event) => {
  if (event.target === palette) {
    togglePalette(false);
  }
});

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement ? document.activeElement.tagName : "";
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    togglePalette(!paletteOpen);
  } else if (event.key === "/" && !isTyping && !paletteOpen) {
    event.preventDefault();
    togglePalette(true);
  } else if (event.key === "Escape" && paletteOpen) {
    togglePalette(false);
  }
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

// Ambient orbs: page-wide parallax following the cursor
const heroOrbs = document.querySelector(".hero-orbs");

if (heroOrbs && !prefersReducedMotion) {
  window.addEventListener("mousemove", (event) => {
    if (window.innerWidth <= 768) {
      return;
    }

    const px = event.clientX / window.innerWidth - 0.5;
    const py = event.clientY / window.innerHeight - 0.5;

    heroOrbs.style.transform = `translate3d(${px * -30}px, ${py * -24}px, 0)`;
  });
}
