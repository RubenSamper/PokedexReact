import { Link } from "react-router-dom";
import { BiChevronRight, BiChevronDown } from "react-icons/bi";
import { useEvolutionChain, formatEvolutionDetail } from "../hooks/useEvolutionChain";
import styles from "./PokemonEvolutions.module.css";

/**
 * Formatea el nombre: "vulpix-alola" → "Vulpix (Alola)", "charizard" → "Charizard"
 */
function formatPokemonName(name) {
    const regionalMatch = name.match(/^(.+)-(alola|galar|hisui|paldea)$/);
    if (regionalMatch) {
        const base = regionalMatch[1].charAt(0).toUpperCase() + regionalMatch[1].slice(1);
        const region = regionalMatch[2].charAt(0).toUpperCase() + regionalMatch[2].slice(1);
        return `${base} (${region})`;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokemonEvolutions({ evolutionChainUrl, currentId, currentFormName }) {
    const { data: chainData, isLoading, isError } = useEvolutionChain(evolutionChainUrl, currentFormName);

    if (isLoading || isError || !chainData) return null;

    const { levels, connections } = chainData;

    // Necesitamos al menos 2 niveles para mostrar evolución
    if (levels.length < 2) return null;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Línea evolutiva</h2>

            {levels.map((pokemonList, levelIndex) => (
                <div key={levelIndex} className={styles.level}>
                    {/* Flechas desde el nivel anterior */}
                    {levelIndex > 0 && (
                        <div className={styles.levelArrows}>
                            {pokemonList.map((pokemon) => {
                                const conn = connections.find(c => c.to === pokemon.id);
                                return conn ? (
                                    <div key={pokemon.id} className={styles.arrowCol}>
                                        <span className={styles.arrowLabel}>
                                            {formatEvolutionDetail(conn.details)}
                                        </span>
                                        <span className={styles.arrowSymbol}>
                                            <BiChevronDown size={20} />
                                        </span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* Pokémon de este nivel */}
                    <div className={styles.levelPokemon}>
                        {pokemonList.map((pokemon) => (
                            <Link
                                key={pokemon.id}
                                to={`/pokemon/${pokemon.name}`}
                                className={`${styles.pokeCard} ${
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
                                    {formatPokemonName(pokemon.name)}
                                </span>
                                <span className={styles.pokeNum}>
                                    #{String(pokemon.id).padStart(3, "0")}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
