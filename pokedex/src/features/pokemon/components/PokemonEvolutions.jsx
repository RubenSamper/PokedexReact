import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";
import { useEvolutionChain, formatEvolutionDetail } from "../hooks/useEvolutionChain";
import styles from "./PokemonEvolutions.module.css";

export default function PokemonEvolutions({ evolutionChainUrl, currentId }) {
    const { data: chain = [], isLoading, isError } = useEvolutionChain(evolutionChainUrl);

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
        </div>
    );
}
