
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000/api";

interface Titular {
  id: number;
  nombre: string;
  cedula: string;
  celular: string | null;
  direccion: string | null;
  id_municipio: number;
  id_departamento: number;
  nombre_municipio: string;
}

interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
  departamento_nombre: string;
}

interface Props {
  idTitular: number;
  alActualizar: () => void;
}

interface FormularioTitular {
  nombre: string;
  cedula: string;
  celular: string;
  direccion: string;
  id_departamento: string;
  id_municipio: string;
}

const formularioVacio: FormularioTitular = {
  nombre: "",
  cedula: "",
  celular: "",
  direccion: "",
  id_departamento: "",
  id_municipio: "",
};

function ActualizarTitular({ idTitular, alActualizar }: Props) {
  const [formulario, setFormulario] =
    useState<FormularioTitular>(formularioVacio);

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Consultar los departamentos.
  useEffect(() => {
    const obtenerDepartamentos = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(`${API_URL}/ubicaciones/`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            resultado.message || "No se pudieron consultar los departamentos."
          );
        }

        setDepartamentos(
          Array.isArray(resultado.data)
            ? resultado.data
            : Array.isArray(resultado)
              ? resultado
              : []
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al consultar los departamentos."
        );
      }
    };

    obtenerDepartamentos();
  }, []);

  // Consultar el titular y precargar sus datos.
  useEffect(() => {
    const obtenerTitular = async () => {
      try {
        setCargando(true);
        setError("");

        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(
          `${API_URL}/titulares/${idTitular}/`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            resultado.message || "No se pudo consultar el titular."
          );
        }

        const titular: Titular = resultado.data;

        setFormulario({
          nombre: titular.nombre,
          cedula: titular.cedula,
          celular: titular.celular || "",
          direccion: titular.direccion || "",
          id_departamento: String(titular.id_departamento),
          id_municipio: String(titular.id_municipio),
        });

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
  }, [idTitular]);

  // Cargar los municipios del departamento seleccionado.
  useEffect(() => {
    if (!formulario.id_departamento) {
        setMunicipios([]);
        return;
    }

    const obtenerMunicipios = async () => {
      try {
        setCargandoMunicipios(true);

        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(
          `${API_URL}/ubicaciones/${formulario.id_departamento}/`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar los municipios.");
        }

        setMunicipios(
          Array.isArray(resultado.data)
            ? resultado.data
            : Array.isArray(resultado)
              ? resultado
              : []
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al consultar los municipios."
        );
      } finally {
        setCargandoMunicipios(false);
      }
    };

    obtenerMunicipios();
  }, [formulario.id_departamento]);

  const cambiarCampo = (
    campo: keyof FormularioTitular,
    valor: string
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const actualizarTitular = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `${API_URL}/titulares/${idTitular}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            nombre: formulario.nombre,
            cedula: formulario.cedula,
            celular: formulario.celular || null,
            direccion: formulario.direccion || null,
            id_municipio: Number(formulario.id_municipio),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const errores = resultado.error || resultado.errors;

        if (errores && typeof errores === "object") {
          const detalle = Object.entries(errores)
            .map(([campo, mensajes]) => {
              const texto = Array.isArray(mensajes)
                ? mensajes.join(", ")
                : String(mensajes);

              return `${campo}: ${texto}`;
            })
            .join(" | ");

          throw new Error(
            detalle || resultado.message || "No se pudo actualizar el titular."
          );
        }

        throw new Error(
          resultado.message || "No se pudo actualizar el titular."
        );
      }

      const titular: Titular = resultado.data;

      setFormulario((actual) => ({
        ...actual,
        nombre: titular.nombre,
        cedula: titular.cedula,
        celular: titular.celular || "",
        direccion: titular.direccion || "",
        id_municipio: String(titular.id_municipio),
      }));

      setModoEdicion(false);
      alActualizar();

      toast.success(
        resultado.message || "Titular actualizado exitosamente."
      );

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el titular."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <section className="detalle-seccion"><p>Cargando titular...</p></section>;
  }

  if (error) {
    return <section className="detalle-seccion"><p>{error}</p></section>;
  }

  return (
    <section className="detalle-seccion">
      <h3>Actualizar titular</h3>

      {!modoEdicion ? (
        <div className="formulario-acciones">
          <p>Modifica los datos del titular cuando lo necesites.</p>
          <button type="button" onClick={() => setModoEdicion(true)}>
            Editar titular
          </button>
        </div>
      ) : (
        <form
          className="formulario-titular"
          onSubmit={actualizarTitular}
        >
          <label htmlFor="titular-nombre">Nombre</label>
          <input
            id="titular-nombre"
            value={formulario.nombre}
            onChange={(e) => cambiarCampo("nombre", e.target.value)}
            required
            maxLength={100}
          />

          <label htmlFor="titular-cedula">Cédula</label>
          <input
            id="titular-cedula"
            value={formulario.cedula}
            onChange={(e) => cambiarCampo("cedula", e.target.value)}
            required
            maxLength={10}
          />

          <label htmlFor="titular-celular">Celular</label>
          <input
            id="titular-celular"
            value={formulario.celular}
            onChange={(e) => cambiarCampo("celular", e.target.value)}
            maxLength={10}
          />

          <label htmlFor="titular-direccion">Dirección</label>
          <input
            id="titular-direccion"
            value={formulario.direccion}
            onChange={(e) => cambiarCampo("direccion", e.target.value)}
            maxLength={50}
          />

          <label htmlFor="titular-departamento">Departamento</label>
          <select
            id="titular-departamento"
            value={formulario.id_departamento}
            onChange={(e) => {
              cambiarCampo("id_departamento", e.target.value);
              cambiarCampo("id_municipio", "");
            }}
            required
          >
            <option value="">Selecciona un departamento</option>
            {departamentos.map((departamento) => (
              <option key={departamento.id} value={departamento.id}>
                {departamento.nombre}
              </option>
            ))}
          </select>

          <label htmlFor="titular-municipio">Municipio</label>
          <select
            id="titular-municipio"
            value={formulario.id_municipio}
            onChange={(e) => cambiarCampo("id_municipio", e.target.value)}
            disabled={!formulario.id_departamento || cargandoMunicipios}
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

          <div className="formulario-acciones">
            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => setModoEdicion(false)}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default ActualizarTitular;
