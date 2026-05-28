import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip as RTooltip,
} from "recharts";

// Real values from notebook: model_rf.feature_importances_
const DATA = [
	{ feature: "gap_count", importance: 0.4861 },
	{ feature: "length", importance: 0.3062 },
	{ feature: "score_blosum", importance: 0.1223 },
	{ feature: "mismatches", importance: 0.0853 },
];

export function FeatureImportanceChart() {
	return (
		<div className="h-[200px]">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={DATA}
					layout="vertical"
					margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
				>
					<XAxis type="number" hide domain={[0, 0.55]} />
					<YAxis
						type="category"
						dataKey="feature"
						width={110}
						tick={{
							fontFamily: "JetBrains Mono",
							fontSize: 10,
							fill: "var(--color-muted-foreground)",
						}}
						axisLine={false}
						tickLine={false}
					/>
					<RTooltip
						cursor={{ fill: "var(--color-muted)" }}
						formatter={(v: number) =>
							`${(v * 100).toFixed(1)}%`
						}
						contentStyle={{
							background: "var(--color-card)",
							border: "1px solid var(--color-border)",
							fontSize: 11,
							fontFamily: "JetBrains Mono",
						}}
					/>
					<Bar
						dataKey="importance"
						fill="var(--color-primary)"
						radius={[0, 2, 2, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
