import { useMemo } from "react";
import styles from "./BattlePredictor.module.css";

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
    fairy:    { weak:["poison","steel"],resist:["fighting","bug","dark"],immune:["dragon"] },
};

const TYPE_ES = {
    normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
    electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada",
};

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

function getEffectiveness(attackerType, defenderTypes) {
    let mult = 1;
    for (const dt of defenderTypes) {
        const eff = TYPE_EFFECTS[dt];
        if (!eff) continue;
        if (eff.immune.includes(attackerType)) return 0;
        if (eff.weak.includes(attackerType)) mult *= 2;
        if (eff.resist.includes(attackerType)) mult *= 0.5;
    }
    return mult;
}

function getStatValue(pokemon, statName) {
    const s = pokemon.stats.find((s) => s.name === statName);
    return s ? s.base : 0;
}

function getRealStatValue(realStats, statName) {
    return realStats?.[statName] ?? 0;
}

export default function BattlePredictor({ pokemon1, pokemon2, realStats1, realStats2 }) {
    const result = useMemo(() => {
        if (!pokemon1 || !pokemon2) return null;

        const p1Types = pokemon1.types;
        const p2Types = pokemon2.types;

        // Efectividad de tipos: P1 ataca a P2 y viceversa
        let p1vsP2 = 1; // multiplicador P1 → P2
        let p2vsP1 = 1; // multiplicador P2 → P1

        for (const t of p1Types) {
            const eff = getEffectiveness(t, p2Types);
            p1vsP2 *= eff;
        }
        for (const t of p2Types) {
            const eff = getEffectiveness(t, p1Types);
            p2vsP1 *= eff;
        }

        // Stats totales (usa stats reales si están disponibles)
        const p1Total = realStats1?._total ?? pokemon1.stats.reduce((a, s) => a + s.base, 0);
        const p2Total = realStats2?._total ?? pokemon2.stats.reduce((a, s) => a + s.base, 0);

        // Velocidad (quién ataca primero)
        const p1Speed = realStats1?.speed ?? getStatValue(pokemon1, "speed");
        const p2Speed = realStats2?.speed ?? getStatValue(pokemon2, "speed");

        // Score combinado (peso: 40% stats, 30% tipo ofensivo, 30% tipo defensivo)
        const maxStat = Math.max(p1Total, p2Total);
        const statScore1 = p1Total / maxStat;
        const statScore2 = p2Total / maxStat;

        const typeOff1 = p1vsP2 / Math.max(p1vsP2, p2vsP1);
        const typeOff2 = p2vsP1 / Math.max(p1vsP2, p2vsP1);

        // Defensivo: qué tan bien resiste
        const p1DefScore = 1 / (p2vsP1 || 1);
        const p2DefScore = 1 / (p1vsP2 || 1);
        const maxDef = Math.max(p1DefScore, p2DefScore);
        const typeDef1 = p1DefScore / maxDef;
        const typeDef2 = p2DefScore / maxDef;

        const score1 = statScore1 * 0.4 + typeOff1 * 0.3 + typeDef1 * 0.3;
        const score2 = statScore2 * 0.4 + typeOff2 * 0.3 + typeDef2 * 0.3;

        // Análisis detallado
        const details = [];

        const statSource = realStats1 ? " (calculadas con EV/IV/naturaleza)" : " (base)";

        // Stats totales
        if (p1Total > p2Total) {
            details.push(`${pokemon1.nameEs} tiene más stats totales${statSource} (${p1Total} vs ${p2Total})`);
        } else if (p2Total > p1Total) {
            details.push(`${pokemon2.nameEs} tiene más stats totales${statSource} (${p2Total} vs ${p1Total})`);
        } else {
            details.push(`Mismos stats totales${statSource} (${p1Total})`);
        }

        // Velocidad
        if (p1Speed > p2Speed) {
            details.push(`${pokemon1.nameEs} es más rápido (${p1Speed} vs ${p2Speed}), ataca primero`);
        } else if (p2Speed > p1Speed) {
            details.push(`${pokemon2.nameEs} es más rápido (${p2Speed} vs ${p1Speed}), ataca primero`);
        } else {
            details.push(`Misma velocidad (${p1Speed})`);
        }

        // Tipo ofensivo
        const effLabel = (m) => {
            if (m === 0) return "0× (inmune)";
            if (m >= 4) return "4× (súper eficaz)";
            if (m >= 2) return "2× (eficaz)";
            if (m <= 0.25) return "¼× (poco eficaz)";
            if (m <= 0.5) return "½× (poco eficaz)";
            return "1× (neutral)";
        };

        if (p1vsP2 > 1) {
            details.push(`${pokemon1.nameEs} golpea ${effLabel(p1vsP2)} a ${pokemon2.nameEs}`);
        } else if (p1vsP2 < 1) {
            details.push(`${pokemon1.nameEs} golpea ${effLabel(p1vsP2)} a ${pokemon2.nameEs}`);
        } else {
            details.push(`Los tipos de ${pokemon1.nameEs} golpean neutral a ${pokemon2.nameEs}`);
        }

        if (p2vsP1 > 1) {
            details.push(`${pokemon2.nameEs} golpea ${effLabel(p2vsP1)} a ${pokemon1.nameEs}`);
        } else if (p2vsP1 < 1) {
            details.push(`${pokemon2.nameEs} golpea ${effLabel(p2vsP1)} a ${pokemon1.nameEs}`);
        } else {
            details.push(`Los tipos de ${pokemon2.nameEs} golpean neutral a ${pokemon1.nameEs}`);
        }

        const winner = score1 > score2 ? pokemon1 : pokemon2;
        const loser = score1 > score2 ? pokemon2 : pokemon1;
        const margin = Math.abs(score1 - score2);
        const confidence = margin > 0.15 ? "alta" : margin > 0.05 ? "media" : "baja";

        return {
            winner,
            loser,
            winnerScore: Math.round(Math.max(score1, score2) * 100),
            loserScore: Math.round(Math.min(score1, score2) * 100),
            confidence,
            details,
            p1Total,
            p2Total,
            p1Speed,
            p2Speed,
            p1vsP2,
            p2vsP1,
        };
    }, [pokemon1, pokemon2, realStats1, realStats2]);

    if (!result) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Predicción de combate</h3>

            <div className={styles.resultCard}>
                <div className={styles.winnerBanner}>
                    <span className={styles.vs}>VS</span>
                    <div className={styles.winnerInfo}>
                        <img
                            src={result.winner.artwork || result.winner.sprite}
                            alt={result.winner.nameEs}
                            className={styles.winnerSprite}
                        />
                        <span className={styles.winnerName}>{result.winner.nameEs}</span>
                        <span className={styles.winLabel}>Ganador</span>
                    </div>
                </div>

                <div className={styles.scoreBar}>
                    <div className={styles.scoreTrack}>
                        <div
                            className={styles.scoreFill}
                            style={{
                                width: `${result.winnerScore}%`,
                                background:
                                    result.winner.name === pokemon1.name
                                        ? "#4a9eff"
                                        : "#ff6b6b",
                            }}
                        />
                    </div>
                    <div className={styles.scoreLabels}>
                        <span>{pokemon1.nameEs}: {result.winner.name === pokemon1.name ? result.winnerScore : result.loserScore}%</span>
                        <span>{pokemon2.nameEs}: {result.winner.name === pokemon2.name ? result.winnerScore : result.loserScore}%</span>
                    </div>
                </div>

                <p className={styles.confidence}>
                    Confianza: <strong>{result.confidence === "alta" ? "Alta" : result.confidence === "media" ? "Media" : "Baja"}</strong>
                    {result.confidence === "baja" && " (muy parejo)"}
                </p>
            </div>

            <div className={styles.details}>
                <h4 className={styles.detailsTitle}>Detalles</h4>
                <ul className={styles.detailList}>
                    {result.details.map((d, i) => (
                        <li key={i} className={styles.detailItem}>{d}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.typeGrid}>
                <div className={styles.typeCol}>
                    <h5>{pokemon1.nameEs}</h5>
                    <div className={styles.typeBadges}>
                        {pokemon1.types.map((t) => (
                            <span
                                key={t}
                                className={styles.typeBadge}
                                style={{ background: TYPE_COLORS[t] || "#999" }}
                            >
                                {TYPE_ES[t]}
                            </span>
                        ))}
                    </div>
                    <p className={styles.statLine}>
                        Stats: {result.p1Total} · Vel: {result.p1Speed}
                    </p>
                    <p className={styles.effLine}>
                        {result.p1vsP2 === 0
                            ? "No puede dañar"
                            : result.p1vsP2 >= 4
                            ? "Golpea súper eficaz (4×)"
                            : result.p1vsP2 >= 2
                            ? "Golpea eficaz (2×)"
                            : result.p1vsP2 <= 0.25
                            ? "Golpea poco eficaz (¼×)"
                            : result.p1vsP2 <= 0.5
                            ? "Golpea poco eficaz (½×)"
                            : "Golpea neutral (1×)"}
                    </p>
                </div>
                <div className={styles.typeCol}>
                    <h5>{pokemon2.nameEs}</h5>
                    <div className={styles.typeBadges}>
                        {pokemon2.types.map((t) => (
                            <span
                                key={t}
                                className={styles.typeBadge}
                                style={{ background: TYPE_COLORS[t] || "#999" }}
                            >
                                {TYPE_ES[t]}
                            </span>
                        ))}
                    </div>
                    <p className={styles.statLine}>
                        Stats: {result.p2Total} · Vel: {result.p2Speed}
                    </p>
                    <p className={styles.effLine}>
                        {result.p2vsP1 === 0
                            ? "No puede dañar"
                            : result.p2vsP1 >= 4
                            ? "Golpea súper eficaz (4×)"
                            : result.p2vsP1 >= 2
                            ? "Golpea eficaz (2×)"
                            : result.p2vsP1 <= 0.25
                            ? "Golpea poco eficaz (¼×)"
                            : result.p2vsP1 <= 0.5
                            ? "Golpea poco eficaz (½×)"
                            : "Golpea neutral (1×)"}
                    </p>
                </div>
            </div>
        </div>
    );
}
