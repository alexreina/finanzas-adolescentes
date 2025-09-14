document.addEventListener("DOMContentLoaded", () => {
  const retoButton = document.getElementById("reto-button");

  if (retoButton) {
    retoButton.addEventListener("click", () => {
      markMissionComplete(3); // Mission ID for "el dinero que se va"
      unlockBadge("ant_killer");

      const final = document.getElementById("final-section");
      const nextBtn = document.getElementById("next-btn");
      const hint = document.getElementById("unlock-hint");

      // Unlock the section visually
      final.classList.remove("bg-gray-300", "text-gray-500");
      final.classList.add("bg-gradient-to-r", "from-purple-600", "to-teal-500", "text-white", "fade-unlock");

      nextBtn.classList.remove("opacity-50", "pointer-events-none");
      nextBtn.classList.add("hover:bg-gray-100", "transition");

      hint.classList.add("hidden");

      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.7 }
      });

      // Toast notification
      const toast = document.createElement("div");
      toast.textContent = "🎉 ¡Reto completado! Ahora puedes continuar a la siguiente misión.";
      toast.className = "fixed bottom-5 right-5 bg-purple-600 text-white px-4 py-2 rounded shadow-lg";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  }
});
