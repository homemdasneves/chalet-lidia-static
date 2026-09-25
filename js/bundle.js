document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector('.grid');
    const gridItems = Array.from(document.querySelectorAll('.grid-item'));
  
    // Redistribuir os itens para balancear as colunas
    const columns = Array.from(grid.querySelectorAll('.grid-col'));
    gridItems.forEach((item, index) => {
      const columnIndex = index % columns.length; // Distribui os itens ciclicamente entre as colunas
      columns[columnIndex].appendChild(item);
    });
  
    // Inicializar o Colcade
    const colcade = new Colcade('.grid', {
      columns: '.grid-col',
      items: '.grid-item'
    });
  
    // Função para aplicar o filtro
    function applyFilter(filter) {
      gridItems.forEach(item => {
        const tags = item.getAttribute('data-tags').split(' ');
        if (filter === 'all' || tags.includes(filter)) {
          item.style.display = 'block'; // Mostra o item
        } else {
          item.style.display = 'none'; // Esconde o item
        }
      });
  
      // Atualiza o layout do Colcade
      colcade.reloadItems();
      colcade.layout();
    }
  
    // Configurar os botões de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Atualizar o botão ativo
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
  
        // Aplicar o filtro
        const filter = button.getAttribute('data-filter');
        applyFilter(filter);
      });
    });
  
    // Aplicar o filtro inicial (mostrar todos os itens)
    applyFilter('all');
  });

  document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gridItems = document.querySelectorAll('.grid-item');
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <span class="arrow left">&larr;</span>
      <img src="" alt="">
      <div class="caption"></div>
      <span class="arrow right">&rarr;</span>
    `;
    document.body.appendChild(modal);
  
    const modalImg = modal.querySelector('img');
    const modalCaption = modal.querySelector('.caption');
    const modalLeftArrow = modal.querySelector('.arrow.left');
    const modalRightArrow = modal.querySelector('.arrow.right');
  
    let currentIndex = 0;
  
    // Inicializa o filtro "all"
    function showAllItems() {
      gridItems.forEach(item => {
        item.style.display = 'block';
        item.classList.remove('hidden');
      });
    }
    showAllItems();
  
    // Filtro com fade in/out
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
  
        const filter = button.getAttribute('data-filter');
  
        gridItems.forEach(item => {
          const tags = item.getAttribute('data-tags').split(' ');
          if (filter === 'all' || tags.includes(filter)) {
            item.classList.remove('hidden');
            setTimeout(() => {
              item.style.display = 'block';
            }, 500); // Tempo do fade out
          } else {
            item.classList.add('hidden');
            setTimeout(() => {
              item.style.display = 'none';
            }, 500); // Tempo do fade out
          }
        });
      });
    });
  
    // Modal de visualização ampliada
    gridItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        modalImg.src = img.src;
        modalCaption.textContent = img.alt;
        modal.classList.add('active');
        currentIndex = index;
      });
    });
  
    // Navegação no modal
    function showImage(index) {
      const items = Array.from(gridItems).filter(item => !item.classList.contains('hidden'));
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      const img = items[index].querySelector('img');
      modalImg.src = img.src;
      modalCaption.textContent = img.alt;
      currentIndex = index;
    }
  
    modalLeftArrow.addEventListener('click', () => {
      showImage(currentIndex - 1);
    });
  
    modalRightArrow.addEventListener('click', () => {
      showImage(currentIndex + 1);
    });
  
    // Fechar o modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modalImg) {
        modal.classList.remove('active');
      }
    });
  
    // Navegação com teclado
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'Escape') modal.classList.remove('active');
    });
  });


document.addEventListener('DOMContentLoaded', function () {
  var app = document.getElementById('guide-app');
  if (!app) return;

  var viewHome = document.getElementById('view-home');
  var viewArea = document.getElementById('view-area');
  var areaHeader = document.getElementById('area-header');
  var areaBackLinkEl = areaHeader.querySelector('.back-link');
  var areaIconEl = areaHeader.querySelector('.area-icon');
  var areaTitleEl = areaHeader.querySelector('.area-title');
  var HOME_HEADER_TEXT = 'All you need to know for a great stay.';
  var tocNav = viewArea.querySelector('.guide-toc');
  var guideTopicsEl = viewArea.querySelector('.guide-topics');
  var areaSections = Array.prototype.slice.call(viewArea.querySelectorAll('[data-area]'));
  var viewToggleBtn = document.getElementById('area-view-toggle');
  var areaMapEl = document.getElementById('area-map');
  var areaMapCanvasEl = document.getElementById('area-map-canvas');
  var tagFilterEl = document.getElementById('area-tag-filter');

  var spyObserver = null;
  var currentAreaSlug = null;
  var manualScrollActive = false;
  var currentViewMode = 'list';
  var currentSectionEl = null;
  var leafletMap = null;
  var leafletMarkersLayer = null;
  var activeTags = new Set();

  // ---- Tags ----
  function humanizeTag(tag) {
    return tag.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function getTopicTags(details) {
    var raw = details.getAttribute('data-tags');
    if (!raw) return [];
    return raw.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }

  function renderTopicTags(details) {
    var tags = getTopicTags(details);
    if (!tags.length) return;
    var body = details.querySelector('.topic-body');
    if (!body) return;
    var wrap = document.createElement('div');
    wrap.className = 'topic-tags';
    wrap.innerHTML = tags.map(function (t) {
      return '<span class="topic-tag">' + humanizeTag(t) + '</span>';
    }).join('');
    body.insertBefore(wrap, body.firstChild);
  }

  areaSections.forEach(function (section) {
    section.querySelectorAll('.topic[data-tags]').forEach(renderTopicTags);
  });

  function topicMatchesFilter(details) {
    if (activeTags.size === 0) return true;
    return getTopicTags(details).some(function (t) { return activeTags.has(t); });
  }

  function buildTagFilter(section) {
    activeTags.clear();
    section.querySelectorAll('.topic.topic-filtered-out').forEach(function (details) {
      details.classList.remove('topic-filtered-out');
    });
    var tags = [];
    section.querySelectorAll('.topic[data-tags]').forEach(function (details) {
      getTopicTags(details).forEach(function (t) {
        if (tags.indexOf(t) === -1) tags.push(t);
      });
    });
    tags.sort();

    if (!tags.length) {
      tagFilterEl.hidden = true;
      tagFilterEl.innerHTML = '';
      return;
    }

    tagFilterEl.hidden = false;
    tagFilterEl.innerHTML = tags.map(function (t) {
      return '<button type="button" class="tag-filter-btn" data-tag="' + t + '">' + humanizeTag(t) + '</button>';
    }).join('');
  }

  function applyTagFilter() {
    if (!currentSectionEl) return;

    currentSectionEl.querySelectorAll('.topic').forEach(function (details) {
      details.classList.toggle('topic-filtered-out', !topicMatchesFilter(details));
    });

    tocNav.querySelectorAll('a').forEach(function (a) {
      var details = currentSectionEl.querySelector('.topic[data-topic="' + a.dataset.topic + '"]');
      var match = details ? topicMatchesFilter(details) : true;
      a.closest('li').classList.toggle('hidden-by-filter', !match);
    });

    updateAreaMapAvailability(currentSectionEl);
    if (currentViewMode === 'map') {
      // The toggle button that would let a guest switch back to list view
      // hides itself when a filter leaves zero pins - bail out to list view
      // first so they're never stranded on an empty map with no way back.
      if (getSectionCoords(currentSectionEl).length === 0) {
        setViewMode('list');
      } else {
        renderAreaMap(currentSectionEl);
      }
    }
  }

  tagFilterEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.tag-filter-btn');
    if (!btn) return;
    var tag = btn.getAttribute('data-tag');
    btn.classList.toggle('active');
    if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
    applyTagFilter();
  });

  // ---- Smooth scroll ----
  // Native scrollIntoView({behavior:'smooth'}) picks its own (short, fixed)
  // duration, which reads as an abrupt snap for longer distances. Driving
  // the scroll ourselves with an eased animation gives a consistently
  // gentle transition regardless of distance.
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration, onComplete) {
    var startY = window.pageYOffset;
    var diff = targetY - startY;
    if (Math.abs(diff) < 1) { if (onComplete) onComplete(); return; }
    var startTime = null;
    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    }
    requestAnimationFrame(step);
  }

  // ---- Accordion / lazy Swiper init ----
  function initSlider(details) {
    if (details.dataset.sliderInit) return;
    var sliderEl = details.querySelector('.topic-slider');
    if (!sliderEl) return;
    details.dataset.sliderInit = '1';
    // Swiper measures its own container (el.clientWidth) to size slides, and
    // that self-measurement has proven unreliable for a slider nested this
    // deep inside a <details> accordion - sometimes wildly wrong (millions
    // of px), sometimes just wrong enough to fit 2 slides where 1 should
    // show. Measuring the container ourselves, right here, and handing
    // Swiper that exact number sidesteps whatever is going wrong inside its
    // own measurement path.
    var measuredWidth = sliderEl.getBoundingClientRect().width;
    new Swiper(sliderEl, {
      loop: false,
      slidesPerView: 1,
      spaceBetween: 8,
      width: measuredWidth,
      // Nothing here needs to react to a later resize/orientation change
      // (and both of those re-measure paths independently reproduced the
      // same corruption), so never let Swiper re-measure after this.
      resizeObserver: false,
      updateOnWindowResize: false,
      pagination: {
        el: sliderEl.querySelector('.swiper-pagination'),
        clickable: true
      }
    });
  }

  areaSections.forEach(function (section) {
    section.querySelectorAll('.topic').forEach(function (details) {
      details.addEventListener('toggle', function () {
        if (details.open) initSlider(details);
      });
    });
  });

  function openTopic(details, scrollTo) {
    if (!details) return;
    if (!details.open) details.open = true;
    initSlider(details);
    if (scrollTo) {
      details.classList.add('flash');
      setTimeout(function () { details.classList.remove('flash'); }, 1400);
      var offset = parseFloat(getComputedStyle(details).scrollMarginTop) || 0;
      var targetY = details.getBoundingClientRect().top + window.pageYOffset - offset;
      manualScrollActive = true;
      smoothScrollTo(targetY, 700, function () { manualScrollActive = false; });
    }
  }

  // ---- TOC ----
  function buildToc(section) {
    tocNav.innerHTML = '';
    var ul = document.createElement('ul');
    section.querySelectorAll('.topic').forEach(function (details) {
      var topicSlug = details.getAttribute('data-topic');
      var iconEl = details.querySelector('.topic-icon');
      var titleEl = details.querySelector('.topic-title');
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#/' + section.getAttribute('data-area') + '/' + topicSlug;
      a.dataset.topic = topicSlug;
      a.innerHTML = (iconEl ? iconEl.outerHTML : '') + '<span>' + (titleEl ? titleEl.textContent.trim() : '') + '</span>';
      li.appendChild(a);
      ul.appendChild(li);
    });
    tocNav.appendChild(ul);
  }

  function setActiveTocLink(topicSlug) {
    var links = tocNav.querySelectorAll('a');
    links.forEach(function (a) {
      a.classList.toggle('active', a.dataset.topic === topicSlug);
    });
  }

  function setupScrollSpy(section) {
    if (spyObserver) spyObserver.disconnect();
    var links = tocNav.querySelectorAll('a');
    if (!links.length) return;

    spyObserver = new IntersectionObserver(function (entries) {
      // While a TOC click is driving a programmatic scroll, ignore the
      // topics it scrolls past - only the clicked link should be
      // highlighted until the scroll settles.
      if (manualScrollActive) return;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var topicSlug = entry.target.closest('.topic').getAttribute('data-topic');
        setActiveTocLink(topicSlug);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    section.querySelectorAll('.topic-header').forEach(function (header) {
      spyObserver.observe(header);
    });
  }

  // ---- Area map ----
  function getSectionCoords(section, ignoreFilter) {
    var items = [];
    section.querySelectorAll('.topic[data-coords]').forEach(function (details) {
      if (!ignoreFilter && !topicMatchesFilter(details)) return;
      var parts = details.getAttribute('data-coords').split(',');
      var lat = parseFloat(parts[0]);
      var lng = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lng)) return;
      var iconEl = details.querySelector('.topic-icon');
      var titleEl = details.querySelector('.topic-title');
      items.push({
        topicSlug: details.getAttribute('data-topic'),
        title: titleEl ? titleEl.textContent.trim() : '',
        iconClass: iconEl ? iconEl.className : 'fas fa-location-dot',
        lat: lat,
        lng: lng
      });
    });
    return items;
  }

  function updateAreaMapAvailability(section) {
    // Whether the toggle itself shows depends on the area having any
    // geo-tagged topics at all, not on how many survive the current tag
    // filter - otherwise picking a tag with no located topics would make
    // the button vanish instead of just leaving the map empty.
    viewToggleBtn.hidden = getSectionCoords(section, true).length === 0;
  }

  function getHouseMarkerData(section) {
    var raw = section.getAttribute('data-house-coords');
    if (!raw) return null;
    var parts = raw.split(',');
    var lat = parseFloat(parts[0]);
    var lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      title: section.getAttribute('data-house-title') || '',
      iconClass: section.getAttribute('data-house-icon') || 'fas fa-house',
      lat: lat,
      lng: lng
    };
  }

  function buildPinIcon(iconClass, modifierClass) {
    return L.divIcon({
      html: '<div class="area-map-pin' + (modifierClass ? ' ' + modifierClass : '') + '"><i class="' + iconClass + '"></i></div>',
      className: 'area-map-pin-wrapper',
      iconSize: [30, 42],
      iconAnchor: [15, 36],
      popupAnchor: [0, -36]
    });
  }

  function renderAreaMap(section) {
    var areaSlug = section.getAttribute('data-area');
    var points = getSectionCoords(section);

    if (!leafletMap) {
      leafletMap = L.map(areaMapCanvasEl);
      // Esri World Imagery - free satellite tiles, no API key required.
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        maxZoom: 19
      }).addTo(leafletMap);
      leafletMarkersLayer = L.layerGroup().addTo(leafletMap);
    }

    leafletMarkersLayer.clearLayers();

    var latLngs = points.map(function (point) {
      var marker = L.marker([point.lat, point.lng], { icon: buildPinIcon(point.iconClass) }).addTo(leafletMarkersLayer);
      marker.bindPopup(
        '<div class="area-map-popup">' +
        '<strong>' + escapeHtml(point.title) + '</strong>' +
        '<a class="area-map-popup-link" href="#/' + areaSlug + '/' + point.topicSlug + '">View details</a>' +
        '</div>'
      );
      marker.on('popupopen', function (e) {
        var link = e.popup.getElement().querySelector('.area-map-popup-link');
        if (link) link.addEventListener('click', function () { setViewMode('list'); });
      });
      return [point.lat, point.lng];
    });

    var house = getHouseMarkerData(section);
    if (house) {
      var houseMarker = L.marker([house.lat, house.lng], { icon: buildPinIcon(house.iconClass, 'area-map-pin--house') }).addTo(leafletMarkersLayer);
      if (house.title) {
        houseMarker.bindPopup('<div class="area-map-popup"><strong>' + escapeHtml(house.title) + '</strong></div>');
      }
      latLngs.push([house.lat, house.lng]);
    }

    if (latLngs.length > 1) {
      leafletMap.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
    } else if (latLngs.length === 1) {
      leafletMap.setView(latLngs[0], 15);
    }

    setTimeout(function () { leafletMap.invalidateSize(); }, 50);
  }

  function setViewMode(mode) {
    currentViewMode = mode;
    var isMap = mode === 'map';
    areaMapEl.hidden = !isMap;
    guideTopicsEl.hidden = isMap;
    tocNav.hidden = isMap;
    viewToggleBtn.querySelector('i').className = isMap ? 'fas fa-list' : 'fas fa-earth-americas';
    viewToggleBtn.setAttribute('aria-label', isMap ? 'Switch to list view' : 'Switch to map view');
    if (isMap && currentSectionEl) renderAreaMap(currentSectionEl);
  }

  viewToggleBtn.addEventListener('click', function () {
    setViewMode(currentViewMode === 'map' ? 'list' : 'map');
  });

  // ---- Router ----
  function showHome() {
    currentAreaSlug = null;
    currentSectionEl = null;
    viewArea.hidden = true;
    viewHome.hidden = false;
    if (spyObserver) spyObserver.disconnect();

    areaHeader.hidden = false;
    areaBackLinkEl.hidden = true;
    areaIconEl.hidden = true;
    areaTitleEl.textContent = HOME_HEADER_TEXT;
    viewToggleBtn.hidden = true;

    window.scrollTo({ top: 0 });
  }

  function showArea(areaSlug, topicSlug) {
    var areaChanged = areaSlug !== currentAreaSlug;
    var activeSection = null;
    areaSections.forEach(function (section) {
      var match = section.getAttribute('data-area') === areaSlug;
      section.hidden = !match;
      if (match) activeSection = section;
    });
    if (!activeSection) { showHome(); currentAreaSlug = null; return; }

    currentAreaSlug = areaSlug;
    currentSectionEl = activeSection;

    viewHome.hidden = true;
    viewArea.hidden = false;

    areaHeader.hidden = false;
    areaBackLinkEl.hidden = false;
    areaIconEl.hidden = false;
    areaIconEl.className = 'area-icon ' + activeSection.getAttribute('data-area-icon');
    areaTitleEl.textContent = activeSection.getAttribute('data-area-title');

    // Only reset scroll position and re-render the area chrome when actually
    // switching areas. When a TOC link is clicked for a topic within the
    // area that's already open, skip all of this so the page can smooth
    // scroll straight from where it is to the target topic instead of
    // jumping to the top first.
    if (areaChanged) {
      buildToc(activeSection);
      setupScrollSpy(activeSection);
      buildTagFilter(activeSection);
      updateAreaMapAvailability(activeSection);
      setViewMode('list');
      window.scrollTo({ top: 0 });

      // On desktop, topics start expanded (users can still collapse them);
      // on mobile they start collapsed as before.
      if (window.matchMedia('(min-width: 1024px)').matches) {
        activeSection.querySelectorAll('.topic').forEach(function (details) {
          if (!details.open) {
            details.open = true;
            initSlider(details);
          }
        });
      }
    }

    if (topicSlug) {
      var target = activeSection.querySelector('.topic[data-topic="' + topicSlug + '"]');
      if (target) {
        // Highlight the TOC entry immediately on click, rather than waiting
        // for the scroll-spy to catch up once the scroll settles.
        setActiveTocLink(topicSlug);
        setTimeout(function () { openTopic(target, true); }, areaChanged ? 60 : 0);
      }
    }
  }

  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    if (!hash) { showHome(); return; }
    var parts = hash.split('/').filter(Boolean);
    showArea(parts[0], parts[1]);
  }

  window.addEventListener('hashchange', route);
  route();

  // ---- Search ----
  var searchIndex = [];
  areaSections.forEach(function (section) {
    var areaSlug = section.getAttribute('data-area');
    var areaTitle = section.getAttribute('data-area-title');
    section.querySelectorAll('.topic').forEach(function (details) {
      var topicSlug = details.getAttribute('data-topic');
      var titleEl = details.querySelector('.topic-title');
      var bodyEl = details.querySelector('.topic-body');
      var bodyText = bodyEl ? bodyEl.textContent.replace(/\s+/g, ' ').trim() : '';
      var tagsText = getTopicTags(details).join(' ');
      searchIndex.push({
        areaSlug: areaSlug,
        areaTitle: areaTitle,
        topicSlug: topicSlug,
        topicTitle: titleEl ? titleEl.textContent.trim() : '',
        text: tagsText ? (bodyText + ' ' + tagsText) : bodyText
      });
    });
  });

  var overlay = document.getElementById('search-overlay');
  var searchInput = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var mobileNav = document.querySelector('.mobile-nav');
  var menuToggle = document.querySelector('.menu-toggle');

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildExcerpt(text, query) {
    var lower = text.toLowerCase();
    var idx = lower.indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text.slice(0, 100)) + (text.length > 100 ? '…' : '');
    var start = Math.max(0, idx - 40);
    var end = Math.min(text.length, idx + query.length + 40);
    var before = escapeHtml(text.slice(start, idx));
    var match = escapeHtml(text.slice(idx, idx + query.length));
    var after = escapeHtml(text.slice(idx + query.length, end));
    return (start > 0 ? '…' : '') + before + '<mark>' + match + '</mark>' + after + (end < text.length ? '…' : '');
  }

  function renderResults(query) {
    if (!query) { resultsEl.innerHTML = ''; return; }
    var q = query.toLowerCase();
    var matches = searchIndex.filter(function (item) {
      return item.text.toLowerCase().indexOf(q) !== -1 || item.topicTitle.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 20);

    if (!matches.length) {
      resultsEl.innerHTML = '<p class="search-empty">No results for &ldquo;' + escapeHtml(query) + '&rdquo;</p>';
      return;
    }

    resultsEl.innerHTML = matches.map(function (item) {
      var href = '#/' + item.areaSlug + '/' + item.topicSlug;
      var excerptHtml = item.text.toLowerCase().indexOf(q) !== -1
        ? buildExcerpt(item.text, query)
        : escapeHtml(item.text.slice(0, 100));
      return '<a class="search-result" href="' + href + '">' +
        '<span class="search-result-area">' + escapeHtml(item.areaTitle) + '</span>' +
        '<div class="search-result-title">' + escapeHtml(item.topicTitle) + '</div>' +
        '<div class="search-result-excerpt">' + excerptHtml + '</div>' +
        '</a>';
    }).join('');
  }

  function openSearch() {
    if (mobileNav) mobileNav.classList.remove('open');
    if (menuToggle) menuToggle.classList.remove('open');
    overlay.hidden = false;
    searchInput.value = '';
    resultsEl.innerHTML = '';
    setTimeout(function () { searchInput.focus(); }, 30);
  }

  function closeSearch() { overlay.hidden = true; }

  document.querySelectorAll('.search-trigger').forEach(function (btn) {
    btn.addEventListener('click', openSearch);
  });

  var backdrop = overlay.querySelector('.search-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeSearch);

  var closeBtn = document.getElementById('search-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeSearch();
  });

  searchInput.addEventListener('input', function () {
    renderResults(searchInput.value.trim());
  });

  resultsEl.addEventListener('click', function (e) {
    if (e.target.closest('a.search-result')) closeSearch();
  });
});


// Parallax effect for background images
document.addEventListener("DOMContentLoaded", function () {
  const parallaxElements = document.querySelectorAll('.parallax-bg');

  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach(el => {
      const parent = el.parentElement;
      const offsetTop = parent.offsetTop;
      const height = parent.offsetHeight;

      if (parent.classList.contains('hero-full')) {
        // Parallax para hero1 (sem zoom)
        const offset = (scrollY - offsetTop) * 0.4;
        el.style.transform = `translateY(${offset}px)`;
        el.style.height = '100%'; // Mantém a altura fixa
      } else if (parent.classList.contains('hero-small')) {
        // Parallax para hero2 (com ajuste de altura)
        const offset = (scrollY - offsetTop) * 0.4;
        el.style.transform = `translateY(${offset}px)`;
        el.style.height = `${height * 1.5}px`; // Ajusta a altura para evitar cortes
      }
    });
  }

  // Aplica o estado inicial já com o ajuste de altura, para evitar
  // o "flick" de enquadramento que ocorria só ao primeiro scroll.
  updateParallax();
  window.addEventListener('scroll', updateParallax);
});

// Hero-content rise-and-fade on scroll: the h1 travels further/faster than
// the taglines and the "book now" CTA beneath it, so the heading visually
// leads the exit. Runs on every template sharing the .hero markup.
document.addEventListener('DOMContentLoaded', function () {
  var heroItems = Array.prototype.slice.call(document.querySelectorAll('.hero')).map(function (hero) {
    var content = hero.querySelector('.hero-content');
    if (!content) return null;
    return {
      hero: hero,
      h1: content.querySelector('h1'),
      taglines: content.querySelector('.hero-taglines'),
      btn: content.querySelector('.btn')
    };
  }).filter(Boolean);

  if (!heroItems.length) return;

  var H1_RISE_PX = 90; // the heading travels this far upward as it fades
  var REST_RISE_PX = 40; // taglines/CTA travel less, so they lag behind the h1
  var FADE_HEIGHT_RATIO = 0.7; // fraction of the hero's height over which the fade completes

  function setRiseAndFade(el, progress, risePx) {
    if (!el) return;
    el.style.transform = 'translateY(' + (-risePx * progress) + 'px)';
    el.style.opacity = String(1 - progress);
    el.style.pointerEvents = progress >= 0.98 ? 'none' : '';
  }

  function updateHeroFade() {
    var scrollY = window.scrollY;
    heroItems.forEach(function (item) {
      var heroHeight = item.hero.offsetHeight || 1;
      var progress = Math.min(Math.max((scrollY - item.hero.offsetTop) / (heroHeight * FADE_HEIGHT_RATIO), 0), 1);
      setRiseAndFade(item.h1, progress, H1_RISE_PX);
      setRiseAndFade(item.taglines, progress, REST_RISE_PX);
      setRiseAndFade(item.btn, progress, REST_RISE_PX);
    });
  }

  var heroFadeTicking = false;
  function onHeroScroll() {
    if (heroFadeTicking) return;
    heroFadeTicking = true;
    window.requestAnimationFrame(function () {
      updateHeroFade();
      heroFadeTicking = false;
    });
  }

  updateHeroFade();
  window.addEventListener('scroll', onHeroScroll);
});

document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
  
    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("open");      // <== adiciona animação
      mobileNav.classList.toggle("open");
    });
  
    // Opcional: fechar ao clicar num link
    mobileNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        menuButton.classList.remove("open");    // <== fecha o "X"
      });
    });
  });
  

  // Scoped to .testimonials .swiper (not a bare '.swiper') - this script has
  // no guard and runs unconditionally on every page via the shared bundle;
  // a bare '.swiper' selector would also grab any other page's unrelated
  // Swiper carousel (e.g. guide.html's per-topic image sliders) before it's
  // ready, corrupting it (Swiper attaches instance state to whatever
  // element it matches first).
  const swiper = new Swiper('.testimonials .swiper', {
    slidesPerView: 1, // Mostra 1 slide por vez no mobile
    spaceBetween: 20, // Espaçamento entre os slides
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      768: {
        slidesPerView: 3, // Mostra 3 slides por vez em telas maiores
        spaceBetween: 30,
      },
    },
  });
