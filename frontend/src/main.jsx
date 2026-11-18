import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
// import * as bootstrap 
import './Instagram.css'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import Config from './routes/Config.jsx'
import Timeline from './routes/Timeline.jsx'
import Publicar from './routes/Publicar.jsx'
import App from './App.jsx'
import Cadastro from './routes/Cadastro.jsx'
import RotaProtegida from './routes/RotaProtegida.jsx'

//importar react router

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { estaAutenticado } from './services/auth'

function RotaDesconhecida() {
  return <Navigate to={estaAutenticado() ? '/home' : '/login'} replace />
}

const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        {
          path: '/',
          element: <Login />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/cadastro',
          element: <Cadastro />,
        },
        {
          element: <RotaProtegida />,
          children: [
            { path: '/home', element: <Home /> },
            { path: '/feed', element: <Timeline /> },
            { path: '/publicar', element: <Publicar /> },
            { path: '/config', element: <Config /> },
          ],
        },
        {
          path: '*',
          element: <RotaDesconhecida />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
