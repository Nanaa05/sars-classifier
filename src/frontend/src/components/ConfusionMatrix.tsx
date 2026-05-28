const LABELS = ["Alpha", "Delta", "Omicron"] as const;

// Confusion matrix from notebook evaluation (Random Forest, n=120 test sequences).
// Rows = true label, columns = predicted label.
const MATRIX: number[][] = [
	[40, 0, 0], // Alpha
	[0, 38, 1], // Delta
	[1, 0, 39], // Omicron
];

export function ConfusionMatrix() {
	const max = Math.max(...MATRIX.flat());
	return (
		<div className="inline-block">
			<table className="border-collapse text-sm">
				<thead>
					<tr>
						<th className="p-2 text-xs text-muted-foreground font-normal text-right">
							true \ pred
						</th>
						{LABELS.map((l) => (
							<th
								key={l}
								className="p-2 text-xs font-medium text-muted-foreground"
							>
								{l}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{MATRIX.map((row, i) => (
						<tr key={i}>
							<td className="p-2 text-xs text-muted-foreground text-right font-medium">
								{LABELS[i]}
							</td>
							{row.map((v, j) => {
								const intensity = v / max;
								const isDiag = i === j;
								return (
									<td key={j} className="p-0">
										<div
											className="w-16 h-12 flex items-center justify-center font-mono text-sm border border-border"
											style={{
												background: isDiag
													? `color-mix(in oklab, var(--color-primary) ${Math.round(intensity * 60)}%, transparent)`
													: `color-mix(in oklab, var(--color-destructive) ${Math.round(intensity * 50)}%, transparent)`,
											}}
										>
											{v}
										</div>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
