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

initTyping();
initCopy();
initTheme();

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? '#1a1917' : '';
  });
});
