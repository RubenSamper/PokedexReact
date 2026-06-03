import { useState, useCallback, useRef, useEffect } from "react";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const showToast = useCallback((message, type = "info") => {
        clearTimeout(timer.current);
        setToast({ id: Date.now(), message, type });
        timer.current = setTimeout(hideToast, 3000);
    }, [hideToast]);

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 9999,
                        padding: "12px 24px",
                        borderRadius: "10px",
                        background: toast.type === "success" ? "#4ade80" : toast.type === "error" ? "#f87171" : "#333",
                        color: "#fff",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        pointerEvents: "auto",
                        cursor: "pointer",
                        animation: "toastIn 0.25s ease",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                    }}
                    onClick={hideToast}
                >
                    {toast.message}
                </div>
            )}
            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
