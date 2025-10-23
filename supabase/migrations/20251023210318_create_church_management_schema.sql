/*
  # GestãoEclesiástica Pro - Database Schema

  ## Overview
  Complete database schema for church management system with members, finances, events, and cell groups.

  ## New Tables

  ### 1. `members` - Church Members Registry
    - `id` (uuid, primary key)
    - `name` (text) - Full name
    - `cpf` (text, unique) - Brazilian tax ID
    - `phone` (text) - Contact phone
    - `email` (text) - Email address
    - `conversion_date` (date) - Date of conversion
    - `address` (text) - Full address
    - `cell_id` (uuid) - Reference to cell group
    - `status` (text) - active, inactive, transferred
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. `cells` - Cell Groups
    - `id` (uuid, primary key)
    - `name` (text) - Cell name
    - `leader_id` (uuid) - Reference to member who is leader
    - `meeting_address` (text) - Where cell meets
    - `meeting_day` (text) - Day of week
    - `meeting_time` (time) - Time of meeting
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 3. `finances` - Financial Transactions
    - `id` (uuid, primary key)
    - `date` (date) - Transaction date
    - `type` (text) - dizimo, oferta, campanha
    - `amount` (decimal) - Transaction amount
    - `member_id` (uuid) - Reference to member
    - `description` (text) - Additional notes
    - `created_at` (timestamptz)

  ### 4. `events` - Church Events
    - `id` (uuid, primary key)
    - `name` (text) - Event name
    - `date` (date) - Event date
    - `time` (time) - Event time
    - `location` (text) - Event location
    - `expected_attendees` (integer) - Expected number
    - `confirmed_attendees` (integer) - Confirmed number
    - `description` (text) - Event details
    - `status` (text) - planned, confirmed, completed, cancelled
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 5. `cell_attendance` - Cell Meeting Attendance
    - `id` (uuid, primary key)
    - `cell_id` (uuid) - Reference to cell
    - `member_id` (uuid) - Reference to member
    - `date` (date) - Attendance date
    - `present` (boolean) - Was present
    - `visitor` (boolean) - Is visitor
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their church data
  - Restrict access based on user authentication

  ## Important Notes
  1. All tables use UUID for primary keys
  2. Timestamps are automatically managed
  3. Foreign keys ensure data integrity
  4. RLS policies ensure secure access
*/

-- Create cells table first (referenced by members)
CREATE TABLE IF NOT EXISTS cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  leader_id uuid,
  meeting_address text,
  meeting_day text,
  meeting_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cpf text UNIQUE,
  phone text,
  email text,
  conversion_date date,
  address text,
  cell_id uuid REFERENCES cells(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to cells.leader_id (now that members exists)
ALTER TABLE cells 
  ADD CONSTRAINT cells_leader_id_fkey 
  FOREIGN KEY (leader_id) 
  REFERENCES members(id) 
  ON DELETE SET NULL;

-- Create finances table
CREATE TABLE IF NOT EXISTS finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('dizimo', 'oferta', 'campanha', 'outros')),
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  time time,
  location text,
  expected_attendees integer DEFAULT 0,
  confirmed_attendees integer DEFAULT 0,
  description text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cell_attendance table
CREATE TABLE IF NOT EXISTS cell_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id uuid NOT NULL REFERENCES cells(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  present boolean DEFAULT true,
  visitor boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cell_id, member_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_cell_id ON members(cell_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_finances_date ON finances(date);
CREATE INDEX IF NOT EXISTS idx_finances_type ON finances(type);
CREATE INDEX IF NOT EXISTS idx_finances_member_id ON finances(member_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_cell_attendance_cell_id ON cell_attendance(cell_id);
CREATE INDEX IF NOT EXISTS idx_cell_attendance_date ON cell_attendance(date);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Members policies
CREATE POLICY "Authenticated users can view members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);

-- Cells policies
CREATE POLICY "Authenticated users can view cells"
  ON cells FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cells"
  ON cells FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cells"
  ON cells FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cells"
  ON cells FOR DELETE
  TO authenticated
  USING (true);

-- Finances policies
CREATE POLICY "Authenticated users can view finances"
  ON finances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert finances"
  ON finances FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update finances"
  ON finances FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete finances"
  ON finances FOR DELETE
  TO authenticated
  USING (true);

-- Events policies
CREATE POLICY "Authenticated users can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Cell attendance policies
CREATE POLICY "Authenticated users can view attendance"
  ON cell_attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON cell_attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON cell_attendance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON cell_attendance FOR DELETE
  TO authenticated
  USING (true);