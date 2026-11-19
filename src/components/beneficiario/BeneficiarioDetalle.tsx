import { useState, useEffect } from "react";
import BeneficiarioActualizar from "./BeneficiarioActualizar";
import './BeneficiarioDetalle.css'
import BeneficiarioRegistro from "./BeneficiarioRegistro";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000/api";

interface Beneficiario{
    id:number;
    nombre:string;

}

interface Props {
  idTitular: number;
}

function BeneficiarioDetalle({ idTitular}: Props){
    const [beneficiarios, setBeneficiarios]=useState<Beneficiario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] =useState<Beneficiario | null>(null);
    const [modoFormulario, setModoFormulario] = useState<"registro" | "actualizar" | null>(null);
    useEffect(() => {
        const obtenerBeneficiario = async () => {
            setCargando(true);
            setError("");
            try{
                const token = localStorage.getItem("access_token");
                const respuesta = await fetch(
                    `${API_URL}/beneficiarios/titular/${idTitular}/`,
                    {
                        headers: {
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                        },
                    }
                );
                const resultado = await respuesta.json();
                if (!respuesta.ok) {
                    throw new Error(
                        resultado.message || "No se pudo consultar el titular."
                    );
                }
                setBeneficiarios(resultado.data);
            }catch(error){
                setError(
                    error instanceof Error
                        ? error.message
                        : "Error al consultar el titular."
                );
            }finally {
                setCargando(false);
            }
        }
        obtenerBeneficiario();
    },[idTitular]);

    const actualizarListado = (beneficiarioActualizado: Beneficiario) => {
        setBeneficiarios((anteriores) =>
        anteriores.map((beneficiario) =>
            beneficiario.id === beneficiarioActualizado.id
            ? beneficiarioActualizado
            : beneficiario
        )
        );

        setBeneficiarioSeleccionado(null);
        setModoFormulario(null);
    };

    const eliminarBeneficiario = async (id: number) => {
        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar este beneficiario?"
        );

        if (!confirmar) return;

        try {
            const token = localStorage.getItem("access_token");

            const respuesta = await fetch(
                `${API_URL}/beneficiarios/${id}/`,
                {
                    method: "DELETE",
                    headers: {
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                toast.error(
                    resultado.message || "No se pudo eliminar el beneficiario."
                );
                return;
            }

            toast.success(
                resultado.message || "Beneficiario eliminado correctamente."
            );

            setBeneficiarios((anteriores) =>
                anteriores.filter((beneficiario) => beneficiario.id !== id)
            );

            setBeneficiarioSeleccionado(null);
            setModoFormulario(null);

        } catch {
            toast.error("Ocurrió un error al eliminar el beneficiario.");
        }
    };

    if (cargando) return <p>Cargando datos de beneficiarios...</p>;
    if (error) return <p>{error}</p>;

    return(
        <>
        <section className="detalle-seccion">
            <h3 className="titulo-seccion">Beneficiarios</h3>
            <button
                type="button"
                onClick={() => {
                    setBeneficiarioSeleccionado(null);
                    setModoFormulario("registro");
                }}
                >
                Registrar beneficiario
            </button>
            <div className="beneficiarios-contenedor">
                {/* Columna izquierda: listado */}
                <div className="beneficiarios-listado">
                {beneficiarios.length === 0 ? (
                    <p>Este titular no tiene beneficiarios registrados.</p>
                ) : (
                        <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beneficiarios.map((beneficiario) =>(
                                <tr key={beneficiario.id}>
                                    <td>{beneficiario.nombre}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>{
                                                setBeneficiarioSeleccionado(beneficiario);
                                                setModoFormulario("actualizar");
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => eliminarBeneficiario(beneficiario.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                </div>

                {/* Columna derecha: formulario */}
                <div className="beneficiarios-formulario">
                        {modoFormulario === "registro" && (
                        <>
                        <h4>Registrar beneficiario</h4>

                        <BeneficiarioRegistro
                            idTitular={idTitular}
                            alRegistrar={(nuevoBeneficiario) => {
                            setBeneficiarios((anteriores) => [
                                ...anteriores,
                                nuevoBeneficiario,
                            ]);
                            setModoFormulario(null);
                            }}
                            alCancelar={() => setModoFormulario(null)}
                        />
                        </>
                    )}

                    {modoFormulario === "actualizar" && beneficiarioSeleccionado && (
                        <>
                        <h4>Actualizar beneficiario</h4>

                        <BeneficiarioActualizar
                            beneficiario={beneficiarioSeleccionado}
                            alActualizar={actualizarListado}
                            alCancelar={() => {
                            setBeneficiarioSeleccionado(null);
                            setModoFormulario(null);
                            }}
                        />
                        </>
                    )}

                    {modoFormulario === null && (
                        <p>Selecciona una opción para gestionar los beneficiarios.</p>
                    )}
                </div>
            </div>
        </section>
        </>
    );
}
export default BeneficiarioDetalle;