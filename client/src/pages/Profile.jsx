import React, {useRef, useState, useEffect} from 'react'
import { useSelector } from 'react-redux';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {app} from "../firebase";

export default function Profile() {
    const {currentUser} = useSelector(state => state.user);
    const fileRef = useRef(null);
    const [image, setImage] = useState(undefined);
    const [imagePercent, setImagePercent] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        if(image){
            handleFileUpload(image);
        }
    }, [image]);

    const handleFileUpload = async (image) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + image.name;
        const storageRef  = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImagePercent(Math.round(progress));
            },
            (error) => {
                setImageError(true);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setFormData({...formData, profilePicture: downloadURL}));
            },
        );
    };

    return (
        <div className="p-3 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
            <form className="flex flex-col gap-4 shadow-xl rounded-lg">
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={(event) => setImage(event.target.files[0]) } />
                <img src={formData.profilePicture || currentUser.profilePicture} alt="profile image" className="h-24 w-24 self-center cursor-pointer rounded-full object-cover hover:opacity-50" onClick={()=> fileRef.current.click()}/>
                <p className="text-sm self-center">
                    {imageError ? (<span className ="text-red-700">Error uploading image ("File size must be less than 2 MB")</span>) : imagePercent>0 && imagePercent < 100 ? (
                    <span className="text-slate-700">{`Uploading: ${imagePercent} %`}</span>) : imagePercent === 100 ? (
                    <span className="text-green-700">Image uploaded sucessfully</span>) : ("")}
                </p>
                <div className="flex flex-col p-10 gap-4 rounded-lg">
                    <p>UserName:</p>
                    <input defaultValue={currentUser.username} type="text" id="username" placeholder="Username" className="border border-slate-200 rounded-lg p-3" readOnly />
                    <p>Email:</p>
                    <input defaultValue={currentUser.email} type="text" id="email" placeholder="Email" className="border border-slate-200 rounded-lg p-3" readOnly />
                    <p>Password:</p>
                    <input type="password" id="password" placeholder="Change Password" className="border border-slate-200 rounded-lg p-3"/>
                    <p>Confirm Password:</p>
                    <input type="password" id="confirm-password" placeholder="Confirm Password" className="border border-slate-200 rounded-lg p-3"/>
                    <button className="bg-slate-700 text-white p-3 mt-2 rounded-lg uppercase hover:opacity-90 disabled:opacity-80">update</button>
                    <div className="flex flex-row justify-between">
                        <span className="text-red-700 cursor-pointer">Delete Account</span>
                        <span className="text-red-700 cursor-pointer">Sign out</span>
                    </div>
                </div>
            </form>
        </div>
    )
}
