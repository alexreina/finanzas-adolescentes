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
    label: "Dinero consciente",
    description: "¿por qué hablar de dinero?"
  },
  mision_2: {
    emoji: "👛",
    label: "Cazador de ingresos", 
    description: "el que entra"
  },
  mision_3: {
    emoji: "💳",
    label: "Defensor del débito",
    description: "el que se va"
  },
  mision_4: {
    emoji: "🌱",
    label: "Ahorro aventurero",
    description: "¿cómo consigo que crezca?"
  },
  mision_5: {
    emoji: "🛡️",
    label: "Guardián de seguridad",
    description: "compras seguras"
  },
  mision_6: {
    emoji: "📉",
    label: "Domador de deudas",
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

    // Add tooltip on hover
    if (isUnlocked) {
      div.title = `Completado: ${badge.description}`;
    } else if (isCurrentMission) {
      div.title = `Misión actual: ${badge.description}`;
    } else {
      div.title = `Misión futura: ${badge.description}`;
    }

    badgesContainer.appendChild(div);
  }
  
  container.appendChild(badgesContainer);
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
  
  // Also refresh badges when localStorage changes (for debugging)
  window.addEventListener('storage', (e) => {
    if (e.key === 'progress') {
      renderMissionBadges(currentMission);
    }
  });
});
