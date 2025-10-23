export interface Member {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  conversion_date: string | null;
  address: string | null;
  cell_id: string | null;
  status: 'active' | 'inactive' | 'transferred';
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: string;
  name: string;
  leader_id: string | null;
  meeting_address: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Finance {
  id: string;
  date: string;
  type: 'dizimo' | 'oferta' | 'campanha' | 'outros';
  amount: number;
  member_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string | null;
  location: string | null;
  expected_attendees: number;
  confirmed_attendees: number;
  description: string | null;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CellAttendance {
  id: string;
  cell_id: string;
  member_id: string;
  date: string;
  present: boolean;
  visitor: boolean;
  notes: string | null;
  created_at: string;
}
