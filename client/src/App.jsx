import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import JoinClub from './pages/JoinClub';
import CreateMessage from './pages/CreateMessage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/join-club" element={<JoinClub />} />
        <Route path="/create-message" element={<CreateMessage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
