import { BiCaretUp, BiCaretDown } from "react-icons/bi";
import styles from "./StatsEditor.module.css";

const STAT_NAMES = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At. Esp",
    "special-defense": "Def. Esp",
    speed: "Velocidad",
};

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

const NATURES = [
    { name: "hardy", label: "Fuerte", up: null, down: null },
    { name: "lonely", label: "Huraña", up: "attack", down: "defense" },
    { name: "brave", label: "Valiente", up: "attack", down: "speed" },
    { name: "adamant", label: "Firme", up: "attack", down: "special-attack" },
    { name: "naughty", label: "Pícara", up: "attack", down: "special-defense" },
    { name: "bold", label: "Osada", up: "defense", down: "attack" },
    { name: "docile", label: "Dócil", up: null, down: null },
    { name: "relaxed", label: "Plácida", up: "defense", down: "speed" },
    { name: "impish", label: "Agitada", up: "defense", down: "special-attack" },
    { name: "lax", label: "Floja", up: "defense", down: "special-defense" },
    { name: "timid", label: "Miedosa", up: "speed", down: "attack" },
    { name: "hasty", label: "Activa", up: "speed", down: "defense" },
    { name: "serious", label: "Seria", up: null, down: null },
    { name: "jolly", label: "Alegre", up: "speed", down: "special-attack" },
    { name: "naive", label: "Ingenua", up: "speed", down: "special-defense" },
    { name: "modest", label: "Modesta", up: "special-attack", down: "attack" },
    { name: "mild", label: "Afable", up: "special-attack", down: "defense" },
    { name: "quiet", label: "Callada", up: "special-attack", down: "speed" },
    { name: "bashful", label: "Tímida", up: null, down: null },
    { name: "rash", label: "Alocada", up: "special-attack", down: "special-defense" },
    { name: "calm", label: "Serena", up: "special-defense", down: "attack" },
    { name: "gentle", label: "Amable", up: "special-defense", down: "defense" },
    { name: "sassy", label: "Grosera", up: "special-defense", down: "speed" },
    { name: "careful", label: "Cauta", up: "special-defense", down: "special-attack" },
    { name: "quirky", label: "Rara", up: null, down: null },
];

function calcStat(base, iv, ev, level, natureMult = 1) {
    return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureMult);
}

function calcHP(base, iv, ev, level) {
    return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

function getNatureMultiplier(natureName, statKey) {
    const n = NATURES.find((n) => n.name === natureName);
    if (!n) return 1;
    if (n.up === statKey) return 1.1;
    if (n.down === statKey) return 0.9;
    return 1;
}

export default function StatsEditor({
    baseStats,
    ivs,
    evs,
    nature,
    level,
    onChangeIvs,
    onChangeEvs,
    onChangeNature,
    onChangeLevel,
}) {
    const handleEv = (stat, val) => {
        const num = Math.max(0, Math.min(252, parseInt(val) || 0));
        onChangeEvs({ ...evs, [stat]: num });
    };

    const handleIv = (stat, val) => {
        const num = Math.max(0, Math.min(31, parseInt(val) || 0));
        onChangeIvs({ ...ivs, [stat]: num });
    };

    const totalEv = Object.values(evs).reduce((a, b) => a + b, 0);

    const baseMap = {};
    if (baseStats) {
        for (const s of baseStats) {
            baseMap[s.name] = s.base;
        }
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>Estadísticas</h4>

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
                        onChange={(e) => onChangeLevel(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
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
                    const natMult = getNatureMultiplier(nature, key);
                    const final =
                        key === "hp"
                            ? calcHP(base, iv, ev, level)
                            : calcStat(base, iv, ev, level, natMult);

                    return (
                        <div key={key} className={styles.statRow}>
                            <span className={styles.statName}>
                                {STAT_NAMES[key]}
                            </span>
                            <span className={styles.statBase}>{base}</span>
                            <div className={styles.evGroup}>
                                <label className={styles.subLabel}>EV</label>
                                <input
                                    type="number"
                                    className={styles.evInput}
                                    value={ev}
                                    min={0}
                                    max={252}
                                    onChange={(e) => handleEv(key, e.target.value)}
                                />
                            </div>
                            <div className={styles.ivGroup}>
                                <label className={styles.subLabel}>IV</label>
                                <input
                                    type="number"
                                    className={styles.ivInput}
                                    value={iv}
                                    min={0}
                                    max={31}
                                    onChange={(e) => handleIv(key, e.target.value)}
                                />
                            </div>
                            <span className={styles.statFinal}>{final}</span>
                            {natMult !== 1 && (
                                <span className={natMult > 1 ? styles.natUp : styles.natDown}>
                                    {natMult > 1 ? <BiCaretUp /> : <BiCaretDown />}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className={styles.evTotal}>
                Total EV: {totalEv} / 510
                {totalEv > 510 && (
                    <span className={styles.evWarning}> (¡excede el límite!)</span>
                )}
            </p>
        </div>
    );
}
