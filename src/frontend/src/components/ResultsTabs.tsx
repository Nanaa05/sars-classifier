import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { AlignmentView } from "./AlignmentView";
import { ConfusionMatrix } from "./ConfusionMatrix";
import { FeatureImportanceChart } from "./FeatureImportanceChart";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip as RTooltip,
	ResponsiveContainer,
} from "recharts";
import type { ClassificationResult } from "../App";

const VARIANT_DESCRIPTIONS: Record<string, string> = {
	Alpha: "B.1.1.7 lineage. First identified in the UK (Sep 2020). Defined by N501Y in the RBD, increasing ACE2 binding affinity.",
	Delta: "B.1.617.2 lineage. First identified in India (Oct 2020). L452R + T478K enhance transmissibility and immune evasion.",
	Omicron:
		"B.1.1.529 lineage. First identified in South Africa (Nov 2021). >30 spike mutations, including a heavily mutated RBD.",
	Other: "No strong match to the major variants of concern. May be wild-type or a different lineage.",
};

const VARIANT_COLORS: Record<string, string> = {
	Alpha: "var(--color-chart-3)",
	Delta: "var(--color-chart-4)",
	Omicron: "var(--color-chart-5)",
	Other: "var(--color-muted-foreground)",
};

interface ResultsTabsProps {
	result: ClassificationResult;
}

export function ResultsTabs({ result }: ResultsTabsProps) {
	return (
		<section className="border border-border rounded-md bg-card">
			<Tabs defaultValue="prediction" className="w-full">
				<TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
					{["prediction", "alignment", "features", "model"].map(
						(t) => (
							<TabsTrigger
								key={t}
								value={t}
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm capitalize"
							>
								{t}
							</TabsTrigger>
						),
					)}
				</TabsList>

				<TabsContent value="prediction" className="p-6 mt-0">
					<PredictionPanel result={result} />
				</TabsContent>

				<TabsContent value="alignment" className="p-6 mt-0">
					<AlignmentTab result={result} />
				</TabsContent>

				<TabsContent value="features" className="p-6 mt-0">
					<FeaturesPanel result={result} />
				</TabsContent>

				<TabsContent value="model" className="p-6 mt-0">
					<ModelPanel />
				</TabsContent>
			</Tabs>
		</section>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
				{label}
			</div>
			<div className="text-sm font-mono mt-1">{value}</div>
		</div>
	);
}

function PredictionPanel({ result }: { result: ClassificationResult }) {
	const desc =
		VARIANT_DESCRIPTIONS[result.prediction] ?? VARIANT_DESCRIPTIONS.Other;
	const probs = result.probabilities
		? Object.entries(result.probabilities)
				.map(([variant, prob]) => ({ variant, prob }))
				.sort((a, b) => b.prob - a.prob)
		: [];

	return (
		<div className="space-y-6">
			<div>
				<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">
					predicted variant
				</div>
				<div className="flex items-baseline gap-4">
					<h3 className="text-4xl font-mono font-semibold tracking-tight">
						{result.prediction}
					</h3>
					<span className="text-sm font-mono text-muted-foreground">
						{(result.confidence * 100).toFixed(1)}% confidence
					</span>
				</div>
				<p className="text-sm text-muted-foreground mt-3 max-w-2xl leading-relaxed">
					{desc}
				</p>
			</div>

			{probs.length > 0 && (
				<div>
					<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">
						class probabilities
					</div>
					<div className="flex h-8 rounded-sm overflow-hidden border border-border">
						{probs.map((p) => (
							<div
								key={p.variant}
								style={{
									width: `${p.prob * 100}%`,
									background:
										VARIANT_COLORS[p.variant] ??
										"var(--color-muted-foreground)",
								}}
								className="flex items-center justify-center text-[10px] font-mono text-background"
								title={`${p.variant} ${(p.prob * 100).toFixed(1)}%`}
							>
								{p.prob > 0.08
									? `${p.variant} ${(p.prob * 100).toFixed(0)}%`
									: ""}
							</div>
						))}
					</div>
				</div>
			)}

			<div>
				<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">
					discriminative mutations detected
				</div>
				{result.detected_markers.length > 0 ? (
					<div className="flex gap-2 flex-wrap">
						{result.detected_markers.map((m) => (
							<Badge
								key={m}
								variant="outline"
								className="font-mono text-xs"
							>
								{m}
							</Badge>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No characteristic variant markers found — sequence
						appears close to wild-type.
					</p>
				)}
			</div>
		</div>
	);
}

function AlignmentTab({ result }: { result: ClassificationResult }) {
	const g = result.alignment_global;
	const l = result.alignment_local;

	return (
		<div>
			<AlignmentView
				title="Global Alignment (Needleman-Wunsch)"
				reference={g.reference}
				query={g.query}
				score={g.score}
			/>
			<AlignmentView
				title="Local Alignment (Smith-Waterman)"
				reference={l.reference}
				query={l.query}
				score={l.score}
			/>
		</div>
	);
}

function FeaturesPanel({ result }: { result: ClassificationResult }) {
	const f = result.features;
	const rows = [
		{
			name: "Aligned length",
			value: `${f.length} aa`,
			explain:
				"Number of reference residues covered by the alignment.",
		},
		{
			name: "Sequence identity",
			value: `${f.identity_pct.toFixed(2)}%`,
			explain:
				"Percent of aligned positions that match — primary signal of homology.",
		},
		{
			name: "Mismatches",
			value: `${f.mismatches}`,
			explain:
				"Substitution events (non-gap positions where ref != query).",
		},
		{
			name: "Gap positions",
			value: `${f.gap_count}`,
			explain: "Indel positions inserted by the alignment algorithm.",
		},
		{
			name: "Gap openings",
			value: `${f.gap_openings}`,
			explain:
				"Distinct indel events. Affine gap penalty separates open and extend.",
		},
		{
			name: "BLOSUM62 score",
			value: f.score_blosum.toFixed(1),
			explain:
				"Sum-of-pairs alignment score under BLOSUM62 with affine gaps.",
		},
	];

	return (
		<div>
			<p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
				Features extracted from the alignment and fed into the
				classifier. These quantitative descriptors capture both global
				similarity and the presence of variant-specific markers.
			</p>
			<div className="border border-border rounded-md overflow-hidden">
				<table className="w-full text-sm">
					<tbody>
						{rows.map((r) => (
							<tr
								key={r.name}
								className="border-b border-border last:border-0"
							>
								<td className="px-4 py-3 text-muted-foreground w-1/4 align-top">
									{r.name}
								</td>
								<td className="px-4 py-3 font-mono align-top">
									{r.value}
								</td>
								<td className="px-4 py-3 text-xs text-muted-foreground align-top">
									{r.explain}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{result.detected_markers.length > 0 && (
				<div className="mt-5">
					<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">
						variant markers found
					</div>
					<div className="flex gap-2 flex-wrap">
						{result.detected_markers.map((m) => (
							<Badge
								key={m}
								variant="outline"
								className="font-mono text-xs"
							>
								{m}
							</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

const DATASET_DIST = [
	{ variant: "Alpha", count: 200 },
	{ variant: "Delta", count: 200 },
	{ variant: "Omicron", count: 200 },
];

const DATASET_STATS = [
	{ variant: "Alpha", mean: "1270.0", std: "0.98", min: "1258", max: "1273" },
	{ variant: "Delta", mean: "1264.3", std: "40.4", min: "946", max: "1273" },
	{ variant: "Omicron", mean: "1269.4", std: "2.89", min: "1238", max: "1273" },
];

function ModelPanel() {
	return (
		<div className="space-y-8">
			<p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
				Random Forest and SVM (RBF) classifiers trained on 595
				filtered spike sequences from NCBI Virus (Alpha / Delta /
				Omicron, ~200 each). Evaluated on a held-out test set with
				5-fold cross-validation.
			</p>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl">
				<Stat label="RF accuracy" value="98.3%" />
				<Stat label="SVM accuracy" value="98.3%" />
				<Stat label="RF CV mean" value="94.6%" />
				<Stat label="RF CV std" value="±2.5%" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-3">
						confusion matrix — random forest
					</div>
					<ConfusionMatrix />
				</div>
				<div>
					<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-3">
						feature importance (RF)
					</div>
					<FeatureImportanceChart />
				</div>
			</div>

			<div>
				<div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-3">
					dataset distribution (pre-cleaning)
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
					<div className="h-[180px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={DATASET_DIST}
								margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
							>
								<XAxis
									dataKey="variant"
									tick={{
										fontFamily: "JetBrains Mono",
										fontSize: 10,
										fill: "var(--color-muted-foreground)",
									}}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{
										fontFamily: "JetBrains Mono",
										fontSize: 10,
										fill: "var(--color-muted-foreground)",
									}}
									axisLine={false}
									tickLine={false}
									domain={[0, 220]}
								/>
								<RTooltip
									formatter={(v: number) => [v, "sequences"]}
									contentStyle={{
										background: "var(--color-card)",
										border: "1px solid var(--color-border)",
										fontSize: 11,
										fontFamily: "JetBrains Mono",
									}}
									cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
								/>
								<Bar
									dataKey="count"
									fill="var(--color-primary)"
									radius={[2, 2, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="border border-border rounded-md overflow-hidden">
						<table className="w-full text-xs">
							<thead>
								<tr className="bg-muted/40 border-b border-border">
									<th className="px-3 py-2 text-left font-medium text-muted-foreground">Variant</th>
									<th className="px-3 py-2 text-right font-medium text-muted-foreground font-mono">Mean len</th>
									<th className="px-3 py-2 text-right font-medium text-muted-foreground font-mono">Std</th>
									<th className="px-3 py-2 text-right font-medium text-muted-foreground font-mono">Min</th>
									<th className="px-3 py-2 text-right font-medium text-muted-foreground font-mono">Max</th>
								</tr>
							</thead>
							<tbody>
								{DATASET_STATS.map((r) => (
									<tr key={r.variant} className="border-b border-border last:border-0">
										<td className="px-3 py-2 font-mono">{r.variant}</td>
										<td className="px-3 py-2 text-right font-mono">{r.mean}</td>
										<td className="px-3 py-2 text-right font-mono">{r.std}</td>
										<td className="px-3 py-2 text-right font-mono">{r.min}</td>
										<td className="px-3 py-2 text-right font-mono">{r.max}</td>
									</tr>
								))}
							</tbody>
						</table>
						<p className="text-[10px] text-muted-foreground font-mono px-3 py-2 border-t border-border">
							595 rows remaining after length filter (1200–1300 aa)
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
