import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import ProtectedRoute from './routes/ProtectedRoute'
import Asesores from './pages/Asesores'
import Layout from './layouts/Layout'
import './App.css'
import { Toaster } from "react-hot-toast";
function App() {

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path='/' element={<Login/>}/>
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path='/home' element={<Home/>}/>
            <Route path='/asesores' element={<Asesores/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
