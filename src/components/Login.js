import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import "../styles/Login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const googleSignIn = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  auth.beforeAuthStateChanged(() => {
    setLoading(true);
  });

  return (
    <main className="login_container">
      <div className="chat_login">
        <h1 style={{ color: "white" }}>React Chat Application </h1>
        <img src="/logo512.png" alt="ReactJs logo" width={70} height={70} />
        {!loading ? (
          <img
            className="login_button"
            onClick={googleSignIn}
            src={
              require("../assets/btn_google_signin_light_normal_web.svg")
                .default
            }
            alt=""
          />
        ) : (
          <div class="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </div>
    </main>
  );
}
