import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

const getFileUrls = async (folderPath, keyword) => {
  try {
    const storage = getStorage();
    const folderRef = ref(storage, folderPath);
    const folderSnapshot = await listAll(folderRef);
    const files = folderSnapshot.items;
    
    const filteredFiles = files.filter(fileRef => fileRef.name.toLowerCase().includes(keyword.toLowerCase()));
    
    const fileUrls = await Promise.all(filteredFiles.map(async (fileRef) => {
      const url = await getDownloadURL(fileRef);
      return { name: fileRef.name, url };
    }));
    
    return fileUrls;
  } catch (error) {
    console.error("Error getting file URLs: ", error);
    throw error;
  }
};

export default getFileUrls;


// import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// const getFileUrl = async (filePath) => {
//   try {
//     const storage = getStorage();
//     const fileRef = ref(storage, filePath);
//     const url = await getDownloadURL(fileRef);
//     return url;
//   } catch (error) {
//     console.error("Error getting file URL: ", error);
//     throw error;
//   }
// };

// export default getFileUrl;
