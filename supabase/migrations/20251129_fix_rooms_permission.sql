-- Grant usage on schema public to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on all tables in schema public to authenticated and anon (simplified for development, refine for prod)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure RLS is enabled on rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;

-- Create a policy that allows authenticated users to insert rooms
CREATE POLICY "Users can create rooms"
ON rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Ensure users can view rooms (needed for the select after insert)
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON rooms;
CREATE POLICY "Rooms are viewable by everyone"
ON rooms
FOR SELECT
TO public
USING (true);

-- Allow users to update their own rooms (e.g. changing status)
DROP POLICY IF EXISTS "Users can update their own rooms" ON rooms;
CREATE POLICY "Users can update their own rooms"
ON rooms
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);
