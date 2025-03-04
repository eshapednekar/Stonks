import React, { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../../library/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useUser } from "../../context/UserContext";

const StockModal = ({ stock, isOpen, onClose, action }) => {
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const { user, balance, portfolio, setBalance, setPortfolio } = useUser();

    if (!isOpen || !stock) return null;

    const handleConfirm = async () => {
        if (!user) {
            setError("You need to log in to perform transactions.");
            return;
        }
    
        setError(""); // Reset errors
    
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
    
        if (!userSnap.exists()) {
            setError("User data not found.");
            return;
        }
    
        let userData = userSnap.data();
        let newBalance = userData.balance;
        let updatedPortfolio = [...userData.portfolio];
    
        // Find stock in portfolio
        const stockIndex = updatedPortfolio.findIndex((s) => s.name === stock.name);
    
        if (action === "buy") {
            const totalCost = stock.price * quantity;
            if (newBalance < totalCost) {
                setError("Not enough balance!");
                return;
            }
            newBalance -= totalCost;
    
            if (stockIndex !== -1) {
                // Update existing stock quantity & avg price
                let existingStock = updatedPortfolio[stockIndex];
                let newQuantity = existingStock.quantity + quantity;
                let newAvgPrice = ((existingStock.avgPrice * existingStock.quantity) + (stock.price * quantity)) / newQuantity;
    
                updatedPortfolio[stockIndex] = {
                    ...existingStock,
                    quantity: newQuantity,
                    avgPrice: newAvgPrice
                };
            } else {
                // Add new stock to portfolio
                updatedPortfolio.push({
                    name: stock.name,
                    quantity,
                    avgPrice: stock.price
                });
            }
        } else if (action === "sell") {
            if (stockIndex === -1 || updatedPortfolio[stockIndex].quantity < quantity) {
                setError("Not enough shares to sell!");
                return;
            }
            let stockToSell = updatedPortfolio[stockIndex];
            stockToSell.quantity -= quantity;
            newBalance += stock.price * quantity;
    
            if (stockToSell.quantity === 0) {
                updatedPortfolio.splice(stockIndex, 1); // Remove stock if all shares are sold
            }
        }
    
        await updateDoc(userRef, {
            balance: newBalance,
            portfolio: updatedPortfolio
        });
    
        setBalance(newBalance);
        setPortfolio(updatedPortfolio);
    
        console.log(`${action === "buy" ? "Bought" : "Sold"} ${quantity} ${stock.name}`);
        onClose(); 
    };
    

    return (
        <ModalOverlay>
            <ModalContent>
                <h2>{action === "buy" ? "Buy" : "Sell"} {stock.name}</h2>
                <p>Price per share: ${stock.price.toFixed(2)}</p>
                <Input
                    type="number"
                    value={quantity}
                    min="1"
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <ButtonContainer>
                    <ConfirmButton onClick={handleConfirm}>
                        {action === "buy" ? "Confirm Purchase" : "Confirm Sale"}
                    </ConfirmButton>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                </ButtonContainer>
            </ModalContent>
        </ModalOverlay>
    );
};

export default StockModal;

// 🔹 Styled Components for Modal UI
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #1a1a2e;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;

const Input = styled.input`
    width: 50px;
    padding: 5px;
    margin: 10px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
`;

const ConfirmButton = styled.button`
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

const CancelButton = styled.button`
    background: #db4437;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background: #c1351d;
    }
`;

const ErrorMessage = styled.p`
    color: red;
    margin: 10px 0;
`;
