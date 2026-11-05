
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AfiliacionRegistro from "../../components/afiliacion/AfiliacionRegistro";

interface Afiliacion {
  id: number;
  nombre_titular: string;
  cedula_titular: string;
  direccion_titular: string;
  municipio_titular: string;
  fecha_inicio: string;
  fecha_fin: string;
  contrato: string;
  provisional: string;
  is_active: boolean;
  id_titular: number;
  id_asesor: number;
}

interface RespuestaAfiliaciones {
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: Afiliacion[];
}

const API_URL = "http://127.0.0.1:8000/api";

function Afiliaciones() {
  const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [contrato, setContrato] = useState("");
  const [provisional, setProvisional] = useState("");
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerAfiliaciones = async () => {
      setCargando(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        const parametros = new URLSearchParams();

        parametros.append("page", String(pagina));

        if (contrato.trim()) {
          parametros.append("contrato", contrato.trim());
        }

        if (provisional.trim()) {
          parametros.append("provisional", provisional.trim());
        }

        if (nombre.trim()) {
          parametros.append("nombre", nombre.trim());
        }

        if (cedula.trim()) {
          parametros.append("cedula", cedula.trim());
        }

        const respuesta = await fetch(
          `${API_URL}/afiliaciones/?${parametros.toString()}`,
          {
            headers: {
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
          }
        );

        const resultado: RespuestaAfiliaciones = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las afiliaciones.");
        }

        setAfiliaciones(resultado.results);
        setTotalPaginas(resultado.total_pages);
        setTotalRegistros(resultado.count);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar las afiliaciones."
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerAfiliaciones();
  }, [pagina, contrato, provisional, nombre, cedula]);

  return (
    <section className="afiliaciones-lista">
      <h2>Lista de afiliaciones</h2>
      <button type="button" onClick={() => navigate("/afiliaciones/crear")}>
        Registrar afiliación
      </button>

      <div className="filtros-afiliaciones">
        <input
          type="text"
          placeholder="Buscar por contrato"
          value={contrato}
          onChange={(e) => {
            setContrato(e.target.value);
            setPagina(1);
          }}
        />

        <input
          type="text"
          placeholder="Buscar por provisional"
          value={provisional}
          onChange={(e) => {
            setProvisional(e.target.value);
            setPagina(1);
          }}
        />

        <input
          type="text"
          placeholder="Buscar por nombre del titular"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setPagina(1);
          }}
        />

        <input
          type="text"
          placeholder="Buscar por cédula"
          value={cedula}
          onChange={(e) => {
            setCedula(e.target.value);
            setPagina(1);
          }}
        />

        <button
          type="button"
          onClick={() => {
            setContrato("");
            setProvisional("");
            setNombre("");
            setCedula("");
            setPagina(1);
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <p>
        Total de afiliaciones: <strong>{totalRegistros}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando afiliaciones...</p>
      ) : afiliaciones.length === 0 ? (
        <p>No hay afiliaciones para mostrar.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Provisional</th>
                <th>Nombre del titular</th>
                <th>Cédula</th>
                <th>Dirección</th>
                <th>Municipio</th>
                <th>Fecha de inicio</th>
                <th>Fecha de finalización</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {afiliaciones.map((afiliacion) => (
                <tr key={afiliacion.id}>
                  <td>{afiliacion.contrato}</td>
                  <td>{afiliacion.provisional}</td>
                  <td>{afiliacion.nombre_titular}</td>
                  <td>{afiliacion.cedula_titular}</td>
                  <td>{afiliacion.direccion_titular || "—"}</td>
                  <td>{afiliacion.municipio_titular}</td>
                  <td>{afiliacion.fecha_inicio}</td>
                  <td>{afiliacion.fecha_fin}</td>
                  <td>
                    {afiliacion.is_active ? "Activa" : "Inactiva"}
                  </td>
                  <td>
                    <button type="button" onClick={()=>navigate(`/afiliaciones/${afiliacion.id}`)}>Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="paginacion">
        <button
          type="button"
          disabled={pagina === 1 || cargando}
          onClick={() => setPagina((actual) => actual - 1)}
        >
          Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          type="button"
          disabled={pagina >= totalPaginas || cargando}
          onClick={() => setPagina((actual) => actual + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}

export default Afiliaciones;
