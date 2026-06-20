const DATA_URLS = {
  tv: "./channels_paraguay.json",
  radio: "./radios_paraguay.json",
};

const DESDEPARAGUAY_MOBILE_LIST_URL = "https://www.desdeparaguay.net/android/movil_list.aspx?v=2";
const ALL_CATEGORY = "Todos";
const PENDING_CATEGORY = "Pendientes";
const LOGO_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
const MODE_COPY = {
  tv: {
    title: "TV Libre Paraguay",
    subtitle: "Canales en vivo",
    itemLabel: "canales",
    searchLabel: "Buscar canal",
    searchPlaceholder: "Nombre del canal",
    categoryLabel: "Categoría",
    empty: "No se encontraron canales",
    noFavorites: "No tienes canales favoritos",
    loading: "Cargando canales...",
    loadError: "No se pudo cargar la lista de canales",
    selectedTitle: "Ningún canal seleccionado",
    selectedMeta: "Busca y elige un canal de la lista.",
    overlayTitle: "Selecciona un canal",
    overlayText: "La reproducción aparecerá aquí.",
    hint: "Enter/OK reproduce el canal seleccionado",
    lastLabel: "Último canal",
    action: "Reproducir",
  },
  radio: {
    title: "Radios Paraguay",
    subtitle: "Emisoras en vivo",
    itemLabel: "radios",
    searchLabel: "Buscar radio",
    searchPlaceholder: "Nombre de la emisora",
    categoryLabel: "Categoría",
    empty: "No se encontraron radios",
    noFavorites: "No tienes radios favoritas",
    loading: "Cargando radios...",
    loadError: "No se pudo cargar la lista de radios",
    selectedTitle: "Ninguna radio seleccionada",
    selectedMeta: "Busca y elige una radio de la lista.",
    overlayTitle: "Selecciona una radio",
    overlayText: "La reproducción de audio aparecerá aquí.",
    hint: "Enter/OK reproduce la radio seleccionada",
    lastLabel: "Última radio",
    action: "Escuchar",
  },
};

const state = {
  mode: "tv",
  tv: createModeState(),
  radio: createModeState(),
  hls: null,
  youtubeFrame: null,
  webFrame: null,
};

const elements = {
  tvModeButton: document.getElementById("tvModeButton"),
  radioModeButton: document.getElementById("radioModeButton"),
  title: document.getElementById("appTitle"),
  subtitle: document.getElementById("appSubtitle"),
  itemCount: document.getElementById("itemCount"),
  itemCountLabel: document.getElementById("itemCountLabel"),
  video: document.getElementById("videoPlayer"),
  audio: document.getElementById("audioPlayer"),
  playerCard: document.getElementById("playerCard"),
  overlay: document.getElementById("playerOverlay"),
  nowPlayingEyebrow: document.getElementById("nowPlayingEyebrow"),
  nowPlayingName: document.getElementById("nowPlayingName"),
  nowPlayingMeta: document.getElementById("nowPlayingMeta"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  searchLabel: document.getElementById("searchLabel"),
  searchInput: document.getElementById("searchInput"),
  categoryLabel: document.getElementById("categoryLabel"),
  lastItemSlot: document.getElementById("lastItemSlot"),
  categoryChips: document.getElementById("categoryChips"),
  favoritesFilterButton: document.getElementById("favoritesFilterButton"),
  itemGrid: document.getElementById("itemGrid"),
  resultsCount: document.getElementById("resultsCount"),
  keyboardHint: document.getElementById("keyboardHint"),
  status: document.getElementById("statusMessage"),
};

function createModeState() {
  return {
    items: [],
    filteredItems: [],
    selectedCategory: ALL_CATEGORY,
    searchText: "",
    favoritesOnly: false,
    favorites: new Set(),
    loaded: false,
  };
}

async function init() {
  bindEvents();
  loadFavorites("tv");
  loadFavorites("radio");
  applyMode("tv");
  await loadCurrentMode();
}

function bindEvents() {
  elements.tvModeButton.addEventListener("click", () => switchMode("tv"));
  elements.radioModeButton.addEventListener("click", () => switchMode("radio"));

  elements.searchInput.addEventListener("input", (event) => {
    currentState().searchText = event.target.value;
    filterAndRender();
  });

  elements.fullscreenButton.addEventListener("click", () => {
    const target = state.mode === "tv" ? elements.playerCard : document.documentElement;
    if (target.requestFullscreen) target.requestFullscreen();
  });

  elements.favoritesFilterButton.addEventListener("click", () => {
    const modeState = currentState();
    modeState.favoritesOnly = !modeState.favoritesOnly;
    renderFavoriteFilter();
    filterAndRender();
  });

  elements.video.addEventListener("waiting", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("loadstart", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("playing", () => setStatus(""));
  elements.video.addEventListener("error", () => {
    if (state.mode === "tv") {
      setStatus("No se pudo reproducir este canal", true);
      showOverlay("Error de reproducción", "Prueba con otro canal o intenta más tarde.");
    }
  });

  elements.audio.addEventListener("waiting", () => setStatus("Cargando radio..."));
  elements.audio.addEventListener("loadstart", () => setStatus("Cargando radio..."));
  elements.audio.addEventListener("playing", () => setStatus(""));
  elements.audio.addEventListener("error", () => {
    if (state.mode === "radio") {
      setStatus("No se pudo cargar esta radio", true);
    }
  });

  document.addEventListener("keydown", handleGlobalNavigation);
}

async function switchMode(mode) {
  if (state.mode === mode) return;
  cleanupPlayback();
  state.mode = mode;
  applyMode(mode);
  await loadCurrentMode();
}

function applyMode(mode) {
  const copy = MODE_COPY[mode];
  const modeState = currentState();
  document.body.dataset.mode = mode;

  elements.tvModeButton.classList.toggle("is-active", mode === "tv");
  elements.radioModeButton.classList.toggle("is-active", mode === "radio");
  elements.tvModeButton.setAttribute("aria-pressed", String(mode === "tv"));
  elements.radioModeButton.setAttribute("aria-pressed", String(mode === "radio"));

  elements.title.textContent = copy.title;
  elements.subtitle.textContent = copy.subtitle;
  elements.itemCountLabel.textContent = copy.itemLabel;
  elements.searchLabel.textContent = copy.searchLabel;
  elements.searchInput.placeholder = copy.searchPlaceholder;
  elements.searchInput.value = modeState.searchText;
  elements.categoryLabel.textContent = copy.categoryLabel;
  elements.keyboardHint.textContent = copy.hint;
  elements.fullscreenButton.hidden = mode === "radio";

  elements.video.hidden = mode !== "tv";
  elements.audio.hidden = mode !== "radio";
  elements.nowPlayingEyebrow.textContent = mode === "tv" ? "Reproduciendo" : "Escuchando";
  elements.nowPlayingName.textContent = copy.selectedTitle;
  elements.nowPlayingMeta.textContent = copy.selectedMeta;
  showOverlay(copy.overlayTitle, copy.overlayText);
  renderLastItem();
  renderFavoriteFilter();
}

async function loadCurrentMode() {
  const mode = state.mode;
  const modeState = currentState();
  const copy = MODE_COPY[mode];

  if (modeState.loaded) {
    renderAll();
    return;
  }

  setStatus(copy.loading);
  elements.itemGrid.innerHTML = `<div class="empty-state">${copy.loading}</div>`;

  try {
    const response = await fetch(DATA_URLS[mode], { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const items = await response.json();
    modeState.items = items
      .filter((item) => isValidItem(item))
      .sort((a, b) => sortItemsForMode(a, b, mode));
    modeState.loaded = true;
    setStatus("");
    renderAll();
  } catch {
    modeState.items = [];
    modeState.loaded = true;
    setStatus(copy.loadError, true);
    renderAll();
  }
}

function renderAll() {
  elements.itemCount.textContent = currentState().items.length;
  renderCategories();
  renderFavoriteFilter();
  renderLastItem();
  filterAndRender();
}

function isValidItem(item) {
  const allowsPending = state.mode === "radio";
  return Boolean(
    item &&
      typeof item.name === "string" &&
      item.name.trim() &&
      typeof item.url === "string" &&
      item.url.trim() &&
      (allowsPending || item.working !== false),
  );
}

function sortItemsForMode(a, b, mode) {
  if (mode === "radio") {
    if (a.working === false && b.working !== false) return 1;
    if (a.working !== false && b.working === false) return -1;
    return 0;
  }

  return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
}

function renderCategories() {
  const modeState = currentState();
  const hasPending = state.mode === "radio" && modeState.items.some((item) => item.working === false);
  const categories = [
    ALL_CATEGORY,
    ...new Set(modeState.items.map((item) => item.category || "General")),
    ...(hasPending ? [PENDING_CATEGORY] : []),
  ].sort((a, b) => {
    if (a === ALL_CATEGORY) return -1;
    if (b === ALL_CATEGORY) return 1;
    if (a === PENDING_CATEGORY) return 1;
    if (b === PENDING_CATEGORY) return -1;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });

  elements.categoryChips.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip${category === modeState.selectedCategory ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => {
      modeState.selectedCategory = category;
      renderCategories();
      filterAndRender();
    });
    elements.categoryChips.appendChild(button);
  });
}

function renderFavoriteFilter() {
  const modeState = currentState();
  elements.favoritesFilterButton.textContent = `Favoritos (${modeState.favorites.size})`;
  elements.favoritesFilterButton.classList.toggle("is-active", modeState.favoritesOnly);
  elements.favoritesFilterButton.setAttribute("aria-pressed", String(modeState.favoritesOnly));
}

function filterAndRender() {
  const modeState = currentState();
  const copy = MODE_COPY[state.mode];
  const query = modeState.searchText.trim().toLowerCase();

  modeState.filteredItems = modeState.items.filter((item) => {
    const location = state.mode === "radio" ? item.city || item.country || "PY" : item.country || "PY";
    const matchesSearch = `${item.name} ${location}`.toLowerCase().includes(query);
    const matchesCategory =
      modeState.selectedCategory === ALL_CATEGORY ||
      (state.mode === "radio" && modeState.selectedCategory === PENDING_CATEGORY && item.working === false) ||
      (item.category || "General") === modeState.selectedCategory;
    const matchesFavorite = !modeState.favoritesOnly || modeState.favorites.has(item.url);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  elements.resultsCount.textContent = `Mostrando ${modeState.filteredItems.length} de ${modeState.items.length} ${copy.itemLabel}`;
  renderItems();
}

function renderItems() {
  const modeState = currentState();
  const copy = MODE_COPY[state.mode];
  elements.itemGrid.innerHTML = "";

  if (modeState.filteredItems.length === 0) {
    const message =
      modeState.favoritesOnly && modeState.favorites.size === 0 ? copy.noFavorites : copy.empty;
    elements.itemGrid.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }

  modeState.filteredItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "channel-card";
    card.innerHTML = `
      <button class="channel-play" type="button" data-index="${index}">
        ${renderLogo(item)}
        <span class="channel-info">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(getItemMeta(item))}</span>
          <span class="badges">${renderBadges(item)}</span>
          ${item.note ? `<em class="channel-note">${escapeHtml(item.note)}</em>` : ""}
          ${item.webNote ? `<em class="channel-note">${escapeHtml(item.webNote)}</em>` : ""}
        </span>
      </button>
      <button class="favorite-button" type="button" aria-label="Cambiar favorito de ${escapeAttribute(item.name)}">
        ${modeState.favorites.has(item.url) ? "★" : "☆"}
      </button>
    `;

    const playButton = card.querySelector(".channel-play");
    const favoriteButton = card.querySelector(".favorite-button");
    playButton.addEventListener("click", () => playItem(item));
    playButton.addEventListener("keydown", (event) => handleCardKeydown(event, index));
    favoriteButton.addEventListener("click", () => toggleFavorite(item.url));
    elements.itemGrid.appendChild(card);
  });
}

function getItemMeta(item) {
  if (state.mode === "radio") {
    return `${item.category || "Radio"} | ${item.city || item.country || "PY"}`;
  }
  return `${item.category || "General"} | ${item.country || "PY"}`;
}

function renderLogo(item) {
  const name = item.name || "";
  const initial = escapeHtml(name.slice(0, 1).toUpperCase());
  const logo = String(item.logo || "").trim();

  if (!logo) return `<span class="logo">${initial}</span>`;

  const src = getLogoSource(logo, 0);
  return `
    <span class="logo" data-logo="${escapeAttribute(logo)}" data-logo-index="0" data-initial="${initial}">
      <img src="${escapeAttribute(src)}" alt="Logo de ${escapeAttribute(name)}" onerror="handleLogoError(this)">
    </span>
  `;
}

function getLogoSource(logo, extensionIndex) {
  if (/^https?:\/\//i.test(logo)) return logo;
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

  if (container) container.textContent = container.dataset.initial || "";
}

window.handleLogoError = handleLogoError;

function renderBadges(item) {
  const badges = [];
  if (state.mode === "radio") {
    badges.push(`<span class="badge">Radio</span>`);
    if (item.working === false) badges.push(`<span class="badge warning">Pendiente</span>`);
    if (item.isTokenized) badges.push(`<span class="badge warning">Temporal</span>`);
    if (!item.isLikelyStable) badges.push(`<span class="badge warning">Variable</span>`);
    return badges.join("");
  }

  if (item.isLikelyStable) badges.push(`<span class="badge">Estable</span>`);
  if (item.isTokenized) badges.push(`<span class="badge warning">Temporal</span>`);
  if (item.isChunklist) badges.push(`<span class="badge warning">Interno</span>`);
  if (item.isUnstable) badges.push(`<span class="badge warning">Inestable</span>`);
  if (item.webPlayerType === "iframe") badges.push(`<span class="badge">Embed Web</span>`);
  if (item.webPlayerType === "external_options") badges.push(`<span class="badge">Opciones Web</span>`);
  if (item.webWorking === false && !["iframe", "external_options"].includes(item.webPlayerType)) {
    badges.push(`<span class="badge warning">Solo APK</span>`);
  }
  return badges.join("");
}

async function playItem(item) {
  if (state.mode === "radio") {
    await playRadio(item);
    return;
  }
  playChannel(item);
}

function playChannel(channel) {
  cleanupPlayback();
  if (channel.webPlayerType === "iframe") {
    playIframeEmbed(channel);
    return;
  }

  if (channel.webPlayerType === "external_options") {
    showExternalOptions(channel);
    return;
  }

  if (channel.webWorking === false) {
    const message = channel.webNote || "Este canal no está disponible en la versión Web.";
    setNowPlaying(channel);
    setStatus(message, true);
    showOverlay("No disponible en Web", message);
    return;
  }

  setStatus("Cargando canal...");
  hideOverlay();
  saveLastItem(channel);
  renderLastItem();
  setNowPlaying(channel);

  const sourceType = String(channel.sourceType || "hls").toLowerCase();
  if (sourceType === "youtube_embed") {
    playYoutubeEmbed(channel);
    return;
  }

  if (sourceType === "youtube") {
    setStatus("Abriendo canal en YouTube...");
    showOverlay("Canal de YouTube", "Se abrirá en YouTube o en una nueva pestaña.");
    window.open(channel.url, "_blank", "noopener,noreferrer");
    return;
  }

  if (window.Hls && Hls.isSupported()) {
    elements.video.hidden = false;
    state.hls = new Hls();
    state.hls.loadSource(channel.url);
    state.hls.attachMedia(elements.video);
    state.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      elements.video.play().catch(() => setStatus("Presiona reproducir para iniciar el canal."));
    });
    state.hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setStatus("No se pudo reproducir este canal", true);
        showOverlay("Error de reproducción", "El stream no respondió correctamente.");
        cleanupPlayback();
      }
    });
    return;
  }

  if (elements.video.canPlayType("application/vnd.apple.mpegurl")) {
    elements.video.hidden = false;
    elements.video.src = channel.url;
    elements.video.play().catch(() => setStatus("Presiona reproducir para iniciar el canal."));
    return;
  }

  setStatus("Este navegador no soporta reproducción HLS", true);
  showOverlay("HLS no disponible", "Prueba con un navegador compatible o habilita HLS.js.");
}

function showExternalOptions(channel) {
  cleanupPlayback();
  saveLastItem(channel);
  renderLastItem();
  setNowPlaying(channel);
  setStatus(channel.webOnlyNote || "Elige una opcion para abrir este canal.");
  elements.video.hidden = true;

  const directUrl = String(channel.webDirectUrl || channel.url || "").trim();
  const youtubeUrl = String(channel.webYoutubeUrl || "").trim();
  const buttons = [
    directUrl
      ? `<button type="button" class="primary-button" data-open-url="${escapeAttribute(directUrl)}">Abrir directo</button>`
      : "",
    youtubeUrl
      ? `<button type="button" class="primary-button secondary" data-open-url="${escapeAttribute(youtubeUrl)}">Ver en YouTube</button>`
      : "",
  ].join("");

  elements.overlay.innerHTML = `
    <strong>${escapeHtml(channel.name)}</strong>
    <span>${escapeHtml(channel.webOnlyNote || "Este canal tiene opciones externas para la version web.")}</span>
    <div class="external-options">
      ${buttons}
    </div>
  `;
  elements.overlay.classList.remove("is-hidden");
  elements.overlay.querySelectorAll("[data-open-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.getAttribute("data-open-url");
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  });
}

async function playRadio(station) {
  cleanupPlayback();
  setStatus("Cargando radio...");
  hideOverlay();
  saveLastItem(station);
  renderLastItem();
  setNowPlaying(station);

  try {
    const streamUrl = await resolveRadioUrl(station);
    await playRadioStream(streamUrl);
  } catch {
    setStatus("No se pudo cargar esta radio", true);
    showOverlay("Error de radio", "Prueba con otra emisora o intenta más tarde.");
  }
}

async function resolveRadioUrl(station) {
  const sourceType = String(station.sourceType || "").toLowerCase();
  if (sourceType === "api_hls") {
    const response = await fetch(station.url, { cache: "no-store" });
    if (!response.ok) throw new Error("API de radio no disponible");
    const data = await response.json();
    const streamUrl = data?.stream?.stream_url?.trim();
    if (!streamUrl) throw new Error("API sin stream");
    if (streamUrl.includes(".m3u8")) return streamUrl;
    const rebuiltUrl = await rebuildDesdeParaguayHlsUrl(station.url, streamUrl);
    if (!rebuiltUrl) throw new Error("API sin HLS válido");
    return rebuiltUrl;
  }

  if (sourceType === "m3u") {
    return resolveM3uUrl(station.url);
  }

  if (sourceType === "audio" || sourceType === "hls_audio" || sourceType === "hls") {
    return station.url;
  }

  if (sourceType !== "pls") return station.url;

  const response = await fetch(station.url, { cache: "no-store" });
  if (!response.ok) throw new Error("PLS no disponible");
  const text = await response.text();
  const fileLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^File\d+=/i.test(line));
  const streamUrl = fileLine?.split("=").slice(1).join("=").trim();
  if (!streamUrl) throw new Error("PLS sin stream");
  return streamUrl;
}

async function playRadioStream(streamUrl) {
  elements.audio.hidden = false;

  if (streamUrl.includes(".m3u8")) {
    if (window.Hls && Hls.isSupported()) {
      state.hls = new Hls();
      state.hls.loadSource(streamUrl);
      state.hls.attachMedia(elements.audio);
      state.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          setStatus("No se pudo reproducir esta radio", true);
        }
      });
      elements.audio.play().catch(() => {
        setStatus("Presiona reproducir para iniciar la radio.");
      });
      return;
    }

    if (elements.audio.canPlayType("application/vnd.apple.mpegurl")) {
      elements.audio.src = streamUrl;
      await elements.audio.play().catch(() => {
        setStatus("Presiona reproducir para iniciar la radio.");
      });
      return;
    }

    throw new Error("HLS de audio no soportado");
  }

  elements.audio.src = streamUrl;
  await elements.audio.play().catch(() => {
    setStatus("Presiona reproducir para iniciar la radio.");
  });
}

async function resolveM3uUrl(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("M3U no disponible");
  const text = await response.text();
  const streamUrl = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && /^https?:\/\//i.test(line));
  if (!streamUrl) throw new Error("M3U sin stream");
  return streamUrl;
}

async function rebuildDesdeParaguayHlsUrl(apiUrl, streamUrl) {
  const slug = apiUrl.match(/\/StreamUrl\/([^/]+)\/hls\/?/i)?.[1];
  const tokenQuery = extractCopacoTokenQuery(streamUrl);
  if (!slug || !tokenQuery) return "";

  const response = await fetch(DESDEPARAGUAY_MOBILE_LIST_URL, { cache: "no-store" });
  if (!response.ok) return "";
  const text = await response.text();
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const trackMatch = text.match(
    new RegExp(
      `<track>[\\s\\S]*?<id>\\s*${escapedSlug}\\s*<\\/id>[\\s\\S]*?<rtsp_stream>\\s*rtsp:\\/\\/[^<]+:1935\\/([^<]+)<\\/rtsp_stream>[\\s\\S]*?<\\/track>`,
      "i"
    )
  );
  const streamPath = trackMatch?.[1]?.trim();
  if (!streamPath) return "";

  return `https://copaco.desdeparaguay.net/${streamPath}/playlist.m3u8?${tokenQuery}`;
}

function extractCopacoTokenQuery(streamUrl) {
  if (!streamUrl || !/^https:\/\/copaco\.desdeparaguay\.net/i.test(streamUrl)) return "";
  const tail = streamUrl
    .replace(/^https:\/\/copaco\.desdeparaguay\.net\/?/i, "")
    .trim();
  if (!tail) return "";
  if (/^\?k=/i.test(tail)) return tail.slice(1);
  if (/\?/.test(tail) && /k=/i.test(tail)) return tail.split("?").slice(1).join("?");
  return `k=${tail}`;
}

function playYoutubeEmbed(channel) {
  elements.video.hidden = true;
  const frame = document.createElement("iframe");
  frame.className = "youtube-frame";
  frame.src = channel.url;
  frame.title = `Reproductor de ${channel.name}`;
  frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  frame.allowFullscreen = true;
  frame.addEventListener("load", () => setStatus(""));
  elements.playerCard.appendChild(frame);
  state.youtubeFrame = frame;
}

function playIframeEmbed(channel) {
  const embedUrl = String(channel.webEmbedUrl || "").trim();
  if (!embedUrl) {
    setNowPlaying(channel);
    setStatus("Este reproductor oficial no está disponible en la versión web.", true);
    showOverlay("Reproductor no disponible", "Este reproductor oficial no está disponible en la versión web.");
    return;
  }

  setStatus("Cargando reproductor oficial...");
  hideOverlay();
  saveLastItem(channel);
  renderLastItem();
  setNowPlaying(channel);
  elements.video.hidden = true;

  const frame = document.createElement("iframe");
  frame.className = "web-embed-frame";
  frame.src = embedUrl;
  frame.title = `Reproductor oficial de ${channel.name}`;
  frame.allow = "autoplay; fullscreen; picture-in-picture";
  frame.allowFullscreen = true;

  const loadTimer = window.setTimeout(() => {
    setStatus("Este reproductor oficial no está disponible en la versión web.", true);
  }, 12000);

  frame.addEventListener("load", () => {
    window.clearTimeout(loadTimer);
    setStatus(channel.webOnlyNote || "");
  });
  frame.addEventListener("error", () => {
    window.clearTimeout(loadTimer);
    setStatus("Este reproductor oficial no está disponible en la versión web.", true);
    showOverlay("Reproductor no disponible", "Este reproductor oficial no está disponible en la versión web.");
  });

  elements.playerCard.appendChild(frame);
  state.webFrame = frame;
}

function setNowPlaying(item) {
  elements.nowPlayingName.textContent = item.name;
  elements.nowPlayingMeta.textContent = getItemMeta(item);
}

function cleanupPlayback() {
  if (state.hls) {
    state.hls.destroy();
    state.hls = null;
  }
  if (state.youtubeFrame) {
    state.youtubeFrame.remove();
    state.youtubeFrame = null;
  }
  if (state.webFrame) {
    state.webFrame.remove();
    state.webFrame = null;
  }
  elements.video.pause();
  elements.video.removeAttribute("src");
  elements.video.load();
  elements.audio.pause();
  elements.audio.removeAttribute("src");
  elements.audio.load();
  elements.video.hidden = state.mode !== "tv";
  elements.audio.hidden = state.mode !== "radio";
}

function loadFavorites(mode) {
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey(mode)) || "[]");
    state[mode].favorites = new Set(Array.isArray(saved) ? saved : []);
  } catch {
    state[mode].favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(favoritesKey(state.mode), JSON.stringify([...currentState().favorites]));
}

function toggleFavorite(itemUrl) {
  const modeState = currentState();
  if (modeState.favorites.has(itemUrl)) {
    modeState.favorites.delete(itemUrl);
  } else {
    modeState.favorites.add(itemUrl);
  }
  saveFavorites();
  renderFavoriteFilter();
  filterAndRender();
}

function saveLastItem(item) {
  localStorage.setItem(lastKey(state.mode), JSON.stringify(item));
}

function getLastItem() {
  try {
    const item = JSON.parse(localStorage.getItem(lastKey(state.mode)) || "null");
    return isValidItem(item) ? item : null;
  } catch {
    return null;
  }
}

function renderLastItem() {
  const item = getLastItem();
  const copy = MODE_COPY[state.mode];
  elements.lastItemSlot.innerHTML = "";

  if (!item) return;

  const card = document.createElement("div");
  card.className = "last-channel-card";
  card.innerHTML = `
    ${renderLogo(item)}
    <span>
      <small>${copy.lastLabel}</small>
      <strong>${escapeHtml(item.name)}</strong>
      <em>${escapeHtml(item.category || "General")}</em>
    </span>
    <button type="button" class="primary-button compact">${copy.action}</button>
  `;
  card.querySelector("button").addEventListener("click", () => playItem(item));
  elements.lastItemSlot.appendChild(card);
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
  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;

  const active = document.activeElement;
  if (active?.classList?.contains("channel-play")) return;
  if (active?.tagName === "INPUT" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) return;

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
  if (!element) return;
  element.focus();
  element.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function getFocusableElements() {
  return Array.from(
    document.querySelectorAll("button:not([disabled]), input:not([disabled]), video[controls], audio[controls]")
  ).filter((element) => element.offsetParent !== null);
}

function getGridColumnCount() {
  const firstCard = elements.itemGrid.querySelector(".channel-card");
  if (!firstCard) return 1;
  return Math.max(
    1,
    Math.round(elements.itemGrid.getBoundingClientRect().width / firstCard.getBoundingClientRect().width),
  );
}

function currentState() {
  return state[state.mode];
}

function favoritesKey(mode) {
  return mode === "radio" ? "tvLibrePyRadioFavorites" : "tvLibrePyTvFavorites";
}

function lastKey(mode) {
  return mode === "radio" ? "tvLibrePyLastRadio" : "tvLibrePyLastChannel";
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
