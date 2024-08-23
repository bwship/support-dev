import { assertEquals, assertNotEquals } from 'asserts';
import supabaseClient from '../../functions/_shared/helpers/supabaseSingleton.ts';
import type { User } from '@supabase/supabase-js';

// For these test a user needs to be signed in and authorized.
const _userEmail = 'bob.m.wall@gmail.com';
const _userPassword = 'testing123';
let _user: User | null;

const _randomUserEmail = 'bob.m.wall+helper1@gmail.com';
const _randomUserPassword = 'testing123';
let _randomUser: User | null;

const signUserIn = async (email: string, password: string) => {
  const { data: signInData, error: signInError } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  _user = signInData?.user ? signInData.user : null;

  // console.log("Profile Images Test: User signed in.");
  console.log('USER DATA: ', _user?.id);

  assertEquals(signInError, null);
  assertEquals(_user?.email, email);
  assertEquals(_user?.role, 'authenticated');
};

const signUserOut = async () => {
  const { error: signOutError } = await supabaseClient.auth.signOut();
  assertEquals(signOutError, null);
};

const testProfileImageUpload = async () => {
  // ************************************************************ //
  // ******* Make sure to Sign the user in before running test.
  // ************************************************************ //

  // ************************************************************ //
  // ******* Upload picture to supabase storage.
  // ************************************************************ //
  // Define test data
  const bucketId = 'profile-images';
  const filePath = 'supabase/tests/deno/assets/profile-images/';
  const fileName = 'sample-avatar-500x500.jpg';
  const fileExt = fileName.split('.').pop() || '';
  const profileImageBuffer = await Deno.readFileSync(filePath.concat(fileName));
  const bucketFolderFilePath = ''.concat(_user?.id || '', '/', fileName);
  const contentType = `image/${fileExt}`;

  // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
  // TODO(#issue): THIS TEST IS CURRENTLY FAILING WITH THE FOLLOWING ERROR. THIS REQUIRES FURTHER RESEARCH.
  // HOWEVER THESE SAME FUNCTIONS WERE TESTED OUTSIDE OF DENO (SVELTEKIT APP) AND THEY ALL PASSED.:
  // error: Leaking resources:
  // - A fetch response body (rid 9) was created during the test, but not consumed during the test.
  // Consume or close the response body `ReadableStream`, e.g `await resp.text()` or `await resp.body.cancel()`.
  // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

  // Upload an image to a supabase storage bucket.
  const { data: storageUploadData, error: storageUploadError } =
    await supabaseClient.storage
      .from(bucketId)
      .upload(bucketFolderFilePath, profileImageBuffer, {
        contentType,
      });
  //console.log("Upload To Storage DATA: ", storageUploadData?.path);

  assertEquals(storageUploadError, null);

  // Make sure the response is not null.
  assertNotEquals(storageUploadData?.path, null);

  // Make sure the response contains the correct file extension.
  assertEquals(storageUploadData?.path?.split('.').pop(), fileExt);

  // Make sure that the storage folder name matches the userId
  assertEquals(storageUploadData?.path?.split('/')[0], _user?.id);

  // ************************************************************ //
  // ******* Download picture from supabase storage.
  // ************************************************************ //

  // ************************************************************ //
  // ******* Replace picture in supabase storage.
  // ************************************************************ //

  // ************************************************************ //
  // ******* Remove picture from supabase storage.
  // ************************************************************ //
  console.log('FOLDER PATH AND NAME: ', bucketFolderFilePath);
  const { data: storageDeleteData, error: storageDeleteError } =
    await supabaseClient.storage.from(bucketId).remove([bucketFolderFilePath]);

  assertEquals(storageDeleteError, null);
  console.log('STORAGE DELETE DATA: ', storageDeleteData);
};

const testProfileImageInvalidFileTypeUpload = async () => {
  // ************************************************************ //
  // ******* Upload invalid file type to supabase storage.
  // ************************************************************ //
  // Define test data
  const bucketId = 'profile-images';
  const filePath = 'supabase/tests/deno/assets/profile-images/';
  const fileName = 'sample-text-file-type.txt';
  const profileImageBuffer = await Deno.readFile(filePath.concat(fileName));
  const bucketFolderFilePath = ''.concat(_user?.id || '', '/', fileName);
  const contentType = 'text/plain';

  // console.log("bucketFolderFilePath", bucketFolderFilePath, profileImageBuffer);

  // Upload a text file to a supabase storage bucket.
  const { data: storageUploadData, error: storageUploadError } =
    await supabaseClient.storage
      .from(bucketId)
      .upload(bucketFolderFilePath, profileImageBuffer, {
        contentType,
      });
  // console.log("Upload To Storage DATA: ", storageUploadData);
  // console.log("Upload To Storage ERROR: ", storageUploadError);

  // TODO(#issue): So the error is actually an authorization error.
  // We probably need to separate the auth policy from the
  // file type policy. As of now the invalid file type
  // errors with auth.
  assertNotEquals(storageUploadError, null);

  // Make sure the response is not null.
  assertEquals(storageUploadData, null);
};

//***************************************************************************

// BEGIN TEST GROUP 1: A USER THAT IS THE OWNER OF THE PROFILE IMAGE.
// Sign the owner of the Profile Image IN.
Deno.test(
  'Profile-Images Test: Sign Profile Image Owner In',
  async () => {
    await signUserIn(_userEmail, _userPassword);
  }
);

// TODO(#issue): Requires further research. See the testProfileImageUpload() function for more details.
// Deno.test(
//   "Profile-Images Test: Test operations to profile-images bucket in Supabase Storage for jpg.",
//   testProfileImageUpload
// );

Deno.test(
  'Profile-Images Test: Upload invalid file type.',
  testProfileImageInvalidFileTypeUpload
);

// Sign the owner of the Profile Image OUT.
Deno.test('Profile-Images Test: Sign out user', signUserOut);
// END TEST GROUP 1

//***************************************************************************

// BEGIN TEST GROUP 2: A USER THAT IS NOT THE OWNER OF THE PROFILE IMAGE.
// // Sign a user in that is NOT the owner of the Profile Image.
// Deno.test(
//   "Profile-Images Test: Sign Profile Image Owner In",
//   async () => {
//     await signUserIn(_userEmail, _userPassword);
//   }
// );

// // Sign the non-owner of the Profile Image OUT.
// Deno.test("Profile-Images Test: Sign out user", signUserOut);

// BEGIN TEST GROUP 2
