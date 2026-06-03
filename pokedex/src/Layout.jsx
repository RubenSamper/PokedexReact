import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiSun, BiMoon, BiX, BiDiamond, BiHome, BiBarChartAlt, BiGrid, BiShield, BiBuildings, BiStar } from "react-icons/bi";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem("pokedex_theme");
        return saved !== null ? saved === "dark" : true;
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        localStorage.setItem("pokedex_theme", dark ? "dark" : "light");
    }, [dark]);

    // Bloquear scroll del body cuando el menú está abierto
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <button
                    className={styles.hamburger}
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Menú"
                >
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ""}`} />
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ""}`} />
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ""}`} />
                </button>

                <h1 className={styles.logo}>Pokédex</h1>

                <button
                    className={styles.themeToggle}
                    onClick={() => setDark((d) => !d)}
                >
                    {dark ? <BiSun size={20} color="white" /> : <BiMoon size={20} />}
                </button>
            </header>

            {/* Overlay */}
            {menuOpen && (
                <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
            )}

            {/* Drawer lateral */}
            <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Menú</h2>
                    <button
                        className={styles.drawerClose}
                        onClick={() => setMenuOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <BiX size={20} />
                    </button>
                </div>

                <nav className={styles.drawerNav}>
                    <span className={styles.navGroupLabel}>Pokédex</span>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/")}
                    >
                        <BiHome size={18} /> Pokédex
                    </button>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/compare")}
                    >
                        <BiBarChartAlt size={18} /> Comparar Pokémon
                    </button>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/favorites")}
                    >
                        <BiStar size={18} /> Favoritos
                    </button>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/items")}
                    >
                        <BiGrid size={18} /> Objetos
                    </button>

                    <span className={styles.navGroupLabel}>Equipos</span>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/teams")}
                    >
                        <BiShield size={18} /> Equipos Cobblemon
                    </button>
                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/builder")}
                    >
                        <BiBuildings size={18} /> Creador de equipos
                    </button>

                    <button
                        className={styles.drawerItem}
                        type="button"
                        onClick={() => handleNavigation("/shinies")}
                    >
                        <BiDiamond size={18} /> Pokémon shiny
                    </button>
                </nav>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
