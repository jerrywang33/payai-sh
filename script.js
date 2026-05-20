const canvas = document.querySelector("#agent-field");
const context = canvas.getContext("2d");
const form = document.querySelector(".waitlist-form");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let particles = [];
let animationFrame = 0;

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(42, Math.min(88, Math.floor(width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    radius: index % 7 === 0 ? 2.2 : 1.35,
    color: index % 5 === 0 ? "#f0c45a" : index % 3 === 0 ? "#64c7f0" : "#6fe7b7",
  }));
}

function draw() {
  context.clearRect(0, 0, width, height);

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 142) {
        context.globalAlpha = (1 - distance / 142) * 0.26;
        context.strokeStyle = "#f7f3ea";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  context.globalAlpha = 1;
  for (const particle of particles) {
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  animationFrame = requestAnimationFrame(draw);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const email = new FormData(form).get("email");
  const button = form.querySelector("button");

  if (!email) {
    form.querySelector("input").focus();
    return;
  }

  button.textContent = "Opening email...";
  const subject = encodeURIComponent("PayAI early access");
  const body = encodeURIComponent(`Please add me to the PayAI early access list.\n\nEmail: ${email}`);
  window.location.href = `mailto:lang6.lv@gmail.com?subject=${subject}&body=${body}`;
}

window.addEventListener("resize", resize);
form.addEventListener("submit", handleFormSubmit);

resize();

if (!prefersReducedMotion.matches) {
  draw();
}

document.addEventListener("visibilitychange", () => {
  if (prefersReducedMotion.matches) return;

  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else {
    draw();
  }
});
