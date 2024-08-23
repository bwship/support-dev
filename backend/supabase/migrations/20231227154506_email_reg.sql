-- email registration Table
CREATE TABLE public.email_registration (
  email TEXT,

  CONSTRAINT emaiL_registration_pkey PRIMARY KEY (email)
);

CREATE OR REPLACE FUNCTION fn_email_registration_valid(_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- If the email ends with "@support.dev", return true
    IF _email ILIKE '%@support.dev' THEN
        RETURN true;
    END IF;

    RETURN EXISTS (SELECT 1 FROM public.email_registration WHERE email = _email);
END;
$$ LANGUAGE plpgsql;

-- Allow SELECT for the table
CREATE POLICY email_registration_select_policy ON public.email_registration
FOR SELECT TO anon USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY email_registration_modify_policy ON public.email_registration
FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE public.email_registration ENABLE ROW LEVEL SECURITY;
