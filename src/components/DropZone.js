import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {db, storage } from '../firebase';
import { addDoc,collection,serverTimestamp, updateDoc,arrayUnion,doc } from '@firebase/firestore';
import {ref, getDownloadURL, uploadBytes} from "@firebase/storage"
const DropZone = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const captionRef = useRef(null)
  const uploadSave = async () => {
    const docRef = await addDoc(collection(db, "saves"), {
        caption: captionRef.current.value,
        timestamp: serverTimestamp(),
      });
      console.log("console",docRef)

      await Promise.all(
        selectedImages.map(image=>{
            const imageRef = ref(storage, `saves${docRef.id}/${image.path}`);
            uploadBytes(imageRef, image,"data_url".then(async()=>{
                const downlaodURL = await getDownloadURL(imageRef)
                console.log("download",downlaodURL)
                await updateDoc(doc(db,"saves", docRef.id),{
                    image: arrayUnion(downlaodURL)
                })
            }))
        })
      )
   captionRef.current.value=''
   setSelectedImages([])
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

export default DropZone;
