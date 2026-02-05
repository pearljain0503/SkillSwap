"use strict";

// ============================================
// CONFIGURATION
// ============================================
const defaultConfiguration = {
  app_title: "SkillSwap Local",
  welcome_text: "Welcome back",
  tagline: "TEACH. LEARN. TRADE.",
};

let config = { ...defaultConfiguration };

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 };

// App state
let currentUser = null;
let currentPage = "dashboard";
let selectedCategory = "all";
let currentChatId = null;
let requestsTab = "incoming";

function updateUIFromConfig() {
  const appTitle = document.getElementById("app-title-text");
  const welcomeText = document.getElementById("welcome-text");

  if (appTitle)
    appTitle.textContent = config.app_title || defaultConfiguration.app_title;

  if (welcomeText && currentUser) {
    welcomeText.innerHTML = `${
      config.welcome_text || defaultConfiguration.welcome_text
    }, <span id="dashboard-user-name">${currentUser.name}</span>`;
  }

  // Apply colors
  const root = document.documentElement;
  if (config.bg_color) root.style.setProperty("--bg-color", config.bg_color);
  if (config.surface_color)
    root.style.setProperty("--surface-color", config.surface_color);
  if (config.text_color)
    root.style.setProperty("--text-color", config.text_color);
  if (config.primary_color)
    root.style.setProperty("--primary-color", config.primary_color);
  if (config.secondary_color)
    root.style.setProperty("--secondary-color", config.secondary_color);

  // Apply font
  if (config.font_family) {
    document.body.style.fontFamily = `${config.font_family}, Inter, sans-serif`;
  }

  // Apply font size
  if (config.font_size) {
    document.body.style.fontSize = `${config.font_size}px`;
  }
}

// ============================================
// SAMPLE DATA
// ============================================

// Sample data
const defaultSampleSkills = [
  {
    id: 1,
    title: "Guitar Lessons",
    category: "arts",
    description:
      "Learn acoustic and electric guitar basics to intermediate techniques.",
    rating: 4.8,
    distance: "1.2 km",
    rate: 1,
    user: "Sarah M.",
    avatar: "S",
    available: true,
    lat: 19.076, // Dadar
    lng: 72.8777,
  },
  {
    id: 2,
    title: "Web Development",
    category: "technology",
    description: "HTML, CSS, JavaScript and modern frameworks like React.",
    rating: 4.9,
    distance: "2.5 km",
    rate: 2,
    user: "Mike T.",
    avatar: "M",
    available: true,
    lat: 19.1136, // Andheri
    lng: 72.8697,
  },
  {
    id: 3,
    title: "Yoga & Meditation",
    category: "wellness",
    description: "Relaxation techniques and beginner-friendly yoga sessions.",
    rating: 5.0,
    distance: "0.8 km",
    rate: 1,
    user: "Emma L.",
    avatar: "E",
    available: false,
    lat: 19.0176, // Colaba
    lng: 72.8562,
  },
  {
    id: 4,
    title: "French Language",
    category: "education",
    description: "Conversational French for beginners to advanced learners.",
    rating: 4.7,
    distance: "3.1 km",
    rate: 1,
    user: "Pierre D.",
    avatar: "P",
    available: true,
    lat: 19.0896, // Bandra
    lng: 72.8347,
  },
  {
    id: 5,
    title: "Home Repairs",
    category: "home",
    description: "Basic plumbing, electrical work, and general fixes.",
    rating: 4.6,
    distance: "1.8 km",
    rate: 2,
    user: "Bob K.",
    avatar: "B",
    available: true,
    lat: 19.2183, // Borivali
    lng: 72.9781,
  },
  {
    id: 6,
    title: "Digital Photography",
    category: "arts",
    description: "Camera settings, composition, and photo editing basics.",
    rating: 4.9,
    distance: "2.2 km",
    rate: 1,
    user: "Lisa R.",
    avatar: "L",
    available: true,
    lat: 19.033, // Worli
    lng: 72.8162,
  },
];

const serverSkillsRaw = Array.isArray(window.SKILLSWAP_SERVER_SKILLS)
  ? window.SKILLSWAP_SERVER_SKILLS
  : [];
const currentMemberId = Number(window.SKILLSWAP_CURRENT_MEMBER_ID);
const hasCurrentMember = Number.isFinite(currentMemberId);

function normalizeServerSkill(skill, takenIds) {
  const name = (skill?.member_name || "Unknown").trim();
  const avatar = name ? name.charAt(0).toUpperCase() : "?";
  const lat = Number(skill?.latitude);
  const lng = Number(skill?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const rating = Number(skill?.rating);
  const rate = Number(skill?.rate);

  let id = Number(skill?.id);
  if (!Number.isFinite(id)) {
    id = Date.now() + Math.floor(Math.random() * 1000);
  }
  if (takenIds.has(id)) {
    id += 1000000;
  }
  takenIds.add(id);

  return {
    id,
    title: skill?.skill_name || "Untitled Skill",
    category: skill?.category || "education",
    description: skill?.description || "",
    rating: Number.isFinite(rating) ? rating : 5.0,
    distance: hasCoords ? "—" : "Location not set",
    rate: Number.isFinite(rate) ? rate : 1,
    user: name || "Unknown",
    avatar,
    available: true,
    lat: hasCoords ? lat : DEFAULT_LOCATION.lat,
    lng: hasCoords ? lng : DEFAULT_LOCATION.lng,
    hasLocation: hasCoords,
  };
}

const takenIds = new Set(defaultSampleSkills.map((skill) => skill.id));
const serverSkills = serverSkillsRaw
  .filter((skill) => {
    if (!hasCurrentMember) return true;
    const skillMemberId = Number(skill?.member_id);
    return !Number.isFinite(skillMemberId) || skillMemberId !== currentMemberId;
  })
  .map((skill) => normalizeServerSkill(skill, takenIds));

const sampleSkills = [...defaultSampleSkills, ...serverSkills];

const sampleRequests = [
  {
    id: 1,
    type: "incoming",
    skill: "Guitar Lessons",
    from: "Alex Johnson",
    avatar: "A",
    status: "pending",
    date: "2 hours ago",
    message: "Hi! I would love to learn basic chords.",
  },
  {
    id: 2,
    type: "incoming",
    skill: "Web Development",
    from: "Chris Lee",
    avatar: "C",
    status: "pending",
    date: "1 day ago",
    message: "Can you teach me React?",
  },
  {
    id: 3,
    type: "outgoing",
    skill: "Yoga & Meditation",
    to: "Emma L.",
    avatar: "E",
    status: "accepted",
    date: "3 days ago",
    message: "Looking forward to our session!",
  },
  {
    id: 4,
    type: "incoming",
    skill: "French Language",
    from: "Maria S.",
    avatar: "M",
    status: "pending",
    date: "5 hours ago",
    message: "I want to improve my conversational French.",
  },
];

const sampleConversations = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "A",
    lastMessage: "Thanks for accepting!",
    time: "2m ago",
    unread: 2,
    status: "online",
  },
  {
    id: 2,
    name: "Emma L.",
    avatar: "E",
    lastMessage: "See you Saturday at 10am",
    time: "1h ago",
    unread: 0,
    status: "offline",
  },
  {
    id: 3,
    name: "Chris Lee",
    avatar: "C",
    lastMessage: "Can we reschedule?",
    time: "3h ago",
    unread: 1,
    status: "online",
  },
];

const sampleMessages = {
  1: [
    {
      id: 1,
      text: "Hi! I saw your guitar lessons offer.",
      sent: false,
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "Hey Alex! Yes, I teach acoustic and electric guitar.",
      sent: true,
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "That sounds perfect! When are you available?",
      sent: false,
      time: "10:35 AM",
    },
    {
      id: 4,
      text: "I have slots on Tuesday and Thursday evenings. Would that work?",
      sent: true,
      time: "10:38 AM",
    },
    {
      id: 5,
      text: "Tuesday works great for me!",
      sent: false,
      time: "10:40 AM",
    },
    { id: 6, text: "Thanks for accepting!", sent: false, time: "10:41 AM" },
  ],
  2: [
    {
      id: 1,
      text: "Hi Emma, looking forward to the yoga session!",
      sent: true,
      time: "9:00 AM",
    },
    {
      id: 2,
      text: "Me too! Bring a yoga mat if you have one.",
      sent: false,
      time: "9:15 AM",
    },
    { id: 3, text: "See you Saturday at 10am", sent: false, time: "9:20 AM" },
  ],
  3: [
    {
      id: 1,
      text: "Hey, about our React lesson...",
      sent: false,
      time: "2:00 PM",
    },
    { id: 2, text: "Sure, what's up?", sent: true, time: "2:05 PM" },
    { id: 3, text: "Can we reschedule?", sent: false, time: "2:10 PM" },
  ],
};

// Experience level mapping (slider values are 1-5)
const EXPERIENCE_MAP = [
  { label: "Novice", credits: 1 },
  { label: "Beginner", credits: 1 },
  { label: "Intermediate", credits: 2 },
  { label: "Advanced", credits: 3 },
  { label: "Expert", credits: 4 },
];

function getExperienceData(value) {
  const numericValue = Number(value);
  const baseIndex = Number.isFinite(numericValue) ? numericValue - 1 : 0;
  const index = Math.min(Math.max(baseIndex, 0), EXPERIENCE_MAP.length - 1);
  return EXPERIENCE_MAP[index];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
      type === "success" ? "#10b981" : "#ef4444"
    }" stroke-width="2">
      ${
        type === "success"
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
      }
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = "";
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
    education: "#3b82f6",
    technology: "#8b5cf6",
    arts: "#ec4899",
    wellness: "#10b981",
    home: "#f59e0b",
  };
  return colors[category] || "#6b7280";
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
  currentPage = page;

  // hide all pages
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
  });

  // show selected page
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add("active");
  }

  // update nav highlight
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  // close mobile menu
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) mobileMenu.classList.remove("active");

  // page-specific logic
  // if (page === "dashboard") renderDashboard();
  if (page === "find-skill") loadMapIfNeeded();
  if (page === "offer-skill") ensureOfferLocation();
  if (page === "requests") renderRequests();
  if (page === "messages") renderConversations();
}

// Expose for inline handlers (if any) and easy debugging.
window.navigateTo = navigateTo;

// ============================================
// AUTH
// ============================================

function checkAuth() {
  const saved = localStorage.getItem("skillswap_user");
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
  document.getElementById("auth-modal").classList.add("active");
}

function hideAuthModal() {
  document.getElementById("auth-modal").classList.remove("active");
}

function updateUserUI() {
  if (!currentUser) return;

  document.getElementById("user-avatar").textContent = currentUser.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("user-name-display").textContent = currentUser.name;
  document.getElementById("total-credits").textContent = currentUser.credits;
  document.getElementById(
    "pending-credits"
  ).textContent = `+${currentUser.pendingCredits}`;

  const dashboardName = document.getElementById("dashboard-user-name");
  if (dashboardName) dashboardName.textContent = currentUser.name;
}

function loadUserData() {
  const savedSkills = localStorage.getItem("skillswap_myskills");
  if (savedSkills) {
    // mySkills = JSON.parse(savedSkills);
  }
  // renderDashboard();
}
// ============================================
// FIND SKILL
// ============================================

function renderSkillsGrid() {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;
  let filtered = [...sampleSkills];

  const radius = getRadius();
  if (userLocation) {
    filtered = filtered.filter((skill) => {
      if (skill.hasLocation === false) {
        return true;
      }
      const distance = haversineDistance(userLocation, {
        lat: skill.lat,
        lng: skill.lng,
      });
      skill.distance = `${distance.toFixed(1)} km`; // Update distance on the skill object
      return distance <= radius;
    });
  }

  if (selectedCategory !== "all") {
    filtered = filtered.filter((s) => s.category === selectedCategory);
  }

  const searchTerm =
    document.getElementById("search-input")?.value.toLowerCase() || "";
  if (searchTerm) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm)
    );
  }

  const skillsCount = document.getElementById("skills-count");
  if (skillsCount) {
    skillsCount.textContent = `${filtered.length} skills nearby`;
  }

  renderSkillMarkers(filtered);

  grid.innerHTML = filtered
    .map(
      (skill) => `
    <div class="skill-card flex gap-4">
      <div class="avatar-lg flex-shrink-0" style="background: linear-gradient(135deg, ${getCategoryColor(
        skill.category
      )}, ${getCategoryColor(skill.category)}aa)">
        ${skill.avatar}
      </div>
      <div class="flex-1">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-semibold">${skill.title}</h4>
            <p class="text-sm opacity-60">${skill.user} · ${skill.distance}</p>
          </div>
          <span class="pill" style="background: ${getCategoryColor(
            skill.category
          )}20; color: ${getCategoryColor(skill.category)}">${
        skill.rate
      } credit/hr</span>
        </div>
        <p class="text-sm opacity-70 mt-2 mb-3">${skill.description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="rating text-sm">${renderStars(skill.rating)}</div>
            <span class="text-sm opacity-60">${skill.rating}</span>
          </div>
          <button class="btn btn-primary btn-sm text-sm py-2 px-4" onclick="requestSkill(${
            skill.id
          })">
            Request
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function requestSkill(skillId) {
  const skill = sampleSkills.find((s) => s.id === skillId);
  if (skill) {
    showToast(`Request sent to ${skill.user} for ${skill.title}!`);
  }
}

// ============================================
// OFFER SKILL
// ============================================

function setOfferLocationFields(lat, lng, statusMessage) {
  const latInput = document.getElementById("offer-lat");
  const lngInput = document.getElementById("offer-lng");
  const status = document.getElementById("offer-location-status");

  if (latInput) latInput.value = lat;
  if (lngInput) lngInput.value = lng;
  if (status && statusMessage) status.textContent = statusMessage;
}

function ensureOfferLocation() {
  const latInput = document.getElementById("offer-lat");
  const lngInput = document.getElementById("offer-lng");
  if (!latInput || !lngInput) return;

  if (latInput.value && lngInput.value) {
    setOfferLocationFields(latInput.value, lngInput.value, "Location captured");
    return;
  }

  if (!navigator.geolocation) {
    setOfferLocationFields(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lng,
      "Location set to default area."
    );
    return;
  }

  setOfferLocationFields("", "", "Detecting your location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setOfferLocationFields(
        position.coords.latitude,
        position.coords.longitude,
        "Location captured"
      );
    },
    () => {
      setOfferLocationFields(
        DEFAULT_LOCATION.lat,
        DEFAULT_LOCATION.lng,
        "Location set to default area."
      );
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
  );
}

function handleOfferSubmit(e) {
  // e.preventDefault();

  const experienceSlider = document.getElementById("experience-slider");
  const category = document.getElementById("offer-category").value;
  const title = document.getElementById("offer-title").value;
  const description = document.getElementById("offer-description").value;
  const rate = document.getElementById("offer-rate").value;
  const experienceLevel = getExperienceData(experienceSlider.value);

  if (!category || !title || !description) {
    showToast("Please fill in all required fields", "error");
    return;
  }
  const newSkill = {
    id: Date.now(),
    category,
    title,
    description,
    rate: parseInt(rate, 10),
    experience: experienceLevel.label,
    experienceValue: parseInt(experienceSlider.value, 10),
    createdAt: new Date().toISOString(),
  };

  // mySkills.push(newSkill);
  // localStorage.setItem("skillswap_myskills", JSON.stringify(mySkills));

  // Reset form
  e.target.reset();
  document.getElementById("description-counter").textContent = "0/500";

  showToast("Skill offer published successfully!");
  navigateTo("dashboard");
}

// ============================================
// REQUESTS
// ============================================

function renderRequests() {
  const list = document.getElementById("requests-list");
  const empty = document.getElementById("requests-empty");

  const filtered = sampleRequests.filter((r) => r.type === requestsTab);

  // Update tab buttons
  document
    .getElementById("tab-incoming")
    .classList.toggle("active", requestsTab === "incoming");
  document
    .getElementById("tab-outgoing")
    .classList.toggle("active", requestsTab === "outgoing");

  if (filtered.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    list.innerHTML = filtered
      .map(
        (req) => `
      <div class="card p-5">
        <div class="flex items-start gap-4">
          <div class="avatar-lg">${req.avatar}</div>
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-semibold">${
                  req.type === "incoming" ? req.from : req.to
                }</h4>
                <p class="text-sm opacity-60">${req.skill} · ${req.date}</p>
              </div>
              <span class="status-badge status-${req.status}">${
          req.status
        }</span>
            </div>
            <p class="text-sm opacity-70 mb-4">${req.message}</p>
            ${
              req.status === "pending" && req.type === "incoming"
                ? `
              <div class="flex gap-2">
                <button class="btn btn-primary text-sm py-2" onclick="handleRequest(${req.id}, 'accept')">Accept</button>
                <button class="btn btn-ghost text-sm py-2" onclick="handleRequest(${req.id}, 'decline')">Decline</button>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }
}

function handleRequest(id, action) {
  const req = sampleRequests.find((r) => r.id === id);
  if (req) {
    req.status = action === "accept" ? "accepted" : "declined";
    renderRequests();
    showToast(`Request ${action === "accept" ? "accepted" : "declined"}!`);
  }
}

// ============================================
// MESSAGES
// ============================================

function renderConversations() {
  const list = document.getElementById("conversations-list");
  list.innerHTML = sampleConversations
    .map(
      (conv) => `
    <div class="p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
      currentChatId === conv.id ? "bg-white/5" : ""
    }" onclick="selectConversation(${conv.id})">
      <div class="flex items-center gap-3">
        <div class="avatar relative">
          ${conv.avatar}
          ${
            conv.status === "online"
              ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-color"></span>'
              : ""
          }
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-medium">${conv.name}</span>
            <span class="text-xs opacity-50">${conv.time}</span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm opacity-60 truncate">${conv.lastMessage}</p>
            ${
              conv.unread > 0
                ? `<span class="w-5 h-5 rounded-full bg-primary-color text-xs flex items-center justify-center">${conv.unread}</span>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function selectConversation(id) {
  currentChatId = id;
  const conv = sampleConversations.find((c) => c.id === id);

  if (conv) {
    document.getElementById("chat-avatar").textContent = conv.avatar;
    document.getElementById("chat-name").textContent = conv.name;
    document.getElementById("chat-status").textContent =
      conv.status === "online" ? "Online" : "Offline";

    // Mark as read
    conv.unread = 0;
    renderConversations();
    renderMessages();

    // On mobile, show chat
    document.querySelector(".message-list-panel").classList.remove("active");
  }
}

function renderMessages() {
  const container = document.getElementById("chat-messages");
  const messages = sampleMessages[currentChatId] || [];

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="text-center opacity-40 py-8">
        <p>No messages yet. Start the conversation!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages
    .map(
      (msg) => `
    <div class="message-bubble ${msg.sent ? "sent" : "received"}">
      <p>${msg.text}</p>
      <span class="text-xs opacity-50 mt-1 block">${msg.time}</span>
    </div>
  `
    )
    .join("");

  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();

  if (!text || !currentChatId) return;

  if (!sampleMessages[currentChatId]) {
    sampleMessages[currentChatId] = [];
  }

  sampleMessages[currentChatId].push({
    id: Date.now(),
    text,
    sent: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  // Update conversation
  const conv = sampleConversations.find((c) => c.id === currentChatId);
  if (conv) {
    conv.lastMessage = text;
    conv.time = "now";
  }

  input.value = "";
  renderMessages();
  renderConversations();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Auth check (based on server-rendered data attribute)
  const isLoggedIn = document.body.dataset.auth === "true";
  if (!isLoggedIn) {
    const authModal = document.getElementById("auth-modal");
    if (authModal) authModal.classList.add("active");
  }

  // Navigation (delegate so SVG/span clicks still work)
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-page]");
    if (!target) return;
    const page = target.dataset.page;
    if (!page) return;
    e.preventDefault();
    navigateTo(page);
  });

  // Mobile menu
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) mobileMenu.classList.toggle("active");
    });
  }

  // Distance slider
  const distanceSlider = document.getElementById("distance-slider");
  const distanceValue = document.getElementById("distance-value");
  if (distanceSlider && distanceValue) {
    distanceSlider.addEventListener("input", (e) => {
      distanceValue.textContent = `${e.target.value} km`;
      updateRadiusAndSkills();
    });
  }

  // Category chips
  document.querySelectorAll("#category-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("#category-chips .chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCategory = chip.dataset.category;
      renderSkillsGrid();
    });
  });

  // Search (prevent page refresh and filter locally)
  const searchForm = document.querySelector("#page-find-skill form");
  const searchInput = document.getElementById("search-input");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      renderSkillsGrid();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderSkillsGrid();
    });
  }

  // Toggle switches
  document.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
    });
  });

  // Description counter
  const offerDescription = document.getElementById("offer-description");
  if (offerDescription) {
    offerDescription.addEventListener("input", (e) => {
      const counter = document.getElementById("description-counter");
      if (!counter) return;
      const length = e.target.value.length;
      counter.textContent = `${length}/500`;
      counter.classList.remove("warning", "error");
      if (length > 400) counter.classList.add("warning");
      if (length >= 500) counter.classList.add("error");
    });
  }

  // Experience slider
  const experienceSlider = document.getElementById("experience-slider");
  const experienceValue = document.getElementById("experience-value");
  const creditsInput = document.getElementById("offer-rate");
  const creditsInputHidden = document.getElementById("offer-rate-hidden");

  function updateExperienceAndCredits() {
    if (!experienceSlider) return;
    const data = getExperienceData(experienceSlider.value);
    if (experienceValue) experienceValue.textContent = data.label;
    if (creditsInput) creditsInput.value = data.credits;
    if (creditsInputHidden) creditsInputHidden.value = data.credits;
  }

  if (experienceSlider) {
    experienceSlider.addEventListener("input", updateExperienceAndCredits);
    // Initialize on load
    updateExperienceAndCredits();
  }

  // Offer form location fallback
  const offerForm = document.getElementById("offer-form");
  if (offerForm) {
    offerForm.addEventListener("submit", () => {
      const latInput = document.getElementById("offer-lat");
      const lngInput = document.getElementById("offer-lng");
      if (latInput && lngInput && (!latInput.value || !lngInput.value)) {
        setOfferLocationFields(
          DEFAULT_LOCATION.lat,
          DEFAULT_LOCATION.lng,
          "Location set to default area."
        );
      }
    });
  }

  // Session type chips
  document.querySelectorAll("[data-session]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("[data-session]")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });

  // Availability chips
  document.querySelectorAll("#availability-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active"); // toggle visually
      console.log(chip.dataset.day + " toggled"); // optional debug
    });
  });

  // Request tabs
  const incomingTab = document.getElementById("tab-incoming");
  const outgoingTab = document.getElementById("tab-outgoing");
  if (incomingTab) {
    incomingTab.addEventListener("click", () => {
      requestsTab = "incoming";
      renderRequests();
    });
  }
  if (outgoingTab) {
    outgoingTab.addEventListener("click", () => {
      requestsTab = "outgoing";
      renderRequests();
    });
  }

  // Send message
  const sendMessageBtn = document.getElementById("send-message-btn");
  if (sendMessageBtn) sendMessageBtn.addEventListener("click", sendMessage);
  const messageInput = document.getElementById("message-input");
  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  // Back to conversations list (mobile)
  const backToList = document.getElementById("back-to-list");
  if (backToList) {
    backToList.addEventListener("click", () => {
      const listPanel = document.querySelector(".message-list-panel");
      if (listPanel) listPanel.classList.add("active");
      currentChatId = null;
    });
  }

  updateUIFromConfig();
  navigateTo("dashboard");
});

function haversineDistance(coords1, coords2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function renderSkillMarkers(skills) {
  if (!map) return;
  // Clear existing skill markers
  skillMarkers.forEach((marker) => map.removeLayer(marker));
  skillMarkers = [];

  skills
    .filter((skill) => skill.hasLocation !== false)
    .forEach((skill) => {
      const marker = L.marker([skill.lat, skill.lng], {
        icon: L.divIcon({
          className: "custom-div-icon",
          html: `<div style='background-color:${getCategoryColor(
            skill.category
          )};' class='marker-pin'></div><i class='material-icons'>${
            skill.avatar
          }</i>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42],
        }),
      })
        .addTo(map)
        .bindPopup(`<b>${skill.title}</b><br>${skill.user}`);
      skillMarkers.push(marker);
    });
}

let map;
let userMarker;
let radiusCircle;
let skillMarkers = [];
let mapInitialized = false;
let userLocation = null;

function loadMapIfNeeded() {
  if (mapInitialized) return;

  mapInitialized = true;
  initMap();
}

// Call when tab opens / user scrolls / page is visible
// setTimeout(loadMapIfNeeded, 500);

// document.addEventListener("DOMContentLoaded", () => {
//   initMap();
// });

function initMap() {
  if (map) {
    map.remove();
    map = null;
  }
  map = L.map("map", {
    zoomControl: true,
    attributionControl: false,
    preferCanvas: true, // faster rendering
  }).setView([20.5937, 78.9629], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  getUserLocation();
}

function applyUserLocation(latitude, longitude) {
  userLocation = { lat: latitude, lng: longitude };

  if (map) {
    const radius = getRadius();
    const zoom = getZoomLevel(radius);
    map.setView([latitude, longitude], zoom);

    if (userMarker) {
      map.removeLayer(userMarker);
    }
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("You are here");

    drawRadius(latitude, longitude);
  }

  renderSkillsGrid();
}

function updateRadiusAndSkills() {
  if (userLocation && map) {
    const radius = getRadius();
    const zoom = getZoomLevel(radius);
    map.setView([userLocation.lat, userLocation.lng], zoom);
    drawRadius(userLocation.lat, userLocation.lng);
  }

  renderSkillsGrid();
}

function getUserLocation() {
  if (userLocation) {
    updateRadiusAndSkills();
    return;
  }

  if (!navigator.geolocation) {
    applyUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      applyUserLocation(latitude, longitude);
    },
    () => {
      applyUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
  );
}

function getRadius() {
  return Number(document.getElementById("distance-slider")?.value || 1);
}

function drawRadius(lat, lng) {
  if (radiusCircle) map.removeLayer(radiusCircle);

  const radiusInMeters = getRadius() * 1000;
  radiusCircle = L.circle([lat, lng], {
    radius: radiusInMeters,
    color: "#6366f1",
    fillColor: "#6366f1",
    fillOpacity: 0.1,
    weight: 2,
  }).addTo(map);
}

function getZoomLevel(radiusKm) {
  if (radiusKm <= 1) return 15;
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 10;
  if (radiusKm <= 50) return 9;
  return 8;
}

function fetchSkills(lat, lng, radius) {
  fetch(`/api/skills/?lat=${lat}&lng=${lng}&radius=${radius}`)
    .then((res) => res.json())
    .then(renderSkills);
}

function renderSkills(skills) {
  skillMarkers.forEach((m) => map.removeLayer(m));
  skillMarkers = [];

  skills.forEach((skill) => {
    const marker = L.marker([skill.lat, skill.lng])
      .addTo(map)
      .bindPopup(`<b>${skill.title}</b><br>${skill.user}`);

    skillMarkers.push(marker);
  });

  document.getElementById(
    "skills-count"
  ).innerText = `${skills.length} skills nearby`;
}

function stayOnFindSkill() {
  setTimeout(() => {
    navigateTo("find-skill");
  }, 50);
}
