import { useEffect, useState } from "react";
import PapeleriaRegistro from "../../components/papeleria/PapeleriaRegistro";
import "./Papeleria.css"
import toast from "react-hot-toast";

interface Papeleria {
    id: number;
    nombre_asesor: string;
    tipo_documento: number;
    valor: string;
    created_at: string;
    updated_at: string;
    is_asignado: boolean;
    id_usuario: number;
    id_usuario_updated: number;
    id_asesor: number;
}

const nombresDocumento: Record<number, string> = {
    1: "Contrato",
    2: "Provisional",
    3: "Recibo",
};

function Papeleria() {
    const [papelerias, setPapelerias] = useState<Papeleria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [papeleriaSeleccionada, setPapeleriaSeleccionada] = useState<Papeleria | null>(null);
    const [error, setError] = useState("");
    const [siguiente, setSiguiente] = useState<string | null>(null);
    const [anterior, setAnterior] = useState<string | null>(null);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaActual, setPaginaActual] = useState(1);

    const obtenerPapelerias = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                "http://127.0.0.1:8000/api/papeleria/",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log("Respuesta papeleria:", data);

            setPapelerias(data.results);
            setSiguiente(data.next);
            setAnterior(data.previous);
            setTotalPaginas(data.total_pages);
            setPaginaActual(1);

        } catch (error) {
            console.error(error);
            setError("Ocurrió un error al cargar la papelería");
        } finally {
            setCargando(false);
        }
    };

    
    const eliminarPapeleria = async (papeleria: Papeleria) => {
        if (papeleria.is_asignado) {
            toast.error("No puedes eliminar una papelería asignada");
            return;
        }

        const confirmar = window.confirm(
            `¿Estás seguro de eliminar la papelería ${papeleria.valor}?`
        );

        if (!confirmar) {
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `http://127.0.0.1:8000/api/papeleria/${papeleria.id}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "No se pudo eliminar la papelería");
                return;
            }

            toast.success(data.message || "Papelería eliminada correctamente");

            if (papeleriaSeleccionada?.id === papeleria.id) {
                setPapeleriaSeleccionada(null);
            }

            await obtenerPapelerias();
        } catch (error) {
            console.error("Error al eliminar papelería:", error);
            toast.error("Error de conexión al eliminar la papelería");
        }
    };


    const cambiarPagina = async (url: string, numeroPagina: number) => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            setPapelerias(data.results);
            setSiguiente(data.next);
            setAnterior(data.previous);
            setTotalPaginas(data.total_pages);
            setPaginaActual(numeroPagina);

        } catch (error) {
            console.error(error);
            setError("Ocurrió un error al cambiar de página");
        }
    };

    useEffect(() => {
        obtenerPapelerias();
    }, []);

    if (cargando) {
        return <p>Cargando papelería...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="papeleria-container">
            <div className="lista-papeleria">
                <h1>Papelería</h1>

                <table>
                    <thead>
                        <tr>
                            <th>TIPO DOCUMENTO</th>
                            <th>VALOR</th>
                            <th>ESTADO</th>
                            <th>ASESOR</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>

                    <tbody>
                        {papelerias.map((papeleria) => (
                            <tr key={papeleria.id}>
                                <td>{nombresDocumento[papeleria.tipo_documento]}</td>
                                <td>{papeleria.valor}</td>
                                <td>
                                    {papeleria.is_asignado
                                        ? "Asignado"
                                        : "Disponible"}
                                </td>
                                <td>{papeleria.nombre_asesor}</td>
                                <td>
                                    <button
                                        type="button"
                                        disabled={papeleria.is_asignado}
                                        onClick={() => setPapeleriaSeleccionada(papeleria)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={papeleria.is_asignado}
                                        onClick={() => eliminarPapeleria(papeleria)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <button
                        type="button"
                        disabled={!anterior}
                        onClick={() => anterior && cambiarPagina(anterior, paginaActual - 1)}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaActual} de {totalPaginas}
                    </span>

                    <button
                        type="button"
                        disabled={!siguiente}
                        onClick={() => siguiente && cambiarPagina(siguiente, paginaActual + 1)}
                    >
                        Siguiente
                    </button>
                    
                </div>
            </div>
            <div className="formulario-papeleria">
                <PapeleriaRegistro onPapeleriaCreada={obtenerPapelerias} papeleria={papeleriaSeleccionada} onCancelarEdicion={() => setPapeleriaSeleccionada(null)}/>
            </div>
            
        </div>
    );
}

export default Papeleria;