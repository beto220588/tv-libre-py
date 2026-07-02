const DATA_URLS = {
  tv: "./channels_paraguay.json",
  latam: "./channels_latam.json",
  radio: "./radios_paraguay.json",
};

const IPTV_REMOTE_URLS = {
  live: "https://beto220588.github.io/tv-libre-py/iptv_live.json",
  movies: "https://beto220588.github.io/tv-libre-py/iptv_movies.json",
  series: "https://beto220588.github.io/tv-libre-py/iptv_series.json",
};

const IPTV_LOCAL_URLS = {
  live: "./iptv_live.json",
  movies: "./iptv_movies.json",
  series: "./iptv_series.json",
};

const DESDEPARAGUAY_MOBILE_LIST_URL = "https://www.desdeparaguay.net/android/movil_list.aspx?v=2";
const ALL_CATEGORY = "Todos";
const PENDING_CATEGORY = "Pendientes";
const PARENTAL_HASH_KEY = "tvLibrePyParentalPinHash";
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
  latam: {
    title: "TV Latam",
    subtitle: "Canales por país",
    itemLabel: "canales",
    searchLabel: "Buscar canal",
    searchPlaceholder: "Nombre del canal o país",
    categoryLabel: "País",
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
  iptv: {
    title: "IPTV",
    subtitle: "Contenido remoto de solo lectura",
    itemLabel: "contenidos",
    searchLabel: "Buscar IPTV",
    searchPlaceholder: "Nombre, categoría o título",
    categoryLabel: "Subcategoría",
    empty: "No se encontraron contenidos IPTV",
    noFavorites: "No tienes contenidos favoritos",
    loading: "Cargando IPTV...",
    loadError: "No se pudo cargar la lista IPTV",
    selectedTitle: "Ningún contenido seleccionado",
    selectedMeta: "Busca y elige un contenido de la lista.",
    overlayTitle: "Selecciona un contenido",
    overlayText: "La reproducción aparecerá aquí.",
    hint: "Enter/OK reproduce el contenido seleccionado",
    lastLabel: "Último contenido",
    action: "Reproducir",
  },
};

const state = {
  mode: "tv",
  tv: createModeState(),
  latam: createModeState(),
  radio: createModeState(),
  iptv: createIptvState(),
  hls: null,
  youtubeFrame: null,
  webFrame: null,
};

const elements = {
  tvModeButton: document.getElementById("tvModeButton"),
  latamModeButton: document.getElementById("latamModeButton"),
  radioModeButton: document.getElementById("radioModeButton"),
  iptvModeButton: document.getElementById("iptvModeButton"),
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
  iptvTabs: document.getElementById("iptvTabs"),
  iptvOrganization: document.getElementById("iptvOrganization"),
  iptvViewModes: document.getElementById("iptvViewModes"),
  iptvSeriesPanel: document.getElementById("iptvSeriesPanel"),
  itemGrid: document.getElementById("itemGrid"),
  resultsCount: document.getElementById("resultsCount"),
  keyboardHint: document.getElementById("keyboardHint"),
  status: document.getElementById("statusMessage"),
  parentalDialog: document.getElementById("parentalDialog"),
  parentalForm: document.getElementById("parentalForm"),
  parentalTitle: document.getElementById("parentalTitle"),
  parentalHelp: document.getElementById("parentalHelp"),
  parentalPin: document.getElementById("parentalPin"),
  parentalError: document.getElementById("parentalError"),
  parentalCancel: document.getElementById("parentalCancel"),
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

function createIptvState() {
  return {
    items: [],
    filteredItems: [],
    selectedCategory: ALL_CATEGORY,
    searchText: "",
    favoritesOnly: false,
    favorites: new Set(),
    loaded: false,
    liveItems: [],
    moviesItems: [],
    seriesItems: [],
    liveSource: null,
    moviesSource: null,
    seriesSource: null,
    liveErrorMessage: null,
    moviesErrorMessage: null,
    seriesErrorMessage: null,
    selectedTab: "live",
    selectedSeriesId: "",
    organization: "category",
    viewMode: "catalog",
    adultUnlocked: false,
    pendingAdultCategory: "",
    detailItem: null,
  };
}

async function init() {
  bindEvents();
  loadFavorites("tv");
  loadFavorites("latam");
  loadFavorites("radio");
  loadFavorites("iptv");
  applyMode("tv");
  await loadCurrentMode();
}

function bindEvents() {
  elements.tvModeButton.addEventListener("click", () => switchMode("tv"));
  elements.latamModeButton.addEventListener("click", () => switchMode("latam"));
  elements.radioModeButton.addEventListener("click", () => switchMode("radio"));
  elements.iptvModeButton.addEventListener("click", () => switchMode("iptv"));

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

  elements.parentalCancel.addEventListener("click", closeParentalDialog);
  elements.parentalForm.addEventListener("submit", handleParentalSubmit);

  elements.video.addEventListener("waiting", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("loadstart", () => setStatus("Cargando canal..."));
  elements.video.addEventListener("playing", () => setStatus(""));
  elements.video.addEventListener("error", () => {
    if (state.mode !== "radio") {
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
  elements.latamModeButton.classList.toggle("is-active", mode === "latam");
  elements.radioModeButton.classList.toggle("is-active", mode === "radio");
  elements.iptvModeButton.classList.toggle("is-active", mode === "iptv");
  elements.tvModeButton.setAttribute("aria-pressed", String(mode === "tv"));
  elements.latamModeButton.setAttribute("aria-pressed", String(mode === "latam"));
  elements.radioModeButton.setAttribute("aria-pressed", String(mode === "radio"));
  elements.iptvModeButton.setAttribute("aria-pressed", String(mode === "iptv"));

  elements.title.textContent = copy.title;
  elements.subtitle.textContent = copy.subtitle;
  elements.itemCountLabel.textContent = copy.itemLabel;
  elements.searchLabel.textContent = copy.searchLabel;
  elements.searchInput.placeholder = copy.searchPlaceholder;
  elements.searchInput.value = modeState.searchText;
  elements.categoryLabel.textContent = copy.categoryLabel;
  elements.keyboardHint.textContent = copy.hint;
  elements.fullscreenButton.hidden = mode === "radio";

  elements.video.hidden = mode === "radio";
  elements.audio.hidden = mode !== "radio";
  elements.nowPlayingEyebrow.textContent = mode === "radio" ? "Escuchando" : "Reproduciendo";
  elements.nowPlayingName.textContent = copy.selectedTitle;
  elements.nowPlayingMeta.textContent = copy.selectedMeta;
  elements.iptvTabs.hidden = mode !== "iptv";
  elements.iptvSeriesPanel.hidden = mode !== "iptv";
  showOverlay(copy.overlayTitle, copy.overlayText);
  renderLastItem();
  renderFavoriteFilter();
  renderIptvTabs();
  renderIptvSeriesPanel();
}

async function loadCurrentMode() {
  const mode = state.mode;
  const modeState = currentState();
  const copy = MODE_COPY[mode];

  if (modeState.loaded) {
    if (mode === "iptv") {
      syncIptvItems();
    }
    renderAll();
    return;
  }

  setStatus(copy.loading);
  elements.itemGrid.innerHTML = `<div class="empty-state">${copy.loading}</div>`;

  if (mode === "iptv") {
    try {
      await loadIptvData();
      modeState.loaded = true;
      syncIptvItems();
      setStatus("");
    } catch (error) {
      modeState.items = [];
      modeState.loaded = true;
      setStatus(copy.loadError, true);
    }
    renderAll();
    return;
  }

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
  renderIptvTabs();
  renderIptvOrganization();
  renderIptvViewModes();
  renderIptvSeriesPanel();
  filterAndRender();
}

async function loadIptvData() {
  const [liveResult, movieResult, seriesResult] = await Promise.all([
    loadIptvList("live"),
    loadIptvList("movies"),
    loadIptvList("series"),
  ]);

  state.iptv.liveItems = liveResult.items;
  state.iptv.moviesItems = movieResult.items;
  state.iptv.seriesItems = seriesResult.items;
  state.iptv.liveSource = liveResult.source;
  state.iptv.moviesSource = movieResult.source;
  state.iptv.seriesSource = seriesResult.source;
  state.iptv.liveErrorMessage = liveResult.errorMessage;
  state.iptv.moviesErrorMessage = movieResult.errorMessage;
  state.iptv.seriesErrorMessage = seriesResult.errorMessage;
  syncIptvItems();
}

async function loadIptvList(kind) {
  const copy = MODE_COPY.iptv;
  try {
    const remoteResponse = await fetch(IPTV_REMOTE_URLS[kind], { cache: "no-store" });
    if (!remoteResponse.ok) throw new Error(`HTTP ${remoteResponse.status}`);
    const remoteItems = await remoteResponse.json();
    return {
      items: normalizeIptvItems(kind, remoteItems),
      source: "remote",
      errorMessage: "",
    };
  } catch (remoteError) {
    try {
      const localResponse = await fetch(IPTV_LOCAL_URLS[kind], { cache: "no-store" });
      if (!localResponse.ok) throw new Error(`HTTP ${localResponse.status}`);
      const localItems = await localResponse.json();
      return {
        items: normalizeIptvItems(kind, localItems),
        source: "local",
        errorMessage: remoteError?.message || copy.loadError,
      };
    } catch (localError) {
      return {
        items: [],
        source: "local",
        errorMessage: localError?.message || copy.loadError,
      };
    }
  }
}

function normalizeIptvItems(kind, items) {
  if (!Array.isArray(items)) return [];

  if (kind === "live") {
    return items
      .map((item) => ({
        ...item,
        name: String(item?.name || "").trim(),
        category: String(item?.category || "General").trim() || "General",
        sourceType: String(item?.sourceType || "hls").trim() || "hls",
      }))
      .filter((item) => item.name)
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }

  if (kind === "movies") {
    return items
      .map((item) => ({
        ...item,
        name: String(item?.name || item?.title || "").trim(),
        title: String(item?.title || item?.name || "").trim(),
        category: String(item?.category || "Películas").trim() || "Películas",
        sourceType: String(item?.sourceType || "vod").trim() || "vod",
      }))
      .filter((item) => item.name)
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }

  return items
    .map((item) => ({
      ...item,
      name: String(item?.name || item?.title || "").trim(),
      title: String(item?.title || item?.name || "").trim(),
      category: String(item?.category || "Series").trim() || "Series",
      seasons: Array.isArray(item?.seasons) ? item.seasons : [],
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
}

function syncIptvItems() {
  const modeState = state.iptv;
  const selectedTab = modeState.selectedTab;
  const sourceItems =
    selectedTab === "movies"
      ? modeState.moviesItems
      : selectedTab === "series"
        ? modeState.seriesItems
        : modeState.liveItems;
  modeState.items = sourceItems;
  modeState.selectedCategory = modeState.selectedCategory || ALL_CATEGORY;
  if (selectedTab === "series" && !modeState.selectedSeriesId) {
    modeState.selectedSeriesId = modeState.seriesItems[0]?.id || modeState.seriesItems[0]?.name || "";
  }
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
  let categories;

  if (state.mode === "latam" || (state.mode === "iptv" && modeState.organization === "country")) {
    categories = [
      ALL_CATEGORY,
      ...new Set(modeState.items.map((item) => state.mode === "iptv" ? getIptvCountry(item) : item.country || "OTRO").filter(Boolean)),
    ].sort((a, b) => {
      if (a === ALL_CATEGORY) return -1;
      if (b === ALL_CATEGORY) return 1;
      return getCountryLabel(a).localeCompare(getCountryLabel(b), "es", { sensitivity: "base" });
    });
  } else {
    const hasPending = state.mode === "radio" && modeState.items.some((item) => item.working === false);
    categories = [
      ALL_CATEGORY,
      ...new Set(modeState.organization === "az" ? [] : modeState.items.map((item) => item.category || "General")),
      ...(hasPending ? [PENDING_CATEGORY] : []),
    ].sort((a, b) => {
      if (a === ALL_CATEGORY) return -1;
      if (b === ALL_CATEGORY) return 1;
      if (a === PENDING_CATEGORY) return 1;
      if (b === PENDING_CATEGORY) return -1;
      return a.localeCompare(b, "es", { sensitivity: "base" });
    });
  }

  elements.categoryChips.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip${category === modeState.selectedCategory ? " is-active" : ""}`;
    button.type = "button";
    const countryMode = state.mode === "latam" || (state.mode === "iptv" && modeState.organization === "country");
    button.textContent = countryMode ? getCountryLabel(category) : isAdultCategory(category) && !state.iptv.adultUnlocked ? `${category} (bloqueado)` : category;
    button.addEventListener("click", () => {
      if (state.mode === "iptv" && isAdultCategory(category) && !state.iptv.adultUnlocked) {
        openParentalDialog(category);
        return;
      }
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
    const displayName = item.name || item.title || "";
    const location =
      state.mode === "radio"
        ? item.city || item.country || "PY"
        : state.mode === "latam"
          ? `${item.country || "XX"} ${getCountryLabel(item.country || "XX")}`
          : item.country || "PY";
    const matchesSearch = `${displayName} ${location} ${item.year || ""}`.toLowerCase().includes(query);
    const matchesCategory =
      modeState.selectedCategory === ALL_CATEGORY ||
      (state.mode === "latam" && (item.country || "OTRO") === modeState.selectedCategory) ||
      (state.mode === "iptv" && modeState.organization === "country" && getIptvCountry(item) === modeState.selectedCategory) ||
      (state.mode === "radio" && modeState.selectedCategory === PENDING_CATEGORY && item.working === false) ||
      (item.category || "General") === modeState.selectedCategory;
    const favoriteKey = item.url || item.name || item.title || "";
    const matchesFavorite = !modeState.favoritesOnly || modeState.favorites.has(favoriteKey);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  elements.resultsCount.textContent = `Mostrando ${modeState.filteredItems.length} de ${modeState.items.length} ${copy.itemLabel}`;
  renderItems();
}

function renderItems() {
  const modeState = currentState();
  const copy = MODE_COPY[state.mode];
  elements.itemGrid.innerHTML = "";

  if (state.mode === "iptv" && state.iptv.detailItem) {
    renderIptvDetail();
    return;
  }

  if (modeState.filteredItems.length === 0) {
    const message =
      modeState.favoritesOnly && modeState.favorites.size === 0 ? copy.noFavorites : copy.empty;
    elements.itemGrid.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }

  if (state.mode === "iptv" && state.iptv.viewMode === "catalog") {
    renderIptvCatalog(modeState.filteredItems);
    return;
  }

  if (
    state.mode === "iptv" &&
    (state.iptv.selectedTab === "movies" || state.iptv.selectedTab === "series") &&
    state.iptv.organization !== "az"
  ) {
    renderIptvSplitBrowser(modeState.filteredItems);
    return;
  }

  modeState.filteredItems.forEach((item, index) => {
    elements.itemGrid.appendChild(createItemCard(item, index));
  });
}

function renderIptvSplitBrowser(items) {
  const categories = getIptvSplitCategories();
  const shell = document.createElement("section");
  shell.className = "iptv-split-browser";
  shell.innerHTML = `
    <aside class="iptv-category-rail" aria-label="Géneros IPTV"></aside>
    <div class="iptv-split-content">
      <div class="iptv-split-grid"></div>
    </div>
  `;

  const rail = shell.querySelector(".iptv-category-rail");
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rail-button${state.iptv.selectedCategory === category ? " is-active" : ""}`;
    button.textContent = isAdultCategory(category) && !state.iptv.adultUnlocked ? `${category} (bloqueado)` : category;
    button.addEventListener("click", () => {
      if (isAdultCategory(category) && !state.iptv.adultUnlocked) {
        openParentalDialog(category);
        return;
      }
      state.iptv.selectedCategory = category;
      renderAll();
    });
    rail.appendChild(button);
  });

  const grid = shell.querySelector(".iptv-split-grid");
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state">No se encontraron contenidos IPTV</div>`;
  } else {
    items.forEach((item, index) => grid.appendChild(createItemCard(item, index)));
  }
  elements.itemGrid.appendChild(shell);
}

function getIptvSplitCategories() {
  const modeState = currentState();
  const categories = [
    ALL_CATEGORY,
    ...new Set(modeState.items.map((item) => item.category || (state.iptv.selectedTab === "movies" ? "Películas" : "Series"))),
  ];
  return categories.sort((a, b) => {
    if (a === ALL_CATEGORY) return -1;
    if (b === ALL_CATEGORY) return 1;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });
}

function createItemCard(item, index) {
  const modeState = currentState();
  const isPlayable = state.mode === "iptv"
    ? (modeState.selectedTab === "series" ? true : item.working !== false && item.url)
    : true;
  const favoriteKey = item.url || item.id || item.name || item.title || "";
  const displayName = item.name || item.title || "";
  const card = document.createElement("article");
  card.className = "channel-card";
  if (state.mode === "iptv" && modeState.selectedTab === "series" && modeState.selectedSeriesId === (item.id || item.name)) {
    card.classList.add("is-selected");
  }
  card.innerHTML = `
    <button class="channel-play" type="button" data-index="${index}">
      ${renderLogo(item)}
      <span class="channel-info">
        <strong>${escapeHtml(displayName)}</strong>
        <span>${escapeHtml(getItemMeta(item))}</span>
        <span class="badges">${renderBadges(item)}</span>
        ${item.note ? `<em class="channel-note">${escapeHtml(item.note)}</em>` : ""}
        ${item.webNote ? `<em class="channel-note">${escapeHtml(item.webNote)}</em>` : ""}
      </span>
    </button>
    <button class="favorite-button" type="button" aria-label="Cambiar favorito de ${escapeAttribute(displayName)}">
      ${modeState.favorites.has(favoriteKey) ? "★" : "☆"}
    </button>
  `;

  const playButton = card.querySelector(".channel-play");
  const favoriteButton = card.querySelector(".favorite-button");
  playButton.addEventListener("click", () => {
    if (state.mode === "iptv" && (modeState.selectedTab === "series" || modeState.selectedTab === "movies")) {
      openIptvDetail(item);
      return;
    }
    if (state.mode === "iptv" && !isPlayable) return;
    playItem(item);
  });
  playButton.addEventListener("keydown", (event) => handleCardKeydown(event, index));
  favoriteButton.addEventListener("click", () => toggleFavorite(favoriteKey));
  return card;
}

function renderIptvCatalog(items) {
  const groups = new Map();
  items.forEach((item, index) => {
    const fallbackGroup = state.iptv.selectedTab === "movies"
      ? "Películas"
      : state.iptv.selectedTab === "series"
        ? "Series"
        : "Canales";
    const group = state.iptv.selectedTab === "live" && state.iptv.organization === "country"
      ? getCountryLabel(getIptvCountry(item))
      : item.category || fallbackGroup;
    if (isAdultCategory(group) && !state.iptv.adultUnlocked) return;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({ item, index });
  });

  [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .forEach(([group, groupItems]) => {
      const section = document.createElement("section");
      section.className = "catalog-row";
      section.innerHTML = `
        <div class="catalog-row-header">
          <h2>${escapeHtml(group)}</h2>
          <span>${groupItems.length}</span>
        </div>
        <div class="catalog-strip"></div>
      `;
      const strip = section.querySelector(".catalog-strip");
      groupItems.forEach(({ item, index }) => {
        strip.appendChild(createItemCard(item, index));
      });
      elements.itemGrid.appendChild(section);
    });
}

function openIptvDetail(item) {
  state.iptv.detailItem = item;
  if (state.iptv.selectedTab === "series") {
    state.iptv.selectedSeriesId = item.id || item.name || "";
  }
  renderAll();
  elements.itemGrid.scrollTo({ top: 0, behavior: "smooth" });
}

function closeIptvDetail() {
  state.iptv.detailItem = null;
  renderAll();
}

function renderIptvDetail() {
  const item = state.iptv.detailItem;
  if (!item) return;
  const isSeries = state.iptv.selectedTab === "series";
  const title = item.name || item.title || "Contenido IPTV";
  const poster = item.poster || item.logo || "";
  const category = item.category || (isSeries ? "Series" : "Películas");
  const meta = [
    item.year || "",
    item.duration || "",
    category,
    item.rating ? `★ ${item.rating}` : "",
  ].filter(Boolean).join(" · ");
  const description = item.description || item.plot || item.note || "Sinopsis no disponible para este contenido.";
  const related = state.iptv.filteredItems
    .filter((candidate) => (candidate.id || candidate.url || candidate.name) !== (item.id || item.url || item.name))
    .slice(0, 18);

  elements.itemGrid.innerHTML = `
    <section class="iptv-detail">
      <div class="iptv-detail-hero">
        <button type="button" class="chip" data-detail-back>← Volver</button>
        <div class="iptv-detail-copy">
          <h2>${escapeHtml(title)}</h2>
          <p class="detail-meta">${escapeHtml(meta)}</p>
          <p>${escapeHtml(description)}</p>
          <div class="detail-actions">
            ${!isSeries && item.url ? `<button type="button" class="primary-button" data-detail-play>Reproducir</button>` : ""}
            <button type="button" class="chip" disabled>♡ Favorito</button>
          </div>
        </div>
        <div class="iptv-detail-poster">${renderLogo({ name: title, logo: poster, poster })}</div>
      </div>
      ${isSeries ? renderSeriesEpisodes(item) : ""}
      <div class="catalog-row">
        <div class="catalog-row-header"><h2>Títulos relacionados</h2><span>${related.length}</span></div>
        <div class="catalog-strip" data-related-strip></div>
      </div>
    </section>
  `;

  elements.itemGrid.querySelector("[data-detail-back]")?.addEventListener("click", closeIptvDetail);
  elements.itemGrid.querySelector("[data-detail-play]")?.addEventListener("click", () => playItem(item));
  const strip = elements.itemGrid.querySelector("[data-related-strip]");
  related.forEach((candidate, index) => strip?.appendChild(createItemCard(candidate, index)));
  elements.itemGrid.querySelectorAll("[data-season][data-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      const seasonNumber = Number(button.getAttribute("data-season"));
      const episodeNumber = Number(button.getAttribute("data-episode"));
      const season = (item.seasons || []).find((seasonItem) => seasonItem.seasonNumber === seasonNumber);
      const episode = season?.episodes?.find((episodeItem) => episodeItem.episodeNumber === episodeNumber);
      if (!episode || episode.working === false || !episode.url) return;
      playItem({
        name: `${title} - ${episode.title || `Episodio ${episode.episodeNumber}`}`,
        url: episode.url,
        logo: poster,
        category,
        country: "IPTV",
        sourceType: episode.sourceType || "vod",
        working: true,
      });
    });
  });
}

function renderSeriesEpisodes(series) {
  const seasons = Array.isArray(series.seasons) ? series.seasons : [];
  if (!seasons.length) return `<div class="empty-state">No hay episodios disponibles</div>`;
  return seasons.map((season) => `
    <section class="season-block-web">
      <h3>Temporada ${escapeHtml(String(season.seasonNumber || 1))}</h3>
      <div class="episode-row-web">
        ${(season.episodes || []).map((episode) => `
          <button type="button" class="episode-chip" data-season="${escapeAttribute(String(season.seasonNumber || 1))}" data-episode="${escapeAttribute(String(episode.episodeNumber || 0))}" ${episode.working === false || !episode.url ? "disabled" : ""}>
            ${escapeHtml(`S${String(season.seasonNumber || 1).padStart(2, "0")}E${String(episode.episodeNumber || 0).padStart(2, "0")} - ${episode.title || "Episodio"}`)}
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function getItemMeta(item) {
  if (state.mode === "iptv") {
    const tab = state.iptv.selectedTab;
    if (tab === "movies") {
      return `${item.category || "Películas"} | ${item.year || "VOD"}`;
    }
    if (tab === "series") {
      return `${item.category || "Series"} | ${(item.seasons || []).length} temporada(s)`;
    }
    return `${item.category || "Canales"} | IPTV`;
  }
  if (state.mode === "radio") {
    return `${item.category || "Radio"} | ${item.city || item.country || "PY"}`;
  }
  if (state.mode === "latam") {
    return `${item.category || "General"} | ${getCountryLabel(item.country || "XX")}`;
  }
  return `${item.category || "General"} | ${item.country || "PY"}`;
}

function getCountryLabel(code) {
  const labels = {
    AR: "Argentina",
    BO: "Bolivia",
    CL: "Chile",
    CO: "Colombia",
    CR: "Costa Rica",
    CU: "Cuba",
    DO: "República Dominicana",
    EC: "Ecuador",
    GT: "Guatemala",
    HN: "Honduras",
    MX: "México",
    NI: "Nicaragua",
    PA: "Panamá",
    PE: "Perú",
    PR: "Puerto Rico",
    SV: "El Salvador",
    UY: "Uruguay",
    VE: "Venezuela",
  };
  return labels[String(code || "").toUpperCase()] || String(code || "OTRO");
}

function renderLogo(item) {
  const name = item.name || "";
  const initial = escapeHtml(name.slice(0, 1).toUpperCase());
  const logo = String(item.logo || item.poster || "").trim();

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
  if (state.mode === "iptv") {
    badges.push(`<span class="badge">IPTV</span>`);
    if (state.iptv.selectedTab === "series") {
      badges.push(`<span class="badge">Series</span>`);
    } else if (state.iptv.selectedTab === "movies") {
      badges.push(`<span class="badge">Película</span>`);
    } else {
      badges.push(`<span class="badge">Canal</span>`);
    }
    if (item.working === false || !item.url) badges.push(`<span class="badge warning">Pendiente</span>`);
    return badges.join("");
  }

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

  if (shouldPlayDirectVideo(sourceType, channel.url)) {
    playDirectVideo(channel.url);
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

function shouldPlayDirectVideo(sourceType, url) {
  const cleanSourceType = String(sourceType || "").toLowerCase();
  const cleanUrl = String(url || "").toLowerCase();
  if (cleanSourceType === "vod" || cleanSourceType === "video" || cleanSourceType === "mp4" || cleanSourceType === "movie") {
    return !cleanUrl.includes(".m3u8");
  }
  return /\.(mp4|webm|ogg|mkv)(\?|#|$)/i.test(cleanUrl);
}

function playDirectVideo(url) {
  elements.video.hidden = false;
  elements.video.src = url;
  elements.video.play().catch(() => setStatus("Presiona reproducir para iniciar el contenido."));
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
  elements.video.hidden = state.mode === "radio";
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

function renderIptvTabs() {
  if (!elements.iptvTabs) return;
  elements.iptvTabs.innerHTML = "";
  elements.iptvTabs.hidden = state.mode !== "iptv";
  if (state.mode !== "iptv") return;

  const tabs = [
    { key: "live", label: "Canales" },
    { key: "movies", label: "Películas" },
    { key: "series", label: "Series" },
  ];

  tabs.forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.iptv.selectedTab === tab.key ? " is-active" : ""}`;
    button.textContent = tab.label;
    button.addEventListener("click", () => selectIptvTab(tab.key));
    elements.iptvTabs.appendChild(button);
  });
}

function renderIptvOrganization() {
  const container = elements.iptvOrganization;
  container.innerHTML = "";
  container.hidden = state.mode !== "iptv";
  if (container.hidden) return;

  const options = state.iptv.selectedTab === "live"
    ? [{ key: "category", label: "Categorías" }, { key: "country", label: "Países" }, { key: "az", label: "A-Z" }]
    : [{ key: "category", label: "Géneros" }, { key: "az", label: "A-Z" }];
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.iptv.organization === option.key ? " is-active" : ""}`;
    button.textContent = option.label;
    button.addEventListener("click", () => {
      state.iptv.organization = option.key;
      state.iptv.selectedCategory = ALL_CATEGORY;
      renderAll();
    });
    container.appendChild(button);
  });
}

function renderIptvViewModes() {
  const container = elements.iptvViewModes;
  container.innerHTML = "";
  container.hidden = state.mode !== "iptv";
  elements.itemGrid.classList.toggle("is-list", state.mode === "iptv" && state.iptv.viewMode === "list");
  elements.itemGrid.classList.toggle("is-catalog", state.mode === "iptv" && state.iptv.viewMode === "catalog");
  elements.itemGrid.classList.toggle(
    "is-split",
    state.mode === "iptv" &&
      state.iptv.viewMode !== "catalog" &&
      (state.iptv.selectedTab === "movies" || state.iptv.selectedTab === "series") &&
      state.iptv.organization !== "az"
  );
  if (container.hidden) return;

  [
    { key: "list", label: "Lista" },
    { key: "grid", label: "Cuadrícula" },
    { key: "catalog", label: "Catálogo" },
  ].forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.iptv.viewMode === option.key ? " is-active" : ""}`;
    button.textContent = option.label;
    button.addEventListener("click", () => {
      state.iptv.viewMode = option.key;
      renderAll();
    });
    container.appendChild(button);
  });
}

function selectIptvTab(tab) {
  if (state.iptv.selectedTab === tab) return;
  state.iptv.selectedTab = tab;
  state.iptv.searchText = "";
  state.iptv.selectedCategory = ALL_CATEGORY;
  state.iptv.organization = "category";
  state.iptv.viewMode = tab === "live" ? "catalog" : "grid";
  state.iptv.detailItem = null;
  if (tab !== "series") {
    state.iptv.selectedSeriesId = "";
  }
  syncIptvItems();
  renderAll();
}

function selectIptvSeries(item) {
  state.iptv.selectedSeriesId = item.id || item.name || "";
  renderAll();
}

function renderIptvSeriesPanel() {
  if (!elements.iptvSeriesPanel) return;
  elements.iptvSeriesPanel.innerHTML = "";
  elements.iptvSeriesPanel.hidden = state.mode !== "iptv" || state.iptv.selectedTab !== "series";
  if (elements.iptvSeriesPanel.hidden) return;

  const series = state.iptv.seriesItems.find((item) => (item.id || item.name) === state.iptv.selectedSeriesId);
  if (!series) {
    elements.iptvSeriesPanel.innerHTML = `<div class="empty-state">Selecciona una serie para ver sus episodios</div>`;
    return;
  }

  const seasons = Array.isArray(series.seasons) ? series.seasons : [];
  const episodeButtons = seasons.flatMap((season) =>
    (season.episodes || []).map((episode) => {
      const enabled = episode.working !== false && Boolean(episode.url);
      return `
        <button type="button" class="episode-chip${enabled ? "" : " is-disabled"}" data-season="${season.seasonNumber}" data-episode="${episode.episodeNumber}" ${enabled ? "" : "disabled"}>
          ${escapeHtml(episode.title || `Episodio ${episode.episodeNumber}`)}
        </button>
      `;
    })
  ).join("");

  elements.iptvSeriesPanel.innerHTML = `
    <div class="series-detail-card">
      <div class="series-detail-header">
        ${renderLogo(series)}
        <div>
          <strong>${escapeHtml(series.name)}</strong>
          <span>${escapeHtml(series.category || "Series")}</span>
        </div>
      </div>
      <div class="series-detail-body">
        ${seasons.length ? seasons.map((season) => `
          <div class="season-block">
            <strong>Temporada ${season.seasonNumber}</strong>
            <div class="episode-row">
              ${(season.episodes || []).map((episode) => {
                const enabled = episode.working !== false && Boolean(episode.url);
                return `<button type="button" class="episode-chip${enabled ? "" : " is-disabled"}" data-season="${season.seasonNumber}" data-episode="${episode.episodeNumber}" ${enabled ? "" : "disabled"}>${escapeHtml(episode.title || `Episodio ${episode.episodeNumber}`)}</button>`;
              }).join("")}
            </div>
          </div>
        `).join("") : `<div class="empty-state">No hay episodios disponibles</div>`}
      </div>
    </div>
  `;

  elements.iptvSeriesPanel.querySelectorAll("[data-season][data-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      const seasonNumber = Number(button.getAttribute("data-season"));
      const episodeNumber = Number(button.getAttribute("data-episode"));
      const season = seasons.find((item) => item.seasonNumber === seasonNumber);
      const episode = season?.episodes?.find((item) => item.episodeNumber === episodeNumber);
      if (!episode || episode.working === false || !episode.url) return;
      playItem({
        name: `${series.name} - ${episode.title || `Episodio ${episode.episodeNumber}`}`,
        url: episode.url,
        logo: series.poster || "",
        category: series.category || "Series",
        sourceType: episode.sourceType || "vod",
        working: true,
        note: "Episodio IPTV",
      });
    });
  });
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
  if (mode === "radio") return "tvLibrePyRadioFavorites";
  if (mode === "latam") return "tvLibrePyLatamFavorites";
  if (mode === "iptv") return "tvLibrePyIptvFavorites";
  return "tvLibrePyTvFavorites";
}

function lastKey(mode) {
  if (mode === "radio") return "tvLibrePyLastRadio";
  if (mode === "latam") return "tvLibrePyLastLatamChannel";
  if (mode === "iptv") return "tvLibrePyLastIptv";
  return "tvLibrePyLastChannel";
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

function getIptvCountry(item) {
  if (item.country) return item.country;
  const value = `${item.category || ""} ${item.name || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const countries = [
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Ecuador",
    "El Salvador", "España", "Estados Unidos", "Guatemala", "Honduras", "México",
    "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana",
    "Uruguay", "Venezuela",
  ];
  return countries.find((country) => {
    const normalized = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return value.includes(normalized);
  }) || "Otros";
}

function isAdultCategory(category) {
  return String(category || "").toLowerCase().includes("xxx");
}

function openParentalDialog(category) {
  state.iptv.pendingAdultCategory = category;
  const creatingPin = !localStorage.getItem(PARENTAL_HASH_KEY);
  elements.parentalTitle.textContent = creatingPin ? "Crear PIN parental" : "Control parental";
  elements.parentalHelp.textContent = creatingPin
    ? "Crea un PIN de 4 a 8 números para proteger esta categoría."
    : "Ingresa el PIN parental para continuar.";
  elements.parentalPin.value = "";
  elements.parentalError.textContent = "";
  elements.parentalDialog.showModal();
  elements.parentalPin.focus();
}

function closeParentalDialog() {
  state.iptv.pendingAdultCategory = "";
  elements.parentalDialog.close();
}

async function handleParentalSubmit(event) {
  event.preventDefault();
  const pin = elements.parentalPin.value.trim();
  if (!/^\d{4,8}$/.test(pin)) {
    elements.parentalError.textContent = "Usa entre 4 y 8 números.";
    return;
  }
  const pinHash = await hashParentalPin(pin);
  const savedHash = localStorage.getItem(PARENTAL_HASH_KEY);
  if (savedHash && savedHash !== pinHash) {
    elements.parentalError.textContent = "PIN incorrecto.";
    return;
  }
  if (!savedHash) localStorage.setItem(PARENTAL_HASH_KEY, pinHash);
  state.iptv.adultUnlocked = true;
  state.iptv.selectedCategory = state.iptv.pendingAdultCategory || ALL_CATEGORY;
  closeParentalDialog();
  renderAll();
}

async function hashParentalPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

init();
