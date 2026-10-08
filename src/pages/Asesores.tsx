import { useEffect, useState } from "react";
import AsesorRegistro from "../components/AsesorRegistro";
import "./Asesores.css"
import toast from "react-hot-toast";

interface Asesor {
    id: number;
    nombre: string;
    codigo: string;
    cedula: string;
    direccion: string;
    celular: string;
    is_active: boolean;
}

function Asesores() {
    const [asesores, setAsesores] = useState<Asesor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [asesorSeleccionado, setAsesorSeleccionado] = useState("");
    const [formulario, setFormulario] = useState({
        nombre: "",
        codigo: "",
        cedula: "",
        direccion: "",
        celular: "",
    });
    const asesor = asesores.find(
        (asesor) => asesor.id.toString() === asesorSeleccionado
    );

    const obtenerAsesores = async () => {
            try{
                const token = localStorage.getItem("access_token");

                const response = await fetch(
                    "http://127.0.0.1:8000/api/asesores/",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                console.log("5. Data:", data);

                setAsesores(data.data);
            }catch(error){
                console.error(error);
                setError("Ocurrió un error al cargar los asesores");
            }finally {
                setCargando(false);
            }
    };

    useEffect(() => {
        obtenerAsesores();
    }, []);

    if (cargando) {
        return <p>Cargando asesores...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const limpiarSeleccion = () => {
        setAsesorSeleccionado("");
        setFormulario({
            nombre: "",
            codigo: "",
            cedula: "",
            direccion: "",
            celular: "",
        });
    };

    const desactivarAsesor = async () => {
        if (!asesor) {
            return;
        }
        const confirmar = window.confirm(
            "¿Está seguro de que desea desactivar este asesor?"
        );

        if (!confirmar) {
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `http://127.0.0.1:8000/api/asesores/${asesor.id}/`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log("Respuesta DELETE:", data);

            if (!response.ok) {
                console.error("Error al desactivar:", data);
                return;
            }

            toast.success(data.message);

            await obtenerAsesores();

            limpiarSeleccion();

        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="asesores-container">
            <div className="lista-asesores">
                <h1>Asesores Activos</h1>
                <table>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>CODIGO</th>
                            <th>CEDULA</th>
                            <th>DIRECCION</th>
                            <th>CELULAR</th>
                            <th>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asesores.map((asesor) =>(
                            <tr key={asesor.id}>
                                <td>{asesor.nombre}</td>
                                <td>{asesor.codigo}</td>
                                <td>{asesor.cedula}</td>
                                <td>{asesor.direccion}</td>
                                <td>{asesor.celular}</td>
                                <td>{asesor.is_active ? "Activo" : "Inactivo"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="formulario-asesores">
                <h3>Seleccione un asesor para modificarlo</h3>
                <select
                    value={asesorSeleccionado}
                    onChange={(event) => {
                        const id = event.target.value;

                        setAsesorSeleccionado(id);

                        const asesorSeleccionado = asesores.find(
                            (asesor) => asesor.id.toString() === id
                        );

                        if (asesorSeleccionado) {
                            setFormulario({
                                nombre: asesorSeleccionado.nombre,
                                codigo: asesorSeleccionado.codigo,
                                cedula: asesorSeleccionado.cedula,
                                direccion: asesorSeleccionado.direccion,
                                celular: asesorSeleccionado.celular,
                            });
                        } else {
                            setFormulario({
                                nombre: "",
                                codigo: "",
                                cedula: "",
                                direccion: "",
                                celular: "",
                            });
                        }
                    }}
                >
                    <option value="">Seleccione un asesor</option>

                    {asesores.map((asesor) => (
                        <option key={asesor.id} value={asesor.id}>
                            {asesor.nombre}{" "+asesor.codigo}
                        </option>
                    ))}
                </select>
                <AsesorRegistro onAsesorCreado={obtenerAsesores} asesor={asesor} formulario={formulario} setFormulario={setFormulario} limpiarSeleccion={limpiarSeleccion}/>
                {asesor && (
                    <button type="button" onClick={desactivarAsesor}>
                        Desactivar asesor
                    </button>
                )}
            </div>
        </div>
    );
}

export default Asesores;