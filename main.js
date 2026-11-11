"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ---------- Page loader ---------- */
  const finishLoading = () => body.classList.add("is-loaded");
  window.addEventListener("load", finishLoading);
  window.setTimeout(finishLoading, 2600);

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      body.classList.toggle("nav-open");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("nav-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        body.classList.remove("nav-open");
      }
    });
  }

  /* ---------- Reveal elements on scroll ---------- */
  const revealItems = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Hero device tilt ---------- */
  const hero = document.getElementById("hero");
  const deviceStack = document.getElementById("deviceStack");

  if (hero && deviceStack && window.matchMedia("(hover: hover)").matches) {
    const moveStack = (event) => {
      const rect = hero.getBoundingClientRect();
      const percentX = (event.clientX - rect.left) / rect.width - 0.5;
      const percentY = (event.clientY - rect.top) / rect.height - 0.5;

      deviceStack.style.setProperty("--ry", `${(percentX * 12).toFixed(2)}deg`);
      deviceStack.style.setProperty("--rx", `${(-percentY * 12).toFixed(2)}deg`);
    };

    const resetStack = () => {
      deviceStack.style.setProperty("--ry", "0deg");
      deviceStack.style.setProperty("--rx", "0deg");
    };

    hero.addEventListener("mousemove", moveStack);
    hero.addEventListener("mouseleave", resetStack);
  }

  /* ---------- Background particle motion ---------- */
  const canvas = document.getElementById("bgCanvas");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles = [];
    const maxLinkDistance = 135;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const createParticles = () => {
      const count = Math.min(85, Math.max(34, Math.floor((width * height) / 17000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.45 + 0.25,
      }));
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        particle.x = Math.min(Math.max(particle.x, 0), width);
        particle.y = Math.min(Math.max(particle.y, 0), height);
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        ctx.beginPath();
        ctx.fillStyle = `rgba(124, 58, 237, ${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);

          if (distance < maxLinkDistance) {
            const lineAlpha = (1 - distance / maxLinkDistance) * 0.28;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(109, 40, 217, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      updateParticles();
      drawParticles();
      window.requestAnimationFrame(animateParticles);
    };

    const resetMotion = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener("resize", resetMotion);
    resizeCanvas();
    createParticles();
    animateParticles();
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const recipientEmail = "brbredobordon@gmail.com";

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formStatus.textContent = "يرجى إكمال الحقول المطلوبة بشكل صحيح.";
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim() || "مشروع جديد";
      const message = String(formData.get("message") || "").trim();

      const mailSubject = `رسالة من ${name} | ${subject}`;
      const mailBody = `الاسم: ${name}\nالبريد: ${email}\nنوع المشروع: ${subject}\n\n${message}`;

      formStatus.textContent = "جارٍ فتح برنامج البريد لإرسال الرسالة...";

      window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(
        mailSubject
      )}&body=${encodeURIComponent(mailBody)}`;

      window.setTimeout(() => {
        formStatus.textContent = "لو لم يُفتح البريد تلقائياً، استخدم رابط البريد في قسم التواصل.";
        contactForm.reset();
      }, 1500);
    });
  }

  /* ---------- Footer year ---------- */
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
});
