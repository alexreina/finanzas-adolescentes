/* ==========
   Progress System for Financial Literacy Course
   Works across all misiones
   ========== */

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("progress") || "{}");
  } catch (error) {
    console.error("Error loading progress:", error);
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem("progress", JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

function addPoints(amount) {
  const progress = loadProgress();
  progress.points = (progress.points || 0) + amount;
  saveProgress(progress);
}

function markMissionComplete(missionId) {
  const progress = loadProgress();
  progress.missionsCompleted = progress.missionsCompleted || [];
  if (!progress.missionsCompleted.includes(missionId)) {
    progress.missionsCompleted.push(missionId);
    saveProgress(progress);
  }
}

function unlockBadge(badgeId) {
  const progress = loadProgress();
  progress.badges = progress.badges || [];
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    saveProgress(progress);
    
    // Trigger badge unlock animation
    animateBadgeUnlock(badgeId);
    
    // Update navigation to reflect new unlocks
    updateNavigation();
    
    return true; // Badge was newly unlocked
  }
  return false; // Badge was already unlocked
}

function animateBadgeUnlock(badgeId) {
  const badge = BADGES[badgeId];
  if (!badge) return;

  // Create floating badge animation
  const floatingBadge = document.createElement('div');
  floatingBadge.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-full shadow-2xl animate-pulse';
  floatingBadge.innerHTML = `
    <div class="text-4xl mb-2">${badge.emoji}</div>
    <div class="text-sm font-bold text-center">${badge.label}</div>
    <div class="text-xs text-center opacity-90 mt-1">¡Desbloqueado!</div>
  `;
  
  document.body.appendChild(floatingBadge);
  
  // Animate and remove
  setTimeout(() => {
    floatingBadge.style.transform = 'translate(-50%, -50%) scale(1.2)';
    floatingBadge.style.opacity = '0';
    floatingBadge.style.transition = 'all 0.5s ease-out';
    
    setTimeout(() => {
      document.body.removeChild(floatingBadge);
      // Re-render badges to show the new unlock
      const currentMission = document.querySelector('[data-mission-id]')?.dataset.missionId || "mision-3";
      renderMissionBadges(currentMission);
    }, 500);
  }, 2000);
}

/* ==========
   BADGE DEFINITIONS
   ========== */
const BADGES = {
  // Un badge por misión completada con nombres descriptivos
  mision_1: {
    emoji: "💸",
    label: "dinero consciente",
    description: "¿por qué hablar de dinero?"
  },
  mision_2: {
    emoji: "👛",
    label: "cazador de ingresos", 
    description: "el que entra"
  },
  mision_3: {
    emoji: "💳",
    label: "maestro del gasto",
    description: "el que se va"
  },
  mision_4: {
    emoji: "🌱",
    label: "constructor de riqueza",
    description: "¿cómo consigo que crezca?"
  },
  mision_5: {
    emoji: "🛡️",
    label: "guardián de seguridad",
    description: "comprar evitando las trampas y los timos"
  },
  mision_6: {
    emoji: "📉",
    label: "domador de deudas",
    description: "deudas"
  }
};

/* ==========
   RENDER BADGES - GAMIFIED VERSION
   ========== */
function renderMissionBadges(missionId) {
  const progress = loadProgress();
  const container = document.getElementById("mission-badges");
  if (!container) return;

  container.innerHTML = "";

  const earnedBadges = (progress.badges || []);
  const currentMission = parseInt(missionId?.replace('mision-', '') || '3');


  // Show all mission badges (1-6)
  const badgesContainer = document.createElement("div");
  badgesContainer.className = "flex flex-wrap justify-center gap-3";
  
  // Show badges for all 6 missions
  for (let i = 1; i <= 6; i++) {
    const badgeId = `mision_${i}`;
    const badge = BADGES[badgeId];
    if (!badge) continue;

    const isUnlocked = earnedBadges.includes(badgeId);
    const isCurrentMission = i === currentMission;

    const div = document.createElement("div");
    div.className = `
      relative p-3 rounded-xl shadow-lg text-center transition-all duration-300 min-w-[80px]
      ${isUnlocked ? 
        'bg-gradient-to-br from-yellow-400 to-orange-500 text-white transform hover:scale-105 shadow-xl' : 
        isCurrentMission ?
          'bg-white bg-opacity-30 text-purple-100 border-2 border-yellow-400' :
          'bg-white bg-opacity-20 text-purple-200 border border-purple-300'
      }
    `;
    
    div.innerHTML = `
      <div class="text-2xl mb-2">
        ${badge.emoji}
      </div>
      <p class="font-semibold text-xs leading-tight">
        ${isUnlocked ? badge.label : (isCurrentMission ? "En progreso" : "Pendiente")}
      </p>
      ${isUnlocked ? 
        '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><span class="text-white text-xs">✓</span></div>' : 
        isCurrentMission ?
          '<div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"><span class="text-white text-xs">!</span></div>' :
          '<div class="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-white flex items-center justify-center"><span class="text-white text-xs">?</span></div>'
      }
    `;

    // Add interactive behavior and tooltips
    if (isUnlocked) {
      // Unlocked badges link to their mission page
      div.onclick = () => window.location.href = getMissionUrl(i);
      div.style.cursor = 'pointer';
      div.title = `Ir a ${badge.description}`;
      
      // Add hover effect for clickable badges
      div.addEventListener('mouseenter', () => {
        div.style.transform = 'scale(1.05)';
        div.style.transition = 'transform 0.2s ease';
      });
      div.addEventListener('mouseleave', () => {
        div.style.transform = 'scale(1)';
      });
    } else if (isCurrentMission) {
      // Current mission badge links to current page (subtle feedback)
      div.onclick = () => window.location.href = window.location.href;
      div.style.cursor = 'pointer';
      div.title = `Misión actual: ${badge.description}`;
      
      // Add hover effect for current mission
      div.addEventListener('mouseenter', () => {
        div.style.transform = 'scale(1.05)';
        div.style.transition = 'transform 0.2s ease';
      });
      div.addEventListener('mouseleave', () => {
        div.style.transform = 'scale(1)';
      });
    } else {
      // Locked badges show helpful tooltip
      div.title = `Completa misiones anteriores para desbloquear: ${badge.description}`;
    }

    badgesContainer.appendChild(div);
  }
  
  container.appendChild(badgesContainer);
}

function getMissionUrl(missionNumber) {
  const missionUrlMap = {
    1: "el-dinero-mola-mas-cuando-lo-sabes-usar.html",
    2: "que-hacer-para-que-entre-mas-dinero-en-tu-bolsillo.html", 
    3: "controlar-tu-dinero-antes-de-que-desaparezca.html",
    4: "el-truco-para-que-tu-dinero-se-multiplique-solo.html",
    5: "comprar-sin-que-te-timen.html",
    6: "las-deudas-son-el-enemigo-numero-1.html"
  };
  return missionUrlMap[missionNumber] || "index.html";
}

/* ==========
   SMART NAVIGATION
   ========== */
function updateNavigation() {
  const progress = loadProgress();
  const currentMission = getCurrentMission();
  
  // Get all navigation links
  const navLinks = document.querySelectorAll('nav a[href*=".html"]');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const missionNumber = getMissionNumberFromUrl(href);
    
    if (missionNumber) {
      const badgeKey = `mision_${missionNumber}`;
      const isUnlocked = progress.badges && progress.badges.includes(badgeKey);
      const isCurrent = missionNumber === currentMission;
      
      // Remove existing classes
      link.classList.remove('text-purple-700', 'font-bold', 'underline', 'text-gray-400', 'cursor-not-allowed');
      
      if (isCurrent) {
        // Current mission - highlight but don't link
        link.classList.add('text-purple-700', 'font-bold', 'underline');
        link.removeAttribute('href');
        link.style.cursor = 'default';
      } else if (isUnlocked) {
        // Unlocked mission - normal link
        link.classList.add('hover:text-purple-600');
        link.style.cursor = 'pointer';
      } else {
        // Locked mission - disabled state
        link.classList.add('text-gray-400', 'cursor-not-allowed');
        link.removeAttribute('href');
        link.style.cursor = 'not-allowed';
      }
    }
  });
}

function getMissionNumberFromUrl(url) {
  const urlMap = {
    "el-dinero-mola-mas-cuando-lo-sabes-usar.html": 1,
    "que-hacer-para-que-entre-mas-dinero-en-tu-bolsillo.html": 2,
    "controlar-tu-dinero-antes-de-que-desaparezca.html": 3,
    "el-truco-para-que-tu-dinero-se-multiplique-solo.html": 4,
    "comprar-sin-que-te-timen.html": 5,
    "las-deudas-son-el-enemigo-numero-1.html": 6
  };
  return urlMap[url] || null;
}

function getCurrentMission() {
  const body = document.body;
  const missionId = body.getAttribute('data-mission-id');
  if (missionId) {
    return parseInt(missionId.replace('mision-', ''));
  }
  return null;
}

function getBadgesForMission(missionNumber) {
  const missionBadgeMap = {
    1: ["dinero_consciente"],
    2: ["cazador_ingresos"],
    3: ["debit_defender", "detective_gastos", "ant_killer"],
    4: ["ahorro_aventurero", "inversion_explorador"],
    5: ["seguridad_guardian"],
    6: ["deuda_domador", "curso_completado"]
  };
  return missionBadgeMap[missionNumber] || [];
}

function getBadgeMission(badgeId) {
  const badgeMissionMap = {
    "dinero_consciente": 1,
    "cazador_ingresos": 2,
    "detective_gastos": 3,
    "ant_killer": 3,
    "debit_defender": 3,
    "ahorro_aventurero": 4,
    "inversion_explorador": 4,
    "seguridad_guardian": 5,
    "deuda_domador": 6,
    "curso_completado": 6
  };
  return badgeMissionMap[badgeId] || 1;
}


// Function to refresh badge display (useful for debugging or manual refresh)
function refreshBadges() {
  const currentMission = document.body.dataset.missionId || "mision-3";
  renderMissionBadges(currentMission);
}

document.addEventListener("DOMContentLoaded", () => {
  const currentMission = document.body.dataset.missionId || "mision-3";
  renderMissionBadges(currentMission);
  
  // Update navigation based on progress
  updateNavigation();
  
  // Also refresh badges when localStorage changes (for debugging)
  window.addEventListener('storage', (e) => {
    if (e.key === 'progress') {
      renderMissionBadges(currentMission);
      updateNavigation(); // Also update navigation on progress changes
    }
  });
});
