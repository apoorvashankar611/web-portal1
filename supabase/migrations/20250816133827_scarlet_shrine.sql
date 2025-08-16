/*
  # Create posts table for social feed

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `content` (text) - post content
      - `author_id` (uuid) - user who created the post
      - `post_type` (enum) - update, advice, announcement
      - `likes_count` (integer) - number of likes
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `posts` table
    - Add policy for authenticated users to read all posts
    - Add policy for users to create posts
    - Add policy for users to update their own posts
*/

-- Create post_type enum
DO $$ BEGIN
  CREATE TYPE post_type_enum AS ENUM ('update', 'advice', 'announcement');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_type post_type_enum NOT NULL DEFAULT 'update',
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all posts
CREATE POLICY "Users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create posts
CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create updated_at trigger for posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);