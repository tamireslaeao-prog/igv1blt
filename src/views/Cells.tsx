import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Cell, Member } from '../types';

export const Cells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    leader_id: '',
    meeting_address: '',
    meeting_day: '',
    meeting_time: '',
  });

  useEffect(() => {
    fetchCells();
    fetchMembers();
  }, []);

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      if (error) throw error;
      setCells(data || []);
    } catch (error) {
      console.error('Error fetching cells:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const getCellMembers = (cellId: string) => {
    return members.filter(m => m.cell_id === cellId);
  };

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return 'Sem líder';
    const leader = members.find(m => m.id === leaderId);
    return leader?.name || 'Desconhecido';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      leader_id: formData.leader_id || null,
      meeting_time: formData.meeting_time || null,
    };

    try {
      if (editingCell) {
        const { error } = await supabase
          .from('cells')
          .update(dataToSave)
          .eq('id', editingCell.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cells')
          .insert([dataToSave]);

        if (error) throw error;
      }

      resetForm();
      fetchCells();
    } catch (error: any) {
      alert('Erro ao salvar célula: ' + error.message);
    }
  };

  const handleEdit = (cell: Cell) => {
    setEditingCell(cell);
    setFormData({
      name: cell.name,
      leader_id: cell.leader_id || '',
      meeting_address: cell.meeting_address || '',
      meeting_day: cell.meeting_day || '',
      meeting_time: cell.meeting_time || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta célula?')) return;

    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCells();
    } catch (error: any) {
      alert('Erro ao excluir célula: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      leader_id: '',
      meeting_address: '',
      meeting_day: '',
      meeting_time: '',
    });
    setEditingCell(null);
    setShowModal(false);
  };

  const filteredCells = cells.filter(cell =>
    cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cell.meeting_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando células...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nova Célula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCells.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Nenhuma célula encontrada
          </div>
        ) : (
          filteredCells.map((cell) => {
            const cellMembers = getCellMembers(cell.id);
            return (
              <div
                key={cell.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{cell.name}</h3>
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{cellMembers.length}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Líder:</span>
                    <span className="text-gray-600 ml-2">{getLeaderName(cell.leader_id)}</span>
                  </div>

                  {cell.meeting_day && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Dia:</span>
                      <span className="text-gray-600 ml-2">
                        {cell.meeting_day}
                        {cell.meeting_time && ` às ${cell.meeting_time}`}
                      </span>
                    </div>
                  )}

                  {cell.meeting_address && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Local:</span>
                      <span className="text-gray-600 ml-2">{cell.meeting_address}</span>
                    </div>
                  )}
                </div>

                {cellMembers.length > 0 && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Membros:</p>
                    <div className="space-y-1">
                      {cellMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="text-sm text-gray-600">
                          {member.name}
                        </div>
                      ))}
                      {cellMembers.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{cellMembers.length - 3} outros
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(cell)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cell.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCell ? 'Editar Célula' : 'Nova Célula'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Célula *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Líder
                </label>
                <select
                  value={formData.leader_id}
                  onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione um líder</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia da Semana
                  </label>
                  <select
                    value={formData.meeting_day}
                    onChange={(e) => setFormData({ ...formData, meeting_day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço de Reunião
                </label>
                <textarea
                  value={formData.meeting_address}
                  onChange={(e) => setFormData({ ...formData, meeting_address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCell ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
