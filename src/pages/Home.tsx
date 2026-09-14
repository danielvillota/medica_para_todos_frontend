import Sidebar from "../components/Sidebar";
import "./Home.css"

function Home(){
    return(
        <>
        <Sidebar />
        <main className="main-content">
            <h1>Bienvenido</h1>
            <h2>Has iniciado sesion</h2>
        </main>
        </>
    )
}
export default Home;