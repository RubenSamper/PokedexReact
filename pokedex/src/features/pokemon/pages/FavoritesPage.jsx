import { useFavorites } from "../hooks/useFavorites";
import { usePokemonBatch } from "../hooks/usePokemonBatch";
import PokemonList from "../components/PokemonList";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./HomePage.module.css";

export default function FavoritesPage() {
    const { favorites } = useFavorites();

    const {
        data: pokemonData = [],
        isLoading,
        isFetching,
        isError,
    } = usePokemonBatch(favorites);

    if (favorites.length === 0) {
        return (
            <div className={styles.wrapper}>
                <ErrorMessage message="No tienes Pokémon favoritos. Marca algunos desde la Pokédex." />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <h2 style={{ padding: "12px 20px 0", margin: 0 }}>
                Favoritos ({favorites.length})
            </h2>
            <PokemonList
                data={pokemonData}
                isLoading={isLoading && pokemonData.length === 0}
                isFetching={isFetching && pokemonData.length > 0}
                isError={isError && pokemonData.length === 0}
            />
        </div>
    );
}
