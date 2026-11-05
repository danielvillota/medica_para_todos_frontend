import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatosTitular from "./detalle/DatosTitular";
import './AfiliacionDetalle.css'
import AfiliacionesTitular from "./detalle/AfiliacionesTitular";
import ActualizarTitular from "./detalle/ActualizarTitular";

const API_URL = "http://127.0.0.1:8000/api";

interface Afiliacion {
  id: number;
  id_titular: number;
}

function AfiliacionDetalle(){

    const { id } = useParams();
    const [afiliacion, setAfiliacion] = useState<Afiliacion | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [actualizacionTitular, setActualizacionTitular] = useState(0);

    useEffect(() => {
        const obtenerAfiliacion = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const respuesta = await fetch(
            `${API_URL}/afiliaciones/${id}/`,
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
                resultado.message || "No se pudo consultar la afiliación."
            );
            }

            setAfiliacion(resultado.data);
        } catch (error) {
            setError(
            error instanceof Error
                ? error.message
                : "Error al consultar la afiliación."
            );
        } finally {
            setCargando(false);
        }
        };

        obtenerAfiliacion();
    }, [id]);

    if (cargando) {
        return <p>Cargando afiliación...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!afiliacion) {
        return <p>No se encontró la afiliación.</p>;
    }

    return(
        <div className="detalle-contenedor">
            <div className="detalle-fila-titular">
                <DatosTitular idTitular={afiliacion.id_titular} actualizacion={actualizacionTitular} />
                <ActualizarTitular idTitular={afiliacion.id_titular} alActualizar={() =>setActualizacionTitular((actual) => actual + 1)}/>
            </div>

            <div className="detalle-fila">
                <AfiliacionesTitular idTitular={afiliacion.id_titular} />
            </div>

            <div className="detalle-fila">
                
            </div>
        </div>
    );

}
export default AfiliacionDetalle;