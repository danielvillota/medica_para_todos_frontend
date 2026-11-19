import { useState, useEffect } from "react"
import './BeneficiariosLista.css'

const API_URL="http://127.0.0.1:8000/api"

interface Beneficiario{
    id:number;
    nombre:string;
    titular:string;
}

interface RespuestaBeneficiarios {
    count: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
    results: Beneficiario[];
}

function BeneficiariosLista(){
    const [beneficiarios, setBeneficiarios]=useState<Beneficiario[]>([]);
    const [nombre, setNombre]=useState("");
    const [pagina, setPagina]=useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const temporizador = setTimeout(() => {
            const obtenerBeneficiarios = async () => {
                setCargando(true);
                setError("");

                try {
                    const token = localStorage.getItem("access_token");

                    const parametros = new URLSearchParams({
                        nombre: nombre.trim(),
                        page: String(pagina),
                    });

                    const respuesta = await fetch(
                        `${API_URL}/beneficiarios/?${parametros.toString()}`,
                        {
                            headers: {
                                ...(token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {}),
                            },
                        }
                    );

                    const resultado: RespuestaBeneficiarios =
                        await respuesta.json();

                    if (!respuesta.ok) {
                        throw new Error(
                            "No se pudo consultar la lista de beneficiarios."
                        );
                    }


                    setBeneficiarios(resultado.results);
                    setTotalPaginas(resultado.total_pages);
                    setTotalRegistros(resultado.count);

                } catch (error) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Error al consultar los beneficiarios."
                    );
                } finally {
                    setCargando(false);
                }
            };

            obtenerBeneficiarios();
        }, 400);

        return () => clearTimeout(temporizador);

    }, [nombre, pagina]);

    return(
        <>
        <div className="beneficiarios-lista">

            <h2 className="titulo-seccion">
                Lista de beneficiarios
            </h2>

            {/* Filtro automático por nombre */}
            <div className="filtro-beneficiarios">
                <div className="form-group">
                    <label htmlFor="buscar-beneficiario">
                        Buscar por nombre
                    </label>

                    <input
                        id="buscar-beneficiario"
                        type="text"
                        value={nombre}
                        onChange={(e) => {
                            setNombre(e.target.value);
                            setPagina(1);
                        }}
                        placeholder="Escriba el nombre del beneficiario..."
                    />
                </div>
            </div>

            {/* Estado de carga */}
            {cargando ? (
                <p>Cargando beneficiarios...</p>

            ) : error ? (
                <p className="mensaje-error">{error}</p>

            ) : (
                <>
                    <p>
                        Total de beneficiarios:{" "}
                        <strong>{totalRegistros}</strong>
                    </p>

                    {/* Tabla de beneficiarios */}
                    {beneficiarios.length === 0 ? (
                        <p>
                            No se encontraron beneficiarios.
                        </p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Titular</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {beneficiarios.map((beneficiario) => (
                                        <tr key={beneficiario.id}>
                                            <td>{beneficiario.nombre}</td>
                                            <td>{beneficiario.titular}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="paginacion-beneficiarios">

                            <button
                                type="button"
                                onClick={() =>
                                    setPagina((actual) => actual - 1)
                                }
                                disabled={pagina === 1}
                            >
                                Anterior
                            </button>

                            <span>
                                Página {pagina} de {totalPaginas}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPagina((actual) => actual + 1)
                                }
                                disabled={pagina === totalPaginas}
                            >
                                Siguiente
                            </button>

                        </div>
                    )}
                </>
            )}
        </div>
        
        </>
    )
}
export default BeneficiariosLista