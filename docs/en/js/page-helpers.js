function toggleTOC() {
  const toc = document.getElementById('toc-content');
  const icon = document.getElementById('toc-icon');

  if (toc.classList.contains('hidden')) {
    toc.classList.remove('hidden');
    icon.textContent = '▲'; // arrow up when open
  } else {
    toc.classList.add('hidden');
    icon.textContent = '▼'; // arrow down when closed
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tocButton = document.querySelector("[data-toc-button]");
  if (tocButton) {
    tocButton.addEventListener("click", toggleTOC);
  }
});
