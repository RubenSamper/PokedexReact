import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const STAT_LABELS = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At.Esp",
    "special-defense": "Def.Esp",
    speed: "Velocidad",
};

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const COLORS = ["#4a9eff", "#ff6b6b"];

/** Lee una variable CSS del root */
function cssVar(name, fallback) {
    if (typeof document === "undefined") return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function StatsComparisonChart({ pokemon1, pokemon2, realStats1, realStats2 }) {
    const labels = STAT_KEYS.map((k) => STAT_LABELS[k]);

    const dataValues1 = useMemo(() => {
        if (realStats1) return STAT_KEYS.map((k) => realStats1[k]);
        return pokemon1.stats.map((s) => s.base);
    }, [pokemon1, realStats1]);

    const dataValues2 = useMemo(() => {
        if (realStats2) return STAT_KEYS.map((k) => realStats2[k]);
        return pokemon2.stats.map((s) => s.base);
    }, [pokemon2, realStats2]);

    const maxVal = Math.max(...dataValues1, ...dataValues2, 255);

    const data = {
        labels,
        datasets: [
            {
                label: pokemon1.nameEs,
                data: dataValues1,
                backgroundColor: "rgba(74, 158, 255, 0.15)",
                borderColor: COLORS[0],
                borderWidth: 2,
                pointBackgroundColor: COLORS[0],
                pointBorderColor: "#fff",
                pointRadius: 4,
            },
            {
                label: pokemon2.nameEs,
                data: dataValues2,
                backgroundColor: "rgba(255, 107, 107, 0.15)",
                borderColor: COLORS[1],
                borderWidth: 2,
                pointBackgroundColor: COLORS[1],
                pointBorderColor: "#fff",
                pointRadius: 4,
            },
        ],
    };

    const isDark = document.documentElement.dataset.theme === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    const labelColor = cssVar("--text-secondary", "#555");

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                max: Math.ceil(maxVal / 50) * 50 + 50,
                ticks: {
                    stepSize: 50,
                    font: { size: 10 },
                    backdropColor: "transparent",
                    color: cssVar("--text-muted", "#888"),
                },
                grid: {
                    color: gridColor,
                },
                angleLines: {
                    color: gridColor,
                },
                pointLabels: {
                    font: { size: 11, weight: "bold" },
                    color: labelColor,
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 16,
                    font: { size: 12, weight: "bold" },
                    usePointStyle: true,
                    color: cssVar("--text", "#111"),
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r}`,
                },
            },
        },
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <Radar data={data} options={options} />
        </div>
    );
}
