import { useState } from "react";
import SequenceForm from "./components/SequenceForm";
import AlignmentView from "./components/AlignmentView";
import DashboardCharts from "./components/DashboardCharts";

interface ClassificationResult {
  prediction: string;
  probabilities: Record<string, number> | null;
  features: {
    length: number;
    score_blosum: number;
    mismatches: number;
    gap_count: number;
  };
  alignment_global: { score: number; reference: string; query: string };
  alignment_local: { score: number; reference: string; query: string };
}

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async (sequence: string, modelType: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

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

      const data: ClassificationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "var(--text-h)" }}>
        SARS-CoV-2 Variant Classifier
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "var(--text)",
          marginBottom: "32px",
        }}
      >
        Powered by Needleman-Wunsch, Smith-Waterman, and Machine Learning
      </p>

      <SequenceForm onSubmit={handleClassify} isLoading={loading} />

      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "24px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ borderTop: "2px solid #eee", paddingTop: "24px" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
              padding: "20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ margin: 0, color: "#2e7d32" }}>
              Predicted Variant: {result.prediction}
            </h2>
          </div>

          <DashboardCharts probabilities={result.probabilities} />

          <div style={{ marginTop: "32px" }}>
            <AlignmentView
              title="Global Alignment (Needleman-Wunsch)"
              reference={result.alignment_global.reference}
              query={result.alignment_global.query}
              score={result.alignment_global.score}
            />

            <AlignmentView
              title="Local Alignment (Smith-Waterman)"
              reference={result.alignment_local.reference}
              query={result.alignment_local.query}
              score={result.alignment_local.score}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
