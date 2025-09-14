/* ==========
   Progress System for Financial Literacy Course
   Works across all modules
   ========== */

function loadProgress() {
  return JSON.parse(localStorage.getItem("progress") || "{}");
}

function saveProgress(progress) {
  localStorage.setItem("progress", JSON.stringify(progress));
}

function addPoints(amount) {
  const progress = loadProgress();
  progress.points = (progress.points || 0) + amount;
  saveProgress(progress);
}

function markModuleComplete(moduleId) {
  const progress = loadProgress();
  progress.modulesCompleted = progress.modulesCompleted || [];
  if (!progress.modulesCompleted.includes(moduleId)) {
    progress.modulesCompleted.push(moduleId);
    saveProgress(progress);
  }
}

function unlockBadge(badgeId) {
  const progress = loadProgress();
  progress.badges = progress.badges || [];
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    saveProgress(progress);
  }
}

/* ==========
   BADGE DEFINITIONS
   ========== */
const BADGES = {
  detective_gastos: {
    emoji: "🔍",
    label: "Detective de gastos",
    description: "entiendes en qué se te va tu dinero"
  },
  ant_killer: {
    emoji: "🐜",
    label: "Atrapahormigas",
    description: "controlaste tus pequeños gastos diarios durante una semana"
  },
  debit_defender: {
    emoji: "💳",
    label: "Defensor del débito",
    description: "aprendiste a usar la tarjeta correctamente"
  },
  ahorro_aventurero: {
    emoji: "🐷",
    label: "Ahorro aventurero",
    description: "completaste tu primer objetivo de ahorro"
  },
  inversion_explorador: {
    emoji: "📈",
    label: "Explorador de inversiones",
    description: "descubriste cómo funciona la magia del interés compuesto"
  },
  seguridad_guardian: {
    emoji: "🛡️",
    label: "Guardián de seguridad",
    description: "haces compras seguras y proteges tu dinero online"
  },
  deuda_domador: {
    emoji: "🪤",
    label: "Domador de deudas",
    description: "comprendes por qué el dinero prestado nunca es gratis"
  },
  curso_completado: {
    emoji: "🏆",
    label: "Maestro de las finanzas",
    description: "completaste todas las misiones del curso"
  }
};

/* ==========
   RENDER BADGES
   ========== */
function renderModuleBadges(moduleId) {
  const progress = loadProgress();
  const container = document.getElementById("module-badges");
  if (!container) return;

  container.innerHTML = "";

  // Define which badges belong to which module
  const moduleBadgeMap = {
    "modulo-3": ["detective_gastos", "ant_killer", "debit_defender"],
    "modulo-4": ["ahorro_aventurero", "inversion_explorador"],
    "modulo-5": ["seguridad_guardian"],
    "modulo-6": ["deuda_domador"],
  };

  const relevantBadges = moduleBadgeMap[moduleId] || [];
  const earnedBadges = (progress.badges || []);

  relevantBadges.forEach(badgeId => {
    const badge = BADGES[badgeId];
    if (!badge) return;

    const isUnlocked = earnedBadges.includes(badgeId);

    const div = document.createElement("div");
    div.className = `
      p-2 rounded shadow text-center text-xs w-20 transition
      ${isUnlocked ? "bg-purple-100" : "bg-gray-100 opacity-50"}
    `;
    
    div.innerHTML = `
      <div class="text-2xl">
        ${isUnlocked ? badge.emoji : "🔒"}
      </div>
      <p class="mt-1 font-medium ${isUnlocked ? "" : "text-gray-500"}">
        ${badge.label}
      </p>
    `;

    container.appendChild(div);
  });
}


document.addEventListener("DOMContentLoaded", renderModuleBadges);
