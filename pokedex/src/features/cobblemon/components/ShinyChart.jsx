import { useState, useMemo } from "react";
import { BiDiamond } from "react-icons/bi";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { usePlayers } from "../hooks/usePlayers";
import { capitalize, getSpriteUrl, getSpeciesName } from "../utils/cobblemon";
import styles from "./ShinyChart.module.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CHART_COLORS = [
    "#FFD700", "#FFA500", "#FF6347", "#4CAF50", "#2196F3",
    "#9C27B0", "#E91E63", "#00BCD4", "#FF9800", "#795548",
    "#607D8B", "#FDD835", "#26C6DA", "#AB47BC", "#EF5350",
];

/** Lee una variable CSS del root */
function cssVar(name, fallback) {
    if (typeof document === "undefined") return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Extrae todos los Pokémon shiny de un jugador (party + PC) */
function extractShinies(player) {
    const results = [];

    // Party
    const party = player.party || player.Party || [];
    for (const pk of party) {
        if (pk && pk.Shiny) {
            results.push({
                name: capitalize(getSpeciesName(pk) || "???"),
                sprite: getSpriteUrl(
                    capitalize(getSpeciesName(pk) || "???"),
                    true,
                    null
                ),
            });
        }
    }

    // PC (array de arrays)
    const pc = player.pc || player.PC || [];
    if (Array.isArray(pc)) {
        for (const box of pc) {
            if (Array.isArray(box)) {
                for (const pk of box) {
                    if (pk && pk.Shiny) {
                        results.push({
                            name: capitalize(getSpeciesName(pk) || "???"),
                            sprite: getSpriteUrl(
                                capitalize(getSpeciesName(pk) || "???"),
                                true,
                                null
                            ),
                        });
                    }
                }
            }
        }
    }

    return results;
}

export default function ShinyChart({ players }) {
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const chartData = useMemo(() => {
        const labels = [];
        const data = [];
        const shinyDetails = [];

        for (const p of players) {
            const name = p.name || "Desconocido";
            const shinies = extractShinies(p);
            labels.push(name);
            data.push(shinies.length);
            shinyDetails.push(shinies);
        }

        const isDark = document.documentElement.dataset.theme === "dark";

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: labels.map((_, i) => {
                        const color =
                            CHART_COLORS[i % CHART_COLORS.length];
                        if (
                            selectedPlayer !== null &&
                            i !== selectedPlayer
                        ) {
                            // Dim non-selected bars
                            const r = parseInt(
                                color.slice(1, 3),
                                16
                            );
                            const g = parseInt(
                                color.slice(3, 5),
                                16
                            );
                            const b = parseInt(
                                color.slice(5, 7),
                                16
                            );
                            return `rgba(${r}, ${g}, ${b}, 0.3)`;
                        }
                        return color;
                    }),
                    borderColor: isDark ? "#333" : "#fff",
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
            shinyDetails,
        };
    }, [players, selectedPlayer]);

    const textMuted = cssVar("--text-muted", "#888");
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                setSelectedPlayer(
                    selectedPlayer === idx ? null : idx
                );
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const label = ctx.label || "";
                        const count = ctx.parsed.x || 0;
                        return `${label}: ${count} shiny`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    color: textMuted,
                },
                title: {
                    display: true,
                    text: "Cantidad",
                    color: textMuted,
                },
                grid: {
                    color: cssVar("--border", "#e0e0e0"),
                },
            },
            y: {
                ticks: {
                    color: textMuted,
                },
                title: {
                    display: true,
                    text: "Jugador",
                    color: textMuted,
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    const totalShinies = chartData.datasets[0].data.reduce(
        (a, b) => a + b,
        0
    );
    const selectedShinies =
        selectedPlayer !== null
            ? chartData.shinyDetails[selectedPlayer] || []
            : [];

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>
                Pokémon shiny ({totalShinies} en total)
            </h3>

            <div className={styles.chartContainer}>
                {totalShinies > 0 ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <p className={styles.empty}>
                        No hay Pokémon shiny en el servidor
                    </p>
                )}
            </div>

            {selectedPlayer !== null && selectedShinies.length > 0 && (
                <div className={styles.shinyDetail}>
                    <h4 className={styles.shinyPlayer}>
                        <BiDiamond size={16} /> {chartData.labels[selectedPlayer]} —{" "}
                        {selectedShinies.length} shiny
                    </h4>
                    <div className={styles.shinyGrid}>
                        {selectedShinies.map((s, i) => (
                            <div key={i} className={styles.shinyCard}>
                                <img
                                    src={s.sprite}
                                    alt={s.name}
                                    className={styles.shinySprite}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                                    }}
                                />
                                <span className={styles.shinyName}>
                                    {s.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
