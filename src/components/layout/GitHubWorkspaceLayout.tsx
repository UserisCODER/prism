import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RegistryContainer } from '../registry/RegistryContainer';
import { IntentBar } from './IntentBar';

const GithubIcon = () => (
  <svg height="32" viewBox="0 0 16 16" width="32" fill="white">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const NAV_TABS = [
  { id: 'code', label: 'Code', icon: '📁' },
  { id: 'issues', label: 'Issues', icon: '⚪' },
  { id: 'pulls', label: 'Pull requests', icon: '🔀' },
  { id: 'actions', label: 'Actions', icon: '▶️' },
  { id: 'projects', label: 'Projects', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const GitHubWorkspaceLayout: React.FC = () => {
  const { layoutPlan, submitIntent, isAnalyzing } = useWorkspace();
  const [activeTab, setActiveTab] = useState('pulls');

  const allPanels = [
    layoutPlan.hero,
    ...layoutPlan.primary,
    ...layoutPlan.secondary,
    ...layoutPlan.rail,
  ].filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: '#0d1117', color: '#e6edf3', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* GitHub Top Navbar */}
      <header style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '0 16px', height: '62px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <GithubIcon />

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: '272px' }}>
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}>
            <svg width="16" height="16" fill="#8b949e" viewBox="0 0 16 16">
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
            </svg>
            <span style={{ color: '#8b949e', fontSize: '14px' }}>Search or jump to...</span>
            <kbd style={{ marginLeft: 'auto', background: '#21262d', border: '1px solid #30363d', borderRadius: '4px', padding: '2px 5px', fontSize: '11px', color: '#8b949e' }}>/</kbd>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {['Pull requests', 'Issues', 'Codespaces', 'Marketplace', 'Explore'].map(link => (
            <a key={link} href="#" onClick={e => e.preventDefault()} style={{ color: '#e6edf3', fontSize: '14px', fontWeight: 600, padding: '6px 8px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >{link}</a>
          ))}
        </nav>

        {/* Right side avatar */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white', border: '2px solid #30363d' }}>U</div>
        </div>
      </header>

      {/* Repo Header */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '16px 32px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <svg width="16" height="16" fill="#8b949e" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" /></svg>
          <span style={{ color: '#58a6ff', fontSize: '20px', fontWeight: 600, cursor: 'pointer' }}>UserisCODER</span>
          <span style={{ color: '#8b949e', fontSize: '20px' }}>/</span>
          <span style={{ color: '#58a6ff', fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>prism</span>
          <span style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', color: '#8b949e', marginLeft: '4px' }}>Public</span>
        </div>

        {/* Repo action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: '⭐ Star', count: '42' },
            { label: '🍴 Fork', count: '8' },
            { label: '👁️ Watch', count: '12' },
          ].map(btn => (
            <button key={btn.label} style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#e6edf3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#30363d')}
              onMouseLeave={e => (e.currentTarget.style.background = '#21262d')}
            >
              {btn.label}
              <span style={{ background: '#30363d', borderRadius: '10px', padding: '0 6px', fontSize: '11px' }}>{btn.count}</span>
            </button>
          ))}
          <button style={{ marginLeft: 'auto', background: '#238636', border: '1px solid #2ea043', borderRadius: '6px', padding: '5px 16px', fontSize: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2ea043')}
            onMouseLeave={e => (e.currentTarget.style.background = '#238636')}
          >+ Code</button>
        </div>

        {/* Repo tabs */}
        <div style={{ display: 'flex', gap: '0', marginTop: '16px', borderBottom: '1px solid #30363d', marginBottom: '-17px' }}>
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #f78166' : '2px solid transparent',
                padding: '8px 16px',
                fontSize: '14px',
                color: activeTab === tab.id ? '#e6edf3' : '#8b949e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                marginBottom: '-1px',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'pulls' && <span style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '10px', padding: '0 6px', fontSize: '11px' }}>3</span>}
              {tab.id === 'issues' && <span style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '10px', padding: '0 6px', fontSize: '11px' }}>5</span>}
            </button>
          ))}
        </div>
      </div>

      {/* PRISM Intent Bar — styled as GitHub search/filter bar */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #30363d', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#8b949e', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🤖</span>
          <span style={{ color: '#58a6ff', fontWeight: 600 }}>PRISM AI</span>
          <span>— adaptive workspace active</span>
        </div>
        <div style={{ flex: 1 }}>
          <IntentBar />
        </div>
      </div>

      {/* Main content area — 2 column GitHub layout */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 296px', gap: '24px', alignItems: 'start' }}>

        {/* Left: Main panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hero panel */}
          <AnimatePresence initial={false} mode="popLayout">
            {layoutPlan.hero && (
              <RegistryContainer key={layoutPlan.hero.instanceId} panel={layoutPlan.hero} />
            )}
          </AnimatePresence>

          {/* Primary panels */}
          <AnimatePresence initial={false} mode="popLayout">
            {layoutPlan.primary.map(panel => (
              <RegistryContainer key={panel.instanceId} panel={panel} />
            ))}
          </AnimatePresence>

          {/* Secondary panels in 2 col grid */}
          {layoutPlan.secondary.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <AnimatePresence initial={false} mode="popLayout">
                {layoutPlan.secondary.map(panel => (
                  <RegistryContainer key={panel.instanceId} panel={panel} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right sidebar — GitHub style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* About box */}
          <div style={{ border: '1px solid #30363d', borderRadius: '6px', padding: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#e6edf3' }}>About</h2>
            <p style={{ fontSize: '13px', color: '#8b949e', lineHeight: '1.5' }}>PRISM — Intent-to-Interface Adaptive Workspace. AI-powered dashboard that reshapes itself around your goal.</p>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['TypeScript', 'Next.js', 'Supabase', 'Gemini AI'].map(tag => (
                <span key={tag} style={{ background: '#388bfd1a', border: '1px solid #388bfd33', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', color: '#58a6ff', width: 'fit-content' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Rail panels */}
          <AnimatePresence initial={false} mode="popLayout">
            {layoutPlan.rail.map(panel => (
              <RegistryContainer key={panel.instanceId} panel={panel} />
            ))}
          </AnimatePresence>

          {/* AI analyzing indicator */}
          {isAnalyzing && (
            <div style={{ border: '1px solid #30363d', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8b949e' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0883e', animation: 'pulse 1s infinite' }} />
              PRISM is analyzing your intent...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
