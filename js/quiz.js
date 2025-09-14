document.addEventListener('DOMContentLoaded', () => {
  const quizContainers = document.querySelectorAll('.space-y-10 > div');
  const QUIZ_STORAGE_KEY = 'quizProgress-module3';

  // Load saved progress or default to empty object
  const savedProgress = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');

  quizContainers.forEach((container, index) => {
    const buttons = container.querySelectorAll('.quiz-btn');
    const questionId = `question-${index}`;

    // Create or reuse feedback element
    let feedback = container.querySelector('.quiz-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'quiz-feedback mt-4 text-lg font-semibold transition duration-300';
      container.appendChild(feedback);
    }

    // --- Restore previous state ---
    if (savedProgress[questionId]?.answered) {
      // Show saved correct message
      feedback.textContent = '¡Correcto! 🎉';
      feedback.classList.add('text-green-600');

      // Disable all buttons
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');

        // Highlight the correct button
        if (btn.dataset.correct === "true") {
          btn.classList.add('bg-green-500');
        }
      });
    }

    // --- Set up click handling ---
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        // Clear old feedback
        feedback.textContent = '';
        feedback.classList.remove('text-green-600', 'text-red-600', 'animate-bounce');

        if (button.dataset.correct === "true") {
          // Show success message
          feedback.textContent = '¡correcto! 🎉';
          feedback.classList.add('text-green-600', 'animate-bounce');

          // Animate correct button
          button.classList.add('bg-green-500', 'scale-110', 'transition', 'duration-300');

          // Confetti effect
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          }

          // Save progress to localStorage
          savedProgress[questionId] = { answered: true };
          localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(savedProgress));

          // Disable all buttons after animation
          setTimeout(() => {
            buttons.forEach(btn => {
              btn.disabled = true;
              btn.classList.add('opacity-50', 'cursor-not-allowed');
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
