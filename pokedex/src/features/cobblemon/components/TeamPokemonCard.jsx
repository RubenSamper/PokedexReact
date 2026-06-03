import { useState, useCallback } from "react";
import { BiDiamond } from "react-icons/bi";
import {
    getSpeciesName,
    getApiTypes,
    capitalize,
    getSpriteUrl,
    TYPE_ES,
} from "../utils/cobblemon";
import PokemonDetailModal from "./PokemonDetailModal";
import styles from "./TeamPokemonCard.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

export default function TeamPokemonCard({ pokemon }) {
    const [showDetail, setShowDetail] = useState(false);
    const name = capitalize(getSpeciesName(pokemon) || "???");
    const types = getApiTypes(pokemon);
    const sprite = getSpriteUrl(name, false, null);
    const shiny = pokemon.Shiny || false;

    // Objeto
    const itemId = pokemon.HeldItem?.id || "";
    const hasItem = itemId !== "";
    const itemEn = hasItem
        ? (itemId.includes(":") ? itemId.split(":")[1] : itemId)
        : "";
    const itemSprite = hasItem
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemEn.replace(/_/g, "-")}.png`
        : null;

    const level = pokemon.Level || 50;

    const openDetail = useCallback(() => setShowDetail(true), []);
    const closeDetail = useCallback(() => setShowDetail(false), []);

    return (
        <>
            <div
                className={`${styles.card} ${shiny ? styles.shiny : ""}`}
                onClick={openDetail}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openDetail(); }}
            >
                <div className={styles.header}>
                    <img
                        src={sprite}
                        alt={name}
                        className={styles.sprite}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            e.target.src =
                                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                        }}
                    />
                    <div className={styles.info}>
                        <span className={styles.name}>
                            {name}
                            {shiny && <span className={styles.shinyBadge}><BiDiamond size={12} /></span>}
                        </span>
                        <span className={styles.meta}>Nv. {level}</span>
                    </div>
                </div>

                <div className={styles.badges}>
                    {types.map((t) => (
                        <span
                            key={t}
                            className={styles.typeBadge}
                            style={{ background: TYPE_COLORS[t] || "#888" }}
                        >
                            {TYPE_ES[t] || t}
                        </span>
                    ))}
                </div>

                <div className={styles.itemRow}>
                    {hasItem ? (
                        <>
                            {itemSprite && (
                                <img
                                    src={itemSprite}
                                    alt=""
                                    className={styles.itemIcon}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />
                            )}
                            <span className={styles.itemName}>{itemEn.replace(/_/g, " ")}</span>
                        </>
                    ) : (
                        <span className={styles.noItem}>Sin objeto</span>
                    )}
                </div>
            </div>

            {showDetail && (
                <PokemonDetailModal pokemon={pokemon} onClose={closeDetail} />
            )}
        </>
    );
}
