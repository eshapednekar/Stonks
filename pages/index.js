import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styled from "styled-components";
import StockCard from "./components/StockCard";

const STOCKS = ["SkibidiCoin", "RizzToken", "SigmaStock", "MemeCorp", "GrindSetInc"];

const Home = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
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

  return (
    <Container>
      <h1>📈 Stonks Trading Simulator</h1>
      <StockGrid>
        {stocks.map((stock, index) => (
          <StockCard key={index} stock={stock} onBuy={handleBuy} onSell={handleSell} />
        ))}
      </StockGrid>
    </Container>
  );
};

export default Home;

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