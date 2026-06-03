import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";
import { useEvolutionChain, formatEvolutionDetail } from "../hooks/useEvolutionChain";
import { usePokemonVarieties } from "../hooks/usePokemonVarieties";
import styles from "./PokemonEvolutions.module.css";

/** Detecta el tipo de forma alternativa a partir del nombre */
function getFormType(name, baseName) {
    const suffix = name.replace(`${baseName}-`, "");
    if (suffix.includes("mega")) return "mega";
    if (suffix === "gmax") return "gmax";
    if (["alola", "galar", "hisui", "paldea"].includes(suffix)) return "regional";
    return "other";
}

/** Devuelve texto descriptivo para una forma alternativa */
function formatFormLabel(name, baseName) {
    const suffix = name.replace(`${baseName}-`, "");

    if (suffix === "gmax") return "Gigamax";
    if (suffix.startsWith("mega-")) {
        const variant = suffix.replace("mega-", "").toUpperCase();
        return `Mega ${variant}`;
    }
    if (suffix === "mega") return "Mega";
    if (["alola", "galar", "hisui", "paldea"].includes(suffix)) {
        const regions = { alola: "Alola", galar: "Galar", hisui: "Hisui", paldea: "Paldea" };
        return `Forma de ${regions[suffix]}`;
    }
    return suffix
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

const FORM_COLORS = {
    mega: "#E3350D",
    gmax: "#855AC9",
    regional: "#2E7D32",
    other: "#888",
};

const METHOD_COLORS = {
    mega: "#b82810",
    gmax: "#6a3d9a",
    regional: "#1b5e20",
};

export default function PokemonEvolutions({ evolutionChainUrl, currentId, varieties = [] }) {
    const { data: chain = [], isLoading, isError } = useEvolutionChain(evolutionChainUrl);
    const { data: varietySprites = [] } = usePokemonVarieties(varieties);

    const hasChain = !isLoading && !isError && chain.length > 1;
    const hasForms = varieties.length > 0;

    if (!hasChain && !hasForms) return null;

    // Nombre base del Pokémon actual para identificar las variedades
    const currentPokemon = chain.find((p) => p.id === currentId);
    const baseName = currentPokemon?.name || "";

    // Mapa nombre -> datos para acceso rápido
    const formDataMap = {};
    varietySprites.forEach((v) => {
        formDataMap[v.name] = v;
    });

    return (
        <div className={styles.wrapper}>
            {hasChain && (
                <>
                    <h2 className={styles.title}>Línea evolutiva</h2>
                    <div className={styles.chain}>
                        {chain.map((pokemon, index) => (
                            <div key={pokemon.id} className={styles.step}>
                                {index > 0 && (
                                    <div className={styles.arrow}>
                                        <span className={styles.arrowLabel}>
                                            {formatEvolutionDetail(pokemon.details)}
                                        </span>
                                        <span className={styles.arrowSymbol}><BiChevronRight size={24} /></span>
                                    </div>
                                )}

                                <Link
                                    to={`/pokemon/${pokemon.name}`}
                                    className={`${styles.pokemon} ${
                                        pokemon.id === currentId ? styles.current : ""
                                    }`}
                                >
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                        alt={pokemon.name}
                                        className={styles.sprite}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <span className={styles.pokeName}>
                                        {pokemon.name.charAt(0).toUpperCase() +
                                            pokemon.name.slice(1)}
                                    </span>
                                    <span className={styles.pokeNum}>
                                        #{String(pokemon.id).padStart(3, "0")}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {hasForms && varietySprites.length > 0 && (
                <>
                    <h2 className={styles.title}>Formas alternativas</h2>
                    <div className={styles.formsGrid}>
                        {varieties.map((v) => {
                            const type = getFormType(v.name, baseName);
                            const label = formatFormLabel(v.name, baseName);
                            const color = FORM_COLORS[type];
                            const formData = formDataMap[v.name];
                            const sprite = formData?.sprite;
                            const method = formData?.evolutionMethod;
                            const methodColor = method ? METHOD_COLORS[method.type] || "#666" : "#666";

                            return (
                                <Link
                                    key={v.name}
                                    to={`/pokemon/${v.name}`}
                                    className={styles.formCard}
                                >
                                    {sprite && (
                                        <img
                                            src={sprite}
                                            alt={v.name}
                                            className={styles.formSprite}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                    <span className={styles.formLabel} style={{ background: color }}>
                                        {label}
                                    </span>
                                    {method && (
                                        <span className={styles.formMethod} style={{ background: methodColor }}>
                                            {method.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
