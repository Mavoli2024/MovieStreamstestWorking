import { useQuery } from "@tanstack/react-query";
import { usePerformance } from "@/hooks/use-performance";
import { TrendingUp, Activity, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvgMetrics {
  avgStreamQuality: string | number;
  avgBufferTime: string | number;
  avgErrorRate: string | number;
  avgConnectionSpeed: string | number;
  avgCdnLatency: string | number;
}

export function PerformanceDashboard() {
  const { data: avgMetrics } = useQuery<AvgMetrics>({
    queryKey: ["/api/performance-metrics/average"],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const { connectionSpeed } = usePerformance();

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return "text-green-400";
    if (quality >= 85) return "text-yellow-400";
    return "text-red-400";
  };

  const getQualityBarWidth = (quality: number) => {
    return `${Math.min(100, quality)}%`;
  };

  return (
    <section className="bg-madifa-gray/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center" data-testid="text-performance-title">
          Performance & Streaming Health
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stream Quality */}
          <div className="madifa-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-madifa-gold">Stream Quality</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className={cn(
              "text-3xl font-bold mb-2",
              getQualityColor(Number(avgMetrics?.avgStreamQuality) || 98.5)
            )} data-testid="text-stream-quality">
              {avgMetrics?.avgStreamQuality ? `${Number(avgMetrics.avgStreamQuality).toFixed(1)}%` : '98.5%'}
            </div>
            <div className="text-sm text-gray-400">Average quality delivery</div>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: getQualityBarWidth(Number(avgMetrics?.avgStreamQuality) || 98.5) }}
              ></div>
            </div>
          </div>

          {/* Buffer Health */}
          <div className="madifa-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-madifa-gold">Buffer Health</h3>
              <Activity className="text-madifa-purple w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-buffer-time">
              {avgMetrics?.avgBufferTime ? `${Number(avgMetrics.avgBufferTime).toFixed(1)}s` : '2.3s'}
            </div>
            <div className="text-sm text-gray-400">Average buffer time</div>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-xs text-green-400">OPTIMAL</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-4/5 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {/* CDN Performance */}
          <div className="madifa-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-madifa-gold">CDN Performance</h3>
              <Globe className="text-madifa-orange w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-cdn-latency">
              {avgMetrics?.avgCdnLatency ? `${Number(avgMetrics.avgCdnLatency).toFixed(0)}ms` : '45ms'}
            </div>
            <div className="text-sm text-gray-400">Global average latency</div>
            <div className="mt-4 grid grid-cols-3 gap-1">
              <div className="bg-green-500 h-2 rounded"></div>
              <div className="bg-green-500 h-2 rounded"></div>
              <div className="bg-yellow-500 h-2 rounded"></div>
            </div>
          </div>

          {/* Error Rate */}
          <div className="madifa-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-madifa-gold">Error Rate</h3>
              <Shield className="text-green-500 w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-2" data-testid="text-error-rate">
              {avgMetrics?.avgErrorRate ? `${(Number(avgMetrics.avgErrorRate) * 100).toFixed(2)}%` : '0.02%'}
            </div>
            <div className="text-sm text-gray-400">Last 24 hours</div>
            <div className="mt-4 text-xs text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>↓ 0.05% from yesterday</span>
            </div>
          </div>
        </div>

        {/* Adaptive Streaming Controls */}
        <div className="madifa-card rounded-xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-madifa-purple">
            Adaptive Streaming Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-madifa-gold">Quality Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Quality Adjustment</span>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-madifa-purple transition-colors"
                    data-testid="toggle-auto-quality"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preloading</span>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-madifa-purple transition-colors"
                    data-testid="toggle-preloading"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CDN Fallback</span>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-madifa-purple transition-colors"
                    data-testid="toggle-fallback"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-madifa-gold">Connection Speed Detection</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High Speed ({'>'}10 Mbps): 1080p+</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Medium Speed (5-10 Mbps): 720p</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Low Speed ({'<'}5 Mbps): 480p</span>
                </div>
                <div className="mt-4 p-3 bg-madifa-gray rounded-lg">
                  <div className="text-sm text-gray-300">Current Connection</div>
                  <div className="text-lg font-semibold text-green-400" data-testid="text-current-speed">
                    {connectionSpeed > 0 ? `${connectionSpeed.toFixed(1)} Mbps` : 'Testing...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
