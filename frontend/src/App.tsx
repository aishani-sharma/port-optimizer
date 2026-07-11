import PortfolioForm from './components/PortfolioForm';

/**
 * Main application component.
 * 
 * Sets up the premium dark theme layout for the Portfolio Optimizer app.
 * A near-black background (zinc-950) is used with red accents (red-500/red-600)
 * to provide a sleek fintech aesthetic.
 */
function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Decorative premium radial background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header / Brand */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo/Icon */}
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="font-semibold text-zinc-100 tracking-tight text-lg">
              PortOpt
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
              v1.0.0-beta
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-20 relative z-10">
        <div className="w-full max-w-xl text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Portfolio Optimizer
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Optimize your asset allocation using Modern Portfolio Theory (MPT) to maximize the Sharpe ratio.
          </p>
        </div>

        <PortfolioForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PortOpt. Built with React, TypeScript & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;