
import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000/api";

interface Beneficiario {
  id: number;
  nombre: string;
}

interface Props {
  beneficiario: Beneficiario;
  alActualizar: (beneficiario: Beneficiario) => void;
  alCancelar: () => void;
}

function BeneficiarioActualizar({beneficiario,alActualizar,alCancelar,}: Props) {
  const [nombre, setNombre] = useState(beneficiario.nombre);
  const [guardando, setGuardando] = useState(false);

  const actualizar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }

    setGuardando(true);

    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `${API_URL}/beneficiarios/${beneficiario.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const errores = resultado.error;

        if (errores && typeof errores === "object") {
          Object.entries(errores).forEach(([campo, detalle]) => {
            const mensaje = Array.isArray(detalle)
              ? detalle.join(", ")
              : String(detalle);

            toast.error(`${campo}: ${mensaje}`);
          });
        } else {
          toast.error(
            resultado.message || "No se pudo actualizar el beneficiario."
          );
        }

        return;
      }

      alActualizar(resultado.data);
      toast.success(
        resultado.message || "Beneficiario actualizado correctamente."
      );
    } catch {
      toast.error("Ocurrió un error al actualizar el beneficiario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={actualizar} className="formulario-beneficiario">
      <label htmlFor="nombre-beneficiario">Nombre del beneficiario</label>

      <input
        id="nombre-beneficiario"
        type="text"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        maxLength={150}
        required
      />

      <button type="submit" disabled={guardando}>
        {guardando ? "Actualizando..." : "Guardar cambios"}
      </button>

      <button type="button" onClick={alCancelar} disabled={guardando}>
        Cancelar
      </button>
    </form>
  );
}

export default BeneficiarioActualizar;
