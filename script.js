const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const year = document.querySelector('#year');
const reveals = document.querySelectorAll('.reveal');
const galleryImages = document.querySelectorAll('.gallery-img');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
});

reveals.forEach((item) => observer.observe(item));

galleryImages.forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('is-missing');
    image.setAttribute('aria-hidden', 'true');
  });
});
