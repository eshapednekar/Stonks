import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../library/firebaseConfig";
import styled from "styled-components";
import StockCard from "./components/StockCard";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import StockModal from "./components/StockModal";
import { useUser } from "../context/UserContext";


const Dashboard = () => {
  const router = useRouter();
  const [selectedStock, setSelectedStock] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { user, stocks } = useUser();
 
  const openModal = (stock, type) => {
  if (!user) {
    alert("You need to log in to perform transactions.");
    return;
  }
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
) : !stocks || Object.keys(stocks).length === 0? (
  <p>No stocks available.</p>
  ) : (
    <StockGrid>
      {Object.keys(stocks).map((stockName) => (
        <StockCard
          key={stockName}
          stock={stocks[stockName]}
          onBuy={() => openModal(stocks[stockName], "buy")}
          onSell={() => openModal(stocks[stockName], "sell")}
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

