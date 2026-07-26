import React from 'react';

export type NavTab = 'optimizer' | 'research' | 'risk' | 'backtest';

interface NavigationRailProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NavigationRail({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}: NavigationRailProps) {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'optimizer',
      label: 'Optimizer',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: 'research',
      label: 'Research',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      id: 'risk',
      label: 'Risk Assessment',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      id: 'backtest',
      label: 'Backtest',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`relative border-r border-zinc-900/80 bg-zinc-950 flex flex-col justify-between transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Section: App Logo & Navigation List */}
      <div className="flex flex-col flex-grow">
        {/* Brand Header */}
        <div className="h-14 border-b border-zinc-900/80 flex items-center justify-between px-3.5">
          <div className="flex items-center overflow-hidden">
            {!isCollapsed && (
              <span className="font-bold text-zinc-100 tracking-tight text-base truncate">
                PortOpt
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {isCollapsed && (
          <div className="p-2 border-b border-zinc-900/60 flex justify-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start'
                } ${
                  isActive
                    ? 'bg-amber-950/40 text-white border border-amber-900/50 shadow-sm shadow-amber-950/50 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className={isActive ? 'text-amber-400' : 'text-zinc-400'}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Footer watermark when expanded */}
      {!isCollapsed && (
        <div className="p-3 border-t border-zinc-900/80 text-[10px] text-zinc-600 flex flex-col items-start space-y-0.5">
          <span className="font-semibold text-zinc-500">MPT Engine v1.0</span>
          <span>Sharpe Allocation</span>
        </div>
      )}
    </aside>
  );
}
