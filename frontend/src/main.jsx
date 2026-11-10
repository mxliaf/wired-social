import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
// import * as bootstrap 
import './Instagram.css'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import Config from './routes/Config.jsx'
import Feed from './routes/Feed.jsx'
import Publicar from './routes/Publicar.jsx'
import App from './App.jsx'

//importar react router

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
          path: '/home',
          element: <Home />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/feed',
          element: <Feed />,
        },
        {
          path: '/publicar',
          element: <Publicar />,
        },
        {
          path: '/config',
          element: <Config />,
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
