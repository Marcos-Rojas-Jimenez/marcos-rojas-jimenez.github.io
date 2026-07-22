document.body.classList.add("js-ready");

/* Performance: make high-frequency listeners passive and coalesce scroll /
   mousemove work to at most once per animation frame. This removes the
   layout thrashing from the many independent scroll/mousemove handlers
   without changing any behavior or visuals. Installed before any listener
   is registered so it wraps them all. */
(function optimizeListeners() {
  const EP = EventTarget.prototype;
  const origAdd = EP.addEventListener;
  const PASSIVE = { scroll: 1, wheel: 1, mousewheel: 1, touchstart: 1, touchmove: 1, mousemove: 1, pointermove: 1 };
  const COALESCE = { scroll: 1, mousemove: 1 };

  function normOpts(type, options) {
    if (!PASSIVE[type]) return options;
    if (options === undefined || options === null) return { passive: true };
    if (typeof options === "boolean") return { capture: options, passive: true };
    if (typeof options === "object" && options.passive === undefined) {
      const o = {};
      for (const k in options) o[k] = options[k];
      o.passive = true;
      return o;
    }
    return options;
  }

  EP.addEventListener = function (type, listener, options) {
    if (typeof listener === "function" && COALESCE[type]) {
      let scheduled = false;
      let lastEv = null;
      const self = this;
      const wrapped = function (ev) {
        lastEv = ev;
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(function () {
            scheduled = false;
            listener.call(self, lastEv);
          });
        }
      };
      return origAdd.call(this, type, wrapped, normOpts(type, options));
    }
    return origAdd.call(this, type, listener, normOpts(type, options));
  };
})();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

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

let glowRunning = false;

function animateCursorGlow() {
  const dx = cursorTarget.x - cursorCurrent.x;
  const dy = cursorTarget.y - cursorCurrent.y;

  cursorCurrent.x += dx * 0.14;
  cursorCurrent.y += dy * 0.14;

  cursorGlow.style.left = `${cursorCurrent.x}px`;
  cursorGlow.style.top = `${cursorCurrent.y}px`;

  // stop looping once the glow has caught up to the pointer; a mousemove
  // restarts it. Avoids a permanent rAF loop while the pointer is still.
  if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
    glowRunning = false;
    return;
  }

  requestAnimationFrame(animateCursorGlow);
}

function kickCursorGlow() {
  if (!glowRunning) {
    glowRunning = true;
    requestAnimationFrame(animateCursorGlow);
  }
}

window.addEventListener("mousemove", (event) => {
  cursorTarget.x = event.clientX;
  cursorTarget.y = event.clientY;

  if (prefersReducedMotion) {
    cursorGlow.style.left = `${cursorTarget.x}px`;
    cursorGlow.style.top = `${cursorTarget.y}px`;
    return;
  }

  kickCursorGlow();
});

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

// Cache section geometry so scroll updates never force a layout read.
// Absolute document tops/heights are measured once (and on resize/load),
// then compared against scrollY — visually identical, zero layout thrash.
let navGeom = [];
let navDocBottom = 0;

function refreshNavGeom() {
  const sy = window.scrollY;
  navGeom = sectionIds
    .map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { id, top: rect.top + sy, height: rect.height };
    })
    .filter(Boolean);
  navDocBottom = document.documentElement.scrollHeight;
}

let navLastKey = null;

function updateActiveNav() {
  const sy = window.scrollY;
  let current = "";

  for (let i = 0; i < navGeom.length; i += 1) {
    const g = navGeom[i];
    const vt = g.top - sy;
    if (vt <= 170 && vt + g.height >= 170) {
      current = g.id;
    }
  }

  if (sy + window.innerHeight >= navDocBottom - 8) {
    current = "contact";
  }

  const effective = sy < 400 && !current ? "home" : current;

  // nothing changed since last frame -> skip all DOM writes
  if (effective === navLastKey) {
    return;
  }
  navLastKey = effective;

  navAnchors.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });

  const dotsNav = document.querySelector(".side-dots");
  if (dotsNav) {
    dotsNav.querySelectorAll("a").forEach((dot) => {
      dot.classList.toggle("active", dot.getAttribute("href") === `#${effective}`);
    });
  }

  moveNavIndicator();
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("resize", () => {
  refreshNavGeom();
  navLastKey = null;
  moveNavIndicator();
});
window.addEventListener("load", () => {
  refreshNavGeom();
  navLastKey = null;
  updateActiveNav();
});
refreshNavGeom();
updateActiveNav();

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

  const bootTip = document.createElement("p");
  bootTip.className = "boot-tip";
  bootTip.textContent = "[ TIP ] For the best experience, view this portfolio on a computer";
  boot.appendChild(bootTip);

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
    window.__bootDone = true;
    document.dispatchEvent(new Event("bootdone"));
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
        "Marcos Rojas Jimenez — Junior Cybersecurity Analyst (IAM Operations · SOC · Blue Team)"
      ],
      skills: () => [
        "IAM operations · Keycloak · OpenID Connect · RBAC · privileged account review",
        "SOC-style monitoring · log analysis · email security (SPF / DKIM / DMARC)",
        "Linux · Python · REST API automation · Streamlit dashboards · evidence handling"
      ],
      project: () => [
        "IAM Operations & CyberIAM Monitoring Lab — Keycloak · OIDC · RBAC · Streamlit",
        "→ marcos-rojas-jimenez.github.io/projects/iam-operations-cyberiam-lab",
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

// Skill radar: animated pentagon chart with rotating sweep
const radarCanvas = document.getElementById("skillRadar");

if (radarCanvas) {
  const rctx = radarCanvas.getContext("2d");
  const radarAxes = [
    { label: "IAM / Identity", value: 0.82 },
    { label: "Blue Team / SOC", value: 0.85 },
    { label: "Email Sec", value: 0.9 },
    { label: "Systems", value: 0.72 },
    { label: "Automation", value: 0.75 },
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
  const trainingNodes = Array.from(trainingTimeline.querySelectorAll(".training-node"));

  // cache absolute geometry; only re-measure on resize/load
  let tlTop = 0;
  let tlHeight = 0;
  let nodeCenters = [];

  function refreshTrainingGeom() {
    const sy = window.scrollY;
    const rect = trainingTimeline.getBoundingClientRect();
    tlTop = rect.top + sy;
    tlHeight = rect.height;
    nodeCenters = trainingNodes.map((node) => {
      const nr = node.getBoundingClientRect();
      return nr.top + nr.height / 2 + sy;
    });
  }

  function updateTrainingProgress() {
    const sy = window.scrollY;
    const triggerY = window.innerHeight * 0.62;
    const relTop = tlTop - sy;
    const passed = Math.min(Math.max(triggerY - relTop, 0), tlHeight);
    const pct = tlHeight > 0 ? (passed / tlHeight) * 100 : 0;

    trainingFill.style.height = `${pct}%`;

    trainingNodes.forEach((node, i) => {
      const reached = nodeCenters[i] - sy <= triggerY;
      node.classList.toggle("active", reached);
      const card = node.parentElement.querySelector(".training-clean-card");
      if (card) {
        card.classList.toggle("lit", reached);
      }
    });
  }

  window.addEventListener("scroll", updateTrainingProgress);
  window.addEventListener("resize", () => {
    refreshTrainingGeom();
    updateTrainingProgress();
  });
  window.addEventListener("load", () => {
    refreshTrainingGeom();
    updateTrainingProgress();
  });
  refreshTrainingGeom();
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

// Omnira-style masked slide-up reveal for section titles
document.querySelectorAll(".section-head h2, .contact-card h2").forEach((heading) => {
  const inner = document.createElement("span");
  inner.className = "h2-mask-inner";

  while (heading.firstChild) {
    inner.appendChild(heading.firstChild);
  }

  heading.appendChild(inner);
  heading.classList.add("h2-mask");
});

// Hero portrait: gentle scroll parallax
const heroPortrait = document.querySelector(".hero-portrait");

if (heroPortrait && !prefersReducedMotion) {
  window.addEventListener("scroll", () => {
    heroPortrait.style.transform = `translateY(${window.scrollY * 0.12}px)`;
  });
}

// Subtle page-wide starfield (tiny static stars behind every section)
const starField = document.createElement("canvas");
starField.className = "star-field";
starField.setAttribute("aria-hidden", "true");
document.body.appendChild(starField);

function drawStarField() {
  const ctx = starField.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starField.width = window.innerWidth * dpr;
  starField.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  const count = Math.round((w * h) / 13000);

  for (let i = 0; i < count; i += 1) {
    const sx = Math.random() * w;
    const sy = Math.random() * h;
    const r = 0.3 + Math.random() * 0.9;
    const a = 0.07 + Math.random() * 0.24;
    const tint = Math.random();

    if (tint > 0.92) {
      ctx.fillStyle = "rgba(167,139,250," + a.toFixed(2) + ")";
    } else if (tint > 0.84) {
      ctx.fillStyle = "rgba(122,167,255," + a.toFixed(2) + ")";
    } else {
      ctx.fillStyle = "rgba(205,218,245," + a.toFixed(2) + ")";
    }

    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

drawStarField();
window.addEventListener("resize", drawStarField);

// 3D celestial bodies in the training timeline (Sun, Saturn, Earth, Moon)
// Planet textures: Solar System Scope (solarsystemscope.com/textures),
// licensed CC BY 4.0 — photo-based maps distributed for reuse with credit.
const planetSlots = document.querySelectorAll(".planet-slot");

if (planetSlots.length && window.innerWidth > 900) {
  let planetsStarted = false;

  async function initPlanets() {
    if (planetsStarted) {
      return;
    }
    planetsStarted = true;

    let THREE;
    let tex;

    // yield to the browser so heavy steps never share one frame
    const nextFrame = () =>
      new Promise((resolve) => {
        if (document.hidden) {
          setTimeout(resolve, 16);
        } else {
          requestAnimationFrame(() => setTimeout(resolve, 0));
        }
      });

    try {
      THREE = await import("https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js");

      await nextFrame();

      // ImageBitmapLoader decodes the 2K JPEGs OFF the main thread,
      // removing the multi-hundred-ms sync decodes that froze the page
      const loader = new THREE.ImageBitmapLoader();
      loader.setOptions({ imageOrientation: "flipY" });

      const loadTex = async (file, srgb) => {
        const bmp = await loader.loadAsync("assets/planets/" + file);
        const t = new THREE.Texture(bmp);
        t.flipY = false;
        t.needsUpdate = true;
        if (srgb) {
          t.colorSpace = THREE.SRGBColorSpace;
        }
        return t;
      };

      const [sunT, saturnT, ringT, earthT, cloudsT, moonT] = await Promise.all([
        loadTex("2k_sun.jpg", true),
        loadTex("2k_saturn.jpg", true),
        loadTex("2k_saturn_ring_alpha.png", true),
        loadTex("2k_earth_daymap.jpg", true),
        loadTex("2k_earth_clouds.jpg", true),
        loadTex("2k_moon.jpg", true)
      ]);

      tex = { sunT, saturnT, ringT, earthT, cloudsT, moonT };
      await nextFrame();
    } catch (e) {
      return; // CDN or texture unavailable: slots simply stay empty
    }

    function makeCanvas(w, h) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    }

    // Soft radial glow sprite, tinted to the page palette
    function glowTexture(inner, outer) {
      const c = makeCanvas(256, 256);
      const x = c.getContext("2d");
      const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, inner);
      g.addColorStop(0.4, outer);
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    }

    function addHalo(scene, inner, outer, scale, opacity) {
      const mat = new THREE.SpriteMaterial({
        map: glowTexture(inner, outer),
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(scale, scale, 1);
      sprite.position.z = -0.4;
      scene.add(sprite);
      return sprite;
    }

    function buildBody(kind, scene) {
      if (kind === "sun") {
        addHalo(scene, "rgba(255,190,80,0.85)", "rgba(255,140,20,0.30)", 2.55, 0.9);
        tex.sunT.wrapS = THREE.RepeatWrapping;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1.02, 64, 64),
          new THREE.MeshBasicMaterial({ map: tex.sunT })
        );
        scene.add(mesh);
        return { spin: mesh, speed: 0.0035, scrollMap: tex.sunT };
      }

      if (kind === "saturn") {
        addHalo(scene, "rgba(232,211,168,0.40)", "rgba(122,167,255,0.12)", 4.1, 0.45);
        const tilt = new THREE.Group();
        const inner = new THREE.Group();

        const body = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 64, 64),
          new THREE.MeshStandardMaterial({ map: tex.saturnT, roughness: 0.95 })
        );
        inner.add(body);

        const RING_IN = 1.24;
        const RING_OUT = 1.92;
        const ringGeo = new THREE.RingGeometry(RING_IN, RING_OUT, 180, 1);
        const rpos = ringGeo.attributes.position;
        const ruv = ringGeo.attributes.uv;
        const v3 = new THREE.Vector3();

        for (let i = 0; i < rpos.count; i += 1) {
          v3.fromBufferAttribute(rpos, i);
          ruv.setXY(i, (v3.length() - RING_IN) / (RING_OUT - RING_IN), 0.5);
        }

        const ring = new THREE.Mesh(
          ringGeo,
          new THREE.MeshBasicMaterial({
            map: tex.ringT,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        ring.rotation.x = -Math.PI / 2;
        inner.add(ring);

        tilt.rotation.z = 0.4;
        tilt.rotation.x = 0.34;
        tilt.add(inner);
        scene.add(tilt);
        return { spin: inner, speed: 0.0035, precess: tilt };
      }

      if (kind === "earth") {
        addHalo(scene, "rgba(122,167,255,0.65)", "rgba(122,167,255,0.16)", 2.5, 0.65);
        const group = new THREE.Group();

        const globe = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          new THREE.MeshPhongMaterial({
            map: tex.earthT,
            specular: new THREE.Color(0x2f4d7a),
            shininess: 14
          })
        );
        group.add(globe);

        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(1.025, 64, 64),
          new THREE.MeshBasicMaterial({
            map: tex.cloudsT,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        group.add(clouds);
        scene.add(group);
        return { spin: group, speed: 0.004, clouds };
      }

      addHalo(scene, "rgba(190,205,235,0.45)", "rgba(122,167,255,0.10)", 2.45, 0.5);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.95, 64, 64),
        new THREE.MeshStandardMaterial({ map: tex.moonT, roughness: 1 })
      );
      scene.add(mesh);
      return { spin: mesh, speed: 0.0028 };
    }

    const planetItems = [];

    // Build ONE planet per frame: each iteration creates its renderer,
    // uploads its textures to the GPU (via an immediate first render) and
    // then yields, so the total cost is spread instead of one long freeze.
    for (let slotIndex = 0; slotIndex < planetSlots.length; slotIndex += 1) {
      const slot = planetSlots[slotIndex];
      const kind = slot.dataset.body;
      const size = slot.clientWidth || 300;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size);
      slot.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
      camera.position.z = kind === "saturn" ? 5.95 : 3.4;

      scene.add(new THREE.AmbientLight(0x8fa5d8, 0.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
      keyLight.position.set(4, 2, 5);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x7aa7ff, 1.0);
      rimLight.position.set(-5, -1, -4);
      scene.add(rimLight);

      const built = buildBody(kind, scene);

      const state = {
        renderer,
        scene,
        camera,
        target: built.spin,
        clouds: built.clouds || null,
        scrollMap: built.scrollMap || null,
        precess: built.precess || null,
        autoSpeed: prefersReducedMotion ? 0 : built.speed,
        rotX: 0,
        rotY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0
      };

      const canvasEl = renderer.domElement;

      canvasEl.addEventListener("pointerdown", (event) => {
        state.dragging = true;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        canvasEl.setPointerCapture(event.pointerId);
      });

      canvasEl.addEventListener("pointermove", (event) => {
        if (!state.dragging) {
          return;
        }
        state.rotY += (event.clientX - state.lastX) * 0.01;
        state.rotX += (event.clientY - state.lastY) * 0.01;
        state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX));
        state.lastX = event.clientX;
        state.lastY = event.clientY;
      });

      const endDrag = () => {
        state.dragging = false;
      };

      canvasEl.addEventListener("pointerup", endDrag);
      canvasEl.addEventListener("pointercancel", endDrag);

      planetItems.push(state);

      // force this planet's shader compile + texture uploads NOW, alone
      renderer.render(scene, camera);
      await nextFrame();
    }

    let planetsVisible = true;

    const planetVisObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          planetsVisible = entry.isIntersecting;
        });
      },
      { rootMargin: "200px" }
    );

    planetVisObserver.observe(document.getElementById("training"));

    (function renderPlanets() {
      requestAnimationFrame(renderPlanets);

      if (!planetsVisible) {
        return;
      }

      planetItems.forEach((s) => {
        if (!s.dragging) {
          s.rotY += s.autoSpeed;
        }
        s.target.rotation.y = s.rotY;
        s.target.rotation.x = s.rotX;

        if (s.clouds) {
          s.clouds.rotation.y += 0.0014;
        }

        if (s.scrollMap) {
          s.scrollMap.offset.x += 0.00035;
        }

        if (s.precess && !prefersReducedMotion) {
          s.precess.rotation.y += 0.0009;
        }

        s.renderer.render(s.scene, s.camera);
      });
    })();
  }

  window.__initPlanets = initPlanets;

  const planetsTrigger = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          planetsTrigger.disconnect();
          initPlanets();
        }
      });
    },
    { rootMargin: "700px" }
  );

  planetsTrigger.observe(document.getElementById("training"));

  // Pre-warm during idle time shortly after load, so by the time the
  // visitor scrolls to Training everything is already built and uploaded.
  window.addEventListener("load", () => {
    const prewarm = () => initPlanets();

    if ("requestIdleCallback" in window) {
      requestIdleCallback(prewarm, { timeout: 6000 });
    } else {
      setTimeout(prewarm, 3500);
    }
  });
}


// Hero portrait: image "generates" top-to-bottom behind lines of code
const revealImg = document.querySelector(".hero-portrait img");

if (revealImg && !prefersReducedMotion && window.innerWidth > 900) {
  const revealFig = revealImg.closest(".hero-portrait");
  const codeScan = document.createElement("div");
  codeScan.className = "code-scan";

  for (let i = 0; i < 4; i += 1) {
    codeScan.appendChild(document.createElement("span"));
  }

  revealFig.appendChild(codeScan);
  revealImg.style.clipPath = "inset(0 0 100% 0)";

  const SCAN_CHARS = "01<>/{}[]=+*#$&%@!;:._ABCDEF";
  const SCAN_TOKENS = [
    "render_px(x,y)", "decrypt(row)", "0x7AA7FF", "img.write()",
    "sha256: ok", "alloc(24kb)", "scanline++", "gpu.flush()",
    "decode(base64)", "identity: MRJ"
  ];

  function scanLine(len) {
    let s = "";
    for (let i = 0; i < len; i += 1) {
      s += Math.random() < 0.12 ? " " : SCAN_CHARS[Math.floor(Math.random() * SCAN_CHARS.length)];
    }
    return s;
  }

  function startReveal() {
    const start = performance.now();
    const DURATION = 2400;

    function step(now) {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      const pct = eased * 100;

      revealImg.style.clipPath = "inset(0 0 " + (100 - pct) + "% 0)";
      codeScan.style.top = "calc(" + pct + "% - 36px)";

      codeScan.querySelectorAll("span").forEach((line) => {
        const token = Math.random() < 0.2
          ? SCAN_TOKENS[Math.floor(Math.random() * SCAN_TOKENS.length)] + "  "
          : "";
        line.textContent = token + scanLine(36);
      });

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        codeScan.remove();
        revealImg.style.clipPath = "";
      }
    }

    requestAnimationFrame(step);
  }

  function kickReveal() {
    // If the boot intro is (or will be) covering the page, wait for it
    if (bootPending && !window.__bootDone) {
      document.addEventListener(
        "bootdone",
        () => setTimeout(startReveal, 250),
        { once: true }
      );
    } else {
      setTimeout(startReveal, 600);
    }
  }

  if (revealImg.complete && revealImg.naturalWidth > 0) {
    kickReveal();
  } else {
    revealImg.addEventListener("load", kickReveal, { once: true });
  }
}




// PhisDefense: Mail Storm — wave arcade with a living malware entity
const fwCanvas = document.getElementById("fwCanvas");

if (fwCanvas) {
  const fwStage = document.getElementById("fwStage");
  const fwOverlay = document.getElementById("fwOverlay");
  const fwStartBtn = document.getElementById("fwStart");
  const fwTitle = fwOverlay.querySelector(".fw-title");
  const fwSub = fwOverlay.querySelector(".fw-sub");
  const fwBestEl = document.getElementById("fwBest");
  const fwScoreEl = document.getElementById("fwScore");
  const fwWaveEl = document.getElementById("fwWave");
  const fwComboEl = document.getElementById("fwCombo");
  const fwFillEl = document.getElementById("fwIntegrityFill");
  const fwLabelEl = document.getElementById("fwIntegrityLabel");

  const fx = fwCanvas.getContext("2d");
  let W = 0;
  let H = 0;

  const PHISH = ["RE: invoice", "verify now", "acct locked", "you won $", "reset pwd", "gift card", "CEO urgent", "pay overdue", "unusual login", "claim refund"];
  const LEGIT = ["newsletter", "backup ok", "TLS-RPT", "MFA code", "cron done", "HR memo", "cert renew", "ticket #42", "standup", "receipt"];

  const g = {
    playing: false,
    mails: [],
    particles: [],
    floats: [],
    rings: [],
    dust: [],
    score: 0,
    combo: 1,
    integrity: 100,
    wave: 1,
    waveKills: 0,
    waveNeed: 8,
    elapsed: 0,
    spawnIn: 0,
    shakeT: 0,
    hurtT: 0,
    flashT: 0,
    flashText: "",
    scanY: 0,
    overdrive: 0,
    boss: null,
    entityFlinch: 0,
    entityAnger: 0,
    killStamps: [],
    last: 0
  };

  function seedDust() {
    g.dust = [];
    for (let i = 0; i < 30; i += 1) {
      g.dust.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.5 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 8, vy: 5 + Math.random() * 12,
        a: 0.05 + Math.random() * 0.14
      });
    }
  }

  function sizeG() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = fwStage.clientWidth;
    H = fwStage.clientHeight;
    fwCanvas.width = W * dpr;
    fwCanvas.height = H * dpr;
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedDust();
  }

  sizeG();
  window.addEventListener("resize", sizeG);

  function readBest() {
    try { return parseInt(localStorage.getItem("mailStormBest") || "0", 10); }
    catch (e) { return 0; }
  }
  function writeBest(v) { try { localStorage.setItem("mailStormBest", String(v)); } catch (e) { /* */ } }
  function showBest() {
    const b = readBest();
    fwBestEl.textContent = b > 0 ? "BEST: " + b + " PTS" : "";
  }

  function hud() {
    fwScoreEl.textContent = "SCORE " + g.score;
    fwWaveEl.textContent = "WAVE " + g.wave;
    fwComboEl.textContent = g.overdrive > 0 ? "⚡ OVERDRIVE" : "COMBO ×" + g.combo;
    const pct = Math.max(0, Math.round(g.integrity));
    fwFillEl.style.width = pct + "%";
    fwLabelEl.textContent = "SERVER " + pct + "%";
    fwFillEl.style.background = pct > 55
      ? "linear-gradient(90deg, #4ade80, #22c55e)"
      : pct > 25
        ? "linear-gradient(90deg, #facc15, #f59e0b)"
        : "linear-gradient(90deg, #f87171, #dc2626)";
  }

  function spawnMail(forceType) {
    const roll = Math.random();
    let type = forceType || "phish";

    if (!forceType) {
      if (roll < 0.04 && g.integrity < 92) type = "patch";
      else if (roll < 0.085 && g.elapsed > 8) type = "golden";
      else if (roll < 0.14 && g.wave >= 2) type = "enc";
      else if (roll < 0.17 && g.wave >= 2) type = "ransom";
      else if (roll < 0.52) type = "legit";
    }

    const speed = 50 + Math.min(g.elapsed * 2.0, 150) + g.wave * 6;
    const isPhish = type === "phish" || type === "enc";
    const isLegit = type === "legit";
    const big = type === "ransom";

    g.mails.push({
      type,
      x: 44 + Math.random() * (W - 88),
      y: -24,
      w: big ? 54 : 40,
      h: big ? 38 : 28,
      vy: speed * (0.85 + Math.random() * 0.4) * (g.overdrive > 0 ? 0.55 : 1) * (big ? 0.72 : 1) * (type === "enc" ? 0.9 : 1),
      wob: Math.random() * Math.PI * 2,
      wobAmp: 5 + Math.random() * 12,
      hp: type === "enc" ? 2 : 1,
      label: isPhish && type !== "enc" ? PHISH[Math.floor(Math.random() * PHISH.length)]
        : isLegit ? LEGIT[Math.floor(Math.random() * LEGIT.length)] : "",
      trail: []
    });
  }

  function spawnBoss() {
    g.boss = { x: W / 2, y: 46, dir: 1, hp: 6 + g.wave, maxHp: 6 + g.wave, shootIn: 1.1, hitT: 0 };
    g.flashText = "⚠ BOTNET C2 INBOUND";
    g.flashT = 1.6;
  }

  function boom(x, y, color, n) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = 40 + Math.random() * 190;
      g.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.45, color });
    }
  }
  function ring(x, y, color, maxR) { g.rings.push({ x, y, r: 5, maxR, life: 1, color }); }
  function floatText(x, y, txt, color) { g.floats.push({ x, y, txt, color, life: 0.95 }); }

  function damage(amount) {
    if (g.overdrive > 0) return;
    g.integrity -= amount;
    g.combo = 1;
    g.hurtT = Math.max(g.hurtT, amount > 15 ? 0.7 : 0.45);
    if (!prefersReducedMotion) g.shakeT = amount > 15 ? 0.5 : 0.3;
    if (g.integrity <= 0) { g.integrity = 0; endGame(); }
  }

  function registerKill(x, y) {
    g.waveKills += 1;
    g.entityFlinch = 0.35;
    g.entityAnger = Math.min(1, g.entityAnger + 0.06);

    // triple-block streak bonus
    g.killStamps.push(g.elapsed);
    g.killStamps = g.killStamps.filter((t) => g.elapsed - t < 1.4);
    if (g.killStamps.length >= 3) {
      g.killStamps = [];
      const bonus = 300 * g.combo;
      g.score += bonus;
      floatText(x, y - 30, "TRIPLE BLOCK +" + bonus, "#c4b5fd");
      ring(x, y, "#a78bfa", 60);
    }

    if (g.waveKills >= g.waveNeed) {
      g.wave += 1;
      g.waveKills = 0;
      g.waveNeed = 7 + g.wave * 2;
      g.integrity = Math.min(100, g.integrity + 8);
      g.flashText = "WAVE " + g.wave;
      g.flashT = 1.3;
      if (g.wave % 3 === 0) spawnBoss();
    }
  }

  function goldenSweep() {
    g.overdrive = 4.5;
    g.flashText = "★ DMARC OVERDRIVE";
    g.flashT = 1.6;
    for (let i = g.mails.length - 1; i >= 0; i -= 1) {
      const m = g.mails[i];
      if (m.type === "phish" || m.type === "enc" || m.type === "ransom" || m.type === "shot") {
        g.score += 60 * g.combo;
        boom(m.x, m.y, "#ffd166", 14);
        g.mails.splice(i, 1);
      }
    }
    ring(W / 2, H / 2, "#ffd166", Math.max(W, H));
  }

  function rank(pts, wave) {
    if (pts >= 8000 || wave >= 10) return "RANK: DMARC OVERLORD 🛡";
    if (pts >= 4500) return "RANK: PHISH SLAYER";
    if (pts >= 2000) return "RANK: MAIL MARSHAL";
    return "RANK: INBOX ROOKIE ☕";
  }

  function endGame() {
    g.playing = false;
    const best = readBest();
    if (g.score > best) writeBest(g.score);
    fwTitle.textContent = "SERVER DOWN — " + g.score + " PTS";
    fwSub.textContent = rank(g.score, g.wave) + " · reached wave " + g.wave + (g.score > best ? "  ·  NEW BEST!" : "");
    fwStartBtn.textContent = "▶ NEW SHIFT";
    fwOverlay.classList.remove("hidden");
    showBest();
  }

  function update(dt) {
    g.elapsed += dt;
    g.spawnIn -= dt;
    g.scanY = (g.scanY + dt * 60) % H;
    if (g.shakeT > 0) g.shakeT -= dt;
    if (g.hurtT > 0) g.hurtT -= dt;
    if (g.flashT > 0) g.flashT -= dt;
    if (g.overdrive > 0) g.overdrive -= dt;
    if (g.entityFlinch > 0) g.entityFlinch -= dt * 2.2;
    g.entityAnger = Math.max(g.entityAnger * (1 - dt * 0.05), Math.min(1, (g.wave - 1) * 0.1 + (g.boss ? 0.35 : 0)));

    const spawnRate = Math.max(0.32, 0.9 - g.elapsed * 0.01 - g.wave * 0.02);
    if (g.spawnIn <= 0 && !(g.boss && g.mails.length > 4)) {
      spawnMail();
      g.spawnIn = spawnRate;
    }

    const baseline = H - 34;

    if (g.boss) {
      const b = g.boss;
      b.x += b.dir * dt * 70;
      if (b.x < 60) { b.x = 60; b.dir = 1; }
      if (b.x > W - 60) { b.x = W - 60; b.dir = -1; }
      if (b.hitT > 0) b.hitT -= dt;
      b.shootIn -= dt;
      if (b.shootIn <= 0) {
        b.shootIn = Math.max(0.5, 1.3 - g.wave * 0.05);
        g.mails.push({ type: "shot", x: b.x, y: b.y + 18, w: 16, h: 16, vy: 150, wob: 0, wobAmp: 0, hp: 1, label: "", trail: [] });
      }
    }

    for (let i = g.mails.length - 1; i >= 0; i -= 1) {
      const m = g.mails[i];
      m.y += m.vy * dt;
      m.wob += dt * 3;
      const mx = m.x + Math.sin(m.wob) * m.wobAmp * 0.4;
      m.trail.unshift({ x: mx, y: m.y });
      if (m.trail.length > 7) m.trail.pop();

      if (m.y >= baseline) {
        g.mails.splice(i, 1);
        if (m.type === "phish" || m.type === "enc" || m.type === "shot") {
          boom(mx, baseline, "#f87171", 26);
          ring(mx, baseline, "#f87171", 50);
          floatText(mx, baseline - 22, "-12%", "#f87171");
          damage(12);
        } else if (m.type === "ransom") {
          boom(mx, baseline, "#f87171", 40);
          ring(mx, baseline, "#f87171", 80);
          floatText(mx, baseline - 22, "RANSOMWARE -25%", "#f87171");
          damage(25);
        } else if (m.type === "legit") {
          g.score += 5;
          floatText(mx, baseline - 22, "+5", "#4ade80");
        }
      }
    }

    for (let i = g.particles.length - 1; i >= 0; i -= 1) {
      const p = g.particles[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt;
      if (p.life <= 0) g.particles.splice(i, 1);
    }
    for (let i = g.rings.length - 1; i >= 0; i -= 1) {
      const r = g.rings[i];
      r.life -= dt * 2.2; r.r += (r.maxR - r.r) * dt * 9;
      if (r.life <= 0) g.rings.splice(i, 1);
    }
    for (let i = g.floats.length - 1; i >= 0; i -= 1) {
      const f = g.floats[i];
      f.life -= dt; f.y -= 36 * dt;
      if (f.life <= 0) g.floats.splice(i, 1);
    }
    g.dust.forEach((s) => {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
      if (s.x < -4) s.x = W + 4; if (s.x > W + 4) s.x = -4;
    });
  }

  // ---- living malware entity background ----
  function drawEntity() {
    const ex = W * 0.5;
    const ey = H * 0.4;
    const anger = g.entityAnger;
    const pulse = 1 + Math.sin(g.elapsed * 2.6) * 0.09 - g.entityFlinch * 0.35;
    const coreR = (34 + anger * 26) * pulse;
    const hueR = 200 + anger * 30;
    const hueG = 60 - anger * 40;
    const baseCol = "rgba(" + Math.round(hueR) + "," + Math.round(Math.max(20, hueG)) + ",90,";
    const alpha = 0.09 + anger * 0.05;

    fx.save();
    fx.globalCompositeOperation = "lighter";

    // writhing tentacles
    const N = 10;
    for (let i = 0; i < N; i += 1) {
      const a = (i / N) * Math.PI * 2 + g.elapsed * (0.12 + anger * 0.1);
      const wig = Math.sin(g.elapsed * 2 + i * 1.7);
      const len = coreR * (2.2 + anger * 0.9) + wig * 16;
      const cx1 = ex + Math.cos(a + 0.5 * wig) * len * 0.55;
      const cy1 = ey + Math.sin(a + 0.5 * wig) * len * 0.55;
      const tx = ex + Math.cos(a) * len;
      const ty = ey + Math.sin(a) * len;

      const grad = fx.createLinearGradient(ex, ey, tx, ty);
      grad.addColorStop(0, baseCol + (alpha * 1.4) + ")");
      grad.addColorStop(1, baseCol + "0)");
      fx.strokeStyle = grad;
      fx.lineWidth = coreR * 0.4 * (0.6 + Math.abs(wig) * 0.5);
      fx.lineCap = "round";
      fx.beginPath();
      fx.moveTo(ex, ey);
      fx.quadraticCurveTo(cx1, cy1, tx, ty);
      fx.stroke();
    }

    // nucleus
    const ng = fx.createRadialGradient(ex, ey, 2, ex, ey, coreR * 1.8);
    ng.addColorStop(0, baseCol + (0.22 + anger * 0.1) + ")");
    ng.addColorStop(0.5, baseCol + (alpha) + ")");
    ng.addColorStop(1, baseCol + "0)");
    fx.fillStyle = ng;
    fx.beginPath();
    fx.arc(ex, ey, coreR * 1.8, 0, Math.PI * 2);
    fx.fill();

    fx.globalCompositeOperation = "source-over";

    // glitch code strands drifting through the entity
    fx.font = "9px Consolas, monospace";
    fx.textAlign = "center";
    for (let i = 0; i < 5; i += 1) {
      const gx = ex + Math.cos(g.elapsed * 0.6 + i * 1.3) * coreR * 1.4;
      const gy = ey + ((g.elapsed * 22 + i * 40) % (coreR * 3)) - coreR * 1.5;
      fx.fillStyle = "rgba(248,113,113," + (0.12 + anger * 0.12) + ")";
      fx.fillText(["0x1A", "rm -rf", "exec()", "b64d", "0xFF"][i], gx, gy);
    }

    // two malevolent eyes that track the lowest phishing packet
    let target = null;
    let lowest = -1;
    g.mails.forEach((m) => {
      if ((m.type === "phish" || m.type === "enc" || m.type === "ransom") && m.y > lowest) { lowest = m.y; target = m; }
    });
    const look = target ? Math.atan2(target.y - ey, target.x - ex) : Math.sin(g.elapsed) * 0.4 + Math.PI / 2;
    const eyeDx = Math.cos(look) * 3;
    const eyeDy = Math.sin(look) * 3;
    const eyeGlow = 0.5 + Math.sin(g.elapsed * 4) * 0.2 + anger * 0.3;
    [-1, 1].forEach((side) => {
      const eox = ex + side * coreR * 0.42;
      const eoy = ey - coreR * 0.1;
      fx.fillStyle = "rgba(255,80,80," + eyeGlow + ")";
      fx.shadowColor = "rgba(255,60,60,0.9)";
      fx.shadowBlur = 10;
      fx.beginPath();
      fx.arc(eox + eyeDx, eoy + eyeDy, 2.6 + anger * 1.2, 0, Math.PI * 2);
      fx.fill();
    });
    fx.shadowBlur = 0;
    fx.restore();
  }

  function drawEnvelope(m) {
    const mx = m.x + Math.sin(m.wob) * m.wobAmp * 0.4;
    const colors = { phish: "#f87171", legit: "#4ade80", patch: "#7aa7ff", golden: "#ffd166", shot: "#f87171", enc: "#e0466a", ransom: "#ff5470" };
    const color = colors[m.type];

    for (let i = 2; i < m.trail.length; i += 1) {
      const t = m.trail[i];
      const fade = 1 - i / m.trail.length;
      fx.globalAlpha = fade * 0.14;
      fx.fillStyle = color;
      fx.fillRect(t.x - m.w * fade * 0.4, t.y - m.h * fade * 0.3, m.w * fade * 0.8, m.h * fade * 0.6);
    }
    fx.globalAlpha = 1;

    if (m.type === "shot") {
      fx.save();
      fx.translate(mx, m.y);
      fx.shadowColor = "#f87171"; fx.shadowBlur = 14;
      fx.fillStyle = "#f87171";
      fx.beginPath(); fx.arc(0, 0, 7, 0, Math.PI * 2); fx.fill();
      fx.restore();
      return;
    }

    const ranPulse = m.type === "ransom" ? 1 + Math.sin(g.elapsed * 8) * 0.08 : 1;
    fx.save();
    fx.translate(mx, m.y);
    fx.scale(ranPulse, ranPulse);
    fx.shadowColor = color;
    fx.shadowBlur = m.type === "golden" ? 22 : m.type === "ransom" ? 20 : 14;

    fx.fillStyle = "rgba(12,17,30,0.95)";
    fx.strokeStyle = color;
    fx.lineWidth = 2;
    fx.beginPath();
    fx.roundRect(-m.w / 2, -m.h / 2, m.w, m.h, 4);
    fx.fill();
    fx.stroke();

    fx.beginPath();
    fx.moveTo(-m.w / 2, -m.h / 2);
    fx.lineTo(0, 2);
    fx.lineTo(m.w / 2, -m.h / 2);
    fx.stroke();

    // crack lines on a half-broken encrypted envelope
    if (m.type === "enc" && m.hp < 2) {
      fx.strokeStyle = "#ffd166";
      fx.lineWidth = 1;
      fx.beginPath();
      fx.moveTo(-8, -6); fx.lineTo(-2, 2); fx.lineTo(-6, 8);
      fx.moveTo(8, -4); fx.lineTo(3, 3);
      fx.stroke();
    }

    fx.shadowBlur = 0;
    fx.fillStyle = color;
    fx.font = "700 12px 'Segoe UI', sans-serif";
    fx.textAlign = "center"; fx.textBaseline = "middle";

    if (m.type === "phish") { fx.beginPath(); fx.arc(0, m.h / 2 - 5, 4.5, 0, Math.PI * 2); fx.fill(); }
    else if (m.type === "enc") { fx.fillText("🔒", 0, m.h / 2 - 6); }
    else if (m.type === "ransom") { fx.fillText("💀", 0, m.h / 2 - 6); }
    else if (m.type === "patch") { fx.fillText("⛨", 0, m.h / 2 - 5); }
    else if (m.type === "golden") { fx.fillText("★", 0, m.h / 2 - 5); }

    if (m.label) {
      fx.fillStyle = "rgba(199,215,255,0.85)";
      fx.font = "600 7px Consolas, monospace";
      fx.fillText(m.label, 0, -2);
    }
    fx.restore();
  }

  function drawBoss() {
    if (!g.boss) return;
    const b = g.boss;
    fx.save();
    fx.translate(b.x, b.y);
    const hit = b.hitT > 0;
    fx.shadowColor = hit ? "#ffffff" : "#a78bfa";
    fx.shadowBlur = 20;
    fx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * 26, py = Math.sin(a) * 20;
      if (i === 0) fx.moveTo(px, py); else fx.lineTo(px, py);
    }
    fx.closePath();
    fx.fillStyle = hit ? "#f8f0ff" : "rgba(20,14,40,0.95)";
    fx.fill();
    fx.lineWidth = 2.5; fx.strokeStyle = "#a78bfa"; fx.stroke();
    fx.shadowBlur = 0;
    fx.fillStyle = "#f87171";
    fx.beginPath(); fx.arc(-8, -2, 3, 0, Math.PI * 2); fx.fill();
    fx.beginPath(); fx.arc(8, -2, 3, 0, Math.PI * 2); fx.fill();
    fx.fillStyle = "#c7d7ff"; fx.font = "700 7px Consolas, monospace"; fx.textAlign = "center";
    fx.fillText("BOTNET C2", 0, 30);
    fx.restore();
    const bw = 70;
    fx.fillStyle = "rgba(255,255,255,0.1)"; fx.fillRect(b.x - bw / 2, b.y - 34, bw, 5);
    fx.fillStyle = "#a78bfa"; fx.fillRect(b.x - bw / 2, b.y - 34, bw * (b.hp / b.maxHp), 5);
  }

  function draw() {
    fx.clearRect(0, 0, W, H);
    fx.save();
    if (g.shakeT > 0) fx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    let bg = fx.createLinearGradient(0, 0, 0, H);
    if (g.overdrive > 0) { bg.addColorStop(0, "rgba(255,209,102,0.05)"); bg.addColorStop(1, "rgba(245,158,11,0.08)"); }
    else { bg.addColorStop(0, "rgba(122,167,255,0.02)"); bg.addColorStop(1, "rgba(167,139,250,0.05)"); }
    fx.fillStyle = bg; fx.fillRect(0, 0, W, H);

    const cx = W / 2;
    fx.strokeStyle = g.overdrive > 0 ? "rgba(255,209,102,0.09)" : "rgba(122,167,255,0.07)";
    fx.lineWidth = 1;
    for (let k = -9; k <= 9; k += 1) {
      fx.beginPath(); fx.moveTo(cx + k * (W / 26), 0); fx.lineTo(cx + k * (W / 13), H); fx.stroke();
    }

    drawEntity();

    g.dust.forEach((s) => { fx.globalAlpha = s.a; fx.fillStyle = "#c7d7ff"; fx.fillRect(s.x, s.y, s.r, s.r); });
    fx.globalAlpha = 1;

    const sweep = fx.createLinearGradient(0, g.scanY - 44, 0, g.scanY);
    sweep.addColorStop(0, "rgba(122,167,255,0)"); sweep.addColorStop(1, "rgba(122,167,255,0.05)");
    fx.fillStyle = sweep; fx.fillRect(0, g.scanY - 44, W, 44);

    const baseY = H - 26;
    const pulse = 0.5 + Math.sin(g.elapsed * 3) * 0.22;
    fx.shadowColor = "rgba(122,167,255," + pulse + ")"; fx.shadowBlur = 18;
    fx.fillStyle = "rgba(122,167,255,0.78)"; fx.fillRect(14, baseY, W - 28, 3);
    fx.shadowBlur = 0;
    const rw = 96, rh = 24;
    fx.fillStyle = "rgba(10,15,28,0.95)"; fx.strokeStyle = "rgba(122,167,255,0.55)"; fx.lineWidth = 1.5;
    fx.beginPath(); fx.roundRect(cx - rw / 2, baseY - rh - 4, rw, rh, 6); fx.fill(); fx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const on = Math.sin(g.elapsed * 5 + i * 1.7) > 0;
      fx.fillStyle = on ? (i === 3 ? "#4ade80" : "#7aa7ff") : "rgba(255,255,255,0.12)";
      fx.beginPath(); fx.arc(cx - rw / 2 + 14 + i * 13, baseY - rh + 8, 3, 0, Math.PI * 2); fx.fill();
    }
    fx.fillStyle = "rgba(199,215,255,0.7)"; fx.font = "700 9px Consolas, monospace"; fx.textAlign = "left";
    fx.fillText("MAIL-SRV", cx + 8, baseY - rh + 11);

    drawBoss();
    g.mails.forEach(drawEnvelope);

    g.particles.forEach((p) => { fx.globalAlpha = Math.max(0, p.life * 1.6); fx.fillStyle = p.color; fx.fillRect(p.x - 2, p.y - 2, 4, 4); });
    fx.globalAlpha = 1;
    g.rings.forEach((r) => { fx.globalAlpha = Math.max(0, r.life) * 0.8; fx.strokeStyle = r.color; fx.lineWidth = 2; fx.beginPath(); fx.arc(r.x, r.y, r.r, 0, Math.PI * 2); fx.stroke(); });
    fx.globalAlpha = 1;
    g.floats.forEach((f) => {
      fx.globalAlpha = Math.max(0, f.life);
      fx.font = "800 15px Consolas, monospace"; fx.textAlign = "center";
      fx.lineWidth = 3; fx.strokeStyle = "rgba(7,10,17,0.85)"; fx.strokeText(f.txt, f.x, f.y);
      fx.fillStyle = f.color; fx.fillText(f.txt, f.x, f.y);
    });
    fx.globalAlpha = 1;

    if (g.combo >= 3 && g.overdrive <= 0) {
      fx.globalAlpha = 0.08 + Math.sin(g.elapsed * 6) * 0.02;
      fx.fillStyle = "#c7d7ff"; fx.font = "900 60px Consolas, monospace"; fx.textAlign = "center";
      fx.fillText("×" + g.combo, cx, 78);
      fx.globalAlpha = 1;
    }

    if (g.flashT > 0) {
      const a = Math.min(1, g.flashT);
      fx.globalAlpha = a;
      fx.fillStyle = g.flashText.indexOf("BOTNET") >= 0 ? "#f87171" : g.flashText.indexOf("OVERDRIVE") >= 0 ? "#ffd166" : "#7aa7ff";
      fx.font = "900 26px Consolas, monospace"; fx.textAlign = "center";
      fx.shadowColor = fx.fillStyle; fx.shadowBlur = 20;
      fx.fillText(g.flashText, cx, H / 2);
      fx.shadowBlur = 0; fx.globalAlpha = 1;
    }

    if (g.hurtT > 0) {
      const v = fx.createRadialGradient(cx, H / 2, H * 0.3, cx, H / 2, H);
      v.addColorStop(0, "rgba(248,113,113,0)"); v.addColorStop(1, "rgba(248,113,113," + (g.hurtT * 0.55) + ")");
      fx.fillStyle = v; fx.fillRect(0, 0, W, H);
    }
    if (g.overdrive > 0) {
      fx.strokeStyle = "rgba(255,209,102," + (0.3 + Math.sin(g.elapsed * 10) * 0.15) + ")";
      fx.lineWidth = 4; fx.strokeRect(3, 3, W - 6, H - 6);
    }
    fx.restore();
  }

  function frame(now) {
    if (!g.playing) return;
    const dt = Math.min((now - g.last) / 1000, 0.05);
    g.last = now;
    update(dt); draw(); hud();
    requestAnimationFrame(frame);
  }

  function start() {
    sizeG();
    Object.assign(g, {
      playing: true, mails: [], particles: [], floats: [], rings: [],
      score: 0, combo: 1, integrity: 100, wave: 1, waveKills: 0, waveNeed: 8,
      elapsed: 0, spawnIn: 0.4, shakeT: 0, hurtT: 0, flashT: 1.1, flashText: "WAVE 1",
      overdrive: 0, boss: null, entityFlinch: 0, entityAnger: 0, killStamps: []
    });
    fwOverlay.classList.add("hidden");
    hud();
    g.last = performance.now();
    requestAnimationFrame(frame);
  }

  function hit(x, y) {
    if (!g.playing) return;

    if (g.boss) {
      const b = g.boss;
      if (Math.hypot(x - b.x, y - b.y) <= 30) {
        b.hp -= 1; b.hitT = 0.12;
        boom(b.x, b.y, "#a78bfa", 10);
        g.score += 40 * g.combo;
        floatText(b.x, b.y - 30, "+" + (40 * g.combo), "#c4b5fd");
        if (b.hp <= 0) {
          boom(b.x, b.y, "#a78bfa", 40); ring(b.x, b.y, "#a78bfa", 90);
          g.score += 500; floatText(b.x, b.y, "C2 TAKEDOWN +500", "#ffd166");
          g.boss = null;
        }
        hud(); return;
      }
    }

    for (let i = g.mails.length - 1; i >= 0; i -= 1) {
      const m = g.mails[i];
      const mx = m.x + Math.sin(m.wob) * m.wobAmp * 0.4;
      if (Math.abs(x - mx) <= m.w / 2 + 8 && Math.abs(y - m.y) <= m.h / 2 + 8) {

        if (m.type === "enc" && m.hp > 1) {
          m.hp -= 1;
          boom(mx, m.y, "#ffd166", 8);
          ring(mx, m.y, "#ffd166", 26);
          floatText(mx, m.y - 12, "DECRYPTING…", "#ffd166");
          hud();
          return;
        }

        g.mails.splice(i, 1);

        if (m.type === "phish" || m.type === "shot" || m.type === "enc") {
          const base = m.type === "enc" ? 250 : 100;
          const pts = base * g.combo * (g.overdrive > 0 ? 2 : 1);
          g.score += pts;
          g.combo = Math.min(g.combo + 1, 12);
          boom(mx, m.y, "#f87171", 22);
          ring(mx, m.y, "#ffd166", 44);
          floatText(mx, m.y - 12, "+" + pts, "#ffd166");
          registerKill(mx, m.y);
        } else if (m.type === "ransom") {
          const pts = 300 * g.combo * (g.overdrive > 0 ? 2 : 1);
          g.score += pts;
          g.integrity = Math.min(100, g.integrity + 5);
          g.combo = Math.min(g.combo + 1, 12);
          boom(mx, m.y, "#ff5470", 30);
          ring(mx, m.y, "#ff5470", 60);
          floatText(mx, m.y - 12, "QUARANTINED +" + pts, "#ffd166");
          registerKill(mx, m.y);
        } else if (m.type === "legit") {
          boom(mx, m.y, "#4ade80", 12);
          floatText(mx, m.y - 12, "FALSE POSITIVE -8%", "#facc15");
          damage(8);
        } else if (m.type === "patch") {
          g.integrity = Math.min(100, g.integrity + 15);
          boom(mx, m.y, "#7aa7ff", 18);
          ring(mx, m.y, "#7aa7ff", 50);
          floatText(mx, m.y - 12, "+15% SERVER", "#7aa7ff");
        } else if (m.type === "golden") {
          boom(mx, m.y, "#ffd166", 26);
          goldenSweep();
        }
        hud();
        return;
      }
    }
    ring(x, y, "rgba(199,215,255,0.7)", 18);
  }

  fwCanvas.addEventListener("pointerdown", (event) => {
    const rect = fwCanvas.getBoundingClientRect();
    hit(event.clientX - rect.left, event.clientY - rect.top);
  });
  fwStartBtn.addEventListener("click", start);
  document.addEventListener("visibilitychange", () => { if (document.hidden && g.playing) g.last = performance.now(); });

  showBest();
  window.__fwDebug = { g, update, draw, spawnMail, hit, spawnBoss, goldenSweep };
}





// Card zoom: click a card -> it spins in and settles suspended & tilted on
// the left with a traveling neon border, and a panel with additional /
// more detailed information slides in on the right.
(function initCardZoom() {
  const cards = document.querySelectorAll(
    "#about .card, #skills .skill-category:not(.radar-card), #training .training-clean-card, #certifications .cert-card"
  );

  if (!cards.length) {
    return;
  }

  // additional / deeper detail per card, keyed by its heading
  const DETAILS = {
    "Technical Background": {
      kicker: "Foundations",
      lead: "A cybersecurity-first profile: defensive security is the focus, standing on a solid networking and systems foundation.",
      sections: [
        {
          title: "Where it comes from",
          items: [
            "<strong>Cybersecurity specialization</strong> (2025–2026, DigitechFP): incident handling, forensics, hardening, secure deployment and ethical hacking — the core of my profile.",
            "<strong>Continuous cybersecurity training:</strong> TryHackMe SOC Analyst L1 path, Blue Team learning and the PhisDefense home-lab project.",
            "<strong>Higher Technician in Telecommunication & Computer Systems</strong> (2022–2024): the networking and infrastructure base underneath it all."
          ]
        },
        {
          title: "Working habits it produced",
          items: [
            "Methodical fault isolation — reproduce, narrow down, confirm root cause.",
            "Clear technical documentation and incident write-ups that another analyst can follow.",
            "Comfort at the command line on Linux and Windows, and with reading logs."
          ]
        }
      ],
      close: "The same discipline used to diagnose a broken network maps directly onto SOC alert triage and evidence handling.",
      tags: ["Networking", "Linux", "Windows", "Troubleshooting", "Documentation"]
    },

    "Cybersecurity Focus": {
      kicker: "Defensive security",
      lead: "Concentrated firmly on the Blue Team side of security operations — monitoring, detection and email defense, always backed by evidence.",
      sections: [
        {
          title: "Monitoring & detection",
          items: [
            "Reading and correlating logs across systems to reconstruct what happened.",
            "Alert triage: prioritize by severity, confirm true positives, discard noise.",
            "Incident-response fundamentals: contain, investigate, document, learn."
          ]
        },
        {
          title: "Email security (my strongest area)",
          items: [
            "SPF, DKIM and a progressive DMARC policy taken all the way to <strong>p=reject</strong>.",
            "Spoofing simulated and then proven blocked with SMTP responses and logs.",
            "Everything validated on a real Ubuntu VPS, not a slideshow."
          ]
        }
      ],
      close: "Principle I work by: a control that isn't tested and documented doesn't count as a control.",
      tags: ["SOC", "Blue Team", "Log analysis", "Email security", "Detection"]
    },

    "Professional Direction": {
      kicker: "Where I'm heading",
      lead: "Actively looking for a first junior role in defensive security where I can contribute from day one and keep growing fast.",
      sections: [
        {
          title: "Roles I'm targeting",
          items: [
            "SOC Analyst L1 · Junior Cybersecurity Analyst · Blue Team junior.",
            "Location: Spain or fully remote."
          ]
        },
        {
          title: "What I can do now",
          items: [
            "Alert triage and log analysis on real security events.",
            "Email-security configuration and validation (SPF / DKIM / DMARC).",
            "Turn raw events into sanitized datasets and readable dashboards.",
            "Write clear, evidence-based incident documentation."
          ]
        }
      ],
      close: "Currently working through the SOC Analyst L1 path and preparing BTL1 to deepen investigation skills.",
      tags: ["SOC Analyst L1", "Blue Team", "Incident response", "Remote / Spain"]
    },

    "Identity and Access Management": {
      kicker: "01 · Current focus",
      lead: "Hands-on IAM operations against a real identity provider — the core of the IAM Operations & CyberIAM Monitoring Lab.",
      sections: [
        {
          title: "Identity & SSO",
          items: [
            "<strong>Keycloak:</strong> dedicated realm (airbus-iam-lab), confidential OIDC client, users and role mappings.",
            "<strong>OpenID Connect:</strong> full Authorization Code Flow — login, callback validation, protected routes, RP-initiated logout.",
            "<strong>RBAC:</strong> four lab roles (user, admin, auditor, support) validated end to end, with technical roles filtered from the UI.",
            "<strong>OAuth2 / SAML / MFA:</strong> working conceptual base around tokens, claims, federation and factor concepts."
          ]
        },
        {
          title: "IAM operations",
          items: [
            "<strong>Identity inventory:</strong> user-role exports through the Keycloak Admin REST API.",
            "<strong>Privileged account review:</strong> admin role holders detected and flagged automatically.",
            "<strong>Role compliance:</strong> missing lab role checks for RBAC hygiene.",
            "<strong>IAM event monitoring:</strong> login, failed-login and admin events normalized with severity."
          ]
        }
      ],
      close: "Everything is demonstrated in the IAM lab: 4 users, 4 roles, 1 privileged account detected, 10 normalized IAM events and a Streamlit CyberIAM dashboard reading the evidence.",
      tags: ["Keycloak", "OpenID Connect", "RBAC", "SSO", "Privileged Access", "Admin REST API", "IAM Events"]
    },

    "Security Operations": {
      kicker: "02 · Core discipline",
      lead: "Detecting, triaging and investigating security events with a defensive mindset — the day-to-day of a SOC analyst.",
      sections: [
        {
          title: "What this covers",
          items: [
            "<strong>Alert triage:</strong> prioritize by severity, confirm true positives, cut the noise.",
            "<strong>Log & event analysis:</strong> follow an incident across syslog, SMTP responses, IAM event streams and dashboards.",
            "<strong>Threat detection:</strong> recognize spoofing, SMTP abuse, open-relay probing and auth failures.",
            "<strong>Failed login & admin event review:</strong> authentication errors and realm changes surfaced for analyst review.",
            "<strong>SIEM fundamentals & ITIL concepts:</strong> aggregation, correlation, and change/event/incident awareness.",
            "<strong>Incident response basics:</strong> contain, document, report."
          ]
        }
      ],
      close: "Applied for real in both labs: 190 SOC events processed in PhisDefense and a normalized, severity-tagged IAM event pipeline in the Keycloak lab.",
      tags: ["Alert Triage", "Log Analysis", "Threat Detection", "SIEM", "Evidence Handling", "ITIL Concepts", "Incident Response"]
    },

    "Email Security": {
      kicker: "03 · Signature strength",
      lead: "A full defensive email stack designed, deployed and validated on a real Ubuntu VPS — the core of the PhisDefense project.",
      sections: [
        {
          title: "Authentication",
          items: [
            "SPF tested in both pass and fail conditions.",
            "DKIM validated across valid, broken and absent signatures, plus a real selector rotation to <strong>s2026</strong>.",
            "Progressive DMARC policy hardened step by step up to <strong>p=reject</strong>, rejecting external spoofing."
          ]
        },
        {
          title: "Transport & reporting",
          items: [
            "DNSSEC, MTA-STS and TLS-RPT documented and in place.",
            "STARTTLS on SMTP and IMAPS TLS for encrypted transport.",
            "Reporting status surfaced on the SOC dashboard."
          ]
        },
        {
          title: "The stack",
          items: [
            "Postfix (SMTP), Dovecot (IMAPS), OpenDKIM, OpenDMARC and OpenARC.",
            "Syslog as the single source of technical evidence."
          ]
        }
      ],
      tags: ["SPF", "DKIM", "DMARC p=reject", "DNSSEC", "MTA-STS", "TLS-RPT", "Postfix", "Dovecot"]
    },

    "Systems and Networking": {
      kicker: "04 · Infrastructure base",
      lead: "The systems and networking knowledge that underpins solid defensive work — you can't protect traffic you don't understand.",
      sections: [
        {
          title: "Networking",
          items: [
            "TCP/IP model, addressing and subnetting.",
            "DNS, DHCP, routing and switching fundamentals.",
            "Firewall concepts and network troubleshooting."
          ]
        },
        {
          title: "Systems",
          items: [
            "Linux and Windows administration.",
            "Secure service configuration and TLS.",
            "Structured, layer-by-layer diagnosis from the network up to the application."
          ]
        }
      ],
      tags: ["Linux", "Windows", "TCP/IP", "DNS", "DHCP", "Routing", "Firewalls", "TLS"]
    },

    "Automation, Dashboards and Reporting": {
      kicker: "05 · Force multiplier",
      lead: "Turning raw security data into readable evidence and repeatable automation instead of manual, error-prone work.",
      sections: [
        {
          title: "Scripting & APIs",
          items: [
            "Python for parsing, enrichment and repetitive tasks; Bash and PowerShell basics.",
            "<strong>REST API automation:</strong> identity inventory, privileged account detection and event extraction against the Keycloak Admin REST API.",
            "pandas, CSV/JSON processing and data normalization to shape sanitized datasets.",
            "Markdown reporting: consolidated daily IAM operations reports."
          ]
        },
        {
          title: "Dashboards & delivery",
          items: [
            "<strong>Streamlit + pandas + Altair:</strong> the IAM/CyberIAM operations console (KPIs, reviews, evidence index).",
            "<strong>Python/Dash + Plotly:</strong> the PhisDefense SOC dashboard (KPIs, event categories, SMTP security).",
            "Published with Git, GitHub Pages and Render as public case studies."
          ]
        }
      ],
      close: "Across both labs this turned raw logs and API exports into dashboards and reports a reviewer can actually read.",
      tags: ["Python", "PowerShell Basics", "REST APIs", "pandas", "Streamlit", "Altair", "Dash", "Git"]
    },

    "Security Methodology": {
      kicker: "06 · How I work",
      lead: "A repeatable, evidence-driven approach applied to every task — the habit that ties all the technical skills together.",
      sections: [
        {
          title: "The method",
          items: [
            "<strong>Validate, don't assume:</strong> test every control and capture proof.",
            "<strong>Document everything:</strong> technical docs and clear incident reports.",
            "<strong>Handle data responsibly:</strong> sanitize before anything is made public — no keys, credentials, raw logs or sensitive IPs.",
            "<strong>Stay risk-aware:</strong> anomaly detection and fault diagnosis baked into the process."
          ]
        }
      ],
      close: "It's the reason the public PhisDefense case study contains only sanitized datasets and evidence.",
      tags: ["Technical Documentation", "Incident Reporting", "Defensive Validation", "Data Sanitization", "Risk Awareness"]
    },

    "Cybersecurity Master's Degree": {
      kicker: "Oct 2025 – Jun 2026 · DigitechFP (Barcelona, distancia)",
      lead: "Official Spanish specialization course — <strong>Curso de Especialización en Ciberseguridad en Entornos de las Tecnologías de la Información</strong> (Real Decreto 479/2020) — completed with a final grade of <strong>7.35</strong>.",
      modules: [
        { code: "5021", name: "Incidentes de ciberseguridad", hours: 99, grade: 7 },
        { code: "5022", name: "Fortalecimiento de redes y sistemas", hours: 132, grade: 8 },
        { code: "5023", name: "Puesta en producción segura", hours: 99, grade: 8 },
        { code: "5024", name: "Análisis forense informático", hours: 99, grade: 8 },
        { code: "5025", name: "Hacking ético", hours: 99, grade: 5 },
        { code: "5026", name: "Normativa de ciberseguridad", hours: 66, grade: 8 },
        { code: "C087", name: "Proyecto de ciberseguridad en entornos de las TI", hours: 126, grade: 8 }
      ],
      sections: [
        {
          title: "What each module builds",
          items: [
            "<strong>Incident handling:</strong> detect, respond to and document security incidents.",
            "<strong>Network & system hardening:</strong> bastioning, secure configuration and defense in depth.",
            "<strong>Secure deployment:</strong> shipping software and services securely (secure SDLC, DevSecOps basics).",
            "<strong>Digital forensics:</strong> evidence acquisition, analysis and chain of custody.",
            "<strong>Ethical hacking:</strong> offensive techniques understood from a defender's point of view.",
            "<strong>Regulation:</strong> GDPR/LOPDGDD, ENS and the legal framework around security."
          ]
        }
      ],
      close: "The capstone project (C087) became the PhisDefense SOC & Email Security Lab.",
      tags: ["Incident response", "Hardening", "Forensics", "Secure deployment", "Ethical hacking", "Compliance"]
    },

    "Telecommunications and Computer Systems": {
      kicker: "Sep 2022 – Jun 2024 · IES Universidad Laboral",
      lead: "<strong>Técnico Superior en Sistemas de Telecomunicaciones e Informáticos</strong> (higher vocational degree, Real Decreto 883/2011) — the technical grounding that makes the security work solid.",
      sections: [
        {
          title: "Core modules of the degree",
          items: [
            "Sistemas informáticos y redes locales.",
            "Redes telemáticas.",
            "Configuración de infraestructuras de sistemas de telecomunicaciones.",
            "Elementos y técnicas/procesos en infraestructuras de telecomunicaciones.",
            "Sistemas de radiocomunicaciones y de telefonía fija y móvil.",
            "Sistemas de producción audiovisual e integrados / hogar digital.",
            "Gestión de proyectos de instalaciones de telecomunicaciones."
          ]
        },
        {
          title: "What I took from it into security",
          items: [
            "Real understanding of networking, connectivity and infrastructure.",
            "Hands-on installation, configuration, maintenance and troubleshooting.",
            "Project management and structured technical documentation."
          ]
        }
      ],
      tags: ["Networking", "TCP/IP", "Infrastructure", "Radiocomms", "Telephony", "Project management"]
    },

    "Analysis and documentation": {
      kicker: "Transferable experience",
      lead: "Skills from earlier technical roles that map straight onto SOC work — the analytical muscle behind the security knowledge.",
      sections: [
        {
          title: "What transfers to a SOC",
          items: [
            "<strong>Anomaly detection:</strong> spotting what deviates from a known-good baseline.",
            "<strong>Fault diagnosis:</strong> isolating root cause quickly and under pressure.",
            "<strong>Structured reporting:</strong> evidence-based write-ups other people can act on.",
            "<strong>Quality checks:</strong> methodical verification and attention to detail."
          ]
        }
      ],
      close: "A SOC analyst spends their day doing exactly this — just with security events instead of technical faults.",
      tags: ["Anomaly detection", "Fault diagnosis", "Reporting", "Documentation", "Attention to detail"]
    },

    "Certifications and hands-on labs": {
      kicker: "Continuous learning",
      lead: "An active networking → SOC → Blue Team path, mixing recognized certifications with constant hands-on lab practice.",
      sections: [
        {
          title: "Progress",
          items: [
            "<strong>Completed:</strong> CCNA — Introduction to Networks (Cisco Networking Academy).",
            "<strong>In progress:</strong> TryHackMe SOC Analyst Level 1 learning path.",
            "<strong>Planned:</strong> Blue Team Level 1 (BTL1)."
          ]
        },
        {
          title: "Ongoing practice",
          items: [
            "Regular hands-on labs on real and simulated environments.",
            "Security-monitoring and detection exercises.",
            "Building and documenting home-lab projects like PhisDefense."
          ]
        }
      ],
      tags: ["CCNA ITN", "SOC Analyst L1", "BTL1 path", "Hands-on labs", "Security monitoring"]
    },

    "CCNA: Introduction to Networks": {
      kicker: "Completed · Cisco Networking Academy",
      lead: "The first CCNA course — networking fundamentals that every defender needs before they can protect traffic.",
      sections: [
        {
          title: "What it covers",
          items: [
            "The TCP/IP and OSI models and how data actually moves.",
            "IPv4/IPv6 addressing and subnetting.",
            "Ethernet, switching and basic routing concepts.",
            "Building and troubleshooting a small network, hands-on."
          ]
        }
      ],
      close: "Why it matters for security: you can't defend, monitor or investigate traffic you don't fully understand.",
      tags: ["TCP/IP", "OSI", "Subnetting", "Routing", "Switching", "Troubleshooting"]
    },

    "SOC Analyst Level 1": {
      kicker: "In progress · TryHackMe",
      lead: "A hands-on SOC analyst learning path focused on the practical, day-one skills of a Tier-1 analyst.",
      sections: [
        {
          title: "Focus areas",
          items: [
            "SOC fundamentals and the analyst workflow.",
            "Alert triage and log analysis on realistic data.",
            "SIEM concepts, threat intelligence and network security monitoring.",
            "Endpoint and phishing-analysis basics."
          ]
        }
      ],
      close: "Directly reinforces the monitoring and triage work already demonstrated in PhisDefense.",
      tags: ["SOC fundamentals", "Alert triage", "Log analysis", "SIEM", "Threat intel", "Blue Team"]
    },

    "Blue Team Level 1": {
      kicker: "Planned · Security Blue Team (BTL1)",
      lead: "A recognized, fully hands-on Blue Team certification — the next milestone on the defensive path.",
      sections: [
        {
          title: "Domains it validates",
          items: [
            "Phishing analysis and email-threat investigation.",
            "SIEM: building queries and hunting through logs.",
            "Incident response methodology end to end.",
            "Digital forensics and threat intelligence.",
            "Security-operations fundamentals."
          ]
        }
      ],
      close: "Assessed with a practical, 24-hour exam-in-a-lab — proof of real investigation skill, not just theory. A natural fit with the SOC and email-security work already done.",
      tags: ["Phishing analysis", "SIEM", "Incident response", "Forensics", "Threat intel"]
    }
  };

  const overlay = document.createElement("div");
  overlay.className = "card-zoom-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML =
    '<button class="card-zoom-close" aria-label="Close">✕</button>' +
    '<div class="card-zoom-stage">' +
    '<div class="card-zoom-original"></div>' +
    '<div class="card-zoom-detail"></div>' +
    "</div>";
  document.body.appendChild(overlay);

  const original = overlay.querySelector(".card-zoom-original");
  const detail = overlay.querySelector(".card-zoom-detail");
  const closeBtn = overlay.querySelector(".card-zoom-close");

  function headingOf(card) {
    const h = card.querySelector("h3");
    return h ? h.textContent.trim() : "";
  }

  function buildDetail(heading) {
    const d = DETAILS[heading];
    if (!d) {
      return "<h3>" + heading + "</h3><p>More detail coming soon.</p>";
    }
    let html = "";
    if (d.kicker) html += '<p class="detail-kicker">' + d.kicker + "</p>";
    html += "<h3>" + heading + "</h3>";
    if (d.lead) html += '<p class="detail-lead">' + d.lead + "</p>";

    if (d.paras) {
      html += d.paras.map((p) => "<p>" + p + "</p>").join("");
    }

    // module table (for the degrees) with hours and grades
    if (d.modules && d.modules.length) {
      html += '<div class="detail-modules">';
      d.modules.forEach((m) => {
        html +=
          '<div class="detail-module">' +
          '<span class="dm-code">' + m.code + "</span>" +
          '<span class="dm-name">' + m.name + "</span>" +
          '<span class="dm-hours">' + m.hours + " h</span>" +
          '<span class="dm-grade">' + m.grade + "</span>" +
          "</div>";
      });
      html += "</div>";
    }

    // grouped bullet sections
    if (d.sections) {
      d.sections.forEach((s) => {
        if (s.title) html += "<h4>" + s.title + "</h4>";
        if (s.items && s.items.length) {
          html += "<ul>" + s.items.map((it) => "<li>" + it + "</li>").join("") + "</ul>";
        }
      });
    }

    // legacy flat bullet list
    if (d.points && d.points.length) {
      html += "<ul>" + d.points.map((p) => "<li>" + p + "</li>").join("") + "</ul>";
    }

    if (d.close) html += '<p class="detail-close">' + d.close + "</p>";

    if (d.tags && d.tags.length) {
      html += '<div class="detail-tags">' + d.tags.map((t) => "<span>" + t + "</span>").join("") + "</div>";
    }
    return html;
  }

  function settle() {
    overlay.classList.remove("spin");
    overlay.classList.add("settled");
  }

  function openZoom(card) {
    const heading = headingOf(card);

    const clone = card.cloneNode(true);
    clone.classList.remove("visible", "lit", "reveal", "zoomable");
    clone.removeAttribute("style");
    original.innerHTML = "";
    original.appendChild(clone);

    // re-establish the source section context so id-scoped styles
    // (#training .training-clean-card, #skills .skill-category, ...) apply
    // to the cloned card again — otherwise it loses its padding/pills/etc.
    const section = card.closest("section");
    original.id = section ? section.id : "";

    const sheen = document.createElement("span");
    sheen.className = "glass-sheen";
    clone.appendChild(sheen);

    detail.innerHTML = buildDetail(heading);

    overlay.classList.add("open");
    overlay.classList.remove("settled");

    if (prefersReducedMotion) {
      settle();
      return;
    }

    overlay.classList.add("spin");
    original.addEventListener("animationend", settle, { once: true });
    setTimeout(settle, 1100); // fallback if animationend doesn't fire
  }

  function closeZoom() {
    overlay.classList.remove("open", "settled", "spin");
    original.id = "";
  }

  cards.forEach((card) => {
    card.classList.add("zoomable");
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, img, input, summary, canvas")) {
        return;
      }
      openZoom(card);
    });
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.classList.contains("card-zoom-stage")) {
      closeZoom();
    }
  });
  closeBtn.addEventListener("click", closeZoom);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("open")) {
      closeZoom();
    }
  });

  window.__zoomDebug = { openZoom, settle, DETAILS, overlay };
})();
