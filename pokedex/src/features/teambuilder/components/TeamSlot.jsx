import { BiX, BiDiamond } from "react-icons/bi";
import styles from "./TeamSlot.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

export default function TeamSlot({ slot, index, onClick, onClear }) {
    const hasPokemon = slot.species !== null;
    const types = slot.species?.types || [];

    return (
        <div
            className={`${styles.slot} ${hasPokemon ? styles.filled : styles.empty}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        >
            {hasPokemon ? (
                <>
                    <div className={styles.typeBar}>
                        {types.map((t) => (
                            <span
                                key={t}
                                className={styles.typeDot}
                                style={{ background: TYPE_COLORS[t] || "#999" }}
                                title={t}
                            />
                        ))}
                    </div>

                    <img
                        src={slot.species.sprite}
                        alt={slot.species.nameEs}
                        className={styles.sprite}
                        loading="lazy"
                        decoding="async"
                    />

                    <span className={styles.pokeName}>
                        {slot.species.nameEs}
                    </span>

                    {slot.shiny && <span className={styles.shinyBadge}><BiDiamond size={12} /></span>}

                    <button
                        className={styles.clearBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear?.();
                        }}
                        type="button"
                        title="Quitar Pokémon"
                    >
                        <BiX size={16} />
                    </button>
                </>
            ) : (
                <div className={styles.emptyContent}>
                    <span className={styles.emptyNum}>#{index + 1}</span>
                    <span className={styles.emptyLabel}>Vacío</span>
                </div>
            )}
        </div>
    );
}
