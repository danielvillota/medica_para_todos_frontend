import "../components/Sidebar.css"
function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Medica Para Todos</h2>

            <nav>
                <ul>
                    <li>Inicio</li>
                    <li>Usuarios</li>
                    <li>Asesores</li>
                    <li>Clientes</li>
                    <li>Afiliaciones</li>
                </ul>
            </nav>

            <button>
                Cerrar sesión
            </button>
        </aside>
    );
}

export default Sidebar;