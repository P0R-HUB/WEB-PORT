// Typing animation on hero-sub
var initTyping = function() {
  var el = document.querySelector('.hero-sub');
  if (!el) return;
  var text = el.textContent.trim();
  el.innerHTML = '<span class="cursor"></span>';
  var i = 0;
  setTimeout(function() {
    var timer = setInterval(function() {
      el.innerHTML = text.slice(0, i) + '<span class="cursor"></span>';
      i++;
      if (i > text.length) {
        clearInterval(timer);
        setTimeout(function() {
          el.innerHTML = text;
        }, 800);
      }
    }, 40);
  }, 400);
};

// Copy to clipboard + toast
var showToast = function(msg) {
  var toast = document.getElementById('copy-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2000);
};

var initCopy = function() {
  document.querySelectorAll('.contact-row[data-copy]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      var val = this.getAttribute('data-copy');
      var href = this.getAttribute('href') || '';
      if (href.startsWith('tel:')) e.preventDefault();
      navigator.clipboard.writeText(val).then(function() {
        showToast('Copied: ' + val);
      });
    });
  });
};

// Resume button is a placeholder until a real PDF link is set in the href.
var initResumeGuard = function() {
  document.querySelectorAll('.btn-resume[data-resume-pending]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      showToast('Resume coming soon');
    });
  });
};

// Dark mode toggle
var updateThemeIcon = function(theme) {
  document.getElementById('icon-moon').style.display = theme === 'dark' ? 'none' : 'block';
  document.getElementById('icon-sun').style.display  = theme === 'dark' ? 'block' : 'none';
};

var initTheme = function() {
  var saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  document.getElementById('theme-toggle').addEventListener('click', function() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
};

// Fade-in on scroll — observe elements that actually exist in the markup
var initFadeIn = function() {
  var targets = document.querySelectorAll(
    '.about-text, .info-card, .skill-row, .work-card, .contact-title, .contact-list, .label'
  );
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function(el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });
};

// Active nav link highlight on scroll
var initActiveNav = function() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('nav ul a');
  window.addEventListener('scroll', function() {
    var current = '';
    sections.forEach(function(s) {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
};

// ── Work section ────────────────────────────────────────────────
// Fallback projects shown when the GitHub API is unavailable / rate limited
// or when no repo is tagged with the "portfolio" topic.
var FALLBACK_PROJECTS = [
  {
    name: 'Mutant CAT',
    description: 'Unity game project — gameplay & systems built in C#.',
    homepage: '',
    html_url: 'https://github.com/P0R-HUB',
    language: 'C#',
    topics: ['Unity', 'Game']
  },
  {
    name: 'WEBPORT',
    description: 'This portfolio — static site, Blue/Cyan playful design, deployed on Vercel.',
    homepage: '',
    html_url: 'https://github.com/P0R-HUB',
    language: 'JavaScript',
    topics: ['Vercel', 'Web']
  }
];

var renderWorkCards = function(grid, projects) {
  grid.innerHTML = '';
  projects.forEach(function(repo, i) {
    var num = String(i + 1).padStart(2, '0');
    var link = repo.homepage ? repo.homepage : repo.html_url;
    var chips = [];
    if (repo.language) chips.push(repo.language);
    (repo.topics || []).filter(function(t) { return t !== 'portfolio'; }).forEach(function(t) {
      chips.push(t);
    });

    var card = document.createElement('a');
    card.href = link;
    card.target = '_blank';
    card.rel = 'noopener';
    card.className = 'work-card';
    card.innerHTML =
      '<div class="work-card-top">' +
        '<span class="work-num">' + num + '</span>' +
        '<span class="work-arrow">↗</span>' +
      '</div>' +
      '<h3>' + String(repo.name).replace(/-/g, ' ') + '</h3>' +
      '<p>' + (repo.description || '—') + '</p>' +
      '<div class="work-chips">' +
        chips.map(function(c) { return '<span>' + c + '</span>'; }).join('') +
      '</div>';

    grid.appendChild(card);
  });

  // Re-run fade-in for freshly added cards
  if (typeof IntersectionObserver !== 'undefined') {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    grid.querySelectorAll('.work-card').forEach(function(el) {
      el.classList.add('fade-in');
      obs.observe(el);
    });
  }
};

// Collab / org repos (full name "owner/repo") to feature alongside own repos.
// Must be public — the unauthenticated API can't read private repos.
// Optional `overrides` patch fields the API leaves blank (e.g. missing description).
var EXTRA_REPOS = [
  {
    name: 'PreturnPRO/dii-camt-showprogroup',
    overrides: {
      name: 'DII CAMT ShowPro',
      description: 'Group project — management system for DII CAMT, CMU. Full-stack build in TypeScript.'
    }
  }
];

var fetchJson = function(url) {
  return fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
    .then(function(res) {
      if (!res.ok) throw new Error('GitHub API ' + res.status);
      return res.json();
    });
};

var fetchPortfolioRepos = function() {
  var grid = document.getElementById('work-grid');
  if (!grid) return;

  // Own repos tagged with the "portfolio" topic (empty list on failure)
  var ownReq = fetchJson('https://api.github.com/users/P0R-HUB/repos?per_page=100&sort=pushed')
    .then(function(repos) {
      if (!Array.isArray(repos)) throw new Error('Unexpected response');
      return repos.filter(function(r) {
        return Array.isArray(r.topics) && r.topics.includes('portfolio');
      });
    })
    .catch(function() { return []; });

  // Featured collab repos fetched individually (null on failure, filtered out),
  // with any overrides merged over the live API data.
  var extraReqs = EXTRA_REPOS.map(function(entry) {
    return fetchJson('https://api.github.com/repos/' + entry.name)
      .then(function(repo) {
        var ov = entry.overrides || {};
        Object.keys(ov).forEach(function(k) { repo[k] = ov[k]; });
        return repo;
      })
      .catch(function() { return null; });
  });

  Promise.all([ownReq].concat(extraReqs))
    .then(function(results) {
      var own = results[0] || [];
      var extras = results.slice(1).filter(function(r) { return r; });
      var projects = own.concat(extras);
      renderWorkCards(grid, projects.length ? projects : FALLBACK_PROJECTS);
    })
    .catch(function() {
      // Everything failed — show curated fallback instead of an empty grid
      renderWorkCards(grid, FALLBACK_PROJECTS);
    });
};

// init
initTyping();
initCopy();
initResumeGuard();
initTheme();
initFadeIn();
initActiveNav();
fetchPortfolioRepos();
