-- Fix the infinite recursion in family_members policy
DROP POLICY IF EXISTS "Users can insert family members in their family" ON family_members;

CREATE POLICY "Family creators can insert family members" ON family_members
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );
