DROP POLICY IF EXISTS email_registration_modify_policy ON public.email_registration;

-- For INSERT
CREATE POLICY email_registration_insert_policy ON public.email_registration
FOR INSERT TO anon WITH CHECK (true);

-- For UPDATE
CREATE POLICY email_registration_update_policy ON public.email_registration
FOR UPDATE TO authenticated WITH CHECK (true);

-- For DELETE
CREATE POLICY email_registration_deny_delete_policy
ON public.email_registration FOR DELETE TO public USING (false);

ALTER TABLE public.email_registration ADD COLUMN is_approved BOOLEAN DEFAULT false;
ALTER TABLE public.email_registration ADD COLUMN created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.email_registration ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.email_registration ADD COLUMN deleted_at TIMESTAMPTZ(3);
ALTER TABLE public.email_registration ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.email_registration ADD COLUMN updated_at TIMESTAMPTZ(3);
ALTER TABLE public.email_registration ADD COLUMN updated_by UUID REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION fn_email_registration_valid(_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- If the email ends with "@support.dev", return true
    IF _email ILIKE '%@support.dev' THEN
        RETURN true;
    END IF;

    RETURN EXISTS (SELECT 1
                   FROM public.email_registration
                   WHERE email = _email
                     AND is_approved = true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_email_registration_insert(_email TEXT)
  RETURNS void AS $$
BEGIN
  -- Check if the email already exists
  IF NOT EXISTS (SELECT 1 FROM public.email_registration WHERE email = _email) THEN
    -- If it doesn't exist, then insert
    INSERT INTO public.email_registration (email, is_approved, created_by)
    VALUES (_email, false, fn_get_authenticated_user_id());
  END IF;
END;
$$ LANGUAGE plpgsql;

