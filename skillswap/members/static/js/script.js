const STORAGE_KEY = "skillswap-data-v2";

const defaultUsers = [
  {
    id: "u-1",
    name: "Demo User",
    email: "demo@skillswap.local",
    password: "password",
    credits: 5.2,
    pendingCredits: 1.5,
    trustRating: 4.3,
    offers: [
      {
        id: "offer-1",
        category: "Education",
        title: "Spanish Tutoring",
        description:
          "Conversational Spanish lessons for beginners and intermediate learners.",
        creditsPerHour: 1,
        rating: 4.8,
        distanceKm: 1.1
      },
      {
        id: "offer-2",
        category: "Technology",
        title: "Web Development",
        description:
          "Help with HTML, CSS, JavaScript, and React basics.",
        creditsPerHour: 1,
        rating: 4.7,
        distanceKm: 1.8
      },
      {
        id: "offer-3",
        category: "Arts",
        title: "Guitar Lessons",
        description: "Acoustic guitar fundamentals for all ages.",
        creditsPerHour: 1,
        rating: 4.9,
        distanceKm: 2.3
      }
    ],
    incomingRequests: [],
    sentRequests: [],
    conversations: [],
    stats: {
      offers: 3,
      requests: 0,
      sessions: 0
    }
  }
];

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      users: defaultUsers,
      currentUserId: null
    };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      return { users: defaultUsers, currentUserId: null };
    }
    return parsed;
  } catch {
    return {
      users: defaultUsers,
      currentUserId: null
    };
  }
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store = loadStore();

function $(q) {
  return document.querySelector(q);
}
function $all(q) {
  return Array.from(document.querySelectorAll(q));
}

function getCurrentUser() {
  return store.users.find((u) => u.id === store.currentUserId) || null;
}

/* PAGE LOADER */

const pageLoader = $("#pageLoader");

function showPageLoader() {
  pageLoader?.classList.add("active");
}

function hidePageLoader() {
  pageLoader?.classList.remove("active");
}

/* AUTH */

const authModal = $("#authModal");
const loginErrorEl = $("#loginError");
const signupErrorEl = $("#signupError");

function openAuth() {
  authModal.style.display = "flex";
}

function closeAuth() {
  authModal.style.display = "none";
}

function updateUserUI() {
  const user = getCurrentUser();
  const name = user?.name || "Guest";
  $("#dashboardName").textContent = name.split(" ")[0];
  $("#userNameTop").textContent = name.split(" ")[0];
  $("#userAvatar").textContent = name.charAt(0).toUpperCase();

  const credits = user?.credits ?? 0;
  const pending = user?.pendingCredits ?? 0;
  const rating = user?.trustRating ?? 4.5;

  $("#creditAmount").textContent = `${credits.toFixed(1)} credits`;
  $("#creditPending").textContent = `Pending ${pending.toFixed(1)}`;
  $("#creditsAvailable").textContent = `${credits.toFixed(1)} credits available`;
  $("#trustRating").textContent = `Trust rating: ${rating.toFixed(1)}`;
}

function showAuthIfNeeded() {
  if (!getCurrentUser()) {
    openAuth();
  } else {
    closeAuth();
    updateUserUI();
  }
}

function capitaliseWords(str) {
  return str
    .split(/[\s._-]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#loginEmail").value.trim().toLowerCase();
  const password = $("#loginPassword").value;

  const user = store.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    loginErrorEl.textContent = "No account found with that email.";
    return;
  }
  if (user.password !== password) {
    loginErrorEl.textContent = "Incorrect password. Try again.";
    return;
  }
  loginErrorEl.textContent = "";
  store.currentUserId = user.id;
  saveStore();
  closeAuth();
  updateUserUI();
  fullRender();
});

$("#signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#signupName").value.trim();
  const email = $("#signupEmail").value.trim().toLowerCase();
  const password = $("#signupPassword").value;

  if (!name || !email || !password) {
    signupErrorEl.textContent = "Please fill all fields.";
    return;
  }
  const exists = store.users.some((u) => u.email.toLowerCase() === email);
  if (exists) {
    signupErrorEl.textContent = "Email already registered. Use Login instead.";
    return;
  }

  const id = "u-" + Date.now();
  const newUser = {
    id,
    name: capitaliseWords(name),
    email,
    password,
    credits: 0,
    pendingCredits: 0,
    trustRating: 4.5,
    offers: [],
    incomingRequests: [],
    sentRequests: [],
    conversations: [],
    stats: {
      offers: 0,
      requests: 0,
      sessions: 0
    }
  };

  store.users.push(newUser);
  store.currentUserId = id;
  saveStore();
  signupErrorEl.textContent = "";
  closeAuth();
  updateUserUI();
  fullRender();
});

/* LOGOUT */

$("#logoutBtn").addEventListener("click", () => {
  store.currentUserId = null;
  saveStore();
  openAuth();
});

/* NAVIGATION */

let activePage = "dashboard";

function switchPage(target) {
  if (activePage === target) return;
  activePage = target;

  showPageLoader();
  setTimeout(() => {
    $all(".page").forEach((p) => p.classList.remove("active"));
    $("#page-" + target).classList.add("active");

    $all(".nav-link").forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.page === target)
    );

    hidePageLoader();
  }, 300);
}

$all(".nav-link").forEach((btn) => {
  btn.addEventListener("click", () => switchPage(btn.dataset.page));
});

$all("[data-page-jump]").forEach((btn) => {
  btn.addEventListener("click", () => switchPage(btn.dataset.pageJump));
});

/* DASHBOARD */

function renderDashboardSkeleton() {
  const container = $("#offeredSkillsList");
  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <div>
        <div class="skel-row">
          <div class="skel-col" style="width:100%;">
            <div class="skeleton skel-line-md" style="width:80px;"></div>
            <div class="skeleton skel-line-lg" style="width:70%;"></div>
          </div>
        </div>
        <div class="skeleton skel-line-md" style="margin-top:10px;width:100%;"></div>
      </div>
      <div class="skill-meta-row">
        <span class="skeleton skel-line-sm" style="width:90px;"></span>
        <span class="skeleton skel-line-sm" style="width:60px;"></span>
      </div>
    `;
    container.appendChild(card);
  }

  $("#statOffers").textContent = "—";
  $("#statRequests").textContent = "—";
  $("#statSessions").textContent = "—";
  $("#pendingCount").textContent = "—";
}

function renderDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  const container = $("#offeredSkillsList");
  container.innerHTML = "";

  if (!user.offers.length) {
    container.innerHTML =
      '<p class="muted">You have not posted any skill offers yet.</p>';
  } else {
    user.offers.forEach((offer) => {
      const div = document.createElement("div");
      div.className = "skill-card fade-in";
      div.innerHTML = `
        <div>
          <div class="skill-card-header">
            <div>
              <div class="badge">${offer.category}</div>
              <div class="skill-card-title">${offer.title}</div>
            </div>
          </div>
          <p class="skill-card-desc">${offer.description}</p>
        </div>
        <div class="skill-meta-row">
          <span class="stat-chip">${offer.creditsPerHour} credit / hour</span>
          <span class="muted">⭐ ${offer.rating?.toFixed?.(1) || "5.0"}</span>
        </div>
      `;
      container.appendChild(div);
    });
  }

  $("#statOffers").textContent = user.offers.length;
  $("#statRequests").textContent = user.incomingRequests.length;
  $("#statSessions").textContent = user.stats.sessions;
  $("#pendingCount").textContent = user.incomingRequests.length;
}

/* OFFER A SKILL */

const descInput = $("#offerDescription");
if (descInput) {
  descInput.addEventListener("input", () => {
    $("#descCount").textContent = descInput.value.length;
  });
}

const levelMap = {
  1: "Novice",
  2: "Beginner",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert"
};

const experienceSlider = $("#experienceSlider");
const experienceLabel = $("#experienceLabel");

if (experienceSlider) {
  experienceSlider.addEventListener("input", () => {
    experienceLabel.textContent = levelMap[experienceSlider.value];
  });
}

$("#offerSkillForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    openAuth();
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = `<span class="loader-inline"></span>`;
  submitBtn.disabled = true;

  const cat = $("#offerCategory").value;
  const title = $("#offerTitle").value.trim();
  const desc = $("#offerDescription").value.trim();
  if (!cat || !title || !desc) return;

  const newOffer = {
    id: "offer-" + Date.now(),
    category: cat,
    title,
    description: desc,
    creditsPerHour: 1,
    rating: 5.0,
    distanceKm: 1.0
  };
  user.offers.unshift(newOffer);
  user.stats.offers = user.offers.length;
  saveStore();

  setTimeout(() => {
    renderDashboard();
    renderNearbySkills();
    e.target.reset();
    $("#descCount").textContent = "0";
    experienceSlider.value = 3;
    experienceLabel.textContent = levelMap[3];
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    switchPage("dashboard");
  }, 400);
});

/* FIND A SKILL */

const distanceSlider = $("#distanceSlider");
const distanceLabel = $("#distanceLabel");
const mapRadius = $("#mapRadius");

if (distanceSlider) {
  distanceSlider.addEventListener("input", () => {
    distanceLabel.textContent = distanceSlider.value + " km";
    mapRadius.textContent = distanceSlider.value + " km";
    renderNearbySkills();
  });
}

$("#searchSkillInput").addEventListener("input", renderNearbySkills);

$all("#categoryChips .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    $all("#categoryChips .chip").forEach((c) =>
      c.classList.remove("chip-active")
    );
    chip.classList.add("chip-active");
    renderNearbySkills();
  });
});

$("#availableNowToggle").addEventListener("change", renderNearbySkills);
$("#weekendToggle").addEventListener("change", renderNearbySkills);

function renderNearbySkeletons() {
  const container = $("#nearbySkillsList");
  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <div>
        <div class="skel-row">
          <div class="skeleton skel-avatar"></div>
          <div class="skel-col" style="width:100%;">
            <div class="skeleton skel-line-lg" style="width:60%;"></div>
            <div class="skeleton skel-line-sm" style="width:40%;"></div>
          </div>
        </div>
        <div class="skeleton skel-line-md" style="margin-top:10px;width:100%;"></div>
      </div>
      <div class="skill-meta-row">
        <span class="skeleton skel-line-sm" style="width:90px;"></span>
        <span class="skeleton skel-line-sm" style="width:120px;"></span>
        <span class="skeleton skel-line-sm" style="width:70px;"></span>
      </div>
    `;
    container.appendChild(card);
  }
}

function renderNearbySkills() {
  const container = $("#nearbySkillsList");
  container.innerHTML = "";

  const user = getCurrentUser();
  const offers = store.users.flatMap((u) => u.offers);

  const search = $("#searchSkillInput").value.trim().toLowerCase();
  const activeChip = $("#categoryChips .chip-active");
  const category = activeChip ? activeChip.dataset.cat : "All";
  const maxDistance = parseFloat(distanceSlider.value);

  offers.forEach((offer) => {
    if (search && !offer.title.toLowerCase().includes(search)) return;
    if (category !== "All" && offer.category !== category) return;
    if (offer.distanceKm > maxDistance) return;

    const card = document.createElement("div");
    card.className = "skill-card fade-in";
    card.innerHTML = `
      <div>
        <div class="skill-card-header">
          <div class="conv-avatar">${offer.title.charAt(0)}</div>
          <div>
            <div class="skill-card-title">${offer.title}</div>
            <div class="muted" style="font-size:12px;">${offer.category}</div>
          </div>
        </div>
        <p class="skill-card-desc">${offer.description}</p>
      </div>
      <div class="skill-meta-row">
        <span class="stat-chip">${offer.creditsPerHour} credit / hour</span>
        <span class="muted">⭐ ${offer.rating?.toFixed?.(1) || "5.0"} · ${
      offer.distanceKm
    } km away</span>
        <button class="btn primary small">Request</button>
      </div>
    `;
    container.appendChild(card);
  });

  if (!container.children.length) {
    container.innerHTML =
      '<p class="muted">No skills found. Try adjusting your filters.</p>';
  }
}

/* REQUESTS */

function renderRequestsSkeleton() {
  $("#incomingCount").textContent = "—";
  $("#sentCount").textContent = "—";
  const incomingContainer = $("#incomingRequestsList");
  incomingContainer.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const div = document.createElement("div");
    div.className = "request-card";
    div.innerHTML = `
      <div class="req-main">
        <div class="skeleton skel-line-lg" style="width:70%;"></div>
        <div class="skeleton skel-line-sm" style="width:60%;"></div>
      </div>
      <div>
        <div class="skeleton skel-line-sm" style="width:80%;"></div>
        <div class="skeleton skel-line-sm" style="width:80%;margin-top:4px;"></div>
      </div>
      <div class="req-actions">
        <span class="skeleton skel-line-sm" style="width:90px;"></span>
        <span class="skeleton skel-line-sm" style="width:70px;"></span>
      </div>
    `;
    incomingContainer.appendChild(div);
  }

  const sentContainer = $("#sentRequestsList");
  sentContainer.innerHTML = `
    <div class="skeleton skel-line-md" style="width:60%;"></div>
    <div class="skeleton skel-line-md" style="width:40%;margin-top:6px;"></div>
  `;
}

function renderRequests() {
  const user = getCurrentUser();
  if (!user) return;

  $("#incomingCount").textContent = user.incomingRequests.length;
  $("#sentCount").textContent = user.sentRequests.length;

  const incomingContainer = $("#incomingRequestsList");
  incomingContainer.innerHTML = "";

  if (!user.incomingRequests.length) {
    incomingContainer.innerHTML =
      '<p class="muted">You have no incoming requests yet.</p>';
  }

  user.incomingRequests.forEach((r) => {
    const div = document.createElement("div");
    div.className = "request-card fade-in";
    div.innerHTML = `
      <div class="req-main">
        <div class="req-name">${r.name}</div>
        <div class="req-meta">${r.skill} · ${r.distanceKm} km</div>
      </div>
      <div>
        <div class="req-meta">${r.date}</div>
        <div class="req-meta">${r.time} · ${r.duration}</div>
        <div class="req-meta">${r.mode}</div>
      </div>
      <div class="req-actions">
        <div class="req-tags">
          <span class="req-tag credit">${r.credits} credit</span>
          <span class="req-tag ${
            r.status === "Scheduled"
              ? "scheduled"
              : r.status === "Pending"
              ? "status"
              : "credit"
          }">${r.status}</span>
        </div>
        <div class="req-actions">
          <button class="btn ghost small">Decline</button>
          <button class="btn primary small">${r.badge || "Accept"}</button>
        </div>
      </div>
    `;
    incomingContainer.appendChild(div);
  });

  const sentContainer = $("#sentRequestsList");
  sentContainer.innerHTML = "";
  if (!user.sentRequests.length) {
    sentContainer.innerHTML =
      '<p class="muted">You have not sent any requests yet.</p>';
  }
}

$all("[data-req-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.reqTab;
    $all("[data-req-tab]").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    $("#incomingRequestsPanel").classList.toggle(
      "hidden",
      target !== "incoming"
    );
    $("#sentRequestsPanel").classList.toggle("hidden", target !== "sent");
  });
});

/* MESSAGES (simple per-user placeholder) */

function renderConversationsSkeleton() {
  const list = $("#conversationList");
  list.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const item = document.createElement("div");
    item.className = "conv-item";
    item.innerHTML = `
      <div class="skeleton skel-avatar"></div>
      <div class="skel-col">
        <div class="skeleton skel-line-md" style="width:70%;"></div>
        <div class="skeleton skel-line-sm" style="width:55%;"></div>
      </div>
      <div class="skeleton skel-line-sm" style="width:40px;"></div>
    `;
    list.appendChild(item);
  }

  const thread = $("#messageThread");
  thread.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const row = document.createElement("div");
    row.className = "msg-row";
    row.innerHTML = `
      <div class="skeleton skel-line-md" style="width:60%;border-radius:16px;"></div>
    `;
    thread.appendChild(row);
  }
}

let activeConvId = null;

function renderConversations() {
  const user = getCurrentUser();
  const list = $("#conversationList");
  list.innerHTML = "";

  if (!user || !user.conversations.length) {
    list.innerHTML = '<p class="muted">No conversations yet.</p>';
    $("#messageThread").innerHTML =
      '<p class="muted">Start a new chat to begin messaging.</p>';
    $("#activeChatName").textContent = "Messages";
    $("#activeChatSubtitle").textContent = "";
    return;
  }

  if (!activeConvId) activeConvId = user.conversations[0].id;

  user.conversations.forEach((c) => {
    const item = document.createElement("div");
    item.className = "conv-item" + (c.id === activeConvId ? " active" : "");
    item.dataset.convId = c.id;
    item.innerHTML = `
      <div class="conv-avatar">${c.name.charAt(0)}</div>
      <div class="conv-main">
        <div class="conv-name">${c.name}</div>
        <div class="conv-sub">${c.subtitle}</div>
      </div>
      <div class="conv-time">${c.lastTime}</div>
    `;
    item.addEventListener("click", () => {
      activeConvId = c.id;
      renderConversations();
      renderActiveConversation();
    });
    list.appendChild(item);
  });

  renderActiveConversation();
}

function renderActiveConversation() {
  const user = getCurrentUser();
  if (!user) return;
  const conv = user.conversations.find((c) => c.id === activeConvId);
  const thread = $("#messageThread");
  if (!conv) {
    thread.innerHTML =
      '<p class="muted">Select a conversation from the left.</p>';
    $("#activeChatName").textContent = "Messages";
    $("#activeChatSubtitle").textContent = "";
    return;
  }

  $("#activeChatName").textContent = conv.name;
  $("#activeChatSubtitle").textContent = `You matched with ${conv.name} for "${conv.subtitle}".`;

  thread.innerHTML = "";
  conv.messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "msg-row " + (m.from === "me" ? "me" : "them");
    row.innerHTML = `
      <div>
        <div class="msg-bubble ${m.from === "me" ? "me" : "them"}">
          ${m.text}
        </div>
        <div class="msg-time">${m.time}</div>
      </div>
    `;
    thread.appendChild(row);
  });
  thread.scrollTop = thread.scrollHeight;
}

$("#messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    openAuth();
    return;
  }

  const text = $("#messageInput").value.trim();
  if (!text) return;

  if (!activeConvId) {
    const conv = {
      id: "conv-" + Date.now(),
      name: "New Neighbor",
      subtitle: "SkillSwap chat",
      lastTime: "Just now",
      messages: []
    };
    user.conversations.unshift(conv);
    activeConvId = conv.id;
  }

  const conv = user.conversations.find((c) => c.id === activeConvId);
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  conv.messages.push({ from: "me", text, time });
  conv.lastTime = "Just now";
  $("#messageInput").value = "";
  saveStore();
  renderConversations();
  renderActiveConversation();
});

$("#messageSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const user = getCurrentUser();
  const list = $("#conversationList");
  list.innerHTML = "";

  if (!user) return;
  user.conversations.forEach((c) => {
    if (
      c.name.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q)
    ) {
      const item = document.createElement("div");
      item.className = "conv-item" + (c.id === activeConvId ? " active" : "");
      item.dataset.convId = c.id;
      item.innerHTML = `
        <div class="conv-avatar">${c.name.charAt(0)}</div>
        <div class="conv-main">
          <div class="conv-name">${c.name}</div>
          <div class="conv-sub">${c.subtitle}</div>
        </div>
        <div class="conv-time">${c.lastTime}</div>
      `;
      item.addEventListener("click", () => {
        activeConvId = c.id;
        renderConversations();
        renderActiveConversation();
      });
      list.appendChild(item);
    }
  });

  if (!list.children.length) {
    list.innerHTML = '<p class="muted">No conversations found.</p>';
  }
});

$("#newChatBtn").addEventListener("click", () => {
  const user = getCurrentUser();
  if (!user) {
    openAuth();
    return;
  }

  const name = prompt("Enter name for a new chat:");
  if (!name) return;
  const conv = {
    id: "conv-" + Date.now(),
    name,
    subtitle: "New connection",
    lastTime: "Just now",
    messages: [
      {
        from: "me",
        text: "Hi " + name + "! Welcome to SkillSwap Local 👋",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }
    ]
  };
  user.conversations.unshift(conv);
  activeConvId = conv.id;
  saveStore();
  renderConversations();
  renderActiveConversation();
});

/* FULL RENDER */

function fullRender() {
  updateUserUI();
  renderDashboard();
  renderNearbySkills();
  renderRequests();
  renderConversations();
}

document.addEventListener("DOMContentLoaded", () => {
  showPageLoader();
  renderDashboardSkeleton();
  renderNearbySkeletons();
  renderRequestsSkeleton();
  renderConversationsSkeleton();

  setTimeout(() => {
    showAuthIfNeeded();
    if (getCurrentUser()) fullRender();
    hidePageLoader();
  }, 700);
});
