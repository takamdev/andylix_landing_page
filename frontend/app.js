const API_BASE = "https://andylix-landing-page.vercel.app";

document.getElementById("year").textContent = new Date().getFullYear();

/* Smooth scroll button */
document.getElementById("scrollFeatures").addEventListener("click", () => {
   document.getElementById("features").scrollIntoView({ behavior: "smooth" });
});

/* Mobile menu */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
   navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((a) => {
   a.addEventListener("click", () => navLinks.classList.remove("open"));
});

/* Scroll reveal */
const revealEls = document.querySelectorAll(
   ".hero, #features, #how, #survey, #contact, .footer, .card"
);
revealEls.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
   (entries) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) entry.target.classList.add("in");
      });
   },
   { threshold: 0.12 }
);

revealEls.forEach((el) => io.observe(el));

/* Helpers */
async function postJSON(url, payload) {
   const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
   const data = await res.json().catch(() => ({}));
   return { res, data };
}

/* WAITLIST -> Backend */
const waitlistForm = document.getElementById("waitlistForm");
const formMsg = document.getElementById("formMsg");

waitlistForm.addEventListener("submit", async (e) => {
   e.preventDefault();
   formMsg.textContent = "Envoi en cours...";

   const fd = new FormData(waitlistForm);
   const payload = {
      name: (fd.get("name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      role: fd.get("role"),
   };

   try {
      const { res, data } = await postJSON(`${API_BASE}/api/waitlist`, payload);

      if (!res.ok) {
         formMsg.textContent = ` ${data.error || "Erreur serveur"}`;
         return;
      }

      waitlistForm.reset();
      formMsg.textContent = "✅ Inscription enregistrée. Merci !";
   } catch (err) {
      formMsg.textContent =
         "❌ Erreur réseau. Vérifie que le backend tourne sur localhost:4000.";
   }
});

/* SURVEY -> Backend */
const surveyForm = document.getElementById("surveyForm");
const surveyMsg = document.getElementById("surveyMsg");
const serviceInput = document.getElementById("serviceInput");

let selectedService = "";

// Service chips selection (1 choice)
document.querySelectorAll(".chip.pick").forEach((btn) => {
   btn.addEventListener("click", () => {
      document
         .querySelectorAll(".chip.pick")
         .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedService = btn.dataset.value;
      serviceInput.value = selectedService;
   });
});

surveyForm.addEventListener("submit", async (e) => {
   e.preventDefault();
   surveyMsg.textContent = "Envoi en cours...";

   const fd = new FormData(surveyForm);
   const payload = {
      persona: fd.get("persona"),
      frequency: fd.get("frequency"),
      pain: fd.get("pain"),
      intent: fd.get("intent"),
      service: fd.get("service"),
      comment: (fd.get("comment") || "").trim(),
   };

   if (!payload.service) {
      surveyMsg.textContent = "❌ Choisis un service (clic sur un bouton).";
      return;
   }

   try {
      const { res, data } = await postJSON(`${API_BASE}/api/survey`, payload);

      if (!res.ok) {
         surveyMsg.textContent = `❌ ${data.error || "Erreur serveur"}`;
         return;
      }

      surveyForm.reset();
      surveyMsg.textContent = "✅ Merci ! Sondage enregistré.";

      // reset chips
      document
         .querySelectorAll(".chip.pick")
         .forEach((b) => b.classList.remove("selected"));
      selectedService = "";
      serviceInput.value = "";
   } catch (err) {
      surveyMsg.textContent =
         "❌ Erreur réseau. Vérifie que le backend tourne sur localhost:4000.";
   }
});

/* ===== Tilt effect for visuals (hover + touch) ===== */
function setupTilt(el) {
   const strength = Number(el.dataset.strength || 10);

   const reset = () => {
      el.style.transform = "";
   };

   const move = (clientX, clientY) => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width; // 0..1
      const y = (clientY - r.top) / r.height; // 0..1

      const rx = (y - 0.5) * -strength; // rotateX
      const ry = (x - 0.5) * strength; // rotateY

      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
   };

   // mouse
   el.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
   el.addEventListener("mouseleave", reset);

   // touch
   el.addEventListener(
      "touchmove",
      (e) => {
         if (!e.touches?.length) return;
         const t = e.touches[0];
         move(t.clientX, t.clientY);
      },
      { passive: true }
   );

   el.addEventListener("touchend", reset);
}

document.querySelectorAll(".tilt").forEach(setupTilt);
