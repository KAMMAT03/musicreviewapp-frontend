import React from 'react';
import Login from './pages/Login'
import AlbumPage from './pages/AlbumPage';
import Main from './pages/Main';
import { Routes, Route } from 'react-router-dom';
import UserReviews from './pages/UserReviews';
import NotFound from './pages/Redirect';

export const BACKEND_URL = "https://musicreviewapp-436625947182.europe-central2.run.app"

export default function App(){

  return (
    <div className='container'>
      <Routes>
        <Route path="/auth" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/search" element={<Main />} />
        <Route path="/album/:id" element={<AlbumPage />} />
        <Route path="/reviews/:username" element={<UserReviews />} />
      </Routes>
    </div>
  )
}