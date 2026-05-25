import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
  probabilities: Record<string, number> | null;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ probabilities }) => {
  if (!probabilities) {
    return (
      <div style={{ padding: "16px", backgroundColor: "#fffde7", color: "#f57f17", borderRadius: "6px", border: "1px solid #fff59d" }}>
        * Probabilitas distribusi kelas tidak tersedia untuk model SVM (RBF).
      </div>
    );
  }

  const data = Object.keys(probabilities).map((variant) => ({
    name: variant,
    Confidence: parseFloat((probabilities[variant] * 100).toFixed(2)),
  }));

  return (
    <div style={{ width: "100%", height: 300, marginTop: "16px" }}>
      <h4 style={{ marginBottom: "16px" }}>Model Confidence Distribution (%)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip formatter={(value) => [`${Number(value) || 0}%`, "Confidence"]} />
          <Bar dataKey="Confidence" fill="#1f77b4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardCharts;
