import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { BiStar } from "react-icons/bi";
import PokemonImage from "./PokemonImage";
import PokemonTypeBadge from "./PokemonTypeBadge";
import styles from "./PokemonCard.module.css";
import { useFavorites } from "../../../context/FavoritesContext";
import { useToast } from "../../../context/useToast";

// Lista de excepciones: nombres con guion que NO son formas alternativas
const NON_FORM_HYPHENATED = new Set([
    "ho-oh", "porygon-z", "jangmo-o", "hakamo-o", "kommo-o",
    "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini",
    "sirfetchd", "mr-rime", "mr-mime", "wo-chien",
    "chien-pao", "ting-lu", "chi-yu",
]);

/**
 * Determina si un Pokémon es una forma alternativa basado en su ID y nombre.
 */
function isFormPokemon(id, name) {
    if (id > 1025) return true;
    if (name.includes("-") && !NON_FORM_HYPHENATED.has(name)) return true;
    return false;
}

/**
 * Extrae una etiqueta legible para el tipo de forma.
 */
function getFormLabel(name) {
    if (name.includes("-mega-") || name.endsWith("-mega")) {
        const match = name.match(/-mega(?:-(.+))?$/);
        if (match && match[1]) return `Mega ${match[1].toUpperCase()}`;
        return "Mega";
    }
    if (name.includes("-gmax")) return "Gigamax";
    if (name.endsWith("-alola")) return "Alola";
    if (name.endsWith("-galar")) return "Galar";
    if (name.endsWith("-hisui")) return "Hisui";
    if (name.endsWith("-paldea")) return "Paldea";
    if (name.includes("-eternamax")) return "Eternamax";
    if (name.includes("-primal")) return "Primal";
    return "Forma";
}

const FORM_BADGE_COLORS = {
    mega: { bg: "#E3350D", text: "#fff" },
    gmax: { bg: "#855AC9", text: "#fff" },
    alola: { bg: "#2E7D32", text: "#fff" },
    galar: { bg: "#1565C0", text: "#fff" },
    hisui: { bg: "#6A1B9A", text: "#fff" },
    paldea: { bg: "#E65100", text: "#fff" },
    default: { bg: "#666", text: "#fff" },
};

function getFormBadgeStyle(name) {
    if (name.includes("-mega")) return FORM_BADGE_COLORS.mega;
    if (name.includes("-gmax")) return FORM_BADGE_COLORS.gmax;
    if (name.endsWith("-alola")) return FORM_BADGE_COLORS.alola;
    if (name.endsWith("-galar")) return FORM_BADGE_COLORS.galar;
    if (name.endsWith("-hisui")) return FORM_BADGE_COLORS.hisui;
    if (name.endsWith("-paldea")) return FORM_BADGE_COLORS.paldea;
    return FORM_BADGE_COLORS.default;
}

const PokemonCard = memo(function PokemonCard({ pokemon }) {
    const { id, name, sprites, types } = pokemon;
    const { isFavorite, toggleFavorite } = useFavorites();
    const toast = useToast();
    const isForm = useMemo(() => isFormPokemon(id, name), [id, name]);
    const formLabel = useMemo(() => isForm ? getFormLabel(name) : null, [isForm, name]);
    const badgeStyle = useMemo(() => isForm ? getFormBadgeStyle(name) : null, [isForm, name]);

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

            {isForm && badgeStyle && (
                <span
                    className={styles.formBadge}
                    style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                    }}
                >
                    {formLabel}
                </span>
            )}

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
