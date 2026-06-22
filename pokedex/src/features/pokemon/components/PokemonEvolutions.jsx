import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";
import { useEvolutionChain, formatEvolutionDetail } from "../hooks/useEvolutionChain";
import styles from "./PokemonEvolutions.module.css";

/**
 * Formatea el nombre: "vulpix-alola" → "Vulpix (Alola)", "charizard" → "Charizard"
 */
function formatPokemonName(name) {
    // Detectar sufijo regional
    const regionalMatch = name.match(/^(.+)-(alola|galar|hisui|paldea)$/);
    if (regionalMatch) {
        const base = regionalMatch[1].charAt(0).toUpperCase() + regionalMatch[1].slice(1);
        const region = regionalMatch[2].charAt(0).toUpperCase() + regionalMatch[2].slice(1);
        return `${base} (${region})`;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokemonEvolutions({ evolutionChainUrl, currentId, currentFormName }) {
    const { data: chain = [], isLoading, isError } = useEvolutionChain(evolutionChainUrl, currentFormName);

    const hasChain = !isLoading && !isError && chain.length > 1;

    if (!hasChain) return null;

    return (
        <div className={styles.wrapper}>
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
                                {formatPokemonName(pokemon.name)}
                            </span>
                            <span className={styles.pokeNum}>
                                #{String(pokemon.id).padStart(3, "0")}
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
