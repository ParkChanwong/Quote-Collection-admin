import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './layouts';
import Quote from './pages/Quote';

const App = () => {

  return (
    <Routes>
      <Route path='/login' element={ <Login /> } />
      <Route element={<Layout />}>
        <Route index element={<Navigate to='/quotes' replace />} />
        <Route path='/quotes' element={<Quote />} />
      </Route>
    </Routes>
  )
}

export default App
