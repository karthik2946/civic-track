-- Allow authorities to read all profiles (needed to show reporter names)
CREATE POLICY "Authorities can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'authority'::app_role));