
import { useEffect, useState } from "react";
import "./AfiliacionRegistro.css";
import toast from "react-hot-toast";

interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
}

interface TitularDatos {
  nombre: string;
  cedula: string;
  celular: string;
  id_municipio: string;
  direccion: string;
}

interface AfiliacionDatos {
  contrato: string;
  provisional: string;
  valor: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_asesor: string;
}

const API_URL = "http://127.0.0.1:8000/api";

function AfiliacionRegistro() {
  const [titular, setTitular] = useState<TitularDatos>({
    nombre: "",
    cedula: "",
    celular: "",
    id_municipio: "",
    direccion: "",
  });

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [idDepartamento, setIdDepartamento] = useState("");

  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [error, setError] = useState("");

  const [idTitular, setIdTitular] = useState<number | null>(null);
  const [procesandoTitular, setProcesandoTitular] = useState(false);

  const [paso, setPaso] = useState(1);
  const [afiliacion, setAfiliacion] = useState<AfiliacionDatos>({
    contrato: "",
    provisional: "",
    valor: "",
    fecha_inicio: "",
    fecha_fin: "",
    id_asesor: "",
    });

    const [asesores, setAsesores] = useState<{ id: number; nombre: string; codigo: string }[]>([]);
    const [cargandoAsesores, setCargandoAsesores] = useState(false);
    const [procesandoAfiliacion, setProcesandoAfiliacion] = useState(false);

  useEffect(() => {
    const obtenerDepartamentos = async () => {
      setCargandoDepartamentos(true);
      setError("");

      try {
        const respuesta = await fetch(`${API_URL}/ubicaciones/`);

        if (!respuesta.ok) {
          throw new Error("No fue posible cargar los departamentos.");
        }

        const resultado = await respuesta.json();
        setDepartamentos(resultado.data);
      } catch {
        setError("Error al cargar los departamentos.");
      } finally {
        setCargandoDepartamentos(false);
      }
    };

    obtenerDepartamentos();
  }, []);

  useEffect(() => {
    if (!idDepartamento) {
      setMunicipios([]);
      return;
    }

    const obtenerMunicipios = async () => {
      setCargandoMunicipios(true);
      setMunicipios([]);
      setTitular((anterior) => ({
        ...anterior,
        id_municipio: "",
      }));
      setError("");

      try {
        const respuesta = await fetch(
          `${API_URL}/ubicaciones/${idDepartamento}/`
        );

        if (!respuesta.ok) {
          throw new Error("No fue posible cargar los municipios.");
        }

        const resultado = await respuesta.json();
        setMunicipios(resultado.data);
      } catch {
        setError("Error al cargar los municipios.");
      } finally {
        setCargandoMunicipios(false);
      }
    };

    obtenerMunicipios();
  }, [idDepartamento]);

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target;

    setTitular((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const consultarTitular = async () => {
    const cedula = titular.cedula.trim();

    if (!cedula) {
      setError("Primero debes ingresar la cédula.");
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `${API_URL}/titulares/?cedula=${encodeURIComponent(cedula)}`,
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

      if (resultado.existe && resultado.data) {
        const datos = resultado.data;

        // Cargar los datos del titular encontrado
        setTitular({
          nombre: datos.nombre || "",
          cedula: datos.cedula || "",
          celular: datos.celular || "",
          id_municipio: String(datos.id_municipio || ""),
          direccion: datos.direccion || "",
        });

        // Guardar el ID para utilizar el titular existente
        setIdTitular(datos.id);

        setError("");

        // Pasar directamente al paso 2
        setPaso(2);

        alert("Titular encontrado. Puedes continuar con la afiliación.");
      } else {
        // No existe: permitir diligenciar un titular nuevo
        setIdTitular(null);

        setTitular((actual) => ({
          ...actual,
          nombre: "",
          celular: "",
          direccion: "",
          id_municipio: "",
        }));

        setIdDepartamento("");

        alert("El titular no existe. Puedes completar sus datos.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al consultar el titular."
      );
    }
  };

  
    const continuar = async (evento: React.FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setError("");

        if (!titular.id_municipio) {
            setError("Selecciona el municipio del titular.");
            return;
        }

        setProcesandoTitular(true);

        try {
            // 1. Consultar si el titular ya existe por su cédula.
            const respuestaConsulta = await fetch(
            `${API_URL}/titulares/?cedula=${encodeURIComponent(titular.cedula.trim())}`
            );

            const resultadoConsulta = await respuestaConsulta.json();

            if (!respuestaConsulta.ok) {
            throw new Error(
                resultadoConsulta.message || "No se pudo consultar el titular."
            );
            }

            let idEncontrado: number;

            if (resultadoConsulta.existe) {
            // 2. Si existe, reutilizar su ID.
            idEncontrado = resultadoConsulta.data.id;
            } else {
            // 3. Si no existe, registrar el titular.
            const respuestaCreacion = await fetch(`${API_URL}/titulares/`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                nombre: titular.nombre.trim(),
                cedula: titular.cedula.trim(),
                celular: titular.celular.trim(),
                direccion: titular.direccion.trim(),
                id_municipio: Number(titular.id_municipio),
                }),
            });

            const resultadoCreacion = await respuestaCreacion.json();

            if (!respuestaCreacion.ok) {
                const detalleError = resultadoCreacion.error
                ? JSON.stringify(resultadoCreacion.error)
                : resultadoCreacion.message;

                throw new Error(
                detalleError || "No se pudo registrar el titular."
                );
            }

            idEncontrado = resultadoCreacion.data.id;
            }

            // 4. Guardar el ID para utilizarlo en el segundo paso.
            setIdTitular(idEncontrado);
            setPaso(2);
        } catch (error) {
            setError(
            error instanceof Error
                ? error.message
                : "Ocurrió un error al procesar el titular."
            );
        } finally {
            setProcesandoTitular(false);
        }
    };

    useEffect(() => {
        if (paso !== 2) return;

        const obtenerAsesores = async () => {
            setCargandoAsesores(true);
            setError("");

            try {
            const respuesta = await fetch(`${API_URL}/asesores/`);

            if (!respuesta.ok) {
                throw new Error("No fue posible cargar los asesores.");
            }

            const resultado = await respuesta.json();
            setAsesores(resultado.data);
            } catch {
            setError("Error al cargar los asesores.");
            } finally {
            setCargandoAsesores(false);
            }
        };

        obtenerAsesores();
    }, [paso]);
  
  const manejarCambioAfiliacion = (evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = evento.target;

    setAfiliacion((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  
  const registrarAfiliacion = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");

    if (idTitular === null) {
      toast.error("Primero debes validar los datos del titular.");
      setPaso(1);
      return;
    }

    if (afiliacion.fecha_fin < afiliacion.fecha_inicio) {
      toast.error("La fecha de finalización no puede ser anterior a la fecha de inicio.");
      return;
    }

    setProcesandoAfiliacion(true);

    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(`${API_URL}/afiliaciones/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contrato: afiliacion.contrato.trim(),
          provisional: afiliacion.provisional.trim(),
          valor: afiliacion.valor,
          fecha_inicio: afiliacion.fecha_inicio,
          fecha_fin: afiliacion.fecha_fin,
          id_titular: idTitular,
          id_asesor: Number(afiliacion.id_asesor),
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const errores = resultado.error;

        let mensaje = resultado.message || "No se pudo registrar la afiliación.";

        if (errores && typeof errores === "object") {
          mensaje = Object.entries(errores)
            .map(([campo, detalle]) => {
              const texto = Array.isArray(detalle)
                ? detalle.join(", ")
                : String(detalle);

                toast.error(`${campo}: ${texto}`, {
                  duration: 6000,
                });

            })
            .join("\n");
        }

        throw new Error(mensaje);
      }

      toast.success(resultado.message || "Afiliación registrada exitosamente.");

      // Limpiar los campos del titular
      setTitular({
        nombre: "",
        cedula: "",
        celular: "",
        id_municipio: "",
        direccion: "",
      });

      // Limpiar el departamento seleccionado
      setIdDepartamento("");

      // Limpiar el ID del titular
      setIdTitular(null);

      // Limpiar los datos de la afiliación.
      setAfiliacion({
        contrato: "",
        provisional: "",
        valor: "",
        fecha_inicio: "",
        fecha_fin: "",
        id_asesor: "",
      });

      // Limpiar municipios y errores
      setMunicipios([]);
      setError("");

      // Volver al primer paso conservando los datos del titular.
      setPaso(1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar la afiliación."
      );
    } finally {
      setProcesandoAfiliacion(false);
    }
  };

  return (
    <section className="afiliacion-registro">
      <h2>Crear afiliación</h2>
      <p>Paso {paso} de 2: {paso === 1 ? "datos del titular" : "datos de la afiliación"}</p>

      {error && <p className="afiliacion-error">{error}</p>}

      {paso === 1 ? (
        <form onSubmit={continuar}>
          <div className="campo-cedula">
            <label htmlFor="nombre">Cedula</label>
            <input
              type="text"
              name="cedula"
              value={titular.cedula}
              onChange={(evento) => {
                manejarCambio(evento);
                setIdTitular(null);
              }}
              placeholder="Ingrese la cédula"
              required
            />

            <button type="button" onClick={consultarTitular}>
              Consultar
            </button>
          </div>
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            value={titular.nombre}
            onChange={manejarCambio}
            maxLength={100}
            required
          />

          <label htmlFor="celular">Celular</label>
          <input
            id="celular"
            name="celular"
            value={titular.celular}
            onChange={manejarCambio}
            maxLength={10}
          />

          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            name="direccion"
            value={titular.direccion}
            onChange={manejarCambio}
            maxLength={50}
          />

          <label htmlFor="departamento">Departamento</label>
          <select
            id="departamento"
            value={idDepartamento}
            onChange={(evento) => setIdDepartamento(evento.target.value)}
            required
          >
            <option value="">
              {cargandoDepartamentos
                ? "Cargando departamentos..."
                : "Selecciona un departamento"}
            </option>

            {departamentos.map((departamento) => (
              <option key={departamento.id} value={departamento.id}>
                {departamento.nombre}
              </option>
            ))}
          </select>

          <label htmlFor="id_municipio">Municipio</label>
          <select
            id="id_municipio"
            name="id_municipio"
            value={titular.id_municipio}
            onChange={manejarCambio}
            disabled={!idDepartamento || cargandoMunicipios}
            required
          >
            <option value="">
              {cargandoMunicipios
                ? "Cargando municipios..."
                : "Selecciona un municipio"}
            </option>

            {municipios.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </option>
            ))}
          </select>

          <button type="submit" disabled={procesandoTitular}>
            {procesandoTitular ? "Validando titular..." : "Continuar"}
          </button>
        </form>
      ) : (
        <form onSubmit={registrarAfiliacion}>
          <label htmlFor="contrato">Número de contrato</label>
          <input
            id="contrato"
            name="contrato"
            value={afiliacion.contrato}
            onChange={manejarCambioAfiliacion}
            maxLength={6}
            required
          />

          <label htmlFor="provisional">Número provisional</label>
          <input
            id="provisional"
            name="provisional"
            value={afiliacion.provisional}
            onChange={manejarCambioAfiliacion}
            maxLength={6}
            required
          />

          <label htmlFor="valor">Valor</label>
          <input
            id="valor"
            name="valor"
            type="number"
            min="0"
            step="0.01"
            value={afiliacion.valor}
            onChange={manejarCambioAfiliacion}
            required
          />

          <label htmlFor="fecha_inicio">Fecha de inicio</label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            value={afiliacion.fecha_inicio}
            onChange={manejarCambioAfiliacion}
            required
          />

          <label htmlFor="fecha_fin">Fecha de finalización</label>
          <input
            id="fecha_fin"
            name="fecha_fin"
            type="date"
            value={afiliacion.fecha_fin}
            onChange={manejarCambioAfiliacion}
            required
          />

          <label htmlFor="id_asesor">Asesor</label>
          <select
            id="id_asesor"
            name="id_asesor"
            value={afiliacion.id_asesor}
            onChange={manejarCambioAfiliacion}
            required
            disabled={cargandoAsesores}
          >
            <option value="">
              {cargandoAsesores
                ? "Cargando asesores..."
                : "Selecciona un asesor"}
            </option>

            {asesores.map((asesor) => (
              <option key={asesor.id} value={asesor.id}>
                {asesor.nombre} - {asesor.codigo}
              </option>
            ))}
          </select>

          <button type="button" onClick={() => setPaso(1)}>
            Volver
          </button>

          <button type="submit" disabled={procesandoAfiliacion}>{procesandoAfiliacion
              ? "Registrando afiliación..."
              : "Registrar afiliación"}
          </button>
        </form>
      )}
  </section>
  );
}

export default AfiliacionRegistro;
