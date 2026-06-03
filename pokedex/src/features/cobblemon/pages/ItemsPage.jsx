import { useNavigate } from "react-router-dom";
import {
    BiUpArrowAlt, BiShield, BiCrosshair, BiSolidMagicWand, BiDumbbell,
    BiLeaf, BiSolidFlask, BiCookie, BiDisc, BiDiamond, BiCircle,
    BiSolidCircle, BiMusic, BiPackage,
} from "react-icons/bi";
import { ITEM_GROUPS } from "../utils/itemGroups";
import { useItemCategories } from "../hooks/useItemCategories";
import styles from "./ItemsPage.module.css";

/** Iconos representativos para cada grupo */
const GROUP_ICONS = {
    potenciadores: <BiUpArrowAlt size={28} />,
    platos: <BiShield size={28} />,
    competitivos: <BiCrosshair size={28} />,
    evolutivos: <BiSolidMagicWand size={28} />,
    esfuerzo: <BiDumbbell size={28} />,
    bayas: <BiLeaf size={28} />,
    pociones: <BiSolidFlask size={28} />,
    mentas: <BiCookie size={28} />,
    mts: <BiDisc size={28} />,
    joyas: <BiDiamond size={28} />,
    bonguri: <BiCircle size={28} />,
    "pokeballs-standard": <BiSolidCircle size={28} color="#e74c3c" />,
    "pokeballs-special": <BiSolidCircle size={28} color="#f1c40f" />,
    flautas: <BiMusic size={28} />,
};

export default function ItemsPage() {
    const navigate = useNavigate();
    const { data: categories } = useItemCategories();

    // Mapa rápido: name -> item count
    const catCountMap = {};
    if (categories) {
        for (const c of categories) {
            catCountMap[c.name] = c.itemCount;
        }
    }

    const totalItems = Object.values(catCountMap).reduce((a, b) => a + b, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Objetos</h2>
            <p className={styles.subtitle}>
                {totalItems > 0
                    ? `${totalItems} objetos organizados por tipo`
                    : "Cargando..."}
            </p>

            <div className={styles.grid}>
                {ITEM_GROUPS.map((group) => {
                    const count = group.categories.reduce(
                        (sum, c) => sum + (catCountMap[c] || 0),
                        0
                    );
                    return (
                        <button
                            key={group.slug}
                            className={styles.card}
                            type="button"
                            onClick={() => navigate(`/items/${group.slug}`)}
                        >
                            <span className={styles.icon}>
                                {GROUP_ICONS[group.slug] || <BiPackage size={28} />}
                            </span>
                            <span className={styles.groupName}>{group.name}</span>
                            <span className={styles.count}>
                                {count > 0 ? `${count} objetos` : ""}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
