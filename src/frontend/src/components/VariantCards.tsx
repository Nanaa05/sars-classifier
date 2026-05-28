import { Badge } from "../components/ui/badge";

function Virus({ color, spin = "30s" }: { color: string; spin?: string }) {
	const spikes = Array.from({ length: 14 });
	return (
		<div
			className="relative w-24 h-24 shrink-0"
			style={{ animation: `vs-spin ${spin} linear infinite` }}
		>
			<svg viewBox="-50 -50 100 100" className="w-full h-full">
				{spikes.map((_, i) => {
					const a = (i / spikes.length) * Math.PI * 2;
					const x = Math.cos(a) * 34;
					const y = Math.sin(a) * 34;
					return (
						<g
							key={i}
							transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
						>
							<rect
								x={0}
								y={-2}
								width={10}
								height={4}
								rx={1.5}
								fill={color}
								opacity={0.55}
							/>
							<circle cx={11} cy={0} r={3.5} fill={color} />
						</g>
					);
				})}
				<circle cx={0} cy={0} r={22} fill={color} opacity={0.18} />
				<circle
					cx={0}
					cy={0}
					r={22}
					fill="none"
					stroke={color}
					strokeWidth={1.5}
				/>
				<circle cx={-6} cy={-4} r={2} fill={color} opacity={0.6} />
				<circle cx={7} cy={2} r={2.5} fill={color} opacity={0.6} />
				<circle cx={-2} cy={9} r={1.8} fill={color} opacity={0.6} />
			</svg>
		</div>
	);
}

export function VariantCards() {
	const variants = [
		{
			name: "Alpha",
			lineage: "B.1.1.7",
			year: "Late 2020 · UK",
			color: "var(--color-chart-3)",
			marker: "N501Y",
			fact: "First variant of concern. ~50% more transmissible than the original strain due to tighter ACE2 binding.",
		},
		{
			name: "Delta",
			lineage: "B.1.617.2",
			year: "Late 2020 · India",
			color: "var(--color-chart-4)",
			marker: "L452R + T478K",
			fact: "Drove the 2021 global wave. Higher viral loads and partial immune escape from prior infection.",
		},
		{
			name: "Omicron",
			lineage: "B.1.1.529",
			year: "Late 2021 · South Africa",
			color: "var(--color-chart-5)",
			marker: "30+ spike mutations",
			fact: "Massive antigenic shift with K417N, E484A, N501Y and more. Extensive antibody escape but milder disease on average.",
		},
	];
	return (
		<section className="space-y-4">
			<div className="flex items-baseline justify-between">
				<h2 className="text-lg font-medium">Variants of concern</h2>
				<span className="text-xs text-muted-foreground font-mono">
					WHO designated VOCs
				</span>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{variants.map((v, i) => (
					<div
						key={v.name}
						className="border border-border rounded-md bg-card p-5 flex gap-4 items-start"
					>
						<Virus color={v.color} spin={`${24 + i * 8}s`} />
						<div className="min-w-0">
							<div className="flex items-baseline gap-2 flex-wrap">
								<h3 className="text-xl font-mono font-semibold tracking-tight">
									{v.name}
								</h3>
								<span className="text-xs font-mono text-muted-foreground">
									{v.lineage}
								</span>
							</div>
							<div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">
								{v.year}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed mt-3">
								{v.fact}
							</p>
							<div className="mt-3">
								<Badge
									variant="outline"
									className="font-mono text-[10px]"
								>
									{v.marker}
								</Badge>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
