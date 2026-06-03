/**
 * Cálculo de stats reales en Pokémon (a partir de Gen III).
 * Fórmulas oficiales:
 *   PS = floor((2 * base + IV + floor(EV/4)) * level / 100) + level + 10
 *   Otra stat = floor((floor((2 * base + IV + floor(EV/4)) * level / 100) + 5) * naturaleza)
 */
const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

export const NATURES = [
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

export const STAT_NAMES = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At.Esp",
    "special-defense": "Def.Esp",
    speed: "Velocidad",
};

function getNatureMultiplier(natureName, statKey) {
    const n = NATURES.find((n) => n.name === natureName);
    if (!n) return 1;
    if (n.up === statKey) return 1.1;
    if (n.down === statKey) return 0.9;
    return 1;
}

export function calcStat(base, iv, ev, level, natureName, statKey) {
    const natMult = getNatureMultiplier(natureName, statKey);
    if (statKey === "hp") {
        return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
    }
    return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natMult);
}

export function calcAllStats(baseStats, ivs, evs, level, natureName) {
    const realStats = {};
    const baseMap = {};
    for (const s of baseStats) {
        baseMap[s.name] = s.base;
    }
    for (const key of STAT_KEYS) {
        const base = baseMap[key] || 0;
        const iv = ivs[key] ?? 31;
        const ev = evs[key] ?? 0;
        realStats[key] = calcStat(base, iv, ev, level, natureName, key);
    }
    realStats._total = STAT_KEYS.reduce((sum, k) => sum + realStats[k], 0);
    return realStats;
}

export function getDefaultIvs() {
    return { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
}

export function getDefaultEvs() {
    return { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
}
