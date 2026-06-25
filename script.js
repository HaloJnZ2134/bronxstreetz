const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const year = document.querySelector('#year');
const reveals = document.querySelectorAll('.reveal');
const galleryImages = document.querySelectorAll('.gallery-img');
const statsRoot = document.querySelector('[data-stats-root]');

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

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return 'Unavailable';
  return new Intl.NumberFormat('en-US').format(Number(value));
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return 'Unavailable';
  return `${Number(value).toFixed(1)}%`;
};

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
};

const setStat = (name, value) => {
  setText(`[data-stat="${name}"]`, value);
};

const fetchJson = async (url) => {
  const bust = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${bust}v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
};

const setStatsStatus = (message, isError = false) => {
  const status = document.querySelector('[data-fetch-status]');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
};

const formatUpdatedTime = (isoString) => {
  if (!isoString) return 'Not loaded yet';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const setUnavailableStats = () => {
  ['playing', 'visits', 'favorites', 'likes', 'dislikes', 'rating'].forEach((stat) => {
    setStat(stat, 'Unavailable');
  });
};

const loadRobloxStats = async () => {
  if (!statsRoot) return;

  const statsSrc = statsRoot.dataset.statsSrc || 'data/roblox-stats.json';
  const refreshButton = document.querySelector('[data-refresh-stats]');

  try {
    if (refreshButton) refreshButton.disabled = true;
    setStatsStatus('Loading cached stats...');

    const stats = await fetchJson(statsSrc);

    if (!stats || stats.ok === false) {
      throw new Error(stats && stats.error ? stats.error : 'Stats cache is unavailable.');
    }

    setStat('playing', formatNumber(stats.playing));
    setStat('visits', formatNumber(stats.visits));
    setStat('favorites', formatNumber(stats.favorites));
    setStat('likes', formatNumber(stats.likes));
    setStat('dislikes', formatNumber(stats.dislikes));
    setStat('rating', formatPercent(stats.rating));
    setText('[data-last-updated]', formatUpdatedTime(stats.updatedAt));

    setStatsStatus('Stats loaded');
  } catch (error) {
    console.warn('Could not load cached Roblox stats:', error);
    setUnavailableStats();
    setStatsStatus('Stats cache not ready yet', true);
  } finally {
    if (refreshButton) refreshButton.disabled = false;
  }
};

if (statsRoot) {
  const refreshButton = document.querySelector('[data-refresh-stats]');
  if (refreshButton) refreshButton.addEventListener('click', loadRobloxStats);
  loadRobloxStats();
  setInterval(loadRobloxStats, 60000);
}
