import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { auth, db } from "../library/firebaseConfig";
import {signOut} from "firebase/auth";
import {  doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

const yahooApiKey = "68c0a7c7f6mshf5f0dcfc7db9b56p159e5fjsn05f2884b78fd";
const yahooUrl = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-timeseries?symbol=IBM&region=US";

const Portfolio = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [portfolioSplit, setPortfolioSplit] = useState([]);
  const [balance, setBalance] = useState(10000); // Default balance
  const [newsArticles, setNewsArticles] = useState([]);
  const router = useRouter();

  // Fetch users from firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUser(user);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPortfolio(data.portfolio || []);
          setBalance(data.balance || 0);
        }
      }
    };
    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(yahooUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": yahooApiKey,
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.news && Array.isArray(data.news)) {
            setNewsArticles(data.news.slice(0, 2)); // Show 2 latest news articles
        } else {
            console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    fetchPortfolioFromFirestore();
  }, []);

  const fetchPortfolioFromFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const portfolio = userData.portfolio || [];
  
        // Calculate total amount invested
        let totalInvested = portfolio.reduce((acc, stock) => {
          return acc + (stock.avgPrice * stock.quantity || 0);
        }, 0);
  
  
        // Calculate portfolio split (percentage of each stock)
        let portfolioSplit = portfolio.map(stock => ({
          name: stock.name,
          percentage: totalInvested > 0 ? ((stock.avgPrice * stock.quantity) / totalInvested) * 100 : 0,
        }));
  
  
        setTotalInvested(totalInvested.toFixed(2));
        setPortfolioSplit(portfolioSplit);
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching portfolio from Firestore:", error);
    }
  };

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
          <h2>💰Balance: ${balance.toFixed(2)}</h2>
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
            </AnalyticsHeading>
            <h2>Portfolio Split</h2>
            <p><strong>Total Amount Invested:</strong> ${totalInvested}</p>
            <PortfolioSplit>
            {portfolioSplit.length > 0 ? (
            <ul>
                {portfolioSplit.map((stock, index) => (
                <li key={index}>
                {stock.name}: {stock.percentage.toFixed(2)}% </li>
                ))}
            </ul>
            ) : (
            <p>No portfolio data available.</p>
            )}
            </PortfolioSplit> 
            </AnalyticsContainer>
            <NewsContainer>
            <h2> Stock Market News</h2>
        {newsArticles.length > 0 ? (
          newsArticles.map((article, index) => (
            <NewsCard key={index}>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <a href={article.link} target="_blank" rel="noopener noreferrer">Read More</a>
            </NewsCard>
            
            ))
        ) : (
          <p>Loading stock news...</p>
        )}
        </NewsContainer>
         
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

const NewsContainer = styled.div`
  margin-top: 10px;
  text-align: center;
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

