import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../library/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle for Sign-up/Login
  const [loading, setLoading] = useState(false);

    // Function to create a Firestore document for new users
    const createUserDocument = async (user) => {
        if (!user) return;
    
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
    
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            balance: 10000,  // Starting balance
            portfolio: []    // Empty portfolio
          });
        }
      };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
    let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered successfully:", email);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully:", email);
      }
      const user = userCredential.user;
      await createUserDocument(user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Firebase Auth Error:", err.code, err.message);
      setError(`Error: ${err.message}`);
    }
  };
  


  return (
    <div style={{display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#0f0f0f",
      color: "white"}}>
      <div style={{
        background: "#1a1a2e",
        padding: "40px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
      }}>
        <h1>{isRegistering ? "Sign Up" : "Login to Stonks"}</h1>
        {error && <p style={{color: "red"}}>{error}</p>}
        <form onSubmit={handleAuth} style = {{  display: "flex", flexDirection: "column",  gap: "10px"}}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{  
            padding: "10px",
            borderRadius: "5px",
            border: "none"}}/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{  
            padding: "10px",
            borderRadius: "5px",
            border: "none"}}/>
          <button type="submit"disabled={loading} style={{  
            background: "#4caf50",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"}}>
            {loading ? "Processing..." : isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>
        <p onClick={() => setIsRegistering(!isRegistering)} style={{
          color: "lightgray",
          cursor: "pointer",
          marginTop: "10px",
          textDecoration: "underline",
        }}>
          {isRegistering ? "Already have an account? Login" : "New user? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default Login;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #0f0f0f;
  color: white;
`;

const LoginBox = styled.div`
  background: #1a1a2e;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;


const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
`;

const Button = styled.button`
  background: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #45a049;
  }
`;

const GoogleButton = styled(Button)`
  background: #db4437;
  &:hover {
    background: #c1351d;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const ToggleText = styled.p`
  color: lightgray;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    color: white;
  }
`;