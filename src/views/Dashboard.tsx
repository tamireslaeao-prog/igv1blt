import { useEffect, useState } from 'react';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/Dashboard/StatCard';
import { supabase } from '../lib/supabase';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  upcomingEvents: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membersResult, financeResult, eventsResult] = await Promise.all([
        supabase.from('members').select('id, status', { count: 'exact' }),
        supabase.from('finances').select('amount'),
        supabase.from('events').select('id', { count: 'exact' }).gte('date', new Date().toISOString().split('T')[0]),
      ]);

      const totalMembers = membersResult.count || 0;
      const activeMembers = membersResult.data?.filter(m => m.status === 'active').length || 0;
      const totalRevenue = financeResult.data?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const upcomingEvents = eventsResult.count || 0;

      setStats({
        totalMembers,
        activeMembers,
        totalRevenue,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Membros"
          value={stats.totalMembers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Membros Ativos"
          value={stats.activeMembers}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Arrecadação Total"
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Eventos Próximos"
          value={stats.upcomingEvents}
          icon={Calendar}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bem-vindo ao Sistema</h3>
        <p className="text-gray-600 leading-relaxed">
          Utilize o menu lateral para navegar entre as diferentes funcionalidades do sistema.
          Você pode gerenciar membros, controlar finanças, organizar eventos e administrar células de forma eficiente.
        </p>
      </div>
    </div>
  );
};
