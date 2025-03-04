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
            balance: 10000,  
            portfolio: []    
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
      setError("Invalid credentials");
    }
  };
  


  return (
    <Container>
      <LoginBox>
        <h1>{isRegistering ? "Sign Up" : "Login to Stonks"}</h1>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleAuth}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit"disabled={loading}>
            {loading ? "Processing..." : isRegistering ? "Sign Up" : "Login"}
          </Button>
        </Form>
        <ToggleText onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "New user? Sign Up"}
        </ToggleText>
      </LoginBox>
    </Container>
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
