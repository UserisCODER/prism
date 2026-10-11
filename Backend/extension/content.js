const API_BASE = 'https://prism-topaz-one.vercel.app';
const WORKSPACE_DOMAIN = 'github.com';
let currentPanels = [];
let lastLayoutData = {};

function detectIntent() {
  const url = window.location.href;
  const title = document.title;

  if (url.includes('/pull/')) {
    return 'Review pull request: ' + title;
  }
  if (url.includes('/issues/')) {
    return 'Check issue: ' + title;
  }
  if (url.includes('/actions')) {
    return 'Check deployment and CI status';
  }

  const isRepoRoot = /^https?:\/\/(?:www\.)?github\.com\/[^/?#]+\/[^/?#]+\/?(?:[?#].*)?$/.test(url);
  if (url.includes('/tree/') || isRepoRoot) {
    return 'Explore repository: ' + title;
  }

  return 'Working on GitHub: ' + title;
}

function gatherPageContext() {
  const domain = window.location.hostname;
  const url = window.location.href;
  let pageType = 'generic';

  if (domain.includes('github.com')) {
    const isRepoRoot = /^https?:\/\/(?:www\.)?github\.com\/[^/?#]+\/[^/?#]+\/?(?:[?#].*)?$/.test(url);
    if (url.includes('/pull/')) {
      pageType = 'pull_request';
    } else if (url.includes('/issues/')) {
      pageType = 'issue';
    } else if (url.includes('/actions')) {
      pageType = 'ci_pipeline';
    } else if (url.includes('/tree/') || isRepoRoot) {
      pageType = 'repository';
    } else {
      pageType = 'github_generic';
    }
  } else if (domain.includes('notion.so')) {
    if (url.includes('/page/')) {
      pageType = 'notion_page';
    } else {
      pageType = 'notion_workspace';
    }
  } else if (domain.includes('salesforce.com')) {
    if (url.includes('/lightning/r/Opportunity')) {
      pageType = 'opportunity';
    } else if (url.includes('/lightning/r/Contact')) {
      pageType = 'contact';
    } else if (url.includes('/lightning/r/Account')) {
      pageType = 'account';
    } else {
      pageType = 'salesforce_generic';
    }
  } else {
    pageType = 'generic';
  }

  const metaDescEl = document.querySelector('meta[name="description"]');
  const metaDescription = metaDescEl ? (metaDescEl.getAttribute('content') || '') : '';

  let suggestedDomain = 'general';
  if (domain.includes('github.com')) {
    suggestedDomain = 'github';
  } else if (domain.includes('notion.so')) {
    suggestedDomain = 'notion';
  } else if (domain.includes('salesforce.com')) {
    suggestedDomain = 'salesforce';
  }

  return {
    domain,
    url,
    pageType,
    pageTitle: document.title,
    metaDescription,
    suggestedDomain,
  };
}

async function fetchWorkspace() {
  try {
    const response = await fetch(`${API_BASE}/api/workspace?domain=${WORKSPACE_DOMAIN}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }
}

async function fetchLayout(utterance, registry) {
  try {
    const pageContext = gatherPageContext();
    const intentResponse = await fetch(`${API_BASE}/api/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        utterance,
        context: pageContext,
      }),
    });

    if (!intentResponse.ok) {
      return [];
    }

    const intentData = await intentResponse.json();
    if (intentData.clarify === true) return [];
    const intent = intentData.intent || intentData;
    if (!intent) {
      return [];
    }

    const layoutResponse = await fetch(`${API_BASE}/api/layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent,
        workspace: WORKSPACE_DOMAIN,
        registry,
      }),
    });

    if (!layoutResponse.ok) {
      return [];
    }

    const layoutData = await layoutResponse.json();
    lastLayoutData = layoutData.data || {};
    return Array.isArray(layoutData.panels) ? layoutData.panels : [];
  } catch (error) {
    console.error('Error fetching layout:', error);
    return [];
  }
}

function formatComponentId(componentId) {
  if (!componentId) return '';
  const formatted = String(componentId).replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function removeOverlay() {
  const existingOverlay = document.getElementById('prism-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  currentPanels = [];
}

function createPanelElement(panel, data = lastLayoutData, extraClass = '') {
  if (typeof data === 'string') {
    extraClass = data;
    data = lastLayoutData;
  }
  const safeData = data || {};

  const panelEl = document.createElement('div');
  panelEl.className = extraClass ? `prism-panel ${extraClass}` : 'prism-panel';
  panelEl.dataset.componentId = panel.component_id;

  const h3 = document.createElement('h3');
  h3.textContent = formatComponentId(panel.component_id);

  let contentEl;
  switch (panel.component_id) {
    case 'meeting_prep_brief': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const m = safeData.meetings?.[0];
      const name = m?.name || m?.title || 'N/A';
      const scheduled_at = m?.scheduled_at || m?.held_at || m?.date || 'N/A';
      const attendees = typeof m?.attendees === 'number' ? m.attendees : (m?.attendees?.length || 0);
      contentEl.innerHTML = `<strong>Meeting:</strong> ${name}<br><strong>Date:</strong> ${scheduled_at}<br><strong>Attendees:</strong> ${attendees}`;
      break;
    }

    case 'client_overview': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const c = safeData.clients?.[0];
      const name = c?.name || 'N/A';
      const tier = c?.tier || 'Enterprise';
      const status = c?.status || 'Active';
      contentEl.innerHTML = `<strong>Client:</strong> ${name}<br><strong>Tier:</strong> ${tier}<br><strong>Status:</strong> ${status}`;
      break;
    }

    case 'contact_card': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const contact = safeData.contacts?.[0];
      const name = contact?.name || 'N/A';
      const role = contact?.role || 'N/A';
      const email = contact?.email || 'N/A';
      contentEl.innerHTML = `<strong>Name:</strong> ${name}<br><strong>Role:</strong> ${role}<br><strong>Email:</strong> ${email}`;
      break;
    }

    case 'kpi_row': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const usage = Array.isArray(safeData.usage) ? safeData.usage.slice(-3) : [];
      contentEl.innerHTML = usage.map((item) => {
        const metricName = item.metric_name || item.segment || 'Metric';
        const val = item.value !== undefined ? item.value : (item.active_users ?? item.events ?? 0);
        return `<div class="prism-kpi-box"><span class="prism-kpi-value">${val}</span>${metricName}</div>`;
      }).join('');
      break;
    }

    case 'task_list': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const tasks = Array.isArray(safeData.tasks) ? safeData.tasks.slice(0, 3) : [];
      contentEl.innerHTML = tasks.map((task) => {
        const isChecked = task.status === 'done';
        const name = task.name || task.title || 'Task';
        const dueDate = task.due_date ? ` (${task.due_date})` : '';
        return `<div style="margin-bottom: 4px;"><input type="checkbox" disabled ${isChecked ? 'checked' : ''} style="margin-right: 6px; vertical-align: middle;"><span>${name}</span>${dueDate ? ` <span style="color: #8b949e; font-size: 11px;">${dueDate}</span>` : ''}</div>`;
      }).join('');
      break;
    }

    case 'project_status':
    case 'project_health_card': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      const proj = safeData.projects?.[0];
      const name = proj?.name || proj?.title || 'N/A';
      const status = proj?.status || 'Active';
      const dueDate = proj?.due_date || proj?.deadline || 'N/A';
      const progress = (status === 'completed' || status === 'done') ? '100%' : '65%';
      contentEl.innerHTML = `<strong>Project:</strong> ${name}<br><strong>Status:</strong> ${status}<br><strong>Due Date:</strong> ${dueDate}` +
        `<div style="background: #21262d; border-radius: 4px; height: 6px; width: 100%; margin-top: 8px; overflow: hidden;">` +
          `<div style="background: #238636; height: 100%; width: ${progress};"></div>` +
        `</div>`;
      break;
    }

    case 'suggested_actions': {
      contentEl = document.createElement('div');
      contentEl.className = 'prism-panel-data';
      contentEl.innerHTML = `<button type="button" class="prism-action-btn">Take Action</button><button type="button" class="prism-action-btn">View Details</button>`;
      break;
    }

    default: {
      contentEl = document.createElement('p');
      contentEl.textContent = panel.reason || '';
      break;
    }
  }

  const span = document.createElement('span');
  span.className = 'prism-zone';
  span.textContent = panel.zone || '';

  const whyBtn = document.createElement('button');
  whyBtn.className = 'prism-why-btn';
  whyBtn.textContent = 'Why?';
  whyBtn.type = 'button';
  whyBtn.style.display = 'inline-block';
  whyBtn.style.marginLeft = '8px';
  whyBtn.style.padding = '2px 8px';
  whyBtn.style.fontSize = '10px';
  whyBtn.style.fontWeight = '600';
  whyBtn.style.borderRadius = '10px';
  whyBtn.style.background = '#21262d';
  whyBtn.style.color = '#8b949e';
  whyBtn.style.border = '1px solid #30363d';
  whyBtn.style.cursor = 'pointer';
  whyBtn.style.transition = 'all 0.15s ease';

  whyBtn.addEventListener('mouseenter', () => {
    whyBtn.style.color = '#58a6ff';
    whyBtn.style.borderColor = '#58a6ff';
  });
  whyBtn.addEventListener('mouseleave', () => {
    whyBtn.style.color = '#8b949e';
    whyBtn.style.borderColor = '#30363d';
  });

  const whyContainer = document.createElement('div');
  whyContainer.className = 'prism-why-text';
  whyContainer.style.display = 'none';
  whyContainer.style.marginTop = '8px';
  whyContainer.style.padding = '8px 10px';
  whyContainer.style.background = '#161b22';
  whyContainer.style.border = '1px solid #30363d';
  whyContainer.style.borderRadius = '6px';
  whyContainer.style.fontSize = '11px';
  whyContainer.style.color = '#c9d1d9';
  whyContainer.style.lineHeight = '1.4';

  let whyLoaded = false;
  let isFetchingWhy = false;

  whyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    if (whyContainer.style.display !== 'none') {
      whyContainer.style.display = 'none';
      return;
    }

    whyContainer.style.display = 'block';

    if (whyLoaded) {
      return;
    }

    if (isFetchingWhy) {
      return;
    }

    isFetchingWhy = true;
    whyContainer.textContent = 'PRISM is fetching explanation...';

    try {
      const res = await fetch(`${API_BASE}/api/why/${encodeURIComponent(panel.component_id)}`);
      if (!res.ok) {
        whyContainer.textContent = 'Unable to load explanation.';
        return;
      }
      const data = await res.json();
      whyContainer.textContent = data.intent 
        ? 'For: "' + data.intent + '" — ' + data.reason 
        : data.reason;
      whyLoaded = true;
    } catch (err) {
      console.error('Error fetching why explanation:', err);
      whyContainer.textContent = 'Error loading explanation.';
    } finally {
      isFetchingWhy = false;
    }
  });

  const pinBtn = document.createElement('button');
  pinBtn.innerText = '📌';
  pinBtn.className = 'prism-pin-btn';
  pinBtn.title = 'Pin this panel';
  pinBtn.type = 'button';
  pinBtn.style.display = 'inline-block';
  pinBtn.style.marginLeft = '6px';
  pinBtn.style.padding = '2px 6px';
  pinBtn.style.fontSize = '10px';
  pinBtn.style.borderRadius = '10px';
  pinBtn.style.background = '#21262d';
  pinBtn.style.border = '1px solid #30363d';
  pinBtn.style.cursor = 'pointer';
  pinBtn.style.transition = 'all 0.15s ease';

  try {
    const storedPinned = localStorage.getItem('prism_pinned_panels');
    const pinnedList = storedPinned ? JSON.parse(storedPinned) : [];
    if (Array.isArray(pinnedList) && pinnedList.includes(panel.component_id)) {
      panelEl.classList.add('pinned');
      pinBtn.title = 'Unpin this panel';
    }
  } catch (err) {
    console.error('Error reading pinned panels from localStorage:', err);
  }

  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPinned = panelEl.classList.toggle('pinned');
    pinBtn.title = isPinned ? 'Unpin this panel' : 'Pin this panel';

    try {
      const stored = localStorage.getItem('prism_pinned_panels');
      let currentPinned = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(currentPinned)) {
        currentPinned = [];
      }
      if (isPinned) {
        if (!currentPinned.includes(panel.component_id)) {
          currentPinned.push(panel.component_id);
        }
      } else {
        currentPinned = currentPinned.filter((id) => id !== panel.component_id);
      }
      localStorage.setItem('prism_pinned_panels', JSON.stringify(currentPinned));
    } catch (err) {
      console.error('Error updating pinned panels in localStorage:', err);
    }
  });

  panelEl.appendChild(h3);
  panelEl.appendChild(contentEl);
  panelEl.appendChild(span);
  panelEl.appendChild(whyBtn);
  panelEl.appendChild(pinBtn);
  panelEl.appendChild(whyContainer);

  return panelEl;
}

function getZoneSections(container) {
  let hero = container.querySelector('.prism-zone-hero');
  let grid = container.querySelector('.prism-zone-grid');
  let primary = grid ? grid.querySelector('.prism-zone-primary') : null;
  let secondary = grid ? grid.querySelector('.prism-zone-secondary') : null;
  let rail = container.querySelector('.prism-zone-rail');

  if (!hero) {
    hero = document.createElement('div');
    hero.className = 'prism-zone-hero';
  }
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'prism-zone-grid';
  }
  if (!primary) {
    primary = document.createElement('div');
    primary.className = 'prism-zone-primary';
  }
  if (!secondary) {
    secondary = document.createElement('div');
    secondary.className = 'prism-zone-secondary';
  }
  if (!rail) {
    rail = document.createElement('div');
    rail.className = 'prism-zone-rail';
  }

  return { hero, grid, primary, secondary, rail };
}

function getZoneTarget(zone, { hero, primary, secondary, rail }) {
  const z = (zone || '').toLowerCase();
  if (z === 'hero') return hero;
  if (z === 'secondary') return secondary;
  if (z === 'rail') return rail;
  if (z === 'primary') return primary;
  return primary;
}

function attachZoneSections(container, { hero, grid, primary, secondary, rail }) {
  if (primary.children.length > 0) {
    grid.appendChild(primary);
  } else {
    primary.remove();
  }

  if (secondary.children.length > 0) {
    grid.appendChild(secondary);
  } else {
    secondary.remove();
  }

  if (hero.children.length > 0) {
    container.appendChild(hero);
  } else {
    hero.remove();
  }

  if (grid.children.length > 0) {
    container.appendChild(grid);
  } else {
    grid.remove();
  }

  if (rail.children.length > 0) {
    container.appendChild(rail);
  } else {
    rail.remove();
  }
}

function cleanupEmptyZones(container) {
  const primary = container.querySelector('.prism-zone-primary');
  const secondary = container.querySelector('.prism-zone-secondary');
  const grid = container.querySelector('.prism-zone-grid');
  const hero = container.querySelector('.prism-zone-hero');
  const rail = container.querySelector('.prism-zone-rail');

  if (primary && primary.children.length === 0) primary.remove();
  if (secondary && secondary.children.length === 0) secondary.remove();
  if (grid && grid.children.length === 0) grid.remove();
  if (hero && hero.children.length === 0) hero.remove();
  if (rail && rail.children.length === 0) rail.remove();
}

function renderPanels(container, panels) {
  const existingZones = container.querySelectorAll('.prism-zone-hero, .prism-zone-grid, .prism-zone-rail');
  existingZones.forEach((el) => el.remove());
  const existingPanels = container.querySelectorAll('.prism-panel');
  existingPanels.forEach((el) => el.remove());

  if (!panels || panels.length === 0) {
    currentPanels = [];
    return;
  }

  const sortedPanels = [...panels].sort((a, b) => {
    const pA = (a.priority !== undefined && a.priority !== null) ? Number(a.priority) : 999;
    const pB = (b.priority !== undefined && b.priority !== null) ? Number(b.priority) : 999;
    return pA - pB;
  });

  const zones = getZoneSections(container);

  for (const panel of sortedPanels) {
    const panelEl = createPanelElement(panel, lastLayoutData);
    const targetZone = getZoneTarget(panel.zone, zones);
    targetZone.appendChild(panelEl);
  }

  attachZoneSections(container, zones);
  currentPanels = panels;
}

function createOverlay() {
  let overlay = document.getElementById('prism-overlay');
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.id = 'prism-overlay';

  // Intent input bar
  const intentBar = document.createElement('div');
  intentBar.className = 'prism-intent-bar';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'prism-intent-input';
  input.placeholder = 'What are you trying to do?';

  const btn = document.createElement('button');
  btn.className = 'prism-intent-btn';
  btn.textContent = 'Go';

  const loading = document.createElement('div');
  loading.className = 'prism-intent-loading';
  loading.textContent = 'PRISM is thinking...';
  loading.style.display = 'none';

  intentBar.appendChild(input);
  intentBar.appendChild(btn);
  intentBar.appendChild(loading);
  overlay.appendChild(intentBar);

  async function handleSubmit() {
    const value = input.value.trim();
    if (!value) return;

    // Clear previous error message
    const existingError = overlay.querySelector('.prism-error-msg');
    if (existingError) {
      existingError.remove();
    }

    // Show loading
    loading.style.display = 'block';
    input.disabled = true;
    btn.disabled = true;
    btn.textContent = '...';

    try {
      const pageContext = gatherPageContext();
      const intentRes = await fetch(`${API_BASE}/api/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utterance: value, context: pageContext }),
      });

      if (!intentRes.ok) {
        throw new Error(`Intent request failed with status ${intentRes.status}`);
      }

      const intentData = await intentRes.json();

      if (intentData && intentData.clarify === true) {
        renderPanels(overlay, []);
        const panelEl = document.createElement('div');
        panelEl.className = 'prism-panel';

        const h3 = document.createElement('h3');
        h3.textContent = 'PRISM needs clarification';

        const p = document.createElement('p');
        p.textContent = intentData.question || '';

        panelEl.appendChild(h3);
        panelEl.appendChild(p);

        if (Array.isArray(intentData.options) && intentData.options.length > 0) {
          const btnContainer = document.createElement('div');
          btnContainer.style.display = 'flex';
          btnContainer.style.flexDirection = 'column';
          btnContainer.style.gap = '6px';
          btnContainer.style.marginTop = '8px';

          for (const opt of intentData.options) {
            const optBtn = document.createElement('button');
            optBtn.type = 'button';
            optBtn.className = 'prism-intent-btn';
            optBtn.textContent = opt;
            optBtn.style.width = '100%';
            optBtn.style.textAlign = 'left';
            optBtn.addEventListener('click', () => {
              input.value = opt;
              handleSubmit();
            });
            btnContainer.appendChild(optBtn);
          }

          panelEl.appendChild(btnContainer);
        }

        overlay.appendChild(panelEl);
        return;
      }

      const intent = intentData.intent || intentData;

      const layoutRes = await fetch(`${API_BASE}/api/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });

      if (!layoutRes.ok) {
        throw new Error(`Layout request failed with status ${layoutRes.status}`);
      }

      const layoutData = await layoutRes.json();
      lastLayoutData = layoutData.data || {};
      const newPanels = Array.isArray(layoutData.panels) ? layoutData.panels : [];

      if (currentPanels.length > 0) {
        try {
          const deltaRes = await fetch(`${API_BASE}/api/delta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentLayout: currentPanels,
              newLayout: newPanels,
              pinnedPanelIds: [],
            }),
          });

          if (!deltaRes.ok) {
            renderPanels(overlay, newPanels);
            return;
          }

          const delta = await deltaRes.json();
          const finalPanels = Array.isArray(delta.newPlan) ? delta.newPlan : newPanels;
          const removedIds = Array.isArray(delta.removed) ? delta.removed : [];

          // For panels in delta.removed: find their DOM element and add class "prism-panel-exit" before removing
          removedIds.forEach((id) => {
            const el = overlay.querySelector(`.prism-panel[data-component-id="${CSS.escape(id)}"]`);
            if (el) {
              el.classList.add('prism-panel-exit');
              setTimeout(() => {
                el.remove();
                cleanupEmptyZones(overlay);
              }, 300);
            }
          });

          // Use delta.newPlan as final panels to render
          // For panels in delta.added: render them with class "prism-panel-enter"
          // For panels in delta.kept: keep them in place, just reorder
          const sortedFinalPanels = [...finalPanels].sort((a, b) => {
            const pA = (a.priority !== undefined && a.priority !== null) ? Number(a.priority) : 999;
            const pB = (b.priority !== undefined && b.priority !== null) ? Number(b.priority) : 999;
            return pA - pB;
          });

          const zones = getZoneSections(overlay);

          for (const panel of sortedFinalPanels) {
            const id = panel.component_id;
            const existingEl = overlay.querySelector(`.prism-panel[data-component-id="${CSS.escape(id)}"]`);
            const targetZone = getZoneTarget(panel.zone, zones);

            if (existingEl && !existingEl.classList.contains('prism-panel-exit')) {
              // Kept panel: remove previous enter class if present, update, and reorder in DOM
              existingEl.classList.remove('prism-panel-enter');
              const p = existingEl.querySelector('p');
              if (p && panel.reason) p.textContent = panel.reason;
              const span = existingEl.querySelector('.prism-zone');
              if (span && panel.zone) span.textContent = panel.zone;
              targetZone.appendChild(existingEl);
            } else {
              // Added panel: render with class "prism-panel-enter"
              const newEl = createPanelElement(panel, lastLayoutData, 'prism-panel-enter');
              targetZone.appendChild(newEl);
            }
          }

          attachZoneSections(overlay, zones);
          currentPanels = finalPanels;
        } catch (deltaError) {
          console.error('Error calculating layout delta:', deltaError);
          renderPanels(overlay, newPanels);
        }
      } else {
        renderPanels(overlay, newPanels);
      }
    } catch (error) {
      console.error(error);
      loading.style.display = 'none';

      const errorDiv = document.createElement('div');
      errorDiv.className = 'prism-error-msg';
      errorDiv.textContent = 'Something went wrong. Please try again.';
      errorDiv.style.color = '#f85149';
      errorDiv.style.fontSize = '13px';
      errorDiv.style.marginTop = '12px';
      errorDiv.style.textAlign = 'center';
      overlay.appendChild(errorDiv);
    } finally {
      loading.style.display = 'none';
      input.disabled = false;
      btn.disabled = false;
      btn.textContent = 'Go';
    }
  }


  btn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

function renderOverlay(panels) {
  const overlay = createOverlay();
  renderPanels(overlay, panels);
}

async function init() {
  const utterance = detectIntent();
  const workspace = await fetchWorkspace();
  if (!workspace) {
    createOverlay();
    return;
  }

  const panels = await fetchLayout(utterance, workspace.components);
  renderOverlay(panels);
}

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'P' || event.key === 'p' || event.code === 'KeyP')) {
    event.preventDefault();
    const overlay = document.getElementById('prism-overlay');
    if (overlay) {
      removeOverlay();
    } else {
      init();
    }
  }
});

init();
