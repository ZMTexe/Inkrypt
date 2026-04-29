// UI and Navigation Module
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('mobileOverlay');
  const menuBtn = document.getElementById('mobileMenuBtn');

  function closeMobileNav() {
    body.classList.remove('mobile-nav-open');
  }

  function toggleMobileNav() {
    body.classList.toggle('mobile-nav-open');
  }

  menuBtn?.addEventListener('click', toggleMobileNav);
  overlay?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.nav-btn, .btn-home').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMobileNav();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });
});
