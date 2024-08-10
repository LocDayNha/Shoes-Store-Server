var admin = require('firebase-admin');
const { getDownloadURL } = require('firebase-admin/storage');

var serviceAccount = require('../finalproject-77b50-firebase-adminsdk-2vpjw-9073a95d0d.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: serviceAccount.bucket_name,
});

function getFirebaseAdmin() {
  return admin;
}

function getFirebaseStorage() {
  return admin.storage().bucket();
}

async function getDownloadURLFirebaseStorageFileByName(fileName) {
  const fileRef = getFirebaseStorage().file(fileName);
  return await getDownloadURL(fileRef);
}

async function uploadToFirebaseStorage(fileName, content) {
  try {
    await getFirebaseStorage().file(fileName).save(content);
    let downloadURL = await getDownloadURLFirebaseStorageFileByName(fileName);
    return downloadURL;
  } catch (error) {
    return new Error('Failed to upload to Firebase Storage', error);
  }
}

async function deleteFirebaseStorageFile(fileName) {
  try {
    await getFirebaseStorage().file(fileName).delete();
    return true;
  } catch (error) {
    return new Error('Failed to upload to Firebase Storage', error);
  }
}
module.exports = {
  getFirebaseAdmin,
  getFirebaseStorage,
  getDownloadURLFirebaseStorageFileByName,
  uploadToFirebaseStorage,
  deleteFirebaseStorageFile,
};
