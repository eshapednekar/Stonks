import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { auth, db, signOut } from "../library/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

const Settings = () => {
  const router = useRouter();
  const { user, balance, portfolio, stocks } = useUser();
  const [totalIndividualValue, setTotalIndividualValue] = useState(0);

  useEffect(() => {
    console.log("Balance:", balance);
  console.log("Portfolio:", portfolio);
  console.log("Stocks:", stocks);
    if (balance !== null && stocks && portfolio) {  
      const totalInvestment = portfolio.reduce((total, stock) => {
        if (!stocks[stock.name]) {
          console.warn(`Stock data missing for: ${stock?.name}`);
          return total; 
        }
  
        const currentPrice = stocks[stock.name]?.price ?? stock.avgPrice ?? 0;
        return total + stock.quantity * currentPrice;
      }, 0);
  
      setTotalIndividualValue(balance + totalInvestment);  
    }
  }, [balance, stocks, portfolio]); 
  

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Container>
    <Header>
      <h1>Settings</h1>
      <Controls>
      <Button onClick={() => router.push("/dashboard")}>View Dashboard</Button>
      <Button onClick={() => router.push("/portfolio")}>View Portfolio</Button> 
      </Controls>
      </Header>
      <InfoContainer>
        {user ? (
          <>
            <UserInfo><strong>Email:</strong> {user.email}</UserInfo>
            <UserInfo><strong>Current Balance:</strong> ${balance.toFixed(2) || "Loading..."}</UserInfo>
            <UserInfo><strong>Stocks Owned:</strong> {portfolio.length || 0} stocks</UserInfo>
            <UserInfo><strong>Total Individual Value:</strong> ${totalIndividualValue.toFixed(2) || "Loading..."}</UserInfo>
          </>
        ) : (
          <p>Loading user information...</p>
        )}
      </InfoContainer>
      <LogoutContainer>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </LogoutContainer>
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end; 
  align-items: flex-end;
  width: 100%;
  margin-top: 10px;
  gap: 20px;
`;

const InfoContainer = styled.div`
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: left;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;

const UserInfo = styled.p`
  font-size: 18px;
  margin: 10px 0;
`;


const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 10px;
  margin:10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  border: none;
  &:hover {
    background: #0056b3;
  }
`;

const LogoutButton = styled.button`
  background: #ff4d4d;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 16px;
  &:hover {
    background: #cc0000;
  }
`;

const LogoutContainer = styled.div`
  display: flex;
  justify-content: flex-end; 
  align-items: flex-end;
`;