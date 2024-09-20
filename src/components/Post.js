import React, { useState, useEffect } from 'react'
import { collection,onSnapshot, orderBy,query } from '@firebase/firestore';
import { db } from '../firebase';
import moment from 'moment';
const Post = () => {
    const [posts, setposts] = useState([])
    const postImages = (save) => {
      if (!save.image || save.image.length === 0) return null;
  
      const postImages = save.image.map((file, index) => (
        <div key={index} className="relative w-full h-full">
          <img src={file} alt="Post" className="object-cover w-full h-full" />
        </div>
      ));
  
      return postImages;
    };
    useEffect(() =>{
        const collectionRef = collection(db,"saves");
        const q = query(collectionRef,orderBy("timeStamp","desc"))
        const unsubscribe = onSnapshot(q, (QuerySnapshot) =>{
            setposts(QuerySnapshot.docs.map(doc => ({...doc.data(), id: doc.id, timeStamp:doc.data().timeStamp?.toDate().getTime() })))
        });
        return unsubscribe
    }, [])
    
  return (
    <div>
      
      {
        posts.map(save=><div key={save.id}
         className='bg-white rounded-lg shadow-xl p-8 w-1/2 m-auto mb-4'>
            <div className='text-lg'>
                {save.caption}
            </div>
            <div className='flex space-x-3'>
              {postImages(save)}
            </div>
        </div>
        )
      }
    </div>
  )
}

export default Post
