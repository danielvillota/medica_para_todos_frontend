import {  useState } from "react";
import toast from "react-hot-toast";

interface Asesor {
    id: number;
    nombre: string;
    codigo: string;
    cedula: string;
    direccion: string;
    celular: string;
    is_active: boolean;
}

interface Formulario {
    nombre: string;
    codigo: string;
    cedula: string;
    direccion: string;
    celular: string;
}

interface AsesorRegistroProps {
    onAsesorCreado: () => void;
    asesor?: Asesor;
    formulario: Formulario;
    setFormulario: React.Dispatch<React.SetStateAction<Formulario>>;
    limpiarSeleccion: () => void;
}


function AsesorRegistro({ onAsesorCreado, asesor, formulario, setFormulario,limpiarSeleccion, }: AsesorRegistroProps){
    const [errores, setErrores] = useState<Record<string, string[]>>({});
    const [cargando, setCargando] = useState(false);
    const url = asesor ? `http://127.0.0.1:8000/api/asesores/${asesor.id}/` : "http://127.0.0.1:8000/api/asesores/";


    const handleSubmit=async (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        setErrores({});
        setCargando(true);
        try{
            const token=localStorage.getItem("access_token");
            const datosAsesor = {
                nombre: formulario.nombre,
                codigo: formulario.codigo,
                cedula: formulario.cedula,
                direccion: formulario.direccion,
                celular: formulario.celular,
            };
            const response = await fetch(
                url,
                {
                    method: asesor ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(datosAsesor),
                }
            );
            const data=await response.json()
            if (!response.ok) {
                console.log("Error del backend:", data);

                setErrores(data.errors);
                toast.error("Revisa los campos del formulario");

                return;
            }
            toast.success(data.message);
            setFormulario({
                nombre: "",
                codigo: "",
                cedula: "",
                direccion: "",
                celular: "",
            });
            onAsesorCreado();
            limpiarSeleccion();
        }catch (error) {

            console.error(error);

            toast.error("No se pudo conectar con el servidor");

        } finally {

            setCargando(false);

        }
        
    }
    console.log("URL:", url);
    return(
        <>
            <h1>{asesor ? "Modificar asesor" : "Crear asesor"}</h1>
            <form onSubmit={handleSubmit}>
                <label>Nombre Asesor</label>
                {errores.nombre && (
                    <p>{errores.nombre[0]}</p>
                )}
                <input type="text" name="nombre" value={formulario.nombre} onChange={(event)=>setFormulario({...formulario,nombre: event.target.value,})}/>
                <label>Codigo Asesor</label>
                {errores.codigo && (
                    <p>{errores.codigo[0]}</p>
                )}
                <input type="text" value={formulario.codigo} onChange={(event)=>setFormulario({...formulario, codigo:event.target.value})}/>
                <label>Cedula Asesor</label>
                {errores.cedula && (
                    <p>{errores.cedula[0]}</p>
                )}
                <input type="text" value={formulario.cedula} onChange={(event)=>setFormulario({...formulario, cedula:event.target.value})}/>
                <label>Direccion Asesor</label>
                <input type="text" value={formulario.direccion} onChange={(event)=>setFormulario({...formulario,direccion:event.target.value})}/>
                <label>Celular Asesor</label>
                {errores.celular && (
                    <p>{errores.celular[0]}</p>
                )}
                <input type="text" value={formulario.celular} onChange={(event)=>setFormulario({...formulario, celular:event.target.value})}/>
                <button type="submit" disabled={cargando}>
                    {cargando
                        ? "Guardando..."
                        : asesor
                            ? "Modificar asesor"
                            : "Crear asesor"
                    }
                </button>
            </form>
        </>
    )
}
export default AsesorRegistro;