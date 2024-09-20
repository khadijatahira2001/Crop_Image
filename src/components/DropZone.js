import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, arrayUnion, doc, getDocs } from '@firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from "@firebase/storage";

const DropZone = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [crops, setCrops] = useState([]); // Each image's crop state stored separately
  const [completedCrops, setCompletedCrops] = useState([]); // Each image's completed crop state
  const imageRefs = useRef([]); // Refs to access images for cropping
  const captionRef = useRef(null);

  // Dropzone styles
  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
  };
  
  const focusedStyle = { borderColor: '#2196f3' };
  const acceptStyle = { borderColor: '#00e676' };
  const rejectStyle = { borderColor: '#ff1744' };

  const uploadSave = async () => {
    try {
      const clction = collection(db, "saves");

      const docRef = await addDoc(clction, {
        caption: captionRef.current.value,
        timeStamp: serverTimestamp(),
      });

      await Promise.all(
        selectedImages.map(async (image, index) => {
          const croppedBlob = await getCroppedImg(imageRefs.current[index], completedCrops[index]);
          const imageRef = ref(storage, `saves/${docRef.id}/${image.path}`);
          await uploadBytes(imageRef, croppedBlob);
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(db, "saves", docRef.id), {
            image: arrayUnion(downloadURL),
          });
        })
      );

      captionRef.current.value = '';
      setSelectedImages([]);

    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    
    setSelectedImages(prevImages => [...prevImages, ...newImages]);

    setCrops(prevCrops => [...prevCrops, { aspect: 1 }]);
    setCompletedCrops(prevCompletedCrops => [...prevCompletedCrops, null]);

  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [isFocused, isDragAccept, isDragReject]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      selectedImages.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [selectedImages]);

  const selected_images = selectedImages.map((file, index) => (
    <div key={index}>
      <ReactCrop
        crop={crops[index]} // Unique crop state for each image
        onChange={(newCrop) => {
          const updatedCrops = [...crops];
          updatedCrops[index] = newCrop;
          setCrops(updatedCrops);
        }}
        onComplete={(c) => {
          const updatedCompletedCrops = [...completedCrops];
          updatedCompletedCrops[index] = c;
          setCompletedCrops(updatedCompletedCrops);
        }}
        aspect={1} // Square cropping
      >
        <img
          ref={(el) => (imageRefs.current[index] = el)} // Store image ref for cropping
          src={file.preview}
          style={{ width: '500px' }}
          alt="preview"
        />
      </ReactCrop>
    </div>
  ));

  return (
    <div>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drop the files here ...</p>
      </div>
      <input
        className="border rounded focus:ring-0 w-full text-sm p-3 my-4"
        ref={captionRef}
        type="text"
        placeholder="Enter a caption"
      />
      <button
        className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border rounded"
        onClick={uploadSave}
      >
        Save
      </button>
      {selected_images}
    </div>
  );
};

export default DropZone;
