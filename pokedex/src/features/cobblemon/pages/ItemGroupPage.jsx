import { useParams, useNavigate } from "react-router-dom";
import { BiChevronLeft } from "react-icons/bi";
import { useItemCategories } from "../hooks/useItemCategories";
import { useCategoryItems } from "../hooks/useCategoryItems";
import { getGroupBySlug } from "../utils/itemGroups";
import ItemCard from "../components/ItemCard";
import styles from "./ItemGroupPage.module.css";

export default function ItemGroupPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const group = getGroupBySlug(slug);

    const { data: categories, isLoading: catLoading } = useItemCategories();

    // Mapa rápido name -> category data
    const catMap = {};
    if (categories) {
        for (const c of categories) {
            catMap[c.name] = c;
        }
    }

    // Si el grupo no existe
    if (!group) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>Grupo no encontrado.</p>
                <button className={styles.backBtn} onClick={() => navigate("/items")}>
                    <BiChevronLeft size={18} /> Volver a objetos
                </button>
            </div>
        );
    }

    if (catLoading) {
        return (
            <div className={styles.container}>
                <p className={styles.loading}>Cargando...</p>
            </div>
        );
    }

    // Si el grupo tiene UNA categoría, cargamos items directamente
    // Si tiene VARIAS, mostramos cada categoría como una sección
    const single = group.categories.length === 1;
    const catName = single ? group.categories[0] : null;
    const catData = catName ? catMap[catName] : null;

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate("/items")}>
                <BiChevronLeft size={18} /> Todos los objetos
            </button>

            <h2 className={styles.title}>{group.name}</h2>

            {single && catData ? (
                <CategorySection
                    key={catData.name}
                    category={catData}
                    isSingle
                />
            ) : (
                group.categories.map((cn) => {
                    const cd = catMap[cn];
                    if (!cd) return null;
                    return <CategorySection key={cn} category={cd} />;
                })
            )}
        </div>
    );
}

function CategorySection({ category, isSingle }) {
    const { data: items, isLoading } = useCategoryItems(
        category.items,
        category.name
    );

    return (
        <div className={styles.catBlock}>
            {!isSingle && (
                <h3 className={styles.catTitle}>{category.nameEs}</h3>
            )}
            {isLoading && (
                <p className={styles.loading}>Cargando objetos...</p>
            )}
            {items && items.length === 0 && (
                <p className={styles.empty}>Sin objetos en esta categoría.</p>
            )}
            {items && items.length > 0 && (
                <div className={styles.itemGrid}>
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
