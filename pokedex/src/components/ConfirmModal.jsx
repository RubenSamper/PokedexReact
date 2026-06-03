import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel} type="button">
                        Cancelar
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm} type="button">
                        Borrar
                    </button>
                </div>
            </div>
        </div>
    );
}
