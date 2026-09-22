import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { getAuthToken } from './api/axios';
import Login from './pages/Login';
import Layout from './layouts';
import Quote from './pages/Quote';
import Category from './pages/Category';
import Person from './pages/Person';

const RequireAuth = () => {
  return getAuthToken() ? <Outlet /> : <Navigate to='/login' replace />;
};

const App = () => {

  return (
    <Routes>
      <Route path='/login' element={ <Login /> } />
      <Route element={<RequireAuth />}>
        <Route index element={<Navigate to='/quotes' replace />} />
        <Route element={<Layout title="명언 관리" subtitle="오래 남을 좋은 문장들을 한곳에서 관리해요." />}>
          <Route path='/quotes' element={<Quote />} />
        </Route>
        <Route element={<Layout title="인물 관리" subtitle="좋은 문장을 남긴 인물과 그 배경을 관리해요." />}>
          <Route path='/persons' element={<Person />} />
        </Route>
        <Route element={<Layout title="카테고리 관리" subtitle="좋은 문장을 발견하는 네 가지 기준을 정리해요." />}>
          <Route path='/categories' element={<Category />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
