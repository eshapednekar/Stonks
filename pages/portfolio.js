import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { auth, signOut } from "../library/firebaseConfig";
import { useRouter } from "next/router";

const Portfolio = () => {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [portfolioSplit, setPortfolioSplit] = useState([]);
  const [balance, setBalance] = useState(10000); // Default balance

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensures localStorage runs only on the client
      const storedPortfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
      setPortfolio(storedPortfolio);

      const storedBalance = parseFloat(localStorage.getItem("balance")) || 10000;
      setBalance(storedBalance);

      // Calculate Total Invested
      const total = storedPortfolio.reduce((sum, stock) => sum + stock.avgPrice * stock.quantity, 0);
      setTotalInvested(total);

      // Calculate Portfolio Split (%)
      const split = storedPortfolio.map(stock => ({
        name: stock.name,
        percentage: total > 0 ? ((stock.avgPrice * stock.quantity) / total) * 100 : 0,
      }));
      setPortfolioSplit(split);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Container>
      <Header>
        <h1> Portfolio</h1>
        <ControlsColumn>
          <div>
            <Button onClick={() => router.push("/dashboard")}>View Dashboard</Button>
            <Button onClick={() => router.push("/settings")}>Settings</Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div> 
        </ControlsColumn>
      </Header>
      <BalanceRow>
          <h2>💰 Current Balance: ${balance.toFixed(2)}</h2>
      </BalanceRow>
      {portfolio.length === 0 ? (
        <p>You don't own any stocks yet.</p>
      ) : (
        <>
          <StockList>
            {portfolio.map((stock, index) => (
              <StockItem key={index}>
                <h3>{stock.name}</h3>
                <p>Shares: {stock.quantity}</p>
                <p>Avg Purchase Price: ${stock.avgPrice ? stock.avgPrice.toFixed(2) : "N/A"}</p>
              </StockItem>
            ))}
          </StockList>

          
          <AnalyticsContainer>
            <AnalyticsHeading>
            <h2>Portfolio Insights</h2>
            <p><strong>Total Amount Invested:</strong> ${totalInvested.toFixed(2)}</p>
            </AnalyticsHeading>
            <h2>Portfolio Split</h2>
            <PortfolioSplit>
              {portfolioSplit.map((stock, index) => (
                <p key={index}>{stock.name}: {stock.percentage.toFixed(2)}%</p>
              ))}
            </PortfolioSplit>
          </AnalyticsContainer>
        </>
      )}
    </Container>
  );
};

export default Portfolio;

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

const ControlsColumn = styled.div`
  display: flex;
  justify-content: flex-end; 
  align-items: flex-end;
  width: 100%;
  margin-top: 10px;
  gap: 20px;
`;

const BalanceRow = styled.div`
  text-align: right; /* Align the balance to the right */
  margin-top: 10px;
  width: 100%;
  padding-right: 20px;
`;

const StockList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const StockItem = styled.div`
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const AnalyticsHeading = styled.div`
  background: #1a1a2e;
  margin-top: 20px;
  text-align: center;
`;

const AnalyticsContainer = styled.div`
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: left;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;

const PortfolioSplit = styled.div`
  margin-top: 10px;
  text-align: left;
  padding-left: 20px;
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
