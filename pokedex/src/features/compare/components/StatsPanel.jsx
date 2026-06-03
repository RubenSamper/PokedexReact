import { useState } from "react";
import { STAT_NAMES, NATURES, calcStat } from "../utils/statsCalc";
import styles from "./StatsPanel.module.css";

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

export default function StatsPanel({
    baseStats,
    ivs,
    evs,
    nature,
    level,
    onChangeIvs,
    onChangeEvs,
    onChangeNature,
    onChangeLevel,
    color,
}) {
    const [expanded, setExpanded] = useState(false);
    const baseMap = {};
    if (baseStats) {
        for (const s of baseStats) baseMap[s.name] = s.base;
    }

    const totalEv = Object.values(evs).reduce((a, b) => a + b, 0);

    return (
        <div className={styles.panel} style={{ borderColor: color }}>
            <button
                className={styles.toggle}
                onClick={() => setExpanded((o) => !o)}
                type="button"
            >
                <span>Estadísticas {expanded ? "▲" : "▼"}</span>
                <span className={styles.toggleHint}>
                    Nv.{level} ·{" "}
                    {NATURES.find((n) => n.name === nature)?.label || "Seria"}
                </span>
            </button>

            {expanded && (
                <div className={styles.body}>
                    {/* Nivel + Naturaleza */}
                    <div className={styles.topRow}>
                        <div className={styles.field}>
                            <label className={styles.label}>Nivel</label>
                            <input
                                type="number"
                                className={styles.numInput}
                                value={level}
                                min={1}
                                max={100}
                                onChange={(e) =>
                                    onChangeLevel(
                                        Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                                    )
                                }
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Naturaleza</label>
                            <select
                                className={styles.select}
                                value={nature}
                                onChange={(e) => onChangeNature(e.target.value)}
                            >
                                {NATURES.map((n) => (
                                    <option key={n.name} value={n.name}>
                                        {n.label}
                                        {n.up ? ` (+${STAT_NAMES[n.up]})` : ""}
                                        {n.down ? ` (-${STAT_NAMES[n.down]})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        {STAT_KEYS.map((key) => {
                            const base = baseMap[key] || 0;
                            const iv = ivs[key] ?? 31;
                            const ev = evs[key] ?? 0;
                            const real = calcStat(base, iv, ev, level, nature, key);
                            return (
                                <div key={key} className={styles.statRow}>
                                    <span className={styles.statName}>
                                        {STAT_NAMES[key]}
                                    </span>
                                    <span className={styles.statBase}>{base}</span>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.subLabel}>EV</label>
                                        <input
                                            type="number"
                                            className={styles.evInput}
                                            value={ev}
                                            min={0}
                                            max={252}
                                            onChange={(e) =>
                                                onChangeEvs({
                                                    ...evs,
                                                    [key]: Math.max(
                                                        0,
                                                        Math.min(252, parseInt(e.target.value) || 0)
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.subLabel}>IV</label>
                                        <input
                                            type="number"
                                            className={styles.ivInput}
                                            value={iv}
                                            min={0}
                                            max={31}
                                            onChange={(e) =>
                                                onChangeIvs({
                                                    ...ivs,
                                                    [key]: Math.max(
                                                        0,
                                                        Math.min(31, parseInt(e.target.value) || 0)
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <span className={styles.statReal}>{real}</span>
                                </div>
                            );
                        })}
                    </div>

                    <p className={styles.evTotal}>
                        EV total: {totalEv}/510
                        {totalEv > 510 && (
                            <span className={styles.warning}> ¡Excede el límite!</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
