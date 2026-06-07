import { useState, useCallback } from "react";
import { getRecommendedItems } from "../data/recommendedItems";
import { getItemRecommendations } from "../utils/itemRecommendations";
import styles from "./PokemonRecommendedItems.module.css";

const ITEM_SPRITE_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

/**
 * Genera unas siglas a partir del nombre español para usar como fallback
 * cuando el sprite del item no existe.
 */
function getInitials(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join("");
}

function isMegaStone(itemName) {
    return itemName.endsWith("-x") || itemName.endsWith("-y") || itemName.includes("ite");
}

export default function PokemonRecommendedItems({ pokemonName, types, stats }) {
    const [open, setOpen] = useState(false);
    const [broken, setBroken] = useState({});

    // Usar el motor de recomendaciones: primero datos curados, si no hay,
    // genera recomendaciones dinámicas según tipos y estadísticas
    const allItems = getItemRecommendations(pokemonName, types, stats, getRecommendedItems);

    const handleImgError = useCallback((itemName) => {
        setBroken((prev) => ({ ...prev, [itemName]: true }));
    }, []);

    if (!allItems || allItems.length === 0) return null;

    // Mega piedras primero, luego por prioridad
    const MAX_VISIBLE = 6;
    const sorted = [...allItems]
        .sort((a, b) => {
            const aMega = isMegaStone(a.item) ? 0 : 1;
            const bMega = isMegaStone(b.item) ? 0 : 1;
            if (aMega !== bMega) return aMega - bMega;
            return 0;
        })
        .slice(0, MAX_VISIBLE);

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.toggle}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                <span>
                    Items recomendados{" "}
                    <span className={styles.badge}>{allItems.length}</span>
                </span>
                <span
                    className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
                >
                    ▼
                </span>
            </button>

            {open && (
                <div className={styles.content}>
                    <p className={styles.hint}>
                        Objetos que más le rentan en combate competitivo, ordenados
                        por relevancia.
                    </p>
                    {sorted.map((rec, i) => (
                        <div key={rec.item} className={styles.itemRow}>
                            <div className={styles.itemHeader}>
                                <span className={styles.position}>#{i + 1}</span>

                                {broken[rec.item] ? (
                                    <span
                                        className={styles.itemFallback}
                                        title={rec.itemEs}
                                    >
                                        {getInitials(rec.itemEs)}
                                    </span>
                                ) : (
                                    <img
                                        className={styles.itemSprite}
                                        src={`${ITEM_SPRITE_BASE}/${rec.item}.png`}
                                        alt={rec.itemEs}
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => handleImgError(rec.item)}
                                    />
                                )}

                                <div className={styles.itemInfo}>
                                    <strong className={styles.itemName}>
                                        {rec.itemEs}
                                    </strong>
                                    <span className={styles.itemId}>
                                        {rec.item}
                                    </span>
                                </div>
                            </div>
                            <p className={styles.reason}>{rec.reason}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
