import React from 'react';
import Chat from './pages/chat/chat';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// Assuming Home and Dashboard components are available
// import Home from './pages/home/home';
// import Dashboard from './pages/dashboard/dashboard';
import Signup from './pages/signup/signup';
import Login from './pages/login/login';
function App() {
  const routes = createBrowserRouter([
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/",
      element: <Chat />,
    },
    {
      path: "/login",
      element: <Login />,
    }
    // Uncomment the following code when you have the Home and Dashboard components ready
    /*
    {
      path: "/dashboard",
      element: <Home />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },          
      ],
    },
    */
  ]);

  return (
    <div className="App">
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
