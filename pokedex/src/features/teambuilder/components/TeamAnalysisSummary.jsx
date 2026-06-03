import { useMemo } from "react";
import styles from "./TeamAnalysisSummary.module.css";

const TYPE_ES = {
    normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
    electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada",
};

const TYPE_EFFECTS = {
    normal:   { weak:["fighting"],resist:[],immune:["ghost"] },
    fire:     { weak:["water","ground","rock"],resist:["fire","grass","ice","bug","steel","fairy"],immune:[] },
    water:    { weak:["electric","grass"],resist:["fire","water","ice","steel"],immune:[] },
    electric: { weak:["ground"],resist:["electric","flying","steel"],immune:[] },
    grass:    { weak:["fire","ice","poison","flying","bug"],resist:["water","electric","grass","ground"],immune:[] },
    ice:      { weak:["fire","fighting","rock","steel"],resist:["ice"],immune:[] },
    fighting: { weak:["flying","psychic","fairy"],resist:["bug","rock","dark"],immune:[] },
    poison:   { weak:["ground","psychic"],resist:["grass","fighting","poison","bug","fairy"],immune:[] },
    ground:   { weak:["water","grass","ice"],resist:["poison","rock"],immune:["electric"] },
    flying:   { weak:["electric","ice","rock"],resist:["grass","fighting","bug"],immune:["ground"] },
    psychic:  { weak:["bug","ghost","dark"],resist:["fighting","psychic"],immune:[] },
    bug:      { weak:["fire","flying","rock"],resist:["grass","fighting","ground"],immune:[] },
    rock:     { weak:["water","grass","fighting","ground","steel"],resist:["normal","fire","poison","flying"],immune:[] },
    ghost:    { weak:["ghost","dark"],resist:["poison","bug"],immune:["normal","fighting"] },
    dragon:   { weak:["ice","dragon","fairy"],resist:["fire","water","electric","grass"],immune:[] },
    dark:     { weak:["fighting","bug","fairy"],resist:["ghost","dark"],immune:["psychic"] },
    steel:    { weak:["fire","fighting","ground"],resist:["normal","grass","ice","flying","psychic","bug","rock","dragon","steel","fairy"],immune:["poison"] },
    fairy:    { weak:["poison","steel"],resist:["fighting","bug","dark"],immune:["dragon"] }
};

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

const ALL_TYPES = Object.keys(TYPE_EFFECTS);

export default function TeamAnalysisSummary({ team }) {
    const analysis = useMemo(() => {
        const filled = team.slots.filter((s) => s.species !== null);

        // Colectar todos los tipos del equipo
        const teamTypes = [];
        for (const slot of filled) {
            for (const t of slot.species.types) {
                teamTypes.push(t);
            }
        }

        // Debilidades/resistencias del equipo
        const defs = { weak: {}, resist: {}, immune: [] };
        for (const t of teamTypes) {
            const e = TYPE_EFFECTS[t];
            if (!e) continue;
            for (const w of e.weak) defs.weak[w] = (defs.weak[w] || 0) + 1;
            for (const r of e.resist) defs.resist[r] = (defs.resist[r] || 0) + 1;
            for (const i of e.immune) if (!defs.immune.includes(i)) defs.immune.push(i);
        }

        const weaknesses = [];
        const resistances = [];
        for (const t of ALL_TYPES) {
            if (defs.immune.includes(t)) continue;
            let mult = 1;
            mult *= (defs.weak[t] || 0) * 2;
            mult /= Math.pow(2, defs.resist[t] || 0);
            if (mult > 1) weaknesses.push({ type: t, mult, label: mult >= 4 ? "4×" : "2×" });
            else if (mult < 1) resistances.push({ type: t, mult, label: mult <= 0.25 ? "¼×" : "½×" });
        }
        weaknesses.sort((a, b) => b.mult - a.mult);
        resistances.sort((a, b) => a.mult - b.mult);

        // Cobertura de movimientos
        const coverage = {};
        for (const slot of filled) {
            for (const move of slot.moves) {
                if (!move.name) continue;
                // Will be fetched later; for now just track by move name
            }
        }

        // Tipos ofensivos cubiertos (basado en tipos de Pokémon)
        const typeCoverage = {};
        for (const slot of filled) {
            for (const t of slot.species.types) {
                typeCoverage[t] = (typeCoverage[t] || 0) + 1;
            }
        }

        const coveredTypes = Object.keys(typeCoverage);
        const missingCoverage = ALL_TYPES.filter((t) => !coveredTypes.includes(t));

        return {
            weaknesses,
            resistances,
            immunities: defs.immune,
            coveredTypes,
            missingCoverage,
            slotCount: filled.length,
            teamTypes,
        };
    }, [team]);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Análisis del equipo</h3>

            <div className={styles.grid}>
                {/* Debilidades */}
                <div className={styles.card}>
                    <h4 className={styles.cardTitle}>Debilidades</h4>
                    {analysis.weaknesses.length === 0 ? (
                        <p className={styles.neutral}>Ninguna</p>
                    ) : (
                        <div className={styles.typeList}>
                            {analysis.weaknesses.map((w) => (
                                <span
                                    key={w.type}
                                    className={styles.typeBadge}
                                    style={{ background: TYPE_COLORS[w.type] || "#999" }}
                                >
                                    {TYPE_ES[w.type]} {w.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resistencias */}
                <div className={styles.card}>
                    <h4 className={styles.cardTitle}>Resistencias</h4>
                    {analysis.resistances.length === 0 ? (
                        <p className={styles.neutral}>Ninguna</p>
                    ) : (
                        <div className={styles.typeList}>
                            {analysis.resistances.map((r) => (
                                <span
                                    key={r.type}
                                    className={styles.typeBadge}
                                    style={{ background: TYPE_COLORS[r.type] || "#999", opacity: 0.8 }}
                                >
                                    {TYPE_ES[r.type]} {r.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inmunidades */}
                {analysis.immunities.length > 0 && (
                    <div className={styles.card}>
                        <h4 className={styles.cardTitle}>Inmunidades</h4>
                        <div className={styles.typeList}>
                            {analysis.immunities.map((t) => (
                                <span
                                    key={t}
                                    className={styles.typeBadge}
                                    style={{
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    }}
                                >
                                    {TYPE_ES[t]}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cobertura ofensiva */}
                <div className={styles.card}>
                    <h4 className={styles.cardTitle}>Tipos del equipo</h4>
                    {analysis.teamTypes.length === 0 ? (
                        <p className={styles.neutral}>Sin tipos</p>
                    ) : (
                        <div className={styles.typeList}>
                            {analysis.teamTypes.map((t) => (
                                <span
                                    key={t}
                                    className={styles.typeBadge}
                                    style={{ background: TYPE_COLORS[t] || "#999" }}
                                >
                                    {TYPE_ES[t]}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cobertura faltante */}
                {analysis.missingCoverage.length > 0 && (
                    <div className={`${styles.card} ${styles.cardWide}`}>
                        <h4 className={styles.cardTitle}>Tipos no cubiertos</h4>
                        <p className={styles.hint}>
                            Tu equipo no tiene ningún Pokémon de estos tipos:
                        </p>
                        <div className={styles.typeList}>
                            {analysis.missingCoverage.map((t) => (
                                <span
                                    key={t}
                                    className={styles.typeBadge}
                                    style={{ background: "#999", opacity: 0.5 }}
                                >
                                    {TYPE_ES[t]}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
