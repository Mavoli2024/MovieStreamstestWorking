import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function usePerformance() {
  const [connectionSpeed, setConnectionSpeed] = useState(0);
  const [networkType, setNetworkType] = useState<string>("unknown");

  // Fetch average performance metrics
  const { data: avgMetrics, refetch } = useQuery({
    queryKey: ["/api/performance-metrics/average"],
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Connection speed test
  const testConnectionSpeed = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch("/api/speed-test", {
        cache: 'no-cache'
      });
      const data = await response.json();
      const endTime = performance.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const bits = data.size * 8; // convert bytes to bits
      const speed = (bits / duration) / (1024 * 1024); // Mbps
      
      setConnectionSpeed(speed);
      return speed;
    } catch (error) {
      console.error("Speed test failed:", error);
      setConnectionSpeed(0);
      return 0;
    }
  };

  // Detect network type if available
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setNetworkType(connection.effectiveType || "unknown");
        
        const handleConnectionChange = () => {
          setNetworkType(connection.effectiveType || "unknown");
        };
        
        connection.addEventListener('change', handleConnectionChange);
        return () => connection.removeEventListener('change', handleConnectionChange);
      }
    }
  }, []);

  // Initial connection speed test
  useEffect(() => {
    testConnectionSpeed();
    
    // Test connection speed every 30 seconds
    const interval = setInterval(testConnectionSpeed, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get quality recommendation based on connection speed
  const getQualityRecommendation = (speed: number) => {
    if (speed > 10) return "1080p";
    if (speed > 5) return "720p";
    if (speed > 2) return "480p";
    return "360p";
  };

  // Get connection health status
  const getConnectionHealth = (speed: number) => {
    if (speed > 10) return { status: "excellent", color: "green" };
    if (speed > 5) return { status: "good", color: "yellow" };
    if (speed > 2) return { status: "fair", color: "orange" };
    return { status: "poor", color: "red" };
  };

  return {
    connectionSpeed,
    networkType,
    avgMetrics,
    testConnectionSpeed,
    getQualityRecommendation,
    getConnectionHealth,
    refetchMetrics: refetch
  };
}
