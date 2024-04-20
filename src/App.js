import React, { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import routes from './routes';
import Header from 'components/header';

const privatPages = ['/register', '/login'];

const App = () => {
  const { pathname } = useLocation();

  return (
    <div className="container">
      {privatPages.includes(pathname) ? null : <Header />}
      <Suspense fallback={<div className="lds-dual-ring app-loader" />}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
