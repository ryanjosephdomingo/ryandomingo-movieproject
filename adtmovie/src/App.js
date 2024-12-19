import * as React from 'react';
// import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Login from './pages/Public/Login/Login';
import Register from './pages/Public/Register/Register';
import Dashboard from './pages/Main/Dashboard/Dashboard';
import Main from './pages/Main/Main';
import Movie from './pages/Main/Movie/Movie';
import Lists from './pages/Main/Movie/List/List';
import Form from './pages/Main/Movie/Form/Form';
import CastandCrew from './pages/Main/Movie/Cast/Cast'; // Corrected path
import Photos from './pages/Main/Movie/Photos/Photos';
import Videos from './pages/Main/Movie/Videos/Videos';
import { AuthProvider } from './context/context';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: 'admin/login',
    element: <Login />,
  },
  {
    path: 'admin/register',
    element: <Register />,
  },
  {
    path: '/main',
    element: <Main />,
    children: [
      {
        path: '/main/dashboard',
        element: <Dashboard />
      },
      {
        path: '/main/movies',
        element: <Movie />,
        children: [
          {
            path: '/main/movies',
            element: <Lists />,
          },
          {
            path: '/main/movies/form/:id?',
            element: <Form />,
            children: [
              {
                path: '/main/movies/form/:id',
                element: <CastandCrew />
              },
              {
                path: '/main/movies/form/:id/cast-and-crews/:movieId?',
                element: <CastandCrew />
              },
              {
                path: '/main/movies/form/:id/photos/:movieId?',
                element: <Photos />
              },
              {
                path: '/main/movies/form/:id/videos/:movieId?',
                element: <Videos />
              },
            ]
          },
        ]
      },
      // {
      //   path: '/main/dashboard',
      //   element: <Dashboard />,
      // },
    ],
  },
  {
    path: '/home',
    // element: <Client />,
    children: [
      {
        path: '/home',
        // element: <Home />
      },
      {
        path: '/home/movie/:movieId?',
        // element: <Movie />
      }
    ]
  },
]);


function App() {
  return (
    <AuthProvider>
    <div className='App'>
      <RouterProvider router={router} />
    </div>
    </AuthProvider>
  );
}
export default App;