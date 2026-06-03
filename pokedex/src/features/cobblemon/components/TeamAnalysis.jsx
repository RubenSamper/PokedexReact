import { analyzeTeam, TYPE_ES } from "../utils/cobblemon";
import { BiError, BiXCircle, BiCheckCircle, BiShield, BiTargetLock, BiSearchAlt } from "react-icons/bi";
import styles from "./TeamAnalysis.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

function typeEs(type) {
    return TYPE_ES[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

export default function TeamAnalysis({ party }) {
    const analysis = analyzeTeam(party);

    if (analysis.partySize === 0) {
        return <p className={styles.empty}>El equipo está vacío</p>;
    }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Análisis del equipo</h3>
            <p className={styles.subtitle}>
                {analysis.partySize} Pokémon en el equipo activo
            </p>

            {/* Debilidades críticas */}
            {analysis.criticalWeak.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiError size={16} /> Debilidades críticas</h4>
                    <div className={styles.chips}>
                        {analysis.criticalWeak.map((w) => (
                            <span
                                key={w.type}
                                className={styles.chipDanger}
                                style={{
                                    background: TYPE_COLORS[w.type] || "#888",
                                }}
                            >
                                {typeEs(w.type)} ({w.count}×)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Debilidades */}
            {analysis.weaknesses.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiXCircle size={16} /> Debilidades</h4>
                    <div className={styles.chips}>
                        {analysis.weaknesses.map((w) => (
                            <span
                                key={w.type}
                                className={styles.chipWeak}
                                style={{
                                    background: TYPE_COLORS[w.type] || "#888",
                                }}
                            >
                                {typeEs(w.type)} ({w.count}×)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Resistencias */}
            {analysis.resistances.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiCheckCircle size={16} /> Resistencias</h4>
                    <div className={styles.chips}>
                        {analysis.resistances.map((r) => (
                            <span
                                key={r.type}
                                className={styles.chipResist}
                                style={{
                                    background: TYPE_COLORS[r.type] || "#888",
                                }}
                            >
                                {typeEs(r.type)} ({r.count}×)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Inmunidades */}
            {analysis.immunities.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiShield size={16} /> Inmunidades</h4>
                    <div className={styles.chips}>
                        {analysis.immunities.map((i) => (
                            <span
                                key={i.type}
                                className={styles.chipImmune}
                                style={{
                                    background: TYPE_COLORS[i.type] || "#888",
                                }}
                            >
                                {typeEs(i.type)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Cobertura de movimientos */}
            {analysis.coverage.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiTargetLock size={16} /> Cobertura de movimientos</h4>
                    <div className={styles.chips}>
                        {analysis.coverage.map((c) => (
                            <span
                                key={c.type}
                                className={styles.chipCover}
                                style={{
                                    background: TYPE_COLORS[c.type] || "#888",
                                }}
                            >
                                {typeEs(c.type)} ({c.count})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Cobertura faltante */}
            {analysis.missingCoverage.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}><BiSearchAlt size={16} /> Sin cobertura</h4>
                    <div className={styles.chips}>
                        {analysis.missingCoverage.map((t) => (
                            <span
                                key={t}
                                className={styles.chipMissing}
                                style={{
                                    background: TYPE_COLORS[t] || "#888",
                                }}
                            >
                                {typeEs(t)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
