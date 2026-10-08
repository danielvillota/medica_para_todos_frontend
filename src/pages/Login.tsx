import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const iniciarSesion = async () => {
        const response = await fetch(
            "http://127.0.0.1:8000/api/autenticacion/login/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Error al iniciar sesión");
        }

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        navigate("/home");
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        toast.promise(
            iniciarSesion(),
            {
                loading: "Iniciando sesión...",
                success: <b>¡Inicio de sesión exitoso!</b>,
                error: <b>Credenciales incorrectas.</b>,
            }
        );
    };

    return(
        <div>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email" 
                        id="email" 
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
                <div>
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}/>
                </div>
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}
export default Login;