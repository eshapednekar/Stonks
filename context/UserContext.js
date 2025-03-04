import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "/library/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// Create the context
const UserContext = createContext();

// Create provider component
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
        stocksData[doc.id] = doc.data(); // Store stock price by name
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
      const interval = setInterval(fetchStockData, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, balance, portfolio, stocks, setBalance, setPortfolio }}>
      {!loading && children} 
    </UserContext.Provider>
  );
};

// Hook to use the context
export const useUser = () => useContext(UserContext);
