import { BiXCircle } from "react-icons/bi";

export default function ErrorMessage({ message = "Ha ocurrido un error" }) {
    return (
        <div style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text)",
            fontSize: "1.2rem",
        }}>
            <p><BiXCircle size={20} /> {message}</p>
        </div>
    );
}
