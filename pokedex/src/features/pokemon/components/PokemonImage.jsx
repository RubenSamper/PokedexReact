import { memo } from "react";
import styles from "./PokemonImage.module.css";

const FALLBACK = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

const PokemonImage = memo(function PokemonImage({ src, alt, className }) {
    return (
        <img
            className={className || styles.image}
            src={src || FALLBACK}
            alt={alt}
            onError={(e) => {
                if (e.target.src !== FALLBACK) e.target.src = FALLBACK;
            }}
            loading="lazy"
            decoding="async"
        />
    );
});

export default PokemonImage;
