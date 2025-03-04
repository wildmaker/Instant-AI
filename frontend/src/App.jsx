import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KnowledgeBaseList from './components/KnowledgeBaseList';
import KnowledgeBaseDetail from './components/KnowledgeBaseDetail';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KnowledgeBaseList />} />
        <Route path="/knowledge-base/:id" element={<KnowledgeBaseDetail />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
  );
}

export default App;