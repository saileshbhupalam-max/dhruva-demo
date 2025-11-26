import React from 'react';
import { useDemo } from './contexts/DemoContext';
import { DemoLayout } from './components/layout/DemoLayout';
import LandingPage from './pages/LandingPage';
import CitizenPage from './pages/citizen/CitizenPage';
import OfficerPage from './pages/officer/OfficerPage';
import PolicymakerPage from './pages/policymaker/PolicymakerPage';

function App() {
  const { role } = useDemo();

  // If no role selected, show landing page
  if (!role) {
    return <LandingPage />;
  }

  // Role-based content
  const getContent = () => {
    switch (role) {
      case 'citizen':
        return <CitizenPage />;
      case 'officer':
        return <OfficerPage />;
      case 'policymaker':
        return <PolicymakerPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <DemoLayout>
      {getContent()}
    </DemoLayout>
  );
}

export default App;
