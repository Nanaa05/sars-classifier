import { useState, useEffect, useRef } from "react";
import SequenceForm from "./components/SequenceForm";
import { ResultsTabs } from "./components/ResultsTabs";
import { VariantCards } from "./components/VariantCards";
import { MethodsSection } from "./components/MethodsSection";

export interface ClassificationResult {
	prediction: string;
	confidence: number;
	probabilities: Record<string, number> | null;
	detected_markers: string[];
	features: {
		length: number;
		score_blosum: number;
		mismatches: number;
		gap_count: number;
		gap_openings: number;
		identity_pct: number;
	};
	alignment_global: {
		score: number;
		reference: string;
		query: string;
		identity_pct: number;
		gap_openings: number;
	};
	alignment_local: {
		score: number;
		reference: string;
		query: string;
		identity_pct: number;
	};
}

function App() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<ClassificationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [elapsed, setElapsed] = useState(0);
	const [totalTime, setTotalTime] = useState<number | null>(null);
	const startRef = useRef<number>(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, []);

	const handleClassify = async (sequence: string, modelType: string) => {
		setLoading(true);
		setError(null);
		setResult(null);
		setTotalTime(null);
		setElapsed(0);
		startRef.current = performance.now();
		timerRef.current = setInterval(() => {
			setElapsed(Math.floor((performance.now() - startRef.current) / 100) / 10);
		}, 100);
		try {
			const baseUrl = import.meta.env.VITE_API_URL || "";
			const response = await fetch(`${baseUrl}/api/classify`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sequence, model_type: modelType }),
			});
			if (!response.ok) {
				const errData = await response.json();
				throw new Error(
					errData.detail || "Failed to fetch classification result",
				);
			}
			setResult(await response.json());
			setTotalTime(Math.round((performance.now() - startRef.current) / 100) / 10);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			if (timerRef.current) clearInterval(timerRef.current);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-baseline justify-between">
					<div className="flex items-baseline gap-3">
						<span className="font-mono text-lg font-semibold tracking-tight">
							VariantScope
						</span>
						<span className="text-xs text-muted-foreground">
							SARS-CoV-2 spike variant classifier
						</span>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						IF3211 · Kelompok 07
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
				<section className="border border-border rounded-md bg-card p-5">
					<SequenceForm
						onSubmit={handleClassify}
						isLoading={loading}
						elapsed={elapsed}
					/>
					{error && (
						<p className="mt-3 text-xs text-destructive font-mono">
							{error}
						</p>
					)}
				</section>

				{result && (
					<>
						{totalTime !== null && (
							<p className="text-xs text-muted-foreground font-mono -mt-4">
								completed in {totalTime}s
							</p>
						)}
						<ResultsTabs result={result} />
					</>
				)}

				<VariantCards />
				<MethodsSection />

				<footer className="text-xs text-muted-foreground font-mono pt-8 pb-4 border-t border-border">
					VariantScope · IF3211 Domain Specific Computation ·
					Kelompok 07 · Reference: SARS-CoV-2 Wuhan-Hu-1 spike (NCBI
					YP_009724390.1)
				</footer>
			</main>
		</div>
	);
}

export default App;
