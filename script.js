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
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Unavailable';
  return new Intl.NumberFormat('en-US').format(Number(value));
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Unavailable';
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
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
};

const setStatsStatus = (message, isError = false) => {
  const status = document.querySelector('[data-fetch-status]');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
};

const loadRobloxStats = async () => {
  if (!statsRoot) return;

  const placeId = statsRoot.dataset.placeId;
  const refreshButton = document.querySelector('[data-refresh-stats]');

  try {
    if (refreshButton) refreshButton.disabled = true;
    setStatsStatus('Loading Roblox stats...');

    const universeData = await fetchJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const universeId = universeData.universeId;

    if (!universeId) {
      throw new Error('Universe ID was not returned by Roblox.');
    }

    const [gameData, voteData] = await Promise.all([
      fetchJson(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
      fetchJson(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`).catch(() => null),
    ]);

    const game = gameData && gameData.data && gameData.data[0];
    const votes = voteData && voteData.data && voteData.data[0];

    if (!game) {
      throw new Error('Roblox returned no game statistics.');
    }

    const upVotes = votes ? votes.upVotes : null;
    const downVotes = votes ? votes.downVotes : null;
    const totalVotes = Number(upVotes || 0) + Number(downVotes || 0);
    const rating = totalVotes > 0 ? (Number(upVotes) / totalVotes) * 100 : null;

    setStat('playing', formatNumber(game.playing));
    setStat('visits', formatNumber(game.visits));
    setStat('favorites', formatNumber(game.favoritedCount));
    setStat('likes', formatNumber(upVotes));
    setStat('dislikes', formatNumber(downVotes));
    setStat('rating', formatPercent(rating));

    setText('[data-last-updated]', new Date().toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    }));

    setStatsStatus('Live stats online');
  } catch (error) {
    console.warn('Could not load Roblox stats:', error);
    ['playing', 'visits', 'favorites', 'likes', 'dislikes', 'rating'].forEach((stat) => {
      setStat(stat, 'Unavailable');
    });
    setStatsStatus('Stats unavailable right now', true);
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
