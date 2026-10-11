import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown, Menu, X, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WORKSPACES } from '../../data/workspaces';

export const Navbar: React.FC = () => {
  const { activeWorkspace, isLoadingWorkspace, selectWorkspace } = useWorkspace();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth >= 901) {
        setIsMenuOpen(false);
        document.body.classList.remove('menu-open');
      }
    };
    window.addEventListener('resize', closeMenuOnResize);
    return () => window.removeEventListener('resize', closeMenuOnResize);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        document.body.classList.remove('menu-open');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      {/* Menu backdrop (phone only) */}
      <div
        className={`menu-backdrop ${isMenuOpen ? 'open' : ''}`}
        onClick={() => {
          setIsMenuOpen(false);
          document.body.classList.remove('menu-open');
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="header">
        {/* Left: Logo */}
        <a href="#top" aria-label="PRISM" className="logo appear appear--scale">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <g transform="rotate(-30 12 12)">
              <circle cx="7.3" cy="3.2" r="1.45" />
              <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <circle cx="16.7" cy="20.8" r="1.45" />
            </g>
          </svg>
          <span>
            PRISM<span className="logo-suffix">.ai</span>
          </span>
        </a>

        {/* Center: Navigation (hidden on phone) */}
        <nav id="site-nav" aria-label="Primary" className={`site-nav ${isMenuOpen ? 'open' : ''}`}>
          <a href="#top" className="nav-link appear appear--scale" onClick={handleNavClick}>
            Overview
          </a>
          <a href="#workspace" className="nav-link appear appear--soft" onClick={handleNavClick}>
            Workspace
          </a>
          <a href="#features" className="nav-link appear appear--scale" onClick={handleNavClick}>
            Features
          </a>
          <a href="#demo" className="nav-link appear appear--scale" onClick={handleNavClick}>
            How It Works
          </a>
        </nav>

        {/* Right: Workspace selector + notifications */}
        <div className="header-right">
          <div className="relative">
            <button
              type="button"
              aria-expanded={isWorkspaceMenuOpen}
              aria-haspopup="menu"
              disabled={isLoadingWorkspace}
              onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
              className="workspace-select appear appear--scale"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isLoadingWorkspace ? 'Loading...' : activeWorkspace.name}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isWorkspaceMenuOpen && !isLoadingWorkspace && (
              <div role="menu" className="workspace-menu">
                {WORKSPACES.map((workspace) => (
                  <button
                    key={workspace.domain}
                    type="button"
                    role="menuitem"
                    disabled={workspace.domain === activeWorkspace.domain}
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      void selectWorkspace(workspace);
                    }}
                    className="workspace-item"
                  >
                    <span>{workspace.icon}</span>
                    <span>{workspace.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="icon-button appear appear--scale"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="notification-dot" />
          </button>

          {/* Burger menu (phone only) */}
          <button
            className="burger appear appear--scale"
            onClick={handleMenuToggle}
            aria-controls="site-nav"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="burger-bar" />
            <span className="burger-bar" />
            <span className="burger-bar" />
          </button>
        </div>
      </header>
    </>
  );
};