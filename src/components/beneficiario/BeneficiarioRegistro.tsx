import { useState } from "react";
import toast from "react-hot-toast";

const API_URL="http://127.0.0.1:8000/api";

interface Beneficiario{
    id:number;
    nombre:string;
}

interface Props {
  idTitular: number;
  alRegistrar: (beneficiario: Beneficiario) => void;
  alCancelar: () => void;
}

function BeneficiarioRegistro({idTitular, alRegistrar, alCancelar,}:Props){
    const [nombre, setNombre] = useState("");
    const [procesando, setProcesando] = useState(false);

    const registrarBeneficiario = async (evento: React.FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        if (!nombre.trim()) {
        toast.error("Debes ingresar el nombre del beneficiario.");
        return;
        }

        setProcesando(true);

        try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch(`${API_URL}/beneficiarios/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
            nombre: nombre.trim(),
            id_titular: idTitular,
            }),
        });

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
                resultado.message || "No se pudo registrar el beneficiario."
            );
            }

            return;
        }

        toast.success(
            resultado.message || "Beneficiario registrado correctamente."
        );

        alRegistrar(resultado.data);
        setNombre("");

        } catch {
        toast.error("Ocurrió un error al registrar el beneficiario.");
        } finally {
        setProcesando(false);
        }
    };
    return(
        <>
            <form onSubmit={registrarBeneficiario}>
                <div className="form-group">
                    <label htmlFor="nombre-beneficiario">
                    Nombre del beneficiario
                    </label>

                    <input
                    id="nombre-beneficiario"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={150}
                    placeholder="Ingrese el nombre del beneficiario"
                    disabled={procesando}
                    />
                </div>

                <div className="acciones-formulario">
                    <button type="submit" disabled={procesando}>
                    {procesando ? "Registrando..." : "Registrar"}
                    </button>

                    <button
                    type="button"
                    onClick={alCancelar}
                    disabled={procesando}
                    >
                    Cancelar
                    </button>
                </div>
            </form>
        </>
    )
}
export default BeneficiarioRegistro;