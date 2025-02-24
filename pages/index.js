import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { auth, provider, signInWithPopup, signInWithEmailAndPassword } from "../library/firebaseConfig";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect after login
    } catch (err) {
      setError("Invalid credentials. Try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <Container>
      <LoginBox>
        <h1>🔑 Login to Stonks</h1>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleLogin}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit">Login</Button>
          <GoogleButton onClick={handleGoogleLogin}>Sign in with Google</GoogleButton>
        </Form>
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
