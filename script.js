document.addEventListener('DOMContentLoaded', function onReady() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
    });
  }

  const aboutBtn = document.getElementById('aboutBtn');
  const aboutMessage = document.getElementById('aboutMessage');
  if (aboutBtn && aboutMessage) {
    aboutBtn.addEventListener('click', () => {
      const messages = [
        'هذه رسالة ترحيب! شكرًا لاهتمامك 🌟',
        'نستخدم HTML و CSS و JavaScript لبناء هذه الصفحة.',
        'التصميم متجاوب ويعمل على مختلف الأجهزة 📱💻',
      ];
      const index = Math.floor(Math.random() * messages.length);
      aboutMessage.textContent = messages[index];
      aboutMessage.classList.remove('hidden');
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function handleSubmit(event) {
      event.preventDefault();
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('emailError');
      const formStatus = document.getElementById('formStatus');

      let valid = true;
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (formStatus) formStatus.textContent = '';

      if (nameInput && nameInput.value.trim() === '') {
        valid = false;
        if (nameError) nameError.textContent = 'الرجاء إدخال الاسم';
      }
      if (emailInput && !/^\S+@\S+\.\S+$/.test(String(emailInput.value).trim())) {
        valid = false;
        if (emailError) emailError.textContent = 'يرجى إدخال بريد إلكتروني صحيح';
      }

      if (!valid) return;

      if (formStatus && nameInput) {
        formStatus.textContent = `شكرًا يا ${nameInput.value}! تم استلام رسالتك (تمثيليًا).`;
      }
      if (contactForm instanceof HTMLFormElement) {
        contactForm.reset();
      }
    });
  }
});


