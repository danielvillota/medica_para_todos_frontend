import "../components/Sidebar.css"
import { Link, useNavigate } from "react-router-dom";
function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/", { replace: true });
    };

    return (
        <aside className="sidebar">
            <h2>Medica Para Todos</h2>

            <nav>
                <ul>
                    <li>Inicio</li>
                    <li>Usuarios</li>
                    <li><Link to="/asesores">Asesores</Link></li>
                    <li>Clientes</li>
                    <li>Afiliaciones</li>
                </ul>
            </nav>

            <button onClick={handleLogout}>
                Cerrar sesión
            </button>
        </aside>
    );
}

export default Sidebar;