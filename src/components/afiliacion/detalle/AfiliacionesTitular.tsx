import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import './AfiliacionesTitular.css'

const API_URL = "http://127.0.0.1:8000/api";

interface Afiliacion {
  id: number;
  contrato: string;
  provisional: string;
  valor: string;
  fecha_inicio: string;
  fecha_fin: string;
  is_active: boolean;
  id_asesor:number;
}

interface Props {
  idTitular: number;
}

interface RespuestaAfiliaciones {
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: Afiliacion[];
}

interface Asesor {
  id: number;
  nombre: string;
  codigo: string;
  is_active: boolean;
}

interface FormularioAfiliacion {
  contrato: string;
  provisional: string;
  valor: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_asesor: string;
}

const formularioVacio: FormularioAfiliacion = {
  contrato: "",
  provisional: "",
  valor: "",
  fecha_inicio: "",
  fecha_fin: "",
  id_asesor: "",
};

// Convierte fechas como 02-Mar-2024 a 2024-03-02.
// También admite fechas que ya estén en formato ISO.
function convertirFecha(fecha: string): string {
  if (!fecha) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  const meses: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const partes = fecha.split("-");

  if (partes.length !== 3) return "";

  const [dia, mes, anio] = partes;
  const numeroMes = meses[mes];

  if (!numeroMes) return "";

  return `${anio}-${numeroMes}-${dia.padStart(2, "0")}`;
}

function AfiliacionesTitular({ idTitular }: Props) {

  const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [afiliacionSeleccionada, setAfiliacionSeleccionada] =useState<number | null>(null);
  const [formulario, setFormulario] =useState<FormularioAfiliacion>(formularioVacio);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [errorFormulario, setErrorFormulario] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const obtenerAfiliaciones = async () => {
      try {
        setCargando(true);
        setError("");

        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(
          `${API_URL}/afiliaciones/titular/${idTitular}/?page=${pagina}`,
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
          throw new Error(
            "No se pudieron consultar las afiliaciones."
          );
        }

        setAfiliaciones(
          Array.isArray(resultado.results) ? resultado.results : []
        );
        setTotalPaginas(resultado.total_pages || 1);
        setTotalRegistros(resultado.count || 0);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al consultar las afiliaciones."
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerAfiliaciones();
  }, [idTitular, pagina]);

  // Consultar los asesores disponibles para el selector.
  useEffect(() => {
    const obtenerAsesores = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(`${API_URL}/asesores/`, {
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            resultado.message || "No se pudieron consultar los asesores."
          );
        }

        setAsesores(
          Array.isArray(resultado.data) ? resultado.data : []
        );
      } catch (error) {
        setErrorFormulario(
          error instanceof Error
            ? error.message
            : "Error al consultar los asesores."
        );
      }
    };

    obtenerAsesores();
  }, []);

  // Consultar el detalle al pulsar el botón.
  const verDetalle = async (id: number) => {
    try {
      setAfiliacionSeleccionada(id);
      setCargandoDetalle(true);
      setErrorFormulario("");
      setMensaje("");

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

      const afiliacion: Afiliacion = resultado.data;

      setFormulario({
        contrato: afiliacion.contrato,
        provisional: afiliacion.provisional,
        valor: afiliacion.valor,
        fecha_inicio: convertirFecha(afiliacion.fecha_inicio),
        fecha_fin: convertirFecha(afiliacion.fecha_fin),
        id_asesor: String(afiliacion.id_asesor),
      });
    } catch (error) {
      setErrorFormulario(
        error instanceof Error
          ? error.message
          : "Error al consultar el detalle."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cambiarCampo = (
    campo: keyof FormularioAfiliacion,
    valor: string
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  // Guardar los cambios mediante PATCH.
  const actualizarAfiliacion = async (
    evento: React.FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (afiliacionSeleccionada === null) return;

    try {
      setGuardando(true);
      setErrorFormulario("");
      setMensaje("");

      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `${API_URL}/afiliaciones/${afiliacionSeleccionada}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            contrato: formulario.contrato,
            provisional: formulario.provisional,
            valor: formulario.valor,
            fecha_inicio: formulario.fecha_inicio,
            fecha_fin: formulario.fecha_fin,
            id_asesor: Number(formulario.id_asesor),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const errores = resultado.error;

        if (errores && typeof errores === "object") {
          const detalleErrores = Object.entries(errores)
            .map(([campo, mensajes]) => {
              const texto = Array.isArray(mensajes)
                ? mensajes.join(", ")
                : String(mensajes);

              return `${campo}: ${texto}`;
            })
            .join(" | ");

          throw new Error(
            detalleErrores ||
              resultado.message ||
              "No se pudo actualizar la afiliación."
          );
        }

        throw new Error(
          resultado.message ||
            "No se pudo actualizar la afiliación."
        );
      }

      const actualizada: Afiliacion = resultado.data;

      setAfiliaciones((actuales) =>
        actuales.map((item) =>
          item.id === actualizada.id ? actualizada : item
        )
      );

      setFormulario({
        contrato: actualizada.contrato,
        provisional: actualizada.provisional,
        valor: actualizada.valor,
        fecha_inicio: convertirFecha(actualizada.fecha_inicio),
        fecha_fin: convertirFecha(actualizada.fecha_fin),
        id_asesor: String(actualizada.id_asesor),
      });

      setMensaje(
        resultado.message || "Afiliación actualizada exitosamente."
      );
    } catch (error) {
      setErrorFormulario(
        error instanceof Error
          ? error.message
          : "Error al actualizar la afiliación."
      );
    } finally {
      setGuardando(false);
    }
  };

  const desactivarAfiliacion = async (idAfiliacion: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas desactivar esta afiliación?"
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `${API_URL}/afiliaciones/${idAfiliacion}/`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudo desactivar la afiliación."
        );
      }

      // Actualizar el estado de la afiliación en la lista.
      setAfiliaciones((actuales) =>
        actuales.map((afiliacion) =>
          afiliacion.id === idAfiliacion
            ? { ...afiliacion, is_active: false }
            : afiliacion
        )
      );

      // Cerrar el formulario si corresponde a esa afiliación.
      if (afiliacionSeleccionada === idAfiliacion) {
        cancelarEdicion();
      }

      toast.success(
        resultado.message || "Afiliación desactivada."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al desactivar la afiliación."
      );
    }
  };

  const cancelarEdicion = () => {
    setAfiliacionSeleccionada(null);
    setFormulario(formularioVacio);
    setErrorFormulario("");
    setMensaje("");
  };

  return (
    <section className="detalle-seccion">
      <h3 className="titulo-seccion">Afiliaciones del titular</h3>

      <div className="afiliaciones-edicion">
        {/* Lista de afiliaciones a la izquierda */}
        <div className="afiliaciones-listado">
          {cargando && <p>Cargando afiliaciones...</p>}

          {!cargando && error && <p>{error}</p>}

          {!cargando && !error && afiliaciones.length === 0 && (
            <p>Este titular no tiene afiliaciones registradas.</p>
          )}

          {!cargando && !error && afiliaciones.length > 0 && (
            <>
              <div className="tabla-contenedor">
                <table className="tabla-afiliaciones-titular">
                  <thead>
                    <tr>
                      <th>Contrato</th>
                      <th>Provisional</th>
                      <th>Fecha fin</th>
                      <th>Valor</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {afiliaciones.map((afiliacion) => (
                      <tr key={afiliacion.id}>
                        <td>{afiliacion.contrato}</td>
                        <td>{afiliacion.provisional}</td>
                        <td>{afiliacion.fecha_fin}</td>
                        <td>{afiliacion.valor}</td>
                        <td>
                          <span className={afiliacion.is_active ? "estado-activa" : "estado-inactiva"}>
                            {afiliacion.is_active ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => verDetalle(afiliacion.id)}
                            disabled={!afiliacion.is_active || cargandoDetalle}
                          >
                            Detalle
                          </button>
                          {afiliacion.is_active && (
                            <button
                              type="button"
                              className="boton-desactivar"
                              onClick={() => desactivarAfiliacion(afiliacion.id)}
                            >
                              Desactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="paginacion-afiliaciones">
                <span>Total: {totalRegistros}</span>

                <div className="paginacion-botones">
                  <button
                    type="button"
                    onClick={() => setPagina((actual) => actual - 1)}
                    disabled={pagina === 1 || cargando}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPagina((actual) => actual + 1)}
                    disabled={pagina >= totalPaginas || cargando}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Formulario a la derecha */}
        <div className="afiliacion-formulario">
          {afiliacionSeleccionada === null ? (
            <div className="formulario-placeholder">
              <h4>Actualizar afiliación</h4>
              <p>Selecciona una afiliación para ver sus datos y editarla.</p>
            </div>
          ) : cargandoDetalle ? (
            <p>Cargando detalle de la afiliación...</p>
          ) : (
            <form onSubmit={actualizarAfiliacion}>
              <h4>Actualizar afiliación</h4>

              {errorFormulario && (
                <p className="mensaje-error">{errorFormulario}</p>
              )}

              {mensaje && (
                <p className="mensaje-exito">{mensaje}</p>
              )}

              <label htmlFor="contrato">Contrato</label>
              <input
                id="contrato"
                type="text"
                value={formulario.contrato}
                onChange={(e) =>
                  cambiarCampo("contrato", e.target.value)
                }
                required
              />

              <label htmlFor="provisional">Provisional</label>
              <input
                id="provisional"
                type="text"
                value={formulario.provisional}
                onChange={(e) =>
                  cambiarCampo("provisional", e.target.value)
                }
                required
              />

              <label htmlFor="valor">Valor</label>
              <input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={formulario.valor}
                onChange={(e) =>
                  cambiarCampo("valor", e.target.value)
                }
                required
              />

              <label htmlFor="fecha_inicio">Fecha de inicio</label>
              <input
                id="fecha_inicio"
                type="date"
                value={formulario.fecha_inicio}
                onChange={(e) =>
                  cambiarCampo("fecha_inicio", e.target.value)
                }
                required
              />

              <label htmlFor="fecha_fin">Fecha de fin</label>
              <input
                id="fecha_fin"
                type="date"
                value={formulario.fecha_fin}
                onChange={(e) =>
                  cambiarCampo("fecha_fin", e.target.value)
                }
                required
              />

              <label htmlFor="id_asesor">Asesor</label>
              <select
                id="id_asesor"
                value={formulario.id_asesor}
                onChange={(e) =>
                  cambiarCampo("id_asesor", e.target.value)
                }
                required
              >
                <option value="">Selecciona un asesor</option>

                {asesores.map((asesor) => (
                  <option key={asesor.id} value={asesor.id}>
                    {asesor.nombre} - {asesor.codigo}
                  </option>
                ))}
              </select>

              <div className="formulario-acciones">
                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default AfiliacionesTitular;