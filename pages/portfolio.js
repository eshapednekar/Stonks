import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { auth, signOut } from "../library/firebaseConfig";
import { useRouter } from "next/router";

const Portfolio = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(parseFloat(localStorage.getItem("balance")) || 10000);

  useEffect(() => {
    const storedBalance = parseFloat(localStorage.getItem("balance")) || 10000;
    setBalance(storedBalance);
  }, []);


  useEffect(() => {
    const storedPortfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
    setPortfolio(storedPortfolio);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Container>
       <Header>
    <h1>Portfolio </h1>
    <Controls>
      <Button onClick={() => router.push("/dashboard")}>View Dashboard</Button>
      <Button onClick={handleLogout}>Logout</Button>
    </Controls>
  </Header>

  {/* Display Balance below the buttons */}
  <BalanceRow>
    <h2>💰 Balance: ${balance.toFixed(2)}</h2>
  </BalanceRow>
        
      {portfolio.length === 0 ? (
        <p>You don't own any stocks yet.</p>
      ) : (
        <StockList>
          {portfolio.map((stock, index) => (
            <StockItem key={index}>
              <h3>{stock.name}</h3>
              <p>Shares: {stock.quantity}</p>
              <p>Avg Purchase Price: ${stock.avgPrice ? stock.avgPrice.toFixed(2) : "N/A"}</p>
            </StockItem>
          ))}
        </StockList>
      )}
    </Container>
  );
};

export default Portfolio;

// Styled Components
const Container = styled.div`
  text-align: left;
  color: white;
  background: #0f0f0f;
  min-height: 100vh;
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

const Header = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
`;
const BalanceRow = styled.div`
  text-align: right; 
  margin-top: 10px;
  width: 100%;
  padding-right: 20px;
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

const StockList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const StockItem = styled.div`
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;
