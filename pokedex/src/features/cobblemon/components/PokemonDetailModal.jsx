import { useState, useEffect, useCallback } from "react";
import { BiX, BiDiamond, BiCaretUp, BiCaretDown } from "react-icons/bi";
import {
    getSpeciesName,
    getApiTypes,
    capitalize,
    getSpriteUrl,
    TYPE_ES,
    TYPE_EFFECTS,
    NATURE_ES,
    STAT_NAMES,
    STAT_COLORS,
    translateCache,
    calcStat,
    calcHP,
} from "../utils/cobblemon";
import styles from "./PokemonDetailModal.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

// Máximos teóricos para las barras de stats (Gen IX)
const STAT_MAX = { hp: 255, attack: 194, defense: 255, "special-attack": 194, "special-defense": 255, speed: 210 };

// Mapa de spelling británico que usa Cobblemon -> PokeAPI
const BRIT_TO_POKE = { defence: "defense", special_attack: "special-attack", special_defence: "special-defense" };

function getStatFromCobblemon(obj, pokeApiStat) {
    if (!obj) return null;
    // Probar key PokeAPI directamente
    if (obj[pokeApiStat] !== undefined) return obj[pokeApiStat];
    // Probar con prefijo cobblemon:
    if (obj[`cobblemon:${pokeApiStat}`] !== undefined) return obj[`cobblemon:${pokeApiStat}`];
    // Probar spelling británico
    const britKey = Object.keys(BRIT_TO_POKE).find(k => BRIT_TO_POKE[k] === pokeApiStat);
    if (britKey) {
        if (obj[britKey] !== undefined) return obj[britKey];
        if (obj[`cobblemon:${britKey}`] !== undefined) return obj[`cobblemon:${britKey}`];
    }
    return null;
}

function getNatureMultiplier(natureName, statKey) {
    const natures = {
        "hardy": {}, "lonely": { up: "attack", down: "defense" }, "brave": { up: "attack", down: "speed" },
        "adamant": { up: "attack", down: "special-attack" }, "naughty": { up: "attack", down: "special-defense" },
        "bold": { up: "defense", down: "attack" }, "docile": {}, "relaxed": { up: "defense", down: "speed" },
        "impish": { up: "defense", down: "special-attack" }, "lax": { up: "defense", down: "special-defense" },
        "timid": { up: "speed", down: "attack" }, "hasty": { up: "speed", down: "defense" },
        "serious": {}, "jolly": { up: "speed", down: "special-attack" }, "naive": { up: "speed", down: "special-defense" },
        "modest": { up: "special-attack", down: "attack" }, "mild": { up: "special-attack", down: "defense" },
        "quiet": { up: "special-attack", down: "speed" }, "bashful": {}, "rash": { up: "special-attack", down: "special-defense" },
        "calm": { up: "special-defense", down: "attack" }, "gentle": { up: "special-defense", down: "defense" },
        "sassy": { up: "special-defense", down: "speed" }, "careful": { up: "special-defense", down: "special-attack" },
        "quirky": {},
    };
    const n = natures[natureName];
    if (!n) return 1;
    if (n.up === statKey) return 1.1;
    if (n.down === statKey) return 0.9;
    return 1;
}

function getImmunities(types) {
    const immuneSet = new Set();
    for (const t of types) {
        const e = TYPE_EFFECTS[t];
        if (!e) continue;
        for (const i of e.immune) immuneSet.add(i);
    }
    return [...immuneSet];
}

function getEffectivenessDetail(types) {
    const immunities = getImmunities(types);
    const defs = { weak: {}, resist: {} };
    for (const t of types) {
        const e = TYPE_EFFECTS[t];
        if (!e) continue;
        for (const w of e.weak) defs.weak[w] = (defs.weak[w] || 0) + 1;
        for (const r of e.resist) defs.resist[r] = (defs.resist[r] || 0) + 1;
    }
    const weaknesses = [];
    const resistances = [];
    const allTypes = Object.keys(TYPE_EFFECTS);
    for (const t of allTypes) {
        if (immunities.includes(t)) continue;
        let mult = 1;
        mult *= (defs.weak[t] || 0) * 2;
        mult /= Math.pow(2, defs.resist[t] || 0);
        if (mult > 1) weaknesses.push({ type: t, mult });
        else if (mult < 1) resistances.push({ type: t, mult });
    }
    return { weaknesses, resistances, immunities };
}

export default function PokemonDetailModal({ pokemon, onClose }) {
    const [baseStats, setBaseStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const name = capitalize(getSpeciesName(pokemon) || "???");
    const types = getApiTypes(pokemon);
    const sprite = getSpriteUrl(name, false, null);
    const shiny = pokemon.Shiny || false;
    const level = pokemon.Level || 50;

    // Naturaleza
    const natureRaw = pokemon.MintedNature || "";
    const natureEn = natureRaw.includes(":") ? natureRaw.split(":")[1] : "serious";
    const natureEs = NATURE_ES[natureEn] || capitalize(natureEn);

    // Habilidad (en inglés)
    const abilityEn = pokemon.Ability?.AbilityName || "—";

    // Objeto
    const itemId = pokemon.HeldItem?.id || "";
    const hasItem = itemId !== "";
    const itemEn = hasItem ? (itemId.includes(":") ? itemId.split(":")[1] : itemId) : "";
    const itemKey = `item:${itemEn.toLowerCase()}`;
    const itemEs = hasItem ? (translateCache[itemKey] || itemEn.replace(/_/g, " ")) : "";
    const itemSprite = hasItem
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemEn.replace(/_/g, "-")}.png`
        : null;

    // Movimientos (traducidos si disponible)
    const moves = pokemon.MoveSet
        ? Object.values(pokemon.MoveSet)
              .filter((m) => m.MoveName)
              .map((m) => {
                  const key = `move:${m.MoveName.toLowerCase()}`;
                  return translateCache[key] || m.MoveName;
              })
        : [];

    // IVs y EVs
    const ivsRaw = pokemon.IVs?.Base || {};
    const evsRaw = pokemon.EVs || {};
    const ivs = {};
    const evs = {};
    for (const key of STAT_KEYS) {
        const iv = getStatFromCobblemon(ivsRaw, key);
        ivs[key] = iv !== null ? iv : 31;
        const ev = getStatFromCobblemon(evsRaw, key);
        evs[key] = ev !== null ? ev : 0;
    }

    // Efectividad
    const { weaknesses, resistances, immunities } = getEffectivenessDetail(types);

    // Fetch base stats
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const speciesKey = name.toLowerCase().replace(/[_ ]/g, "-").replace(/[^a-z0-9-]/g, "");
        fetch(`https://pokeapi.co/api/v2/pokemon/${speciesKey}`)
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((data) => {
                if (!cancelled) {
                    const stats = {};
                    data.stats.forEach((s) => { stats[s.stat.name] = s.base_stat; });
                    setBaseStats(stats);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) { setBaseStats(null); setLoading(false); }
            });
        return () => { cancelled = true; };
    }, [name]);

    // Stats calculados
    const realStats = {};
    if (baseStats) {
        for (const key of STAT_KEYS) {
            const base = baseStats[key] || 0;
            const iv = ivs[key];
            const ev = evs[key];
            const natMult = getNatureMultiplier(natureEn, key);
            if (key === "hp") {
                realStats[key] = calcHP(base, iv, ev, level);
            } else {
                realStats[key] = calcStat(base, iv, ev, level, natMult);
            }
        }
    }

    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const effLabel = (mult) => {
        if (mult >= 4) return "4×";
        if (mult > 2) return "2×";
        if (mult === 2) return "2×";
        if (mult === 0.5) return "½×";
        if (mult === 0.25) return "¼×";
        if (mult < 0.25) return "¼×";
        return `${mult}×`;
    };

    const renderStatBar = (key, value) => {
        const maxVal = STAT_MAX[key] || 200;
        const pct = Math.min(100, (value / maxVal) * 100);
        const color = STAT_COLORS[key] || "#888";
        let natIndicator = null;
        const natMult = getNatureMultiplier(natureEn, key);
        if (natMult > 1) natIndicator = <span className={styles.natUp}><BiCaretUp /></span>;
        else if (natMult < 1) natIndicator = <span className={styles.natDown}><BiCaretDown /></span>;
        return (
            <div key={key} className={styles.statRow}>
                <span className={styles.statName}>{STAT_NAMES[key] || key}</span>
                <div className={styles.statBarBg}>
                    <div
                        className={styles.statBarFill}
                        style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                </div>
                <span className={styles.statValue}>
                    {value}
                    {natIndicator}
                </span>
            </div>
        );
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                    <BiX size={18} />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <img
                        src={sprite}
                        alt={name}
                        className={styles.sprite}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                        }}
                    />
                    <div className={styles.headerInfo}>
                        <h2 className={styles.name}>
                            {name}
                            {shiny && <span className={styles.shinyBadge}><BiDiamond size={14} /></span>}
                        </h2>
                        <span className={styles.levelBadge}>Nv. {level}</span>
                    </div>
                </div>

                {/* Tipos */}
                <div className={styles.badges}>
                    {types.map((t) => (
                        <span key={t} className={styles.typeBadge} style={{ background: TYPE_COLORS[t] || "#888" }}>
                            {TYPE_ES[t] || t}
                        </span>
                    ))}
                </div>

                {/* Información general */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Habilidad</span>
                        <span className={styles.infoValue}>{abilityEn}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Naturaleza</span>
                        <span className={styles.infoValue}>{natureEs}</span>
                    </div>
                    {hasItem && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Objeto</span>
                            <span className={styles.infoValue}>
                                {itemSprite && (
                                    <img src={itemSprite} alt="" className={styles.itemIcon} />
                                )}
                                {itemEs}
                            </span>
                        </div>
                    )}
                </div>

                {/* Estadísticas */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Estadísticas</h3>
                    {loading && <p className={styles.loadingText}>Cargando estadísticas base...</p>}
                    {!loading && !baseStats && (
                        <p className={styles.errorText}>No se pudieron cargar las estadísticas base</p>
                    )}
                    {!loading && baseStats && (
                        <div className={styles.statsContainer}>
                            {STAT_KEYS.map((key) => renderStatBar(key, realStats[key] || 0))}
                        </div>
                    )}
                    {!loading && baseStats && (
                        <div className={styles.ivEvSummary}>
                            <span>IV: {STAT_KEYS.map(k => ivs[k]).join("/")}</span>
                            <span>EV: {STAT_KEYS.map(k => evs[k]).join("/")}</span>
                        </div>
                    )}
                </div>

                {/* Movimientos */}
                {moves.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Movimientos</h3>
                        <div className={styles.movesGrid}>
                            {moves.map((m, i) => (
                                <span key={i} className={styles.moveChip}>{m}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Efectividad */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Efectividad</h3>
                    <div className={styles.effGrid}>
                        {weaknesses.length > 0 && (
                            <div className={styles.effCol}>
                                <h4 className={styles.effSubtitle + " " + styles.weakTitle}>Débil a</h4>
                                <div className={styles.effChips}>
                                    {weaknesses.sort((a, b) => b.mult - a.mult).map((w) => (
                                        <span key={w.type} className={styles.effChipWeak}
                                            style={{ background: TYPE_COLORS[w.type] || "#888" }}>
                                            {TYPE_ES[w.type] || w.type}
                                            <span className={styles.effMult}>{effLabel(w.mult)}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {resistances.length > 0 && (
                            <div className={styles.effCol}>
                                <h4 className={styles.effSubtitle + " " + styles.resistTitle}>Fuerte a</h4>
                                <div className={styles.effChips}>
                                    {resistances.sort((a, b) => a.mult - b.mult).map((r) => (
                                        <span key={r.type} className={styles.effChipResist}
                                            style={{ background: TYPE_COLORS[r.type] || "#888" }}>
                                            {TYPE_ES[r.type] || r.type}
                                            <span className={styles.effMult}>{effLabel(r.mult)}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {immunities.length > 0 && (
                            <div className={styles.effCol}>
                                <h4 className={styles.effSubtitle + " " + styles.immuneTitle}>Inmune a</h4>
                                <div className={styles.effChips}>
                                    {immunities.map((t) => (
                                        <span key={t} className={styles.effChipImmune}
                                            style={{ background: TYPE_COLORS[t] || "#888" }}>
                                            {TYPE_ES[t] || t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
