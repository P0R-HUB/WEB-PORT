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

// Dark mode toggle
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

var updateThemeIcon = function(theme) {
  document.getElementById('icon-moon').style.display = theme === 'dark' ? 'none' : 'block';
  document.getElementById('icon-sun').style.display  = theme === 'dark' ? 'block' : 'none';
};

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.skill-card, .project-card, .stat, .contact-card, .about-text, .section-title')
  .forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

// Active nav link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');

var fetchPortfolioRepos = function() {
  var grid = document.getElementById('work-grid');
  if (!grid) return;

  fetch('https://api.github.com/users/P0R-HUB/repos?per_page=100&sort=pushed', {
    headers: { 'Accept': 'application/vnd.github+json' }
  })
  .then(function(res) { return res.json(); })
  .then(function(repos) {
    var portfolio = repos.filter(function(r) {
      return Array.isArray(r.topics) && r.topics.includes('portfolio');
    });

    if (portfolio.length === 0) {
      grid.innerHTML = '<p class="work-loading">No projects found.</p>';
      return;
    }

    grid.innerHTML = '';
    portfolio.forEach(function(repo, i) {
      var num = String(i + 1).padStart(2, '0');
      var link = repo.homepage ? repo.homepage : repo.html_url;
      var chips = [];
      if (repo.language) chips.push(repo.language);
      repo.topics.filter(function(t) { return t !== 'portfolio'; }).forEach(function(t) {
        chips.push(t);
      });

      var card = document.createElement('a');
      card.href = link;
      card.target = '_blank';
      card.className = 'work-card';
      card.innerHTML =
        '<div class="work-card-top">' +
          '<span class="work-num">' + num + '</span>' +
          '<span class="work-arrow">↗</span>' +
        '</div>' +
        '<h3>' + repo.name.replace(/-/g, ' ') + '</h3>' +
        '<p>' + (repo.description || '—') + '</p>' +
        '<div class="work-chips">' +
          chips.map(function(c) { return '<span>' + c + '</span>'; }).join('') +
        '</div>';

      grid.appendChild(card);
    });
  })
  .catch(function() {
    grid.innerHTML = '<p class="work-loading">Could not load projects.</p>';
  });
};

initTyping();
initCopy();
initTheme();
fetchPortfolioRepos();

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? '#1a1917' : '';
  });
});
