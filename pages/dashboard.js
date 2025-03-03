import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth, signOut } from "../library/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import StockCard from "./components/StockCard";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import StockModal from "./components/StockModal";

const Dashboard = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAndUpdateStocks = async () => {
      await fetchStocksFromFirestore();
    };
  
    fetchAndUpdateStocks(); // Fetch once on load
    const interval = setInterval(fetchAndUpdateStocks, 10000); // Update every 10s
  
    return () => clearInterval(interval);
  }, []);
  

  const fetchStocksFromFirestore = async () => {
    try {
      const stocksRef = collection(db, "stocks");
      const stocksSnapshot = await getDocs(stocksRef);
      
      let stockList = stocksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Fetched stocks from Firestore:", stockList); // Debugging
  
      // Get random percentage changes for each stock using Random.org API
      const randomNumbers = await fetchRandomPercentChanges(stockList.length);
      console.log("Random.org values:", randomNumbers); // Debugging
  
      // Apply changes to stock prices
      const updatedStocks = stockList.map((stock, index) => {
        const changePercent = randomNumbers[index] / 100; // Convert to percentage
        const newPrice = Number(stock.price) * (1 + changePercent); // Ensure it's a number
        return { ...stock, price: Number(newPrice.toFixed(2)) };
      });
  
      console.log("Updated stocks with new prices:", updatedStocks); // Debugging
  
      // Update state first
      setStocks(updatedStocks);
  
      // Update Firestore asynchronously (but after setting state)
      updatedStocks.forEach(async (stock) => {
        const stockDoc = doc(db, "stocks", stock.id);
        await updateDoc(stockDoc, { price: stock.price });
      });
  
    } catch (error) {
      console.error("Error fetching stocks from Firestore:", error);
    }
  };

  const fetchRandomPercentChanges = async (count) => {
    try {
      const response = await fetch(
        `https://www.random.org/integers/?num=${count}&min=-5&max=5&col=1&base=10&format=plain&rnd=new`
      );
  
      const text = await response.text();
      const numbers = text.trim().split("\n").map(Number);
      
      console.log("Fetched random changes:", numbers); // Debugging
      return numbers;
    } catch (error) {
      console.error("Error fetching random values:", error);
      return Array(count).fill(0); // Default to 0 change if API fails
    }
  };  

 
const openModal = (stock, type) => {
  setSelectedStock(stock);
  setTransactionType(type);
  setShowModal(true);
};

  const closeModal = () => {
    setSelectedStock(null);
    setTransactionType("");
    setShowModal(false);
  };  

  return (
    <Container>
      <Header>
      <h1> Stonks</h1>
      <Controls>
      <Button onClick={() => router.push("/portfolio")}>View Portfolio</Button>
      <Button onClick={() => router.push("/settings")}>Settings</Button>
      </Controls>    
      </Header>
      {!stocks ? (
  <p>Loading stocks...</p>
) : stocks.length === 0 ? (
  <p>No stocks available.</p>
  ) : (
    <StockGrid>
      {stocks.map((stock, index) => (
        <StockCard
          key={index}
          stock={stock}
          onBuy={() => openModal(stock, "buy")}
          onSell={() => openModal(stock, "sell")}
        />
      ))}
    </StockGrid>
    )}
      {showModal && selectedStock && (
        <StockModal
          stock={selectedStock}
          isOpen={showModal}
          onClose={closeModal}
          action={transactionType}
        />
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

