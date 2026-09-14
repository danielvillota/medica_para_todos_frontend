import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const response = await fetch("http://127.0.0.1:8000/api/autenticacion/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

            console.log("Tokens guardados");

            navigate("/home");
        } else {
            console.log("Error en el login:", data);
        }
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