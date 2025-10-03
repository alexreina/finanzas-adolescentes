document.addEventListener('DOMContentLoaded', () => {
  const quizContainers = document.querySelectorAll('.space-y-10 > div');
  
  // determine mission number from current page
  const currentPage = window.location.pathname;
  let missionNumber = 1; // default
  if (currentPage.includes("domina-tu-dinero-desde-el-primer-euro")) {
    missionNumber = 1;
  } else if (currentPage.includes("haz-que-entre-mas-dinero-sin-magia-ni-suerte")) {
    missionNumber = 2;
  } else if (currentPage.includes("tu-dinero-se-esfuma-y-ni-te-das-cuenta")) {
    missionNumber = 3;
  } else if (currentPage.includes("haz-que-tu-dinero-crezca-mientras-haces-otra-cosa")) {
    missionNumber = 4;
  } else if (currentPage.includes("aprende-a-comprar-sin-que-te-vendan-la-moto")) {
    missionNumber = 5;
  } else if (currentPage.includes("lo-barato-sale-caro-cuando-pagas-con-deuda")) {
    missionNumber = 6;
  }
  
  const QUIZ_STORAGE_KEY = `quizProgress-mision${missionNumber}`;

  // load saved progress or default to empty object
  let savedProgress = {};
  try {
    savedProgress = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
  } catch (error) {
    console.error("Error loading quiz progress:", error);
  }

  quizContainers.forEach((container, index) => {
    const buttons = container.querySelectorAll('.quiz-btn');
    const questionId = `question-${index}`;

    // create or reuse feedback element
    let feedback = container.querySelector('.quiz-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'quiz-feedback mt-4 text-lg font-semibold transition duration-300';
      container.appendChild(feedback);
    }

    // --- restore previous state ---
    if (savedProgress[questionId]?.answered) {
      // show saved correct message
      feedback.textContent = '¡correcto! 🎉';
      feedback.classList.add('text-green-600');

      // disable all buttons
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('cursor-not-allowed');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';

        // highlight the correct button
        if (btn.dataset.correct === "true") {
          btn.classList.add('bg-green-500');
        }
      });
    }

    // --- set up click handling ---
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        // if question already answered, don't do anything
        if (savedProgress[questionId]?.answered) {
          return;
        }

        // clear old feedback
        feedback.textContent = '';
        feedback.classList.remove('text-green-600', 'text-red-600', 'animate-bounce');

        if (button.dataset.correct === "true") {
          // show success message
          feedback.textContent = '¡correcto! 🎉';
          feedback.classList.add('text-green-600', 'animate-bounce');

          // animate correct button
          button.classList.add('bg-green-500', 'scale-110', 'transition', 'duration-300');

          // confetti effect
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          }

          // Save quiz progress when answered correctly
          if (!savedProgress[questionId]?.answered) {
            savedProgress[questionId] = { answered: true };
            
            // Save progress to localStorage
            try {
              localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(savedProgress));
            } catch (error) {
              console.error("Error saving quiz progress:", error);
            }
            
            // Check if all questions are answered to enable reto button
            const allQuestionsAnswered = quizContainers.length === Object.keys(savedProgress).length && 
                                       Object.keys(savedProgress).every(key => savedProgress[key].answered);
            if (allQuestionsAnswered && typeof enableRetoButton === 'function') {
              enableRetoButton();
            }
          }

          // disable all buttons after animation
          setTimeout(() => {
            buttons.forEach(btn => {
              btn.disabled = true;
              btn.classList.add('cursor-not-allowed');
              btn.style.pointerEvents = 'none';
              btn.style.opacity = '0.5';
            });
          }, 400);

        } else {
          // Show incorrect message
          feedback.textContent = 'intentalo otra vez ❌';
          feedback.classList.add('text-red-600');

          // Flash red for wrong answer
          button.classList.add('bg-red-500');
          setTimeout(() => button.classList.remove('bg-red-500'), 500);
        }
      });
    });
  });
});
