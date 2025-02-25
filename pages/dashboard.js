import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, signOut } from "../library/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import StockCard from "./components/StockCard";

const STOCKS = ["SkibidiCoin", "RizzToken", "SigmaStock", "MemeCorp", "BrainRotInc", "CloutCloud", "GrindSet", "DoomScroll"];

const Dashboard = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 10000); // Update every 5s
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

  const handleTransaction = (stock, type) => {
    setSelectedStock(stock);
    setTransactionType(type);
    setShowModal(true);
    setQuantity(1);
  };

  const confirmTransaction = () => {
    let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
    let balance = parseFloat(localStorage.getItem("balance")) || 10000; // Default to $10,000 if not set
  
    if (transactionType === "buy") {
      const cost = selectedStock.price * quantity;
      if (cost > balance) {
        alert("Not enough funds to complete this purchase!");
        return;
      }
  
      const existingStock = portfolio.find((s) => s.name === selectedStock.name);
      if (existingStock) {
        const prevTotalCost = existingStock.avgPrice * existingStock.quantity;
        const newTotalCost = selectedStock.price * quantity;
        const newTotalQuantity = existingStock.quantity + quantity;
  
        existingStock.avgPrice = (prevTotalCost + newTotalCost) / newTotalQuantity;
        existingStock.quantity = newTotalQuantity;
      } else {
        portfolio.push({ 
          name: selectedStock.name, 
          avgPrice: selectedStock.price, 
          quantity 
        });
      }
  
      balance -= cost; // Deduct money for buying stocks
    } else {
      const stockIndex = portfolio.findIndex((s) => s.name === selectedStock.name);
      if (stockIndex !== -1 && portfolio[stockIndex].quantity >= quantity) {
        portfolio[stockIndex].quantity -= quantity;
        balance += selectedStock.price * quantity; // Add money when selling
  
        if (portfolio[stockIndex].quantity === 0) {
          portfolio.splice(stockIndex, 1);
        }
      } else {
        alert("Not enough shares to sell!");
        return;
      }
    }
  
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("balance", balance.toFixed(2)); // Store balance
    setShowModal(false);
  };
  

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Container>
      <Header>
      <h1> Stonks</h1>
      <Controls>
      <Button onClick={() => router.push("/portfolio")}>View Portfolio</Button>
      <Button onClick={handleLogout}>Logout</Button> 
      </Controls>    
      </Header>
    {stocks.length === 0 ? (
      <p>Loading stocks...</p>
    ) : (<StockGrid>
      {stocks.map((stock, index) => (
        <StockCard
          key={index}
          stock={stock}
          onBuy={() => handleTransaction(stock, "buy")}
          onSell={() => handleTransaction(stock, "sell")}
        />
      ))}
    </StockGrid>
    )}
    {showModal && (
      <Modal>
        <ModalContent>
          <h2>{transactionType === "buy" ? "Buy" : "Sell"} {selectedStock?.name}</h2>
          <p>Price: ${selectedStock?.price.toFixed(2)}</p>
          <label>Quantity:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
          <ModalButtons>
          <Button onClick={confirmTransaction}>Confirm</Button>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalButtons>
        </ModalContent>
      </Modal>
    

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

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 20px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
`;
