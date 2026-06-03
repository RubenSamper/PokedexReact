import PokemonCard from "./PokemonCard";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import styles from "./PokemonList.module.css";

export default function PokemonList({
    data,
    isLoading = false,
    isFetching = false,
    isError = false,
}) {
    if (isError) return <ErrorMessage message="Error cargando Pokémon" />;

    return (
        <div className={styles.grid}>
            {data.map((pokemon) => (
                <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}

            {isLoading && (
                <div style={{ gridColumn: "1 / -1" }}>
                    <Loader />
                </div>
            )}

            {isFetching && (
                <div
                    style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "8px",
                        fontSize: "0.85rem",
                        color: "var(--text)",
                        opacity: 0.5,
                    }}
                >
                    Cargando...
                </div>
            )}
        </div>
    );
}
