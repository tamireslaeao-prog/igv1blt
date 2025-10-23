import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './views/Dashboard';
import { Members } from './views/Members';
import { Finances } from './views/Finances';
import { Events } from './views/Events';
import { Cells } from './views/Cells';

function App() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const getViewTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
      members: { title: 'Membros', subtitle: 'Gestão de membros da igreja' },
      finances: { title: 'Finanças', subtitle: 'Controle financeiro e arrecadações' },
      events: { title: 'Eventos', subtitle: 'Gerenciamento de eventos da igreja' },
      cells: { title: 'Células', subtitle: 'Administração de células e grupos' },
    };
    return titles[activeView];
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'finances':
        return <Finances />;
      case 'events':
        return <Events />;
      case 'cells':
        return <Cells />;
      default:
        return <Dashboard />;
    }
  };

  const viewInfo = getViewTitle();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header title={viewInfo.title} subtitle={viewInfo.subtitle} />
        <main className="flex-1 p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
