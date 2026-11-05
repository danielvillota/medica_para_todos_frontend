import { useEffect, useState } from "react";
import './AfiliacionesTitular.css'

const API_URL = "http://127.0.0.1:8000/api";

interface Titular {
  id: number;
  nombre_municipio: string;
  nombre: string;
  cedula: string;
  celular: string | null;
  direccion: string | null;
  id_municipio: number;
}

interface Props {
  idTitular: number;
  actualizacion: number;
}

function DatosTitular({ idTitular, actualizacion }: Props) {
  const [titular, setTitular] = useState<Titular | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerTitular = async () => {
      setCargando(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(
          `${API_URL}/titulares/${idTitular}/`,
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

        setTitular(resultado.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al consultar el titular."
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerTitular();
  }, [idTitular, actualizacion]);

  if (cargando) return <p>Cargando datos del titular...</p>;
  if (error) return <p>{error}</p>;
  if (!titular) return <p>No se encontró el titular.</p>;

  return (
    <section className="detalle-seccion">
      <h3 className="titulo-seccion">Datos del titular</h3>

      <p><strong>Nombre:</strong> {titular.nombre}</p>
      <p><strong>Cédula:</strong> {titular.cedula}</p>
      <p><strong>Celular:</strong> {titular.celular || "No registrado"}</p>
      <p><strong>Dirección:</strong> {titular.direccion || "No registrada"}</p>
      <p><strong>Municipio:</strong> {titular.nombre_municipio}</p>
    </section>
  );
}

export default DatosTitular;