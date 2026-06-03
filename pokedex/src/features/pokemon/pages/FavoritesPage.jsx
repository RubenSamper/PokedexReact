import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { useFavorites } from "../../../context/FavoritesContext";
import { usePokemonBatch } from "../hooks/usePokemonBatch";
import PokemonList from "../components/PokemonList";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../../../components/ConfirmModal";
import styles from "./FavoritesPage.module.css";

export default function FavoritesPage() {
    const [showConfirm, setShowConfirm] = useState(false);
    const { favorites, clearAll } = useFavorites();

    const {
        data: pokemonData = [],
        isLoading,
        isFetching,
        isError,
    } = usePokemonBatch(favorites);

    const handleClearAll = () => {
        clearAll();
        setShowConfirm(false);
    };

    if (favorites.length === 0) {
        return (
            <div className={styles.wrapper}>
                <ErrorMessage message="No tienes Pokémon favoritos. Marca algunos desde la Pokédex." />
            </div>
        );
    }

    if (isLoading && pokemonData.length === 0) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Favoritos ({favorites.length})
                    </h2>
                </div>
                <Loader />
            </div>
        );
    }

    if (isError && pokemonData.length === 0) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Favoritos ({favorites.length})
                    </h2>
                </div>
                <ErrorMessage message="Error al cargar algunos Pokémon." />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    Favoritos ({favorites.length})
                </h2>
                <button className={styles.clearBtn} onClick={() => setShowConfirm(true)}>
                    <BiTrash size={16} /> Borrar todos
                </button>
            </div>
            {showConfirm && (
                <ConfirmModal
                    message="¿Borrar todos los Pokémon favoritos?"
                    onConfirm={handleClearAll}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            {isFetching && pokemonData.length > 0 && (
                <p className={styles.loadingHint}>Cargando...</p>
            )}
            <PokemonList
                key={favorites.join(",")}
                data={pokemonData}
                isLoading={false}
                isFetching={false}
                isError={false}
            />
        </div>
    );
}
