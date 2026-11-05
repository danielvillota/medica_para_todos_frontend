import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import ProtectedRoute from './routes/ProtectedRoute'
import Asesores from './pages/Asesores'
import Layout from './layouts/Layout'
import './App.css'
import { Toaster } from "react-hot-toast";
import Papeleria from './pages/papeleria/Papelerias';
import Afiliaciones from './pages/afiliacion/Afiliacion';
import AfiliacionRegistro from './components/afiliacion/AfiliacionRegistro'
import AfiliacionDetalle from './components/afiliacion/AfiliacionDetalle'

function App() {

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path='/' element={<Login/>}/>
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path='/home' element={<Home/>}/>
            <Route path='/asesores' element={<Asesores/>}/>
            <Route path='/papelerias' element={<Papeleria/>}/>
            <Route path='/afiliaciones' element={<Afiliaciones/>}/>
            <Route path='/afiliaciones/crear' element={<AfiliacionRegistro/>}/>
            <Route path='/afiliaciones/:id' element={<AfiliacionDetalle/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
