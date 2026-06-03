import { useState, useMemo, useRef, useCallback } from "react";
import { useComparePokemon } from "../hooks/useComparePokemon";
import StatsComparisonChart from "../components/StatsComparisonChart";
import BattlePredictor from "../components/BattlePredictor";
import StatsPanel from "../components/StatsPanel";
import { calcAllStats, getDefaultIvs, getDefaultEvs } from "../utils/statsCalc";
import styles from "./ComparePage.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

const TYPE_ES = {
    normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
    electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada",
};

const ALL_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

let speciesCache = null;
async function getSpeciesList() {
    if (speciesCache) return speciesCache;
    const res = await fetch(ALL_POKEMON_URL);
    const data = await res.json();
    speciesCache = data.results.map((r, i) => ({
        id: i + 1,
        name: r.name,
        label: `#${String(i + 1).padStart(3, "0")} ${r.name.charAt(0).toUpperCase() + r.name.slice(1)}`,
    }));
    return speciesCache;
}

function SpeciesSearch({ value, onChange, placeholder }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [list, setList] = useState([]);

    const handleFocus = async () => {
        setOpen(true);
        if (list.length === 0) {
            const l = await getSpeciesList();
            setList(l);
        }
    };

    const filtered = useMemo(() => {
        if (!query) return list.slice(0, 30);
        const q = query.toLowerCase();
        return list
            .filter(
                (s) =>
                    s.name.includes(q) ||
                    s.label.toLowerCase().includes(q) ||
                    String(s.id).includes(q)
            )
            .slice(0, 30);
    }, [list, query]);

    const selectedName = value
        ? list.find((s) => s.name === value)?.label || value
        : "";

    return (
        <div className={styles.searchWrapper}>
            <input
                className={styles.searchInput}
                placeholder={placeholder}
                value={open ? query : selectedName}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
            />
            {open && (
                <div className={styles.dropdown}>
                    {filtered.map((s) => (
                        <button
                            key={s.name}
                            className={`${styles.dropdownItem} ${
                                s.name === value ? styles.active : ""
                            }`}
                            onMouseDown={() => {
                                onChange(s.name);
                                setQuery("");
                                setOpen(false);
                            }}
                            type="button"
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Hook que mantiene stats editables persistentes por Pokémon.
 * Cada especie recuerda sus EVs/IVs/naturaleza/nivel aunque
 * cambies de selección y vuelvas.
 */
function usePersistedStats() {
    const savedRef = useRef({});

    const getStats = useCallback((pokeName) => {
        if (!pokeName) return null;
        if (!savedRef.current[pokeName]) {
            savedRef.current[pokeName] = {
                ivs: getDefaultIvs(),
                evs: getDefaultEvs(),
                nature: "serious",
                level: 100,
            };
        }
        return savedRef.current[pokeName];
    }, []);

    const updateStats = useCallback((pokeName, key, val) => {
        if (!pokeName) return;
        if (!savedRef.current[pokeName]) {
            savedRef.current[pokeName] = {
                ivs: getDefaultIvs(),
                evs: getDefaultEvs(),
                nature: "serious",
                level: 100,
            };
        }
        savedRef.current[pokeName][key] = val;
    }, []);

    return { getStats, updateStats };
}

export default function ComparePage() {
    const [poke1, setPoke1] = useState("");
    const [poke2, setPoke2] = useState("");

    const { data: p1, isLoading: l1 } = useComparePokemon(poke1);
    const { data: p2, isLoading: l2 } = useComparePokemon(poke2);

    const { getStats, updateStats } = usePersistedStats();

    // Usar un dummy state para forzar re-render cuando se editan stats
    const [, forceUpdate] = useState(0);
    const triggerRerender = () => forceUpdate((n) => n + 1);

    // Stats actuales de cada slot (persisten aunque cambie la selección)
    const currentStats1 = getStats(poke1) || { ivs: getDefaultIvs(), evs: getDefaultEvs(), nature: "serious", level: 100 };
    const currentStats2 = getStats(poke2) || { ivs: getDefaultIvs(), evs: getDefaultEvs(), nature: "serious", level: 100 };

    const handleUpdateStat1 = (key, val) => {
        updateStats(poke1, key, val);
        triggerRerender();
    };

    const handleUpdateStat2 = (key, val) => {
        updateStats(poke2, key, val);
        triggerRerender();
    };

    // Stats reales calculados al instante
    const realStats1 = useMemo(() => {
        if (!p1) return null;
        return calcAllStats(p1.stats, currentStats1.ivs, currentStats1.evs, currentStats1.level, currentStats1.nature);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p1, currentStats1.ivs, currentStats1.evs, currentStats1.level, currentStats1.nature]);

    const realStats2 = useMemo(() => {
        if (!p2) return null;
        return calcAllStats(p2.stats, currentStats2.ivs, currentStats2.evs, currentStats2.level, currentStats2.nature);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p2, currentStats2.ivs, currentStats2.evs, currentStats2.level, currentStats2.nature]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Comparar Pokémon</h2>

            <div className={styles.selectors}>
                <div className={styles.selectorCol}>
                    <SpeciesSearch
                        value={poke1}
                        onChange={setPoke1}
                        placeholder="Pokémon #1..."
                    />
                    {l1 && <p className={styles.loading}>Cargando...</p>}
                    {p1 && (
                        <>
                            <div className={styles.preview}>
                                <img
                                    src={p1.artwork || p1.sprite}
                                    alt={p1.nameEs}
                                    className={styles.previewSprite}
                                />
                                <span className={styles.previewName}>{p1.nameEs}</span>
                                <div className={styles.previewTypes}>
                                    {p1.types.map((t) => (
                                        <span key={t} className={styles.typeBadge} style={{ background: TYPE_COLORS[t] || "#999" }}>{TYPE_ES[t] || t}</span>
                                    ))}
                                </div>
                            </div>
                            <StatsPanel
                                baseStats={p1.stats}
                                ivs={currentStats1.ivs}
                                evs={currentStats1.evs}
                                nature={currentStats1.nature}
                                level={currentStats1.level}
                                onChangeIvs={(v) => handleUpdateStat1("ivs", v)}
                                onChangeEvs={(v) => handleUpdateStat1("evs", v)}
                                onChangeNature={(v) => handleUpdateStat1("nature", v)}
                                onChangeLevel={(v) => handleUpdateStat1("level", v)}
                                color="#4a9eff"
                            />
                        </>
                    )}
                </div>

                <div className={styles.vsCol}>VS</div>

                <div className={styles.selectorCol}>
                    <SpeciesSearch
                        value={poke2}
                        onChange={setPoke2}
                        placeholder="Pokémon #2..."
                    />
                    {l2 && <p className={styles.loading}>Cargando...</p>}
                    {p2 && (
                        <>
                            <div className={styles.preview}>
                                <img
                                    src={p2.artwork || p2.sprite}
                                    alt={p2.nameEs}
                                    className={styles.previewSprite}
                                />
                                <span className={styles.previewName}>{p2.nameEs}</span>
                                <div className={styles.previewTypes}>
                                    {p2.types.map((t) => (
<span key={t} className={styles.typeBadge} style={{ background: TYPE_COLORS[t] || "#999" }}>{TYPE_ES[t] || t}</span>
                                    ))}
                                </div>
                            </div>
                            <StatsPanel
                                baseStats={p2.stats}
                                ivs={currentStats2.ivs}
                                evs={currentStats2.evs}
                                nature={currentStats2.nature}
                                level={currentStats2.level}
                                onChangeIvs={(v) => handleUpdateStat2("ivs", v)}
                                onChangeEvs={(v) => handleUpdateStat2("evs", v)}
                                onChangeNature={(v) => handleUpdateStat2("nature", v)}
                                onChangeLevel={(v) => handleUpdateStat2("level", v)}
                                color="#ff6b6b"
                            />
                        </>
                    )}
                </div>
            </div>

            {p1 && p2 && (
                <>
                    <div className={styles.statsSection}>
                        <h3 className={styles.sectionTitle}>Comparativa de estadísticas</h3>
                        {realStats1 && realStats2 && (
                            <p className={styles.statsHint}>
                                Stats calculadas con EV/IV/naturaleza — edítalas en los paneles de arriba
                            </p>
                        )}
                        <StatsComparisonChart
                            pokemon1={p1}
                            pokemon2={p2}
                            realStats1={realStats1}
                            realStats2={realStats2}
                        />
                    </div>

                    <BattlePredictor
                        pokemon1={p1}
                        pokemon2={p2}
                        realStats1={realStats1}
                        realStats2={realStats2}
                    />
                </>
            )}
        </div>
    );
}
