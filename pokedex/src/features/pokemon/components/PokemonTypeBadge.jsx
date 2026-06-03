import styles from "./PokemonTypeBadge.module.css";

const TYPE_ES = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada",
};

import { memo } from "react";

const PokemonTypeBadge = memo(function PokemonTypeBadge({ type }) {
    const label = TYPE_ES[type] || type.charAt(0).toUpperCase() + type.slice(1);
    return (
        <span className={`${styles.badge} ${styles[type]}`}>
            {label}
        </span>
    );
});

export default PokemonTypeBadge;
