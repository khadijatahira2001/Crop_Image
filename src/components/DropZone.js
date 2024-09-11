import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {db, storage } from '../firebase';
import { addDoc,collection,serverTimestamp, updateDoc,arrayUnion,doc, getDocs } from '@firebase/firestore';
import {ref, getDownloadURL, uploadBytes} from "@firebase/storage"
const DropZone = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const captionRef = useRef(null)
    const uploadSave = async () => {
      try {
          const clction = collection(db, "saves");
          console.log("collection", clction.path);

          // Get docs
          const querySnapshot = await getDocs(collection(db, 'saves'));
          console.log("querySnapshot", querySnapshot);

  
          // Get document reference
          const docRef = await addDoc(clction, {
              caption: captionRef.current.value,
              createdAt: serverTimestamp(),
          });
          console.log("Document written with ID: ", docRef.id);
  
          await Promise.all(
            selectedImages.map(async (image) => {
                try {
                    const imageRef = ref(storage, `saves${docRef.id}/${image.path}`);
                    await uploadBytes(imageRef, image, "data_url");
                    const downloadURL = await getDownloadURL(imageRef);
                    console.log("downloadURL", downloadURL);
                    await updateDoc(doc(db, "saves", docRef.id), {
                        image: arrayUnion(downloadURL),
                    });
                } catch (imageError) {
                    console.error("Error uploading image:", imageError);
                }
            })
        );

        captionRef.current.value = '';
        setSelectedImages([]);
    } catch (error) {
        console.error("Error saving document:", error);
      }
  };
  


  const onDrop = useCallback((acceptedFiles) => {
    console.log("accepted files",acceptedFiles)
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    console.log("new images",newImages)
    setSelectedImages(newImages);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    // Cleanup function to revoke the data URLs to avoid memory leaks
    return () => {
      selectedImages.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [selectedImages]);

  const selected_images = selectedImages.map((file, index) => (
    <div key={index}>
      <img src={file.preview} style={{ width: '200px' }} alt="preview" />
    </div>
  ));
  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drop the files here ...</p>
      </div>
      <input ref={captionRef} type='text' placeholder='Enter a caption'/>
      <button onClick={uploadSave}>Save</button>
      {selected_images}
    </div>
  );
};

export default DropZone;
