import { useEffect, useState } from "react";
import toast from "react-hot-toast";


interface Papeleria {
    id: number;
    tipo_documento: number;
    valor: string;
    id_asesor: number;
    is_asignado: boolean;
}

interface PapeleriaRegistroProps {
    onPapeleriaCreada: () => void;
    papeleria?: Papeleria | null;
    onCancelarEdicion: () => void;
}

interface Asesor {
    id:number;
    nombre:string;
}

function PapeleriaRegistro({onPapeleriaCreada, papeleria, onCancelarEdicion,}: PapeleriaRegistroProps){

    const [formulario, setFormulario] = useState({tipo_documento: 1, valor: "", id_asesor: "",});

    const [cargando, setCargando] = useState(false);

    const [asesores, setAsesores] = useState<Asesor[]>([])

    useEffect(() => {
        if (papeleria) {
            setFormulario({
                tipo_documento: papeleria.tipo_documento,
                valor: papeleria.valor,
                id_asesor: String(papeleria.id_asesor),
            });
        } else {
            setFormulario({
                tipo_documento: 1,
                valor: "",
                id_asesor: "",
            });
        }
    }, [papeleria]);

    const obtenerAsesores = async () => {
        try {
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

            if (!response.ok) {
                toast.error("No se pudieron cargar los asesores");
                return;
            }

            setAsesores(data.data);

        } catch (error) {
            console.error("Error al consultar asesores:", error);
            toast.error("Error de conexión al consultar asesores");
        }
    };

    useEffect(() => {
        obtenerAsesores();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (papeleria?.is_asignado) {
            toast.error("No puedes modificar una papelería asignada");
            return;
        }

        setCargando(true);

        try {
            const token = localStorage.getItem("access_token");

            const url = papeleria
            ? `http://127.0.0.1:8000/api/papeleria/${papeleria.id}/`
            : "http://127.0.0.1:8000/api/papeleria/";

            const response = await fetch(url, {
                method: papeleria ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tipo_documento: formulario.tipo_documento,
                    valor: formulario.valor,
                    id_asesor: Number(formulario.id_asesor),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error al registrar papelería:", data);
                if (data.errors) {
                    const mensajes = Object.values(data.errors).flat();
                    toast.error(mensajes.join(" "));
                } else {
                    toast.error(data.message || "Error al registrar la papelería");
                }
                return;
            }

            toast.success(data.message);
            setFormulario({
                tipo_documento: 1,
                valor: "",
                id_asesor: "",
            });

            onCancelarEdicion();
            onPapeleriaCreada();

        } catch (error) {
            console.error("Error de conexión:", error);
            toast.error("No se pudo conectar con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return(
        <div>
            <h2>{papeleria ? "Editar papelería" : "Registrar papelería"}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tipo de documento</label>
                    <select
                        value={formulario.tipo_documento}
                        onChange={(event) =>
                            setFormulario({
                                ...formulario,
                                tipo_documento: Number(event.target.value),
                            })
                        }
                    >
                        <option value={1}>Contrato</option>
                        <option value={2}>Provisional</option>
                        <option value={3}>Recibo</option>
                    </select>
                </div>
                <div>
                    <label>Valor</label>
                    <input
                        type="text"
                        value={formulario.valor}
                        onChange={(event)=>
                            setFormulario({
                                ...formulario,
                                valor:event.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <label>Asesor</label>
                    <select
                        id="id_asesor"
                        value={formulario.id_asesor}
                        onChange={(event) =>
                            setFormulario({
                                ...formulario,
                                id_asesor: event.target.value,
                            })
                        }
                    >
                        <option value="">Seleccione un asesor</option>

                        {asesores.map((asesor) => (
                            <option key={asesor.id} value={asesor.id}>
                                {asesor.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={cargando || !!papeleria?.is_asignado}>
                    {cargando? "Guardando...": papeleria? "Guardar cambios": "Registrar"}
                </button>

                {papeleria && (
                    <button
                        type="button"
                        onClick={onCancelarEdicion}
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                )}
            </form>
        </div>
    );

}
export default PapeleriaRegistro;