// src/components/EfficientFrontierChart.tsx
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import type { SimulatedPoint, SimulatedPortfolio } from '../types/portfolio'

interface Props {
    simulations: SimulatedPoint[]
    bestPortfolio: SimulatedPortfolio
}

export default function EfficientFrontierChart({ simulations, bestPortfolio }: Props) {
    // Recharts wants volatility on X, return on Y — convert to percentages for readability
    const points = simulations.map((s) => ({
        volatility: s.volatility * 100,
        return: s.expected_return * 100,
        sharpe: s.sharpe_ratio,
    }))

    const bestPoint = [{
        volatility: bestPortfolio.volatility * 100,
        return: bestPortfolio.expected_return * 100,
        sharpe: bestPortfolio.sharpe_ratio,
    }]

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-1">Efficient Frontier</h2>
            <p className="text-sm text-zinc-400 mb-4">
                {simulations.length.toLocaleString()} simulated portfolios
            </p>

            <div className="w-full h-[400px] relative min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="volatility"
                            name="Volatility"
                            unit="%"
                            stroke="#71717a"
                            label={{ value: 'Volatility (%)', position: 'bottom', fill: '#a1a1aa' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="return"
                            name="Return"
                            unit="%"
                            stroke="#71717a"
                            label={{ value: 'Return (%)', angle: -90, position: 'left', fill: '#a1a1aa' }}
                        />
                        <ZAxis range={[20, 20]} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(2) : value)}
                        />
                        {/* Random simulated portfolios — the cloud */}
                        <Scatter data={points} fill="#7f1d1d" opacity={0.5} />
                        {/* Best Sharpe portfolio — highlighted */}
                        <Scatter data={bestPoint} fill="#ef4444" shape="star" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}