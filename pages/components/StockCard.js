import React from "react";
import styled from "styled-components";

const StockCard = ({ stock, onBuy, onSell }) => {
  return (
    <Card>
      <h2>{stock?.name || "Unknown Stock"}</h2>
      <p>Price:{typeof stock?.price === "number" 
    ? `$${stock.price.toFixed(2)}` 
    : "Loading..."}</p>
      <ButtonContainer>
        <Button onClick={() => onBuy(stock)}>Buy</Button>
        <ButtonSell onClick={() => onSell(stock)}>Sell</ButtonSell>
      </ButtonContainer>
    </Card>
  );
};

export default StockCard;

// Styled Components
const Card = styled.div`
  background: #1a1a2e;
  color: white;
  padding: 20px;
  margin: 10px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
`;

const Button = styled.button`
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #45a049;
  }
`;

const ButtonSell = styled(Button)`
  background: #d9534f;
  &:hover {
    background: #c9302c;
  }
`;
