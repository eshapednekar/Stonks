import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, signOut } from "../library/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import StockCard from "./components/StockCard";

const STOCKS = ["SkibidiCoin", "RizzToken", "SigmaStock", "MemeCorp", "GrindSetInc"];

const Dashboard = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchStockPrices = async () => {
    try {
      const responses = await Promise.all(
        STOCKS.map(async (stock) => {
          const res = await fetch(
            "https://www.random.org/integers/?num=1&min=-5&max=5&col=1&base=10&format=plain&rnd=new"
          );
          const text = await res.text();
          const change = parseFloat(text.trim());
  
          return { name: stock, price: 100 + (change / 100) * 100 };
        })
      );
      setStocks(responses);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
    }
  };

  const handleBuy = (stock) => {
    alert(`You bought ${stock.name} at $${stock.price.toFixed(2)}`);
  };

  const handleSell = (stock) => {
    alert(`You sold ${stock.name} at $${stock.price.toFixed(2)}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Container>
      <h1> Stonks 📈</h1>
      <Button onClick={handleLogout}>Logout</Button>
      <Button onClick={() => router.push("/portfolio")}>View Portfolio</Button>
    {stocks.length === 0 ? (
      <p>Loading stocks...</p>
    ) : (<StockGrid>
        {stocks.map((stock, index) => (
          <StockCard key={index} stock={stock} onBuy={handleBuy} onSell={handleSell} />
        ))}
      </StockGrid>
    )}
    </Container>
  );
};

export default Dashboard;

// Styled Components
const Container = styled.div`
  text-align: center;
  color: white;
  background: #0f0f0f;
  min-height: 100vh;
  padding: 20px;
`;

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Button = styled.button`
  background: red;
  color: white;
  padding: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background: darkred;
  }
`;
