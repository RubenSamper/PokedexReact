import { memo } from "react";
import styles from "./PokemonClassBadge.module.css";

const CLASS_STYLES = {
    Legendario: "legendary",
    Mítico: "mythical",
    Ultraente: "ultraBeast",
    Pseudolegendario: "pseudoLegendary",
    Bebé: "baby",
};

const PokemonClassBadge = memo(function PokemonClassBadge({ classification, generationName }) {
    const classStyle = classification ? CLASS_STYLES[classification] : null;

    return (
        <div className={styles.container}>
            {classification && classStyle && (
                <span className={`${styles.badge} ${styles[classStyle]}`}>
                    {classification}
                </span>
            )}
            <span className={`${styles.badge} ${styles.generation}`}>
                {generationName}
            </span>
        </div>
    );
});

export default PokemonClassBadge;
