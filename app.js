const CHANNELS_URL = "./channels_paraguay.json";
const ALL_CATEGORY = "Todos";
const FAVORITES_KEY = "tvLibrePyFavorites";
const LAST_CHANNEL_KEY = "tvLibrePyLastChannel";
const LOGO_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const state = {
  channels: [],
  filteredChannels: [],
  selectedCategory: ALL_CATEGORY,
  searchText: "",
  favoritesOnly: false,
  favorites: new Set(),
  hls: null,
};

const elements = {
  video: document.getElementById("videoPlayer"),
  playerCard: document.getElementById("playerCard"),
  overlay: document.getElementById("playerOverlay"),
  status: document.getElementById("statusMessage"),
  channelCount: document.getElementById("channelCount"),
  nowPlayingName: document.getElementById("nowPlayingName"),
  nowPlayingMeta: document.getElementById("nowPlayingMeta"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  searchInput: document.getElementById("searchInput"),
  lastChannelSlot: document.getElementById("lastChannelSlot"),
  categoryChips: document.getElementById("categoryChips"),
  favoritesFilterButton: document.getElementById("favoritesFilterButton"),
  channelGrid: document.getElementById("channelGrid"),
  resultsCount: document.getElementById("resultsCount"),
};

async function init() {
  bindEvents();
  loadFavorites();
  renderLastChannel();
  setStatus("Cargando canales...");

  try {
    const response = await fetch(CHANNELS_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar la lista (${response.status})`);
    }

    const channels = await response.json();
    state.channels = channels
      .filter(isValidChannel)
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

    elements.channelCount.textContent = state.channels.length;
    renderCategories();
    renderFavoriteFilter();
    filterAndRender();
    setStatus("");
  } catch (error) {
    setStatus("No se pudo cargar la lista de canales", true);
    elements.channelGrid.innerHTML = `<div class="empty-state">No hay canales disponibles.</div>`;
  }
}

function isValidChannel(channel) {
  return Boolean(
    channel &&
      typeof channel.name === "string" &&
      channel.name.trim() &&
      typeof channel.url === "string" &&
      channel.url.trim() &&
      channel.working !== false,
  );
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchText = event.target.value;
    filterAndRender();
  });

  elements.fullscreenButton.addEventListener("click", () => {
    const target = elements.playerCard || elements.video;
    if (target.requestFullscreen) {
      target.requestFullscreen();
    }
  });

  elements.favoritesFilterButton.addEventListener("click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    renderFavoriteFilter();
    filterAndRender();
  });

  elements.video.addEventListener("waiting", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("loadstart", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("playing", () => setStatus(""));
  elements.video.addEventListener("error", () => {
    setStatus("No se pudo reproducir este canal", true);
    showOverlay("Error de reproducción", "Prueba con otro canal o intenta más tarde.");
  });

  document.addEventListener("keydown", handleGlobalNavigation);
}

function renderCategories() {
  const categories = [
    ALL_CATEGORY,
    ...new Set(state.channels.map((channel) => channel.category || "General")),
  ].sort((a, b) => {
    if (a === ALL_CATEGORY) return -1;
    if (b === ALL_CATEGORY) return 1;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });

  elements.categoryChips.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip${category === state.selectedCategory ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => {
      state.selectedCategory = category;
      renderCategories();
      filterAndRender();
    });
    elements.categoryChips.appendChild(button);
  });
}

function renderFavoriteFilter() {
  elements.favoritesFilterButton.textContent = `Favoritos (${state.favorites.size})`;
  elements.favoritesFilterButton.classList.toggle("is-active", state.favoritesOnly);
  elements.favoritesFilterButton.setAttribute("aria-pressed", String(state.favoritesOnly));
}

function filterAndRender() {
  const query = state.searchText.trim().toLowerCase();
  state.filteredChannels = state.channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(query);
    const matchesCategory =
      state.selectedCategory === ALL_CATEGORY ||
      (channel.category || "General") === state.selectedCategory;
    const matchesFavorite = !state.favoritesOnly || state.favorites.has(channel.url);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  elements.resultsCount.textContent = `Mostrando ${state.filteredChannels.length} de ${state.channels.length} canales`;
  renderChannels();
}

function renderChannels() {
  elements.channelGrid.innerHTML = "";

  if (state.filteredChannels.length === 0) {
    const message =
      state.favoritesOnly && state.favorites.size === 0
        ? "No tienes canales favoritos"
        : "No se encontraron canales";
    elements.channelGrid.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }

  state.filteredChannels.forEach((channel, index) => {
    const card = document.createElement("article");
    card.className = "channel-card";
    card.innerHTML = `
      <button class="channel-play" type="button" data-index="${index}">
        ${renderLogo(channel)}
        <span class="channel-info">
          <strong>${escapeHtml(channel.name)}</strong>
          <span>${escapeHtml(channel.category || "General")} | ${escapeHtml(channel.country || "PY")}</span>
          <span class="badges">${renderBadges(channel)}</span>
        </span>
      </button>
      <button class="favorite-button" type="button" aria-label="Cambiar favorito de ${escapeAttribute(channel.name)}">
        ${state.favorites.has(channel.url) ? "★" : "☆"}
      </button>
    `;

    const playButton = card.querySelector(".channel-play");
    const favoriteButton = card.querySelector(".favorite-button");
    playButton.addEventListener("click", () => playChannel(channel));
    playButton.addEventListener("keydown", (event) => handleCardKeydown(event, index));
    favoriteButton.addEventListener("click", () => toggleFavorite(channel.url));
    elements.channelGrid.appendChild(card);
  });
}

function renderLogo(channel) {
  const name = channel.name || "";
  const initial = escapeHtml(name.slice(0, 1).toUpperCase());
  const logo = String(channel.logo || "").trim();

  if (!logo) {
    return `<span class="logo">${initial}</span>`;
  }

  const src = getLogoSource(logo, 0);
  return `
    <span class="logo" data-logo="${escapeAttribute(logo)}" data-logo-index="0" data-initial="${initial}">
      <img src="${escapeAttribute(src)}" alt="Logo de ${escapeAttribute(name)}" onerror="handleLogoError(this)">
    </span>
  `;
}

function getLogoSource(logo, extensionIndex) {
  if (/^https?:\/\//i.test(logo)) {
    return logo;
  }

  const extension = LOGO_EXTENSIONS[extensionIndex] || LOGO_EXTENSIONS[0];
  return `./assets/logos/${encodeURIComponent(logo)}.${extension}`;
}

function handleLogoError(image) {
  const container = image.parentElement;
  const logo = container?.dataset.logo || "";
  const currentIndex = Number(container?.dataset.logoIndex || "0");
  const nextIndex = currentIndex + 1;

  if (!/^https?:\/\//i.test(logo) && nextIndex < LOGO_EXTENSIONS.length) {
    container.dataset.logoIndex = String(nextIndex);
    image.src = getLogoSource(logo, nextIndex);
    return;
  }

  if (container) {
    container.textContent = container.dataset.initial || "";
  }
}

window.handleLogoError = handleLogoError;

function renderBadges(channel) {
  const badges = [];
  if (channel.isLikelyStable) badges.push(`<span class="badge">Estable</span>`);
  if (channel.isTokenized) badges.push(`<span class="badge warning">Temporal</span>`);
  if (channel.isChunklist) badges.push(`<span class="badge warning">Interno</span>`);
  return badges.join("");
}

function handleCardKeydown(event, index) {
  const cards = Array.from(document.querySelectorAll(".channel-play"));
  const columns = getGridColumnCount();
  let nextIndex = index;

  if (event.key === "ArrowRight") nextIndex = Math.min(index + 1, cards.length - 1);
  if (event.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0);
  if (event.key === "ArrowDown") nextIndex = Math.min(index + columns, cards.length - 1);
  if (event.key === "ArrowUp") nextIndex = Math.max(index - columns, 0);

  if (nextIndex !== index) {
    event.preventDefault();
    focusElement(cards[nextIndex]);
  }
}

function handleGlobalNavigation(event) {
  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
    return;
  }

  const active = document.activeElement;
  if (active?.classList?.contains("channel-play")) {
    return;
  }

  if (active?.tagName === "INPUT" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    return;
  }

  const focusables = getFocusableElements();
  const currentIndex = focusables.indexOf(active);
  if (currentIndex < 0) {
    event.preventDefault();
    focusElement(focusables[0]);
    return;
  }

  const nextIndex =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? Math.min(currentIndex + 1, focusables.length - 1)
      : Math.max(currentIndex - 1, 0);

  if (nextIndex !== currentIndex) {
    event.preventDefault();
    focusElement(focusables[nextIndex]);
  }
}

function focusElement(element) {
  if (!element) {
    return;
  }

  element.focus();
  element.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: "smooth",
  });
}

function getFocusableElements() {
  return Array.from(
    document.querySelectorAll("button:not([disabled]), input:not([disabled]), video[controls]")
  ).filter((element) => element.offsetParent !== null);
}

function getGridColumnCount() {
  const grid = elements.channelGrid;
  const firstCard = grid.querySelector(".channel-card");
  if (!firstCard) return 1;
  const gridWidth = grid.getBoundingClientRect().width;
  const cardWidth = firstCard.getBoundingClientRect().width;
  return Math.max(1, Math.round(gridWidth / cardWidth));
}

function playChannel(channel) {
  cleanupHls();
  setStatus("Cargando canal...");
  hideOverlay();
  saveLastChannel(channel);
  renderLastChannel();

  elements.nowPlayingName.textContent = channel.name;
  elements.nowPlayingMeta.textContent = `${channel.category || "General"} | ${channel.country || "PY"}`;

  if (window.Hls && Hls.isSupported()) {
    state.hls = new Hls();
    state.hls.loadSource(channel.url);
    state.hls.attachMedia(elements.video);
    state.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      elements.video.play().catch(() => {
        setStatus("Presiona reproducir para iniciar el canal.");
      });
    });
    state.hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setStatus("No se pudo reproducir este canal", true);
        showOverlay("Error de reproducción", "El stream no respondió correctamente.");
        cleanupHls();
      }
    });
    return;
  }

  if (elements.video.canPlayType("application/vnd.apple.mpegurl")) {
    elements.video.src = channel.url;
    elements.video.play().catch(() => {
      setStatus("Presiona reproducir para iniciar el canal.");
    });
    return;
  }

  setStatus("Este navegador no soporta reproducción HLS", true);
  showOverlay("HLS no disponible", "Prueba con un navegador compatible o habilita HLS.js.");
}

function cleanupHls() {
  if (state.hls) {
    state.hls.destroy();
    state.hls = null;
  }
  elements.video.removeAttribute("src");
  elements.video.load();
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    state.favorites = new Set(Array.isArray(saved) ? saved : []);
  } catch {
    state.favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
}

function toggleFavorite(channelUrl) {
  if (state.favorites.has(channelUrl)) {
    state.favorites.delete(channelUrl);
  } else {
    state.favorites.add(channelUrl);
  }
  saveFavorites();
  renderFavoriteFilter();
  filterAndRender();
}

function saveLastChannel(channel) {
  localStorage.setItem(LAST_CHANNEL_KEY, JSON.stringify(channel));
}

function getLastChannel() {
  try {
    const channel = JSON.parse(localStorage.getItem(LAST_CHANNEL_KEY) || "null");
    return isValidChannel(channel) ? channel : null;
  } catch {
    return null;
  }
}

function renderLastChannel() {
  const channel = getLastChannel();
  elements.lastChannelSlot.innerHTML = "";

  if (!channel) {
    return;
  }

  const card = document.createElement("div");
  card.className = "last-channel-card";
  card.innerHTML = `
    ${renderLogo(channel)}
    <span>
      <small>Último canal</small>
      <strong>${escapeHtml(channel.name)}</strong>
      <em>${escapeHtml(channel.category || "General")}</em>
    </span>
    <button type="button" class="primary-button compact">Reproducir</button>
  `;
  card.querySelector("button").addEventListener("click", () => playChannel(channel));
  elements.lastChannelSlot.appendChild(card);
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", isError);
}

function showOverlay(title, message) {
  elements.overlay.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  elements.overlay.classList.remove("is-hidden");
}

function hideOverlay() {
  elements.overlay.classList.add("is-hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

init();
