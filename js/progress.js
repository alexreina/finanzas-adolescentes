/* ==========
   Progress System for Financial Literacy Course
   Works across all misiones
   ========== */

function loadProgress() {
  try {
  return JSON.parse(localStorage.getItem("progress") || "{}");
  } catch (error) {
    console.error("Error loading progress:", error);
    return { pins: [], missionsCompleted: [], userName: null };
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
  progress.pins = progress.pins || [];
  if (!progress.pins.includes(badgeId)) {
    progress.pins.push(badgeId);
    saveProgress(progress);
    
    // Trigger badge unlock animation
    animateBadgeUnlock(badgeId);
    
    // Update navigation to reflect new unlocks
    updateNavigation();
    
    return true; // Badge was newly unlocked
  }
  return false; // Badge was already unlocked
}

// Alias for compatibility with existing code
function unlockPin(pinId) {
  return unlockBadge(pinId);
}

function animateBadgeUnlock(badgeId) {
  const badge = PINS[badgeId];
  if (!badge) return;

  // Get personalized name for the badge
  const userName = getUserName();
  const truncatedUserName = userName ? truncateName(userName) : null;
  const personalizedLabel = truncatedUserName ? `${badge.name}<br>${truncatedUserName}` : badge.name;
  
  

  // Create floating badge animation
  const floatingBadge = document.createElement('div');
  floatingBadge.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-full shadow-2xl animate-pulse';
  floatingBadge.innerHTML = `
    <div class="text-4xl mb-2">${badge.icon}</div>
    <div class="text-sm font-bold text-center">${personalizedLabel}</div>
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
      renderMissionPins(currentMission);
    }, 500);
  }, 2000);
}

/* ==========
   BADGE DEFINITIONS
   ========== */
const PINS = {
  // Un badge por misión completada con nombres descriptivos
  mision_1: {
    icon: "💸",
    name: "dinero-consciente",
    description: "¿por qué hablar de dinero?"
  },
  mision_2: {
    icon: "👛",
    name: "genera-ingresos", 
    description: "el que entra"
  },
  mision_3: {
    icon: "💳",
    name: "caza-fugas",
    description: "el que se va"
  },
  mision_4: {
    icon: "🌱",
    name: "multi-x-ingresos",
    description: "¿cómo consigo que crezca?"
  },
  mision_5: {
    icon: "🛡️",
    name: "rompe-trampas",
    description: "comprar evitando las trampas y los timos"
  },
  mision_6: {
    icon: "📉",
    name: "anti-deudas",
    description: "deudas"
  }
};

/* ==========
   RENDER BADGES - GAMIFIED VERSION
   ========== */
function renderMissionPins(missionId) {
  const progress = loadProgress();
  const container = document.getElementById("mission-pins");
  if (!container) return;

  container.innerHTML = "";

  const earnedBadges = (progress.pins || []);
  const currentMission = typeof missionId === 'number' ? missionId : parseInt(missionId?.replace('mision-', '') || '3');

  // Show all mission badges (1-6)
  const badgesContainer = document.createElement("div");
  badgesContainer.className = "badge-container";
  
  // Show badges for all 6 missions
  for (let i = 1; i <= 6; i++) {
    const badgeId = `mision_${i}`;
    const badge = PINS[badgeId];
    if (!badge) continue;

    const isUnlocked = earnedBadges.includes(badgeId);
    const isCurrentMission = i === currentMission;

    const div = document.createElement("div");
    div.className = `badge-item ${isUnlocked ? 'unlocked' : isCurrentMission ? 'current' : 'locked'}`;
    
    // Personalize badge message if user has provided name
    const userName = getUserName();
    const truncatedUserName = userName ? truncateName(userName) : null;
    const personalizedLabel = truncatedUserName && isUnlocked ? `${badge.name}<br>${truncatedUserName}` : badge.name;
    
    
    
    div.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-label">${isUnlocked ? personalizedLabel : (isCurrentMission ? "En progreso" : "Pendiente")}</div>
      <div class="badge-status">${isUnlocked ? '✓' : isCurrentMission ? '!' : '?'}</div>
    `;

    // Add interactive behavior and tooltips
    if (isUnlocked) {
      // Unlocked badges link to their mission page
      div.onclick = () => window.location.href = getMissionUrl(i);
      div.title = `Ir a ${badge.description}`;
    } else if (isCurrentMission) {
      // Current mission badge links to current page (subtle feedback)
      div.onclick = () => window.location.href = window.location.href;
      div.title = `Misión actual: ${badge.description}`;
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
    1: "domina-tu-dinero-desde-el-primer-euro.html",
    2: "haz-que-entre-mas-dinero-sin-magia-ni-suerte.html", 
    3: "tu-dinero-se-esfuma-y-ni-te-das-cuenta.html",
    4: "haz-que-tu-dinero-crezca-mientras-haces-otra-cosa.html",
    5: "aprende-a-comprar-sin-que-te-vendan-la-moto.html",
             6: "lo-barato-sale-caro-cuando-pagas-con-deuda.html"
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
      const isUnlocked = progress.pins && progress.pins.includes(badgeKey);
      const isCurrent = missionNumber === currentMission;
      const isPrevious = missionNumber < currentMission;
      
      // Remove existing classes
      link.classList.remove('text-purple-700', 'font-bold', 'underline', 'text-gray-400', 'cursor-not-allowed');
      
      if (isCurrent) {
        // Current mission - highlight but don't link
        link.classList.add('text-purple-700', 'font-bold', 'underline');
        link.removeAttribute('href');
        link.style.cursor = 'default';
      } else if (isUnlocked || isPrevious) {
        // Unlocked mission or previous mission - normal link
        link.classList.add('hover:text-purple-600');
        link.style.cursor = 'pointer';
      } else {
        // Future locked mission - disabled state
        link.classList.add('text-gray-400', 'cursor-not-allowed');
        link.removeAttribute('href');
        link.style.cursor = 'not-allowed';
      }
    }
  });
}

function getMissionNumberFromUrl(url) {
  const urlMap = {
    "domina-tu-dinero-desde-el-primer-euro.html": 1,
    "haz-que-entre-mas-dinero-sin-magia-ni-suerte.html": 2,
    "tu-dinero-se-esfuma-y-ni-te-das-cuenta.html": 3,
    "haz-que-tu-dinero-crezca-mientras-haces-otra-cosa.html": 4,
    "aprende-a-comprar-sin-que-te-vendan-la-moto.html": 5,
    "lo-barato-sale-caro-cuando-pagas-con-deuda.html": 6
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

/* ==========
   NAME COLLECTION & PERSONALIZATION
   ========== */
function showNameCollectionModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="nameModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center mx-4">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold mb-4 text-purple-700">¡Increíble trabajo!</h3>
        <p class="mb-6 text-gray-600">Has completado tu primera misión. ¿Cómo te llamas para personalizar tu experiencia?</p>
        <form id="nameForm">
          <input type="text" id="userNameInput" placeholder="tu nombre" class="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:border-purple-500 focus:outline-none" required maxlength="15" title="Solo letras, números, espacios y puntos. Mínimo 2 caracteres, máximo 15." />
          <button type="submit" class="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition w-full">
            ¡Personalizar mi experiencia!
          </button>
        </form>
        <button onclick="closeNameModal()" class="mt-4 text-sm text-gray-500 hover:text-gray-700">
          Más tarde
        </button>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Handle form submission
  document.getElementById('nameForm').addEventListener('submit', handleNameSubmission);
  
  // Focus on input
  setTimeout(() => {
    document.getElementById('userNameInput').focus();
  }, 100);
}

function handleNameSubmission(e) {
  e.preventDefault();
  const userName = document.getElementById('userNameInput').value.trim();
  
  if (userName) {
    // Sanitize user input to prevent XSS
    const sanitizedUserName = sanitizeInput(userName);
    
    if (sanitizedUserName) {
      // Save user name
      const progress = loadProgress();
      progress.userName = sanitizedUserName;
      saveProgress(progress);
      
      // Close modal and show personalized message
      closeNameModal();
      showPersonalizedWelcome(sanitizedUserName);
      
      // Unlock the current mission badge now that we have a name
      const currentMission = getCurrentMission();
      if (currentMission) {
        const badgeId = `mision_${currentMission}`;
        unlockBadge(badgeId);
      }
      
      // Refresh badges to show personalized messages
      refreshBadges();
    } else {
      // Show error for invalid input
      alert('Por favor, introduce un nombre válido (solo letras, números y espacios)');
    }
  }
}

function sanitizeInput(input) {
  // Remove any HTML tags and script content
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim();
  
  // Only allow letters, numbers, spaces, and basic punctuation
  sanitized = sanitized.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\.\-]/g, '');
  
  // Must have at least 2 characters and not be empty after sanitization
  return sanitized.length >= 2 ? sanitized : null;
}

function truncateName(name, maxLength = 15) {
  if (name.length > maxLength) {
    return name.slice(0, maxLength - 1) + '*';
  }
  return name;
}

function closeNameModal() {
  const modal = document.getElementById('nameModal');
  if (modal) {
    modal.remove();
  }
}

function showPersonalizedWelcome(userName) {
  // Truncate name for display
  const truncatedUserName = truncateName(userName);
  
  // Create welcome message positioned below navigation
  const welcomeHTML = `
    <div id="welcomeMessage" class="fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-teal-500 text-white p-4 rounded-lg shadow-lg z-40 max-w-sm">
      <div class="flex items-center gap-3">
        <div class="text-2xl">👋</div>
        <div>
          <p class="font-semibold">¡Hola ${truncatedUserName}!</p>
          <p class="text-sm opacity-90">Tu experiencia personalizada está lista</p>
        </div>
      </div>
    </div>
  `;
  
  // Add welcome message
  document.body.insertAdjacentHTML('beforeend', welcomeHTML);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    const welcome = document.getElementById('welcomeMessage');
    if (welcome) {
      welcome.style.opacity = '0';
      welcome.style.transform = 'translateX(100%)';
      welcome.style.transition = 'all 0.3s ease';
      setTimeout(() => welcome.remove(), 300);
    }
  }, 4000);
}

function getUserName() {
  const progress = loadProgress();
  return progress.userName || null;
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
  renderMissionPins(currentMission);
}

// Debug function to check current progress data
function debugProgress() {
  const progress = loadProgress();
  console.log('Current progress data:', progress);
  console.log('User name:', progress.userName);
  console.log('Pins:', progress.pins);
  return progress;
}

// Manual function to trigger name collection modal (for testing)
function triggerNameModal() {
  if (typeof showNameCollectionModal === 'function') {
    showNameCollectionModal();
  } else {
    console.log('showNameCollectionModal function not available');
  }
}

// Manual function to save a test name (for debugging)
function saveTestName(name) {
  const progress = loadProgress();
  progress.userName = name;
  saveProgress(progress);
  console.log('Test name saved:', name);
  refreshBadges();
}

document.addEventListener("DOMContentLoaded", () => {
  const currentMission = getCurrentMission();
  renderMissionPins(currentMission);
  
  // Update navigation based on progress
  updateNavigation();
  
  // Also refresh badges when localStorage changes (for debugging)
  window.addEventListener('storage', (e) => {
    if (e.key === 'progress') {
      renderMissionPins(currentMission);
      updateNavigation(); // Also update navigation on progress changes
    }
  });
});
