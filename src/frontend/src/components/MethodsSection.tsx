export function MethodsSection() {
	return (
		<>
			<PipelineDiagram />
			<Methods />
			<WhyThisProject />
		</>
	);
}

function PipelineDiagram() {
	const steps = [
		{
			k: "01",
			t: "Parse FASTA",
			d: "Read the sequence, normalize residues",
		},
		{
			k: "02",
			t: "Align to reference",
			d: "Needleman-Wunsch or Smith-Waterman",
		},
		{
			k: "03",
			t: "Extract features",
			d: "Identity, gaps, marker mutations",
		},
		{ k: "04", t: "Classify", d: "Random Forest predicts the variant" },
	];
	return (
		<section className="border border-border rounded-md bg-card">
			<div className="px-6 py-3 border-b border-border flex items-center justify-between">
				<h2 className="text-sm font-medium">Pipeline</h2>
				<span className="text-xs text-muted-foreground font-mono">
					4 stages
				</span>
			</div>
			<ol className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
				{steps.map((s) => (
					<li key={s.k} className="p-6 flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-border font-mono text-[10px] text-primary">
								{s.k}
							</span>
							<span className="text-sm font-medium">{s.t}</span>
						</div>
						<p className="text-xs text-muted-foreground leading-relaxed">
							{s.d}
						</p>
					</li>
				))}
			</ol>
		</section>
	);
}

function Methods() {
	return (
		<section className="space-y-6 pt-8 border-t border-border">
			<h2 className="text-lg font-medium">Methods</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm leading-relaxed text-muted-foreground max-w-4xl">
				<div>
					<h3 className="text-foreground font-medium mb-2">
						Biology
					</h3>
					<p>
						SARS-CoV-2 enters human cells via its spike (S)
						glycoprotein, which binds the ACE2 receptor through its
						receptor-binding domain (RBD, residues 331-540). Point
						mutations in the RBD alter binding affinity and antibody
						escape, defining the major variants of concern: Alpha,
						Delta, and Omicron.
					</p>
				</div>
				<div>
					<h3 className="text-foreground font-medium mb-2">
						Pairwise alignment
					</h3>
					<p>
						Needleman-Wunsch (1970) performs global
						dynamic-programming alignment in O(mn) time.
						Smith-Waterman (1981) is the local variant. Both use
						affine gap penalties (Gotoh, 1982) with three DP
						matrices for match, x-gap, y-gap.
					</p>
				</div>
				<div>
					<h3 className="text-foreground font-medium mb-2">
						Feature extraction
					</h3>
					<p>
						From each alignment we extract sequence identity,
						mismatch and gap counts, alignment score, and indicator
						features for known variant-defining mutations.
					</p>
				</div>
				<div>
					<h3 className="text-foreground font-medium mb-2">
						Classification
					</h3>
					<p>
						A Random Forest maps the feature vector to one of {"{"}
						Alpha, Delta, Omicron, Other{"}"}. Evaluation uses a
						stratified 80/20 train/test split with 5-fold
						cross-validation, reporting per-class precision, recall,
						F1, and a confusion matrix.
					</p>
				</div>
			</div>
		</section>
	);
}

function WhyThisProject() {
	return (
		<section className="space-y-4 pt-8 border-t border-border">
			<h2 className="text-lg font-medium">Why this project</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm leading-relaxed text-muted-foreground max-w-4xl">
				<p>
					Think of a virus genome as a very long word made of only
					four letters. Every time someone gets tested and the lab
					sequences the virus, they get back one of these long words.
					The question is simple: is this Alpha, Delta, Omicron, or
					something else?
				</p>
				<p>
					To answer that, scientists compare the new sequence against
					the original Wuhan reference and look at where the letters
					differ. Those differences are called mutations, and each
					variant has its own signature set of them.
				</p>
				<p>
					The comparison step has a name:{" "}
					<span className="text-foreground font-medium">
						sequence alignment
					</span>
					. It is the act of sliding two sequences next to each other
					so that matching letters stack up in the same column, and
					gaps are inserted where letters were added or removed. For
					sequences of a few hundred letters there are astronomically
					many possible alignments, so we use two classic algorithms,
					Needleman-Wunsch and Smith-Waterman, to find the best one.
				</p>
				<p>
					This project wraps that whole workflow into one tool. You
					paste a spike protein sequence, the backend aligns it,
					measures the differences, and a machine learning model
					predicts which variant it most likely belongs to. It is the
					same kind of pipeline real public health labs use to track
					outbreaks.
				</p>
			</div>
		</section>
	);
}
