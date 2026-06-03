import { memo } from "react";
import { Link } from "react-router-dom";
import { BiStar } from "react-icons/bi";
import PokemonImage from "./PokemonImage";
import PokemonTypeBadge from "./PokemonTypeBadge";
import styles from "./PokemonCard.module.css";
import { useFavorites } from "../../../context/FavoritesContext";
import { useToast } from "../../../context/useToast";

const PokemonCard = memo(function PokemonCard({ pokemon }) {
    const { id, name, sprites, types } = pokemon;
    const { isFavorite, toggleFavorite } = useFavorites();
    const toast = useToast();

    const handleFavorite = (e) => {
        e.preventDefault();
        const wasFav = isFavorite(id);
        toggleFavorite(id);
        toast(wasFav ? "Eliminado de favoritos" : "Añadido a favoritos", wasFav ? "error" : "success");
    };

    return (
        <Link to={`/pokemon/${name}`} className={styles.card}>
            <button
                className={`${styles.favorite} ${
                    isFavorite(id) ? styles.activeFavorite : ""
                }`}
                onClick={handleFavorite}
                aria-label="Marcar como favorito"
            >
                <BiStar size={18} />
            </button>

            <div className={styles.imageWrapper}>
                <PokemonImage
                    src={sprites.front_default || sprites.other["official-artwork"].front_default}
                    alt={name}
                />
            </div>

            <span className={styles.number}>
                #{String(id).padStart(3, "0")}
            </span>

            <h3 className={styles.name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
            </h3>

            <div className={styles.types}>
                {types.map((t) => (
                    <PokemonTypeBadge key={t.type.name} type={t.type.name} />
                ))}
            </div>
        </Link>
    );
});

export default PokemonCard;
