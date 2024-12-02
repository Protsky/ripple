"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaCoins } from "react-icons/fa"; 

export default function Home() {
  const [earnings, setEarnings] = useState<number | null>(null); 
  const [percentage, setPercentage] = useState<number | null>(null); 
  const [error, setError] = useState<string | null>(null); 
  const fixedRippleQuantity = 950.914019; 
  const initialPricePerXRP = 0.71; //CHF

  useEffect(() => {
    const fetchAndUpdateEarnings = async () => {
      try {
        // CryptoCompare API call to get XRP price in CHF
        const response = await axios.get("https://min-api.cryptocompare.com/data/price", {
          params: {
            fsym: "XRP", 
            tsyms: "CHF", 
          },
        });

        // Ensure data exists
        const price = response?.data?.CHF;
        if (price === undefined) {
          console.error("Error: CHF price not available.");
          setError("Unable to fetch data. Please try again later.");
          return;
        }

        // Calculate new earnings in CHF
        const newEarnings = price * fixedRippleQuantity;

        // Calculate percentage gain/loss in CHF
        const newPercentage = ((price - initialPricePerXRP) / initialPricePerXRP) * 100;

        // Only update state if values have changed
        setEarnings((prevEarnings) => prevEarnings !== newEarnings ? newEarnings : prevEarnings);
        setPercentage((prevPercentage) => prevPercentage !== newPercentage ? newPercentage : prevPercentage);
        setError(null); // Reset error if fetch is successful
      } catch (error) {
        console.error("Error fetching Ripple price:", error);
        setError("Unable to fetch data. Please try again later.");
      }
    };

    // Initial fetch
    fetchAndUpdateEarnings();

    // Refresh earnings every 60 seconds
    const interval = setInterval(fetchAndUpdateEarnings, 60000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []); // No dependencies

  // Styling constants
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
      flexDirection: "column",
      textAlign: "center",
    },
    coinIcon: {
      color: "#0074D9",
      marginBottom: "20px",
      animation: "bounce 1s infinite",
    },
    earningsText: {
      fontSize: "5rem",
      color: "#333",
      animation: "fadeIn 1s ease-in-out",
    },
    percentageText: {
      fontSize: "2rem",
      color: "#28a745", // Default green color
      fontWeight: "bold",
      marginTop: "20px",
      animation: "fadeIn 1s ease-in-out",
    },
    errorText: {
      color: "red",
      fontSize: "1.2rem",
      marginTop: "20px",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      {/* Currency Icon */}
      <FaCoins size={80} style={styles.coinIcon} />
      
      {/* Error message */}
      {error && <div style={styles.errorText}>{error}</div>}

      {/* Earnings */}
      <h1 style={styles.earningsText}>
        {earnings !== null ? `CHF ${earnings.toFixed(2)}` : "Loading..."}
      </h1>

      {/* Percentage Gain */}
      <div
        style={{
          ...styles.percentageText,
          color: percentage && percentage >= 0 ? "#28a745" : "#dc3545", // Green for positive, red for negative
        }}
      >
        {percentage !== null
          ? `${percentage.toFixed(2)}% ${percentage >= 0 ? "Gain" : "Loss"}`
          : "Loading..."}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
