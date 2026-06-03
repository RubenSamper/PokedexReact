import styles from "./PokemonsFilter.module.css";

const TYPES = [
    "normal", "fire", "water", "grass", "electric", "ice",
    "fighting", "poison", "ground", "flying", "psychic",
    "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

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

/* Colores oficiales de cada tipo Pokémon */
const TYPE_COLORS = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    grass: "#7AC74C",
    electric: "#F7D02C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
};

export default function PokemonsFilter({ selectedTypes, onChange }) {
    const toggleType = (type) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter((t) => t !== type));
        } else {
            onChange([...selectedTypes, type]);
        }
    };

    return (
        <div className={styles.wrapper}>
            {TYPES.map((type) => {
                const color = TYPE_COLORS[type];
                const isSelected = selectedTypes.includes(type);
                return (
                    <button
                        key={type}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipSelected : ""}`}
                        style={{
                            "--type-color": color,
                            background: isSelected ? color : "transparent",
                            color: isSelected ? "#fff" : "var(--text)",
                            borderColor: color,
                        }}
                        onClick={() => toggleType(type)}
                        aria-pressed={isSelected}
                    >
                        {TYPE_ES[type]}
                    </button>
                );
            })}
        </div>
    );
}
