import styles from "./PokemonFormSwitcher.module.css";

const FORM_TYPE_COLORS = {
    mega: { bg: "#E3350D", text: "#fff" },
    gmax: { bg: "#855AC9", text: "#fff" },
    regional: { bg: "#2E7D32", text: "#fff" },
    original: { bg: "#FF9800", text: "#fff" },
    primal: { bg: "#FF6B35", text: "#fff" },
    origin: { bg: "#4A90D9", text: "#fff" },
    therian: { bg: "#8B5CF6", text: "#fff" },
    eternamax: { bg: "#6B21A8", text: "#fff" },
    other: { bg: "#666", text: "#fff" },
};

/**
 * Componente que muestra un selector de formas alternativas.
 * Cada forma se representa como un botón con sprite pequeño y etiqueta.
 * La forma activa se resalta visualmente.
 *
 * @param {Object} props
 * @param {Array<{name: string, sprite: string|null, formType: string, formLabel: string}>} props.forms - Datos de formas alternativas
 * @param {string} props.currentForm - Nombre de la forma actualmente seleccionada
 * @param {string} props.baseName - Nombre de la forma base del Pokémon
 * @param {string|null} props.baseSprite - URL del sprite oficial de la forma base
 * @param {function} props.onFormSelect - Callback al seleccionar una forma (recibe el nombre)
 * @param {boolean} props.loading - Si los datos de formas están cargando
 * @param {number} props.totalVarieties - Número total de variedades (para saber si mostrar el componente)
 */
export default function PokemonFormSwitcher({
    forms = [],
    currentForm,
    baseName,
    baseSprite = null,
    onFormSelect,
    loading = false,
    totalVarieties = 0,
}) {
    if (totalVarieties === 0 && forms.length === 0 && !loading) return null;

    // Combinamos la forma base con las alternativas para tener el toggle completo
    const allForms = [
        {
            name: baseName,
            sprite: baseSprite,
            formType: "base",
            formLabel: "Base",
        },
        ...forms.map((f) => ({
            name: f.name,
            sprite: f.sprites?.other?.["official-artwork"]?.front_default || null,
            formType: f.formType,
            formLabel: f.formLabel,
        })),
    ];

    const isBusy = loading;

    return (
        <div className={styles.wrapper}>
            <span className={styles.label}>Formas alternativas:</span>
            <div className={styles.switcher}>
                {allForms.map((form) => {
                    const isActive = form.name === currentForm;
                    const colors = FORM_TYPE_COLORS[form.formType] || FORM_TYPE_COLORS.other;

                    return (
                        <button
                            key={form.name}
                            className={`${styles.formBtn} ${
                                isActive ? styles.active : ""
                            }`}
                            style={
                                isActive
                                    ? {
                                          background: colors.bg,
                                          color: colors.text,
                                          borderColor: colors.bg,
                                      }
                                    : {
                                          borderColor: colors.bg,
                                          color: colors.bg,
                                      }
                            }
                            onClick={() => onFormSelect(form.name)}
                            disabled={isBusy}
                            title={form.formLabel}
                        >
                            {form.sprite && (
                                <img
                                    src={form.sprite}
                                    alt={form.name}
                                    className={styles.formSprite}
                                    loading="lazy"
                                    decoding="async"
                                />
                            )}
                            <span className={styles.formLabel}>
                                {form.formLabel}
                            </span>
                        </button>
                    );
                })}
            </div>
            {isBusy && forms.length === 0 && totalVarieties > 0 && (
                <span className={styles.loadingHint}>Cargando formas...</span>
            )}
        </div>
    );
}
