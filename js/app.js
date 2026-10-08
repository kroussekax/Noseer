// Noseer Main Application Bootstrap

document.addEventListener('DOMContentLoaded', () => {
  console.log('Noseer AI Note-Taking App initializing...');

  // Initialize initial page
  if (window.NoseerNavigation) {
    window.NoseerNavigation.navigateTo('notes');
  }

  // Initial render of notes
  if (window.NoseerNotes) {
    window.NoseerNotes.render();
  }

  // Render settings
  if (window.NoseerSettings) {
    window.NoseerSettings.render();
  }
});
