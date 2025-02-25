import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

const Settings = () => {
  const router = useRouter();

  return (
    <Container>
      <h1>Settings</h1>
      <p>Manage your account, reset your portfolio, and adjust preferences.</p>
      <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
    </Container>
  );
};

export default Settings;

// Styled Components
const Container = styled.div`
  text-align: center;
  color: white;
  background: #0f0f0f;
  min-height: 100vh;
  padding: 20px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  border: none;
  margin-top: 20px;
  &:hover {
    background: #0056b3;
  }
`;
