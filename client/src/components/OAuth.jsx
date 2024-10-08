import React from 'react'
import {GoogleAuthProvider, signInWithPopup, getAuth} from "firebase/auth";
import {app} from "../firebase.js";
import {useDispatch} from "react-redux";
import {signInSuccess} from "../redux/user/userSlice.js";
import {useNavigate} from "react-router-dom";
export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try{
            
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);
            const res = await fetch('https://ai-summarizer-alpha-nine.vercel.app/api/auth/google', {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                }),
            });
            const data = await res.json();
            dispatch(signInSuccess(data));
            navigate("/");
        }catch(error){
            console.log("Could not login with google", error);
        }
    };
  return (
    <button type="button" onClick={handleGoogleClick} className="bg-white border-2 border-black  text-black rounded-lg p-3 w-3/4 hover:bg-opacity-10">Continue with Google</button>
  )
}
