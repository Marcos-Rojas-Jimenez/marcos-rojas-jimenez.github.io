document.body.classList.add("js-ready");

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

const typingText = document.getElementById("typingText");

const commands = [
  "analyze_logs --source syslog",
  "validate_dmarc --policy reject",
  "monitor_soc --events 190",
  "deploy_dashboard --live"
];

let commandIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typingText) {
    return;
  }

  const current = commands[commandIndex];

  if (!deleting) {
    typingText.textContent = current.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typingText.textContent = current.slice(0, charIndex - 1);
    charIndex -= 1;

    if (charIndex === 0) {
      deleting = false;
      commandIndex = (commandIndex + 1) % commands.length;
    }
  }

  setTimeout(typeLoop, deleting ? 38 : 72);
}

typeLoop();

const tabs = document.querySelectorAll(".skill-tab");
const panels = document.querySelectorAll(".skill-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));

    tab.classList.add("active");

    const panel = document.getElementById(target);
    if (panel) {
      panel.classList.add("active");
    }
  });
});

const revealElements = document.querySelectorAll(".reveal");

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

revealElements.forEach((element) => {
  revealObserver.observe(element);
});
