import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { 
  Dashboard, 
  ExperimentsList, 
  ExperimentDetail,
  ExperimentEdit,
  NewExperiment, 
  PeoplePage, 
  SettingsPage 
} from './pages';
import PocketBaseTest from './pages/PocketBaseTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="experiments" element={<ExperimentsList />} />
          <Route path="experiments/:id" element={<ExperimentDetail />} />
          <Route path="experiments/:id/edit" element={<ExperimentEdit />} />
          <Route path="experiments/new" element={<NewExperiment />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="pocketbase-test" element={<PocketBaseTest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
