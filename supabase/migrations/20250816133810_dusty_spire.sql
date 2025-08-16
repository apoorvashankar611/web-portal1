/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, unique) - user email
      - `name` (text) - full name
      - `bio` (text, optional) - user biography
      - `linkedin_url` (text, optional) - LinkedIn profile URL
      - `skills` (text array) - user skills
      - `wallet_address` (text, optional) - blockchain wallet address
      - `avatar_url` (text, optional) - profile picture URL
      - `created_at` (timestamp) - account creation time
      - `updated_at` (timestamp) - last profile update

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read all profiles (for networking)
    - Add policy for users to update only their own profile
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  bio text DEFAULT '',
  linkedin_url text DEFAULT '',
  skills text[] DEFAULT '{}',
  wallet_address text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (for networking and job matching)
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();