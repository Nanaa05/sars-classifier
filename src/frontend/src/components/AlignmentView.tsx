import React from "react";

interface AlignmentViewProps {
	title: string;
	reference: string;
	query: string;
	score: number;
}

export const AlignmentView: React.FC<AlignmentViewProps> = ({
	title,
	reference,
	query,
	score,
}) => {
	if (!reference || !query) return null;

	const refChars = reference.split("");
	const qChars = query.split("");
	const minLength = Math.min(refChars.length, qChars.length);

	return (
		<div
			style={{
				marginBottom: "24px",
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "16px",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "12px",
				}}
			>
				<h3 style={{ margin: 0 }}>{title}</h3>
				<span
					style={{
						fontWeight: "bold",
						backgroundColor: "#e3f2fd",
						color: "#0d47a1",
						padding: "4px 8px",
						borderRadius: "4px",
					}}
				>
					Score: {score}
				</span>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					fontFamily: "monospace",
					overflowX: "auto",
					whiteSpace: "pre",
					padding: "12px",
					backgroundColor: "#1e1e1e",
					color: "#fff",
					borderRadius: "6px",
					fontSize: "14px",
					lineHeight: "1.8",
				}}
			>
				{/* Baris REFERENCE */}
				<div style={{ display: "flex" }}>
					<span
						style={{ width: "80px", color: "#888", flexShrink: 0 }}
					>
						REF:{" "}
					</span>
					{refChars.map((char, idx) => (
						<span
							key={`ref-${idx}`}
							style={{
								backgroundColor:
									char === "-" ? "#442222" : "transparent",
								padding: "0 1px",
							}}
						>
							{char}
						</span>
					))}
				</div>

				{/* Baris MATCH CONNECTORS (|) */}
				<div style={{ display: "flex", color: "#4caf50" }}>
					<span style={{ width: "80px", flexShrink: 0 }} />
					{Array.from({ length: minLength }).map((_, idx) => (
						<span
							key={`match-${idx}`}
							style={{ padding: "0 1px" }}
						>
							{refChars[idx] === qChars[idx] &&
							refChars[idx] !== "-"
								? "|"
								: " "}
						</span>
					))}
				</div>

				{/* Baris QUERY */}
				<div style={{ display: "flex" }}>
					<span
						style={{ width: "80px", color: "#888", flexShrink: 0 }}
					>
						QUERY:{" "}
					</span>
					{qChars.map((char, idx) => {
						const isGap = char === "-";
						const isMismatch =
							idx < refChars.length &&
							char !== refChars[idx] &&
							!isGap;
						return (
							<span
								key={`query-${idx}`}
								style={{
									backgroundColor: isGap
										? "#442222"
										: isMismatch
											? "#554411"
											: "transparent",
									color: isMismatch ? "#ffca28" : "#fff",
									padding: "0 1px",
								}}
							>
								{char}
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
};
