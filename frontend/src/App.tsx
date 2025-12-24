import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ManagerDashboard from './pages/ManagerDashboard';
import ReviewDisplayPage from './pages/ReviewDisplayPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/property/:propertyId" element={<ReviewDisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

