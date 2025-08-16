/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text) - job title
      - `description` (text) - job description
      - `skills` (text array) - required skills
      - `budget_min` (integer, optional) - minimum budget
      - `budget_max` (integer, optional) - maximum budget
      - `salary` (integer, optional) - annual salary
      - `location` (text, optional) - job location
      - `job_type` (enum) - full-time, part-time, contract, freelance
      - `company` (text) - company name
      - `posted_by` (uuid) - user who posted the job
      - `payment_confirmed` (boolean) - whether platform fee was paid
      - `transaction_hash` (text, optional) - blockchain transaction hash
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for authenticated users to read all confirmed jobs
    - Add policy for users to create jobs
    - Add policy for users to update their own jobs
*/

-- Create job_type enum
DO $$ BEGIN
  CREATE TYPE job_type_enum AS ENUM ('full-time', 'part-time', 'contract', 'freelance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  skills text[] DEFAULT '{}',
  budget_min integer DEFAULT NULL,
  budget_max integer DEFAULT NULL,
  salary integer DEFAULT NULL,
  location text DEFAULT '',
  job_type job_type_enum NOT NULL DEFAULT 'full-time',
  company text NOT NULL,
  posted_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  payment_confirmed boolean DEFAULT false,
  transaction_hash text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all confirmed jobs
CREATE POLICY "Users can read confirmed jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (payment_confirmed = true);

-- Allow users to create jobs
CREATE POLICY "Users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

-- Allow users to update their own jobs
CREATE POLICY "Users can update own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = posted_by);

-- Create updated_at trigger for jobs
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_payment_confirmed ON jobs(payment_confirmed);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);