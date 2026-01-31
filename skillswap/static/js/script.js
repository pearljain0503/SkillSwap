// ============================================
// APP STATE & DATA
// ============================================

const defaultConfig = {
  app_title: 'SkillSwap Local',
  welcome_text: 'Welcome back',
  tagline: 'TEACH. LEARN. TRADE.',
};


let config = { ...defaultConfig };

// Initialize Element SDK
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (newConfig) => {
      config = { ...defaultConfig, ...newConfig };
      updateUIFromConfig();
    },
    mapToCapabilities: (cfg) => ({
      recolorables: [
        {
          get: () => cfg.bg_color || '#0f0f23',
          set: (v) => {
            cfg.bg_color = v;
            window.elementSdk.setConfig({ bg_color: v });
          }
        },
        {
          get: () => cfg.surface_color || '#1a1a2e',
          set: (v) => {
            cfg.surface_color = v;
            window.elementSdk.setConfig({ surface_color: v });
          }
        },
        {
          get: () => cfg.text_color || '#e8e8f0',
          set: (v) => {
            cfg.text_color = v;
            window.elementSdk.setConfig({ text_color: v });
          }
        },
        {
          get: () => cfg.primary_color || '#7c3aed',
          set: (v) => {
            cfg.primary_color = v;
            window.elementSdk.setConfig({ primary_color: v });
          }
        },
        {
          get: () => cfg.secondary_color || '#06b6d4',
          set: (v) => {
            cfg.secondary_color = v;
            window.elementSdk.setConfig({ secondary_color: v });
          }
        }
      ],
      borderables: [],
      fontEditable: {
        get: () => cfg.font_family || 'Inter',
        set: (v) => {
          cfg.font_family = v;
          window.elementSdk.setConfig({ font_family: v });
        }
      },
      fontSizeable: {
        get: () => cfg.font_size || 16,
        set: (v) => {
          cfg.font_size = v;
          window.elementSdk.setConfig({ font_size: v });
        }
      }
    }),
    mapToEditPanelValues: (cfg) => new Map([
      ['app_title', cfg.app_title || defaultConfig.app_title],
      ['welcome_text', cfg.welcome_text || defaultConfig.welcome_text],
      ['tagline', cfg.tagline || defaultConfig.tagline]
    ])
  });
}

function updateUIFromConfig() {
  const appTitle = document.getElementById('app-title-text');
  const welcomeText = document.getElementById('welcome-text');

  if (appTitle) appTitle.textContent = config.app_title || defaultConfig.app_title;

  if (welcomeText && currentUser) {
    welcomeText.innerHTML = `${config.welcome_text || defaultConfig.welcome_text}, <span id="dashboard-user-name">${currentUser.name}</span>`;
  }

  // Apply colors
  const root = document.documentElement;
  if (config.bg_color) root.style.setProperty('--bg-color', config.bg_color);
  if (config.surface_color) root.style.setProperty('--surface-color', config.surface_color);
  if (config.text_color) root.style.setProperty('--text-color', config.text_color);
  if (config.primary_color) root.style.setProperty('--primary-color', config.primary_color);
  if (config.secondary_color) root.style.setProperty('--secondary-color', config.secondary_color);

  // Apply font
  if (config.font_family) {
    document.body.style.fontFamily = `${config.font_family}, Inter, sans-serif`;
  }

  // Apply font size
  if (config.font_size) {
    document.body.style.fontSize = `${config.font_size}px`;
  }
}

// App state
let currentUser = null;
let currentPage = 'dashboard';
let selectedCategory = 'all';
let currentChatId = null;
let requestsTab = 'incoming';

// Sample data
const sampleSkills = [
  { id: 1, title: 'Guitar Lessons', category: 'arts', description: 'Learn acoustic and electric guitar basics to intermediate techniques.', rating: 4.8, distance: '1.2 km', rate: 1, user: 'Sarah M.', avatar: 'S', available: true },
  { id: 2, title: 'Web Development', category: 'technology', description: 'HTML, CSS, JavaScript and modern frameworks like React.', rating: 4.9, distance: '2.5 km', rate: 2, user: 'Mike T.', avatar: 'M', available: true },
  { id: 3, title: 'Yoga & Meditation', category: 'wellness', description: 'Relaxation techniques and beginner-friendly yoga sessions.', rating: 5.0, distance: '0.8 km', rate: 1, user: 'Emma L.', avatar: 'E', available: false },
  { id: 4, title: 'French Language', category: 'education', description: 'Conversational French for beginners to advanced learners.', rating: 4.7, distance: '3.1 km', rate: 1, user: 'Pierre D.', avatar: 'P', available: true },
  { id: 5, title: 'Home Repairs', category: 'home', description: 'Basic plumbing, electrical work, and general fixes.', rating: 4.6, distance: '1.8 km', rate: 2, user: 'Bob K.', avatar: 'B', available: true },
  { id: 6, title: 'Digital Photography', category: 'arts', description: 'Camera settings, composition, and photo editing basics.', rating: 4.9, distance: '2.2 km', rate: 1, user: 'Lisa R.', avatar: 'L', available: true }
];

const sampleRequests = [
  { id: 1, type: 'incoming', skill: 'Guitar Lessons', from: 'Alex Johnson', avatar: 'A', status: 'pending', date: '2 hours ago', message: 'Hi! I would love to learn basic chords.' },
  { id: 2, type: 'incoming', skill: 'Web Development', from: 'Chris Lee', avatar: 'C', status: 'pending', date: '1 day ago', message: 'Can you teach me React?' },
  { id: 3, type: 'outgoing', skill: 'Yoga & Meditation', to: 'Emma L.', avatar: 'E', status: 'accepted', date: '3 days ago', message: 'Looking forward to our session!' },
  { id: 4, type: 'incoming', skill: 'French Language', from: 'Maria S.', avatar: 'M', status: 'pending', date: '5 hours ago', message: 'I want to improve my conversational French.' }
];

const sampleConversations = [
  { id: 1, name: 'Alex Johnson', avatar: 'A', lastMessage: 'Thanks for accepting!', time: '2m ago', unread: 2, status: 'online' },
  { id: 2, name: 'Emma L.', avatar: 'E', lastMessage: 'See you Saturday at 10am', time: '1h ago', unread: 0, status: 'offline' },
  { id: 3, name: 'Chris Lee', avatar: 'C', lastMessage: 'Can we reschedule?', time: '3h ago', unread: 1, status: 'online' }
];

const sampleMessages = {
  1: [
    { id: 1, text: 'Hi! I saw your guitar lessons offer.', sent: false, time: '10:30 AM' },
    { id: 2, text: 'Hey Alex! Yes, I teach acoustic and electric guitar.', sent: true, time: '10:32 AM' },
    { id: 3, text: 'That sounds perfect! When are you available?', sent: false, time: '10:35 AM' },
    { id: 4, text: 'I have slots on Tuesday and Thursday evenings. Would that work?', sent: true, time: '10:38 AM' },
    { id: 5, text: 'Tuesday works great for me!', sent: false, time: '10:40 AM' },
    { id: 6, text: 'Thanks for accepting!', sent: false, time: '10:41 AM' }
  ],
  2: [
    { id: 1, text: 'Hi Emma, looking forward to the yoga session!', sent: true, time: '9:00 AM' },
    { id: 2, text: 'Me too! Bring a yoga mat if you have one.', sent: false, time: '9:15 AM' },
    { id: 3, text: 'See you Saturday at 10am', sent: false, time: '9:20 AM' }
  ],
  3: [
    { id: 1, text: 'Hey, about our React lesson...', sent: false, time: '2:00 PM' },
    { id: 2, text: 'Sure, what\'s up?', sent: true, time: '2:05 PM' },
    { id: 3, text: 'Can we reschedule?', sent: false, time: '2:10 PM' }
  ]
};

let mySkills = [];

// Experience level mapping
const EXPERIENCE_MAP = [
  { label: 'Novice', credits: 1 },
  { label: 'Beginner', credits: 1 },
  { label: 'Intermediate', credits: 2 },
  { label: 'Advanced', credits: 3 },
  { label: 'Expert', credits: 4 }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#10b981' : '#ef4444'}" stroke-width="2">
      ${type === 'success'
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<span class="star">★</span>';
    } else if (i === fullStars && hasHalf) {
      html += '<span class="star">★</span>';
    } else {
      html += '<span class="star empty">★</span>';
    }
  }
  return html;
}

function getCategoryColor(category) {
  const colors = {
    education: '#3b82f6',
    technology: '#8b5cf6',
    arts: '#ec4899',
    wellness: '#10b981',
    home: '#f59e0b'
  };
  return colors[category] || '#6b7280';
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
  currentPage = page;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) item.classList.add('active');
  });

  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  // Close mobile menu
  document.getElementById('mobile-menu').classList.remove('active');

  // Render page-specific content
  if (page === 'dashboard') renderDashboard();
  if (page === 'find-skill') renderSkillsGrid();
  if (page === 'requests') renderRequests();
  if (page === 'messages') renderConversations();
}

// ============================================
// AUTH
// ============================================

function checkAuth() {
  const saved = localStorage.getItem('skillswap_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    hideAuthModal();
    updateUserUI();
    loadUserData();
  } else {
    showAuthModal();
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

function login(email, password) {
  // Demo validation
  if (email === 'demo@skillswap.com' && password === 'demo123') {
    currentUser = { name: 'Demo User', email, credits: 25, pendingCredits: 3 };
    localStorage.setItem('skillswap_user', JSON.stringify(currentUser));
    hideAuthModal();
    updateUserUI();
    loadUserData();
    showToast('Welcome back!');
    return true;
  }
  return false;
}

function signup(name, email, password) {
  currentUser = { name, email, credits: 10, pendingCredits: 0 };
  localStorage.setItem('skillswap_user', JSON.stringify(currentUser));
  hideAuthModal();
  updateUserUI();
  loadUserData();
  showToast('Account created! Welcome to SkillSwap!');
  return true;
}

function logout() {
  currentUser = null;
  localStorage.removeItem('skillswap_user');
  localStorage.removeItem('skillswap_myskills');
  mySkills = [];
  showAuthModal();
}

function updateUserUI() {
  if (!currentUser) return;

  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('total-credits').textContent = currentUser.credits;
  document.getElementById('pending-credits').textContent = `+${currentUser.pendingCredits}`;

  const dashboardName = document.getElementById('dashboard-user-name');
  if (dashboardName) dashboardName.textContent = currentUser.name;
}

function loadUserData() {
  const savedSkills = localStorage.getItem('skillswap_myskills');
  if (savedSkills) {
    mySkills = JSON.parse(savedSkills);
  }
  renderDashboard();
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
  const listEl = document.getElementById('my-skills-list');
  const emptyEl = document.getElementById('my-skills-empty');

  // Update pending requests count
  const pendingCount = sampleRequests.filter(r => r.type === 'incoming' && r.status === 'pending').length;
  document.getElementById('pending-requests-count').textContent = pendingCount;

  // Update stats
  document.getElementById('stat-offers').textContent = mySkills.length;
  document.getElementById('stat-requests').textContent = sampleRequests.length;
  document.getElementById('stat-completed').textContent = 12;

  if (mySkills.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
  } else {
    emptyEl.classList.add('hidden');
    listEl.innerHTML = mySkills.map(skill => `
      <div class="skill-card mb-3 flex items-start gap-4">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-lg" style="background: ${getCategoryColor(skill.category)}20; color: ${getCategoryColor(skill.category)}">
          ${skill.category === 'education' ? '📚' : skill.category === 'technology' ? '💻' : skill.category === 'arts' ? '🎨' : skill.category === 'wellness' ? '🧘' : '🏠'}
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-semibold">${skill.title}</h4>
              <p class="text-sm opacity-60 capitalize">${skill.category}</p>
            </div>
            <span class="pill" style="background: ${getCategoryColor(skill.category)}20; color: ${getCategoryColor(skill.category)}">${skill.rate} credit/hr</span>
          </div>
          <p class="text-sm opacity-70 mt-2 line-clamp-2">${skill.description}</p>
        </div>
      </div>
    `).join('');
  }
}

// ============================================
// FIND SKILL
// ============================================

function renderSkillsGrid() {
  const grid = document.getElementById('skills-grid');
  let filtered = sampleSkills;

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(s => s.category === selectedCategory);
  }

  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
  if (searchTerm) {
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(searchTerm) ||
      s.description.toLowerCase().includes(searchTerm)
    );
  }

  document.getElementById('skills-count').textContent = `${filtered.length} skills nearby`;

  grid.innerHTML = filtered.map(skill => `
    <div class="skill-card flex gap-4">
      <div class="avatar-lg flex-shrink-0" style="background: linear-gradient(135deg, ${getCategoryColor(skill.category)}, ${getCategoryColor(skill.category)}aa)">
        ${skill.avatar}
      </div>
      <div class="flex-1">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-semibold">${skill.title}</h4>
            <p class="text-sm opacity-60">${skill.user} · ${skill.distance}</p>
          </div>
          <span class="pill" style="background: ${getCategoryColor(skill.category)}20; color: ${getCategoryColor(skill.category)}">${skill.rate} credit/hr</span>
        </div>
        <p class="text-sm opacity-70 mt-2 mb-3">${skill.description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="rating text-sm">${renderStars(skill.rating)}</div>
            <span class="text-sm opacity-60">${skill.rating}</span>
          </div>
          <button class="btn btn-primary btn-sm text-sm py-2 px-4" onclick="requestSkill(${skill.id})">
            Request
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function requestSkill(skillId) {
  const skill = sampleSkills.find(s => s.id === skillId);
  if (skill) {
    showToast(`Request sent to ${skill.user} for ${skill.title}!`);
  }
}

// ============================================
// OFFER SKILL
// ============================================

function handleOfferSubmit(e) {
  e.preventDefault();

  const category = document.getElementById('offer-category').value;
  const title = document.getElementById('offer-title').value;
  const description = document.getElementById('offer-description').value;
  /*const rate = document.getElementById('offer-rate').value;*/
 const rate = document.getElementById('offer-rate').value;
const experienceLevel = EXPERIENCE_MAP[
  document.getElementById('experience-slider').value
];

  if (!category || !title || !description) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  const newSkill = {
  id: Date.now(),
  category,
  title,
  description,
  rate: parseInt(rate),
  experience: experienceLevel.label,
  experienceValue: parseInt(experienceSlider.value),
  createdAt: new Date().toISOString()
};
  

  mySkills.push(newSkill);
  localStorage.setItem('skillswap_myskills', JSON.stringify(mySkills));

  // Reset form
  e.target.reset();
  document.getElementById('description-counter').textContent = '0/500';

  showToast('Skill offer published successfully!');
  navigateTo('dashboard');
}

// ============================================
// REQUESTS
// ============================================

function renderRequests() {
  const list = document.getElementById('requests-list');
  const empty = document.getElementById('requests-empty');

  const filtered = sampleRequests.filter(r => r.type === requestsTab);

  // Update tab buttons
  document.getElementById('tab-incoming').classList.toggle('active', requestsTab === 'incoming');
  document.getElementById('tab-outgoing').classList.toggle('active', requestsTab === 'outgoing');

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    list.innerHTML = filtered.map(req => `
      <div class="card p-5">
        <div class="flex items-start gap-4">
          <div class="avatar-lg">${req.avatar}</div>
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-semibold">${req.type === 'incoming' ? req.from : req.to}</h4>
                <p class="text-sm opacity-60">${req.skill} · ${req.date}</p>
              </div>
              <span class="status-badge status-${req.status}">${req.status}</span>
            </div>
            <p class="text-sm opacity-70 mb-4">${req.message}</p>
            ${req.status === 'pending' && req.type === 'incoming' ? `
              <div class="flex gap-2">
                <button class="btn btn-primary text-sm py-2" onclick="handleRequest(${req.id}, 'accept')">Accept</button>
                <button class="btn btn-ghost text-sm py-2" onclick="handleRequest(${req.id}, 'decline')">Decline</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
}

function handleRequest(id, action) {
  const req = sampleRequests.find(r => r.id === id);
  if (req) {
    req.status = action === 'accept' ? 'accepted' : 'declined';
    renderRequests();
    showToast(`Request ${action === 'accept' ? 'accepted' : 'declined'}!`);
  }
}

// ============================================
// MESSAGES
// ============================================

function renderConversations() {
  const list = document.getElementById('conversations-list');
  list.innerHTML = sampleConversations.map(conv => `
    <div class="p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${currentChatId === conv.id ? 'bg-white/5' : ''}" onclick="selectConversation(${conv.id})">
      <div class="flex items-center gap-3">
        <div class="avatar relative">
          ${conv.avatar}
          ${conv.status === 'online' ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-color"></span>' : ''}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-medium">${conv.name}</span>
            <span class="text-xs opacity-50">${conv.time}</span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm opacity-60 truncate">${conv.lastMessage}</p>
            ${conv.unread > 0 ? `<span class="w-5 h-5 rounded-full bg-primary-color text-xs flex items-center justify-center">${conv.unread}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function selectConversation(id) {
  currentChatId = id;
  const conv = sampleConversations.find(c => c.id === id);

  if (conv) {
    document.getElementById('chat-avatar').textContent = conv.avatar;
    document.getElementById('chat-name').textContent = conv.name;
    document.getElementById('chat-status').textContent = conv.status === 'online' ? 'Online' : 'Offline';

    // Mark as read
    conv.unread = 0;
    renderConversations();
    renderMessages();

    // On mobile, show chat
    document.querySelector('.message-list-panel').classList.remove('active');
  }
}

function renderMessages() {
  const container = document.getElementById('chat-messages');
  const messages = sampleMessages[currentChatId] || [];

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="text-center opacity-40 py-8">
        <p>No messages yet. Start the conversation!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => `
    <div class="message-bubble ${msg.sent ? 'sent' : 'received'}">
      <p>${msg.text}</p>
      <span class="text-xs opacity-50 mt-1 block">${msg.time}</span>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();

  if (!text || !currentChatId) return;

  if (!sampleMessages[currentChatId]) {
    sampleMessages[currentChatId] = [];
  }

  sampleMessages[currentChatId].push({
    id: Date.now(),
    text,
    sent: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // Update conversation
  const conv = sampleConversations.find(c => c.id === currentChatId);
  if (conv) {
    conv.lastMessage = text;
    conv.time = 'now';
  }

  input.value = '';
  renderMessages();
  renderConversations();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  checkAuth();

  // Navigation
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // Mobile menu
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('active');
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!login(email, password)) {
      document.getElementById('login-error').textContent = 'Invalid credentials. Try demo@skillswap.com / demo123';
      document.getElementById('login-error').classList.remove('hidden');
    }
  });

  // Signup form
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const terms = document.getElementById('signup-terms').checked;

    if (!name || !email || !password) {
      document.getElementById('signup-error').textContent = 'Please fill in all fields';
      document.getElementById('signup-error').classList.remove('hidden');
      return;
    }

    if (!terms) {
      document.getElementById('signup-error').textContent = 'Please accept the terms';
      document.getElementById('signup-error').classList.remove('hidden');
      return;
    }

    signup(name, email, password);
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Distance slider
  document.getElementById('distance-slider').addEventListener('input', (e) => {
    document.getElementById('distance-value').textContent = `${e.target.value} km`;
  });

  // Category chips
  document.querySelectorAll('#category-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedCategory = chip.dataset.category;
      renderSkillsGrid();
    });
  });

  // Toggle switches
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  // Search input
  document.getElementById('search-input').addEventListener('input', () => {
    renderSkillsGrid();
  });

  // Offer form
  document.getElementById('offer-form').addEventListener('submit', handleOfferSubmit);

  // Description counter
  document.getElementById('offer-description').addEventListener('input', (e) => {
    const counter = document.getElementById('description-counter');
    const length = e.target.value.length;
    counter.textContent = `${length}/500`;
    counter.classList.remove('warning', 'error');
    if (length > 400) counter.classList.add('warning');
    if (length >= 500) counter.classList.add('error');
  });

  // Experience slider
  const experienceSlider = document.getElementById('experience-slider');
const experienceValue = document.getElementById('experience-value');
const creditsInput = document.getElementById('offer-rate');

function updateExperienceAndCredits() {
  const level = experienceSlider.value;
  const data = EXPERIENCE_MAP[level];

  experienceValue.textContent = data.label;
  creditsInput.value = data.credits;
}

experienceSlider.addEventListener('input', updateExperienceAndCredits);

// initialize on load
updateExperienceAndCredits();


  // Session type chips
  document.querySelectorAll('[data-session]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-session]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  
  // Availability chips
document.querySelectorAll('#availability-chips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('active'); // toggle visually
    console.log(chip.dataset.day + ' toggled'); // optional debug
  });
});


  // Request tabs
  document.getElementById('tab-incoming').addEventListener('click', () => {
    requestsTab = 'incoming';
    renderRequests();
  });

  document.getElementById('tab-outgoing').addEventListener('click', () => {
    requestsTab = 'outgoing';
    renderRequests();
  });

  // Send message
  document.getElementById('send-message-btn').addEventListener('click', sendMessage);
  document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Back to conversations list (mobile)
  document.getElementById('back-to-list').addEventListener('click', () => {
    document.querySelector('.message-list-panel').classList.add('active');
    currentChatId = null;
  });

  // Initial render
  renderSkillsGrid();

  // Apply initial config
  updateUIFromConfig();
});
