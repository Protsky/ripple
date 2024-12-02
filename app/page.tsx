"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaCoins, FaSpinner } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [earnings, setEarnings] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("CHF");
  const [historicalPrices, setHistoricalPrices] = useState<any>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Ensure that this code only runs on the client-side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false; // default value
  });

  const fixedRippleQuantity = 950.914019+500;
  const initialPricePerXRP = 0.6;

  // Fetch current price and historical data
  useEffect(() => {
    const fetchAndUpdateData = async () => {
      try {
        // Fetch current XRP price in selected currency
        const response = await axios.get("https://min-api.cryptocompare.com/data/price", {
          params: {
            fsym: "XRP",
            tsyms: currency,
          },
        });

        const price = response?.data?.[currency];
        if (price === undefined) {
          setError("Unable to fetch data. Please try again later.");
          return;
        }

        // Calculate earnings and percentage change
        const newEarnings = price * fixedRippleQuantity;
        const newPercentage = ((price - initialPricePerXRP) / initialPricePerXRP) * 100;

        setEarnings(newEarnings);
        setPercentage(newPercentage);
        setError(null);

        // Fetch historical data (last 30 days)
        const historicalResponse = await axios.get("https://min-api.cryptocompare.com/data/v2/histoday", {
          params: {
            fsym: "XRP",
            tsym: currency,
            limit: 30,
          },
        });
        setHistoricalPrices(historicalResponse.data.Data.Data);
      } catch (error) {
        setError("Unable to fetch data. Please try again later.");
      }
    };

    fetchAndUpdateData();

    const interval = setInterval(fetchAndUpdateData, 60000);
    return () => clearInterval(interval);
  }, [currency]);

  // Handle currency change
  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value);
  };

 
  // Chart data
  const chartData = {
    labels: historicalPrices.map((item: any) => new Date(item.time * 1000).toLocaleDateString()),
    datasets: [
      {
        label: `XRP to ${currency}`,
        data: historicalPrices.map((item: any) => item.close),
        borderColor: "#0074D9",
        backgroundColor: "rgba(0, 116, 217, 0.2)",
        fill: true,
      },
    ],
  };

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column" as React.CSSProperties['flexDirection'], // Explicitly casting
      textAlign: "center" as "center", // Explicitly typing this
      backgroundColor: darkMode ? "#333" : "#f4f4f4",
      padding: "20px",
      height: "100vh",
    },
    
  coinIcon: {
    color: "#0074D9",
    marginBottom: "20px",
    animation: "bounce 1s infinite",
  },
  earningsText: {
    fontSize: "6vw", // Responsive size based on viewport width
    color: darkMode ? "#fff" : "#333",
    animation: "fadeIn 1s ease-in-out",
    marginBottom: "20px",
  },
  percentageText: {
    fontSize: "3vw", // Responsive size based on viewport width
    color: percentage && percentage >= 0 ? "#28a745" : "#dc3545",
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
  spinner: {
    animation: "spin 1s infinite linear",
  },
  chartWrapper: {
    width: "100%",
    maxWidth: "600px", // Max width for the chart
    marginTop: "30px",
  },
  select: {
    marginTop: "20px",
    padding: "10px",
    fontSize: "1rem",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: darkMode ? "#0074D9" : "#333",
    color: "#fff",
    border: "none",
    cursor: "pointer",
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
        {earnings === null ? (
          <FaSpinner size={50} style={styles.spinner} />
        ) : (
          `${currency} ${earnings.toFixed(2)}`
        )}
      </h1>

      {/* Percentage Gain */}
      <div style={styles.percentageText}>
        {percentage === null
          ? "Loading..."
          : `${percentage.toFixed(2)}% ${percentage >= 0 ? "Gain" : "Loss"}`}
      </div>

      {/* Chart */}
      <div style={styles.chartWrapper}>
        <Line data={chartData} />
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
