document.addEventListener("DOMContentLoaded", () => {
  const retoButton = document.getElementById("reto-btn") || document.getElementById("reto-button");

  if (retoButton) {
    // Ensure reto button starts disabled (quiz system will enable it)
    disableRetoButton();
    
    retoButton.addEventListener("click", () => {
      // Determine mission ID based on current page
      const currentPage = window.location.pathname;
      let missionId, pinId;
      
      if (currentPage.includes("domina-tu-dinero-desde-el-primer-euro")) {
        missionId = 1;
        pinId = "mision_1";
      } else if (currentPage.includes("haz-que-entre-mas-dinero-sin-magia-ni-suerte")) {
        missionId = 2;
        pinId = "mision_2";
      } else if (currentPage.includes("tu-dinero-se-esfuma-y-ni-te-das-cuenta")) {
        missionId = 3;
        pinId = "mision_3";
      } else if (currentPage.includes("haz-que-tu-dinero-crezca-mientras-haces-otra-cosa")) {
        missionId = 4;
        pinId = "mision_4";
      } else if (currentPage.includes("aprende-a-comprar-sin-que-te-vendan-la-moto")) {
        missionId = 5;
        pinId = "mision_5";
      } else if (currentPage.includes("lo-barato-sale-caro-cuando-pagas-con-deuda")) {
        missionId = 6;
        pinId = "mision_6";
      } else {
        missionId = 1; // default
        pinId = "mision_1";
      }
      
      markMissionComplete(missionId);
      
      // Enable final CTA section FIRST (before name collection check)
      const finalCTA = document.getElementById("takeaway");
      if (finalCTA) {
        finalCTA.classList.remove("opacity-50", "pointer-events-none");
        finalCTA.classList.add("opacity-100");
      } else {
        // Fallback: try again after a short delay
        setTimeout(() => {
          const retryCTA = document.getElementById("takeaway");
          if (retryCTA) {
            retryCTA.classList.remove("opacity-50", "pointer-events-none");
            retryCTA.classList.add("opacity-100");
          }
        }, 100);
      }
      
      // trigger name collection for any mission completion if no name exists
      if (typeof loadProgress === 'function') {
        const progress = loadProgress();
        if (!progress.userName && typeof showNameCollectionModal === 'function') {
          // Show name collection modal first, then unlock badge after name is entered
          showNameCollectionModal();
          return; // Exit early, badge will be unlocked after name is submitted
        }
      }
      
      // If user already has a name, unlock the badge immediately
      unlockPin(pinId);

      const hint = document.getElementById("reto-hint");

      // Get user name for personalized message
      let userName = '';
      if (typeof loadProgress === 'function') {
        const progress = loadProgress();
        userName = progress.userName ? `, ${progress.userName}` : '';
      }

      // Update button
      retoButton.innerHTML = '¡completado! 🎉';
      retoButton.classList.add('bg-green-500', 'hover:bg-green-600');
      retoButton.classList.remove('bg-white', 'text-purple-600');
      retoButton.classList.add('text-white');
      retoButton.disabled = true;

      // Update hint
      if (hint) {
        hint.innerHTML = `✅ ¡misión completada${userName}! tu pin está desbloqueado arriba.`;
        hint.classList.remove('text-purple-200');
        hint.classList.add('text-green-200');
      }

      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.7 }
      });

      // Refresh badges to show personalized names
      if (typeof refreshBadges === 'function') {
        setTimeout(() => refreshBadges(), 1000);
      }

      // Toast notification
      const toast = document.createElement("div");
      toast.textContent = `🎉 ¡reto completado${userName}! ahora puedes continuar a la siguiente misión.`;
      toast.className = "fixed bottom-5 right-5 bg-purple-600 text-white px-4 py-2 rounded shadow-lg";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  }
});

// Enable reto button when all quiz questions are answered
function enableRetoButton() {
  const retoButton = document.getElementById("reto-btn") || document.getElementById("reto-button");
  const retoHint = document.getElementById("reto-hint");
  
  if (retoButton) {
    retoButton.disabled = false;
    retoButton.classList.remove('opacity-50', 'cursor-not-allowed');
  }
  
  if (retoHint) {
    retoHint.classList.add('hidden');
  }
}

// Disable reto button initially
function disableRetoButton() {
  const retoButton = document.getElementById("reto-btn") || document.getElementById("reto-button");
  const retoHint = document.getElementById("reto-hint");
  
  if (retoButton) {
    retoButton.disabled = true;
    retoButton.classList.add('opacity-50', 'cursor-not-allowed');
  }
  
  if (retoHint) {
    retoHint.classList.remove('hidden');
  }
}
