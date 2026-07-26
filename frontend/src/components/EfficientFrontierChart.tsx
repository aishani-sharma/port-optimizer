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
    ReferenceDot,
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
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Efficient Frontier</h2>
                    <p className="text-[10px] text-zinc-500">
                        {simulations.length.toLocaleString()} simulated portfolios
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase text-zinc-500 block">Best Sharpe Ratio</span>
                    <span className="font-mono text-sm font-bold text-amber-400">{bestPortfolio.sharpe_ratio.toFixed(2)}</span>
                </div>
            </div>

            <div className="w-full h-[480px] relative min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 25, right: 35, bottom: 20, left: 10 }}>
                        <CartesianGrid stroke="#1f1f23" strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="volatility"
                            name="Volatility"
                            unit="%"
                            stroke="#52525b"
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Volatility (%)', position: 'bottom', fill: '#71717a', fontSize: 11 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="return"
                            name="Return"
                            unit="%"
                            stroke="#52525b"
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#71717a', fontSize: 11 }}
                        />
                        <ZAxis range={[15, 15]} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                            formatter={(value: any, name: any) => {
                                if (typeof value === 'number') {
                                    return [`${value.toFixed(2)}%`, name];
                                }
                                return [value, name];
                            }}
                        />
                        {/* Random simulated portfolios — amber/gold scatter cloud */}
                        <Scatter data={points} fill="#78350f" opacity={0.4} />
                        {/* Best Sharpe portfolio — highlighted */}
                        <Scatter data={bestPoint} fill="#f59e0b" shape="star" />
                        
                        {/* Clearly label the best-Sharpe point directly on the chart */}
                        <ReferenceDot
                            x={bestPortfolio.volatility * 100}
                            y={bestPortfolio.expected_return * 100}
                            r={6}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            label={{
                                value: `Max Sharpe (${bestPortfolio.sharpe_ratio.toFixed(2)})`,
                                position: 'top',
                                fill: '#f59e0b',
                                fontSize: 10,
                                fontWeight: 'bold',
                                offset: 10
                            }}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}