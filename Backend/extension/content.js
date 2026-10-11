const API_BASE = 'https://prism-topaz-one.vercel.app';
const WORKSPACE_DOMAIN = 'github.com';
let currentPanels = [];

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

  return {
    domain,
    url,
    pageType,
    pageTitle: document.title,
    metaDescription,
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

function createPanelElement(panel, extraClass = '') {
  const panelEl = document.createElement('div');
  panelEl.className = extraClass ? `prism-panel ${extraClass}` : 'prism-panel';
  panelEl.dataset.componentId = panel.component_id;

  const h3 = document.createElement('h3');
  h3.textContent = formatComponentId(panel.component_id);

  const p = document.createElement('p');
  p.textContent = panel.reason || '';

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
      whyContainer.textContent = data.reason || 'No explanation provided.';
      whyLoaded = true;
    } catch (err) {
      console.error('Error fetching why explanation:', err);
      whyContainer.textContent = 'Error loading explanation.';
    } finally {
      isFetchingWhy = false;
    }
  });

  panelEl.appendChild(h3);
  panelEl.appendChild(p);
  panelEl.appendChild(span);
  panelEl.appendChild(whyBtn);
  panelEl.appendChild(whyContainer);

  return panelEl;
}

function renderPanels(container, panels) {
  const existing = container.querySelectorAll('.prism-panel');
  existing.forEach((el) => el.remove());

  if (!panels || panels.length === 0) {
    currentPanels = [];
    return;
  }

  const visiblePanels = panels.slice(0, 5);
  for (const panel of visiblePanels) {
    const panelEl = createPanelElement(panel);
    container.appendChild(panelEl);
  }

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
        return;
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
        return;
      }

      const layoutData = await layoutRes.json();
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
              }, 300);
            }
          });

          // Use delta.newPlan as final panels to render
          // For panels in delta.added: render them with class "prism-panel-enter"
          // For panels in delta.kept: keep them in place, just reorder
          const visibleFinalPanels = finalPanels.slice(0, 5);
          for (const panel of visibleFinalPanels) {
            const id = panel.component_id;
            const existingEl = overlay.querySelector(`.prism-panel[data-component-id="${CSS.escape(id)}"]`);

            if (existingEl && !existingEl.classList.contains('prism-panel-exit')) {
              // Kept panel: remove previous enter class if present, update, and reorder in DOM
              existingEl.classList.remove('prism-panel-enter');
              const p = existingEl.querySelector('p');
              if (p && panel.reason) p.textContent = panel.reason;
              const span = existingEl.querySelector('.prism-zone');
              if (span && panel.zone) span.textContent = panel.zone;
              overlay.appendChild(existingEl);
            } else {
              // Added panel: render with class "prism-panel-enter"
              const newEl = createPanelElement(panel, 'prism-panel-enter');
              overlay.appendChild(newEl);
            }
          }

          currentPanels = finalPanels;
        } catch (deltaError) {
          console.error('Error calculating layout delta:', deltaError);
          renderPanels(overlay, newPanels);
        }
      } else {
        renderPanels(overlay, newPanels);
      }
    } catch (error) {
      console.error('PRISM intent submit error:', error);
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
