"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaCoins } from "react-icons/fa"; // Ripple coin icon from React Icons

export default function Home() {
  const [earnings, setEarnings] = useState<number | null>(null); // Changing earnings
  const [percentage, setPercentage] = useState<number | null>(null); // Percentage gain
  const fixedRippleQuantity = 950.914019; // Fixed XRP quantity
  const initialPricePerXRP = 0.65; // Initial price per XRP in USD

  useEffect(() => {
    const fetchAndUpdateEarnings = async () => {
      try {
        // CryptoCompare API call
        const response = await axios.get("https://min-api.cryptocompare.com/data/price", {
          params: {
            fsym: "XRP", // The symbol for Ripple
            tsyms: "CHF", // Target currency is CHF
          },
        });
        const price = response.data.CHF; // Extract the CHF price
        const newEarnings = price * fixedRippleQuantity;

        // Calculate percentage gain
        const currentPricePerXRP = price * (1 / 0.95); // Assuming 1 CHF ≈ 0.95 USD for conversion
        const newPercentage = ((currentPricePerXRP - initialPricePerXRP) / initialPricePerXRP) * 100;

        // Only update state if earnings or percentage have changed
        if (earnings !== newEarnings) {
          setEarnings(newEarnings);
        }
        if (percentage !== newPercentage) {
          setPercentage(newPercentage);
        }
      } catch (error) {
        console.error("Error fetching Ripple price:", );
      }
    };

    // Initial fetch
    fetchAndUpdateEarnings();

    // Refresh earnings every 60 seconds
    const interval = setInterval(fetchAndUpdateEarnings, 60000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [earnings, percentage]); // Re-run the effect if earnings or percentage change

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      {/* Currency Icon */}
      <FaCoins
        size={80}
        style={{
          color: "#0074D9",
          marginBottom: "20px",
          animation: "bounce 1s infinite",
        }}
      />
      {/* Earnings */}
      <h1
        style={{
          fontSize: "5rem",
          color: "#333",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        {earnings !== null ? `CHF ${earnings.toFixed(2)}` : "Loading..."}
      </h1>

      {/* Percentage Gain */}
      <div
        style={{
          fontSize: "2rem",
          color: percentage && percentage >= 0 ? "#28a745" : "#dc3545", // Green for positive, red for negative
          fontWeight: "bold",
          marginTop: "20px",
          animation: "fadeIn 1s ease-in-out",
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

