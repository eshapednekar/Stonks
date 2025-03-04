import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "/library/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        setBalance(0);
        setPortfolio([]);
        setStocks({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setBalance(data.balance || 0);
        setPortfolio(data.portfolio || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchStockData = async () => {
    try {
      const stocksRef = collection(db, "stocks");
      const stocksSnapshot = await getDocs(stocksRef);
      const stocksData = {};

      stocksSnapshot.forEach((doc) => {
        stocksData[doc.id] = doc.data();
      });

      console.log("Fetched Stocks Data:", stocksData);
      setStocks(stocksData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStockData();
    }
  }, [user]);

  // Fetch random price changes from Random.org
  const fetchRandomPercentChanges = async (count) => {
    try {
      const response = await fetch(
        `https://www.random.org/integers/?num=${count}&min=-5&max=5&col=1&base=10&format=plain&rnd=new`
      );
      const text = await response.text();
      return text.trim().split("\n").map(Number);
    } catch (error) {
      console.error("Error fetching random values:", error);
      return Array(count).fill(0);
    }
  };

  useEffect(() => {
    if (Object.keys(stocks).length === 0) return;

    const updateStockPrices = async () => {
      try {
        const stockKeys = Object.keys(stocks);
        if (stockKeys.length === 0) return;

        const randomNumbers = await fetchRandomPercentChanges(stockKeys.length);
        const updatedStocks = {};

        stockKeys.forEach((stockName, index) => {
          const stock = stocks[stockName];
          const changePercent = randomNumbers[index] / 100;
          const newPrice = Number(stock.price) * (1 + changePercent);
          updatedStocks[stockName] = { ...stock, price: Number(newPrice.toFixed(2)) };
        });

        console.log("Updated Stocks with Random Prices:", updatedStocks);
        setStocks(updatedStocks);

        // Update Firestore
        for (const stockName in updatedStocks) {
          const stockDoc = doc(db, "stocks", stockName);
          await updateDoc(stockDoc, { price: updatedStocks[stockName].price });
        }
      } catch (error) {
        console.error("Error updating stock prices:", error);
      }
    };

    // Update stock prices every 10 seconds
    updateStockPrices();
    const interval = setInterval(updateStockPrices, 10000);

    return () => clearInterval(interval);
  }, [stocks]); 

  return (
    <UserContext.Provider value={{ user, loading, balance, portfolio, stocks, setBalance, setPortfolio }}>
      {!loading && children} 
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
