-- Create a bucket to store profile images.
INSERT INTO storage.buckets(id, name, allowed_mime_types, public, file_size_limit)
    VALUES ('profile-images', 'profile-images', ARRAY['image/png', 'image/jpg', 'image/jpeg'], TRUE, 26214400);

-- Allow public viewing for select.
CREATE POLICY "profile-images-select-policy" ON storage.objects
    FOR SELECT TO authenticated, anon
        USING (bucket_id = 'profile-images');

-- Since the bucket is public for viewing lock everything else down.
CREATE POLICY "profile-images-insert-policy" ON storage.objects
    FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'profile-images'
        AND auth.uid()::text =(storage.foldername(name))[1]
        AND storage.extension(name) IN ('png', 'jpg', 'jpeg'));

CREATE POLICY "profile-images-update-policy" ON storage.objects
    FOR UPDATE TO authenticated
        USING (bucket_id = 'profile-images'
            AND auth.uid()::text =(storage.foldername(name))[1]
            AND storage.extension(name) IN ('png', 'jpg', 'jpeg'));

CREATE POLICY "profile-images-delete-policy" ON storage.objects
    FOR DELETE TO authenticated
        USING (bucket_id = 'profile-images'
            AND auth.uid()::text =(storage.foldername(name))[1]);

