import styles from "./ItemCard.module.css";

export default function ItemCard({ item }) {
    return (
        <div className={styles.card}>
            {item.sprite && (
                <img
                    className={styles.sprite}
                    src={item.sprite}
                    alt={item.nameEs}
                    loading="lazy"
                    decoding="async"
                />
            )}
            <div className={styles.body}>
                <h3 className={styles.name}>{item.nameEs}</h3>
                {item.flavorEs ? (
                    <p className={styles.flavor}>{item.flavorEs}</p>
                ) : item.effectEs ? (
                    <p className={styles.flavor}>{item.effectEs}</p>
                ) : (
                    <p className={styles.flavor}>Sin descripción disponible.</p>
                )}
                <p className={styles.effect}>{item.shortEffectEs || item.effectEs || ""}</p>
            </div>
        </div>
    );
}
