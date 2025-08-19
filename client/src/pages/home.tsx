import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VideoPlayer } from "@/components/video-player";
import { MovieCard } from "@/components/movie-card";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { ErrorHandling } from "@/components/error-handling";
import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@shared/schema";
import { Play, Plus, Info } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  const { data: trendingMovies, isLoading: trendingLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies/trending"]
  });

  const { data: originalMovies, isLoading: originalsLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies/originals"]
  });

  const featuredMovie = trendingMovies?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-madifa-dark to-madifa-gray text-white">
      <Header />
      
      {/* Hero Section with Featured Movie */}
      <main className="pt-16">
        <section className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url(${featuredMovie?.thumbnailUrl || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080'})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-madifa-dark via-madifa-dark/70 to-transparent" />
          
          {/* Featured Movie Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto px-4">
              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl mb-8">
                <VideoPlayer 
                  movie={featuredMovie}
                  autoPlay={false}
                />
              </div>

              {/* Movie Info */}
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="featured-movie-title">
                  {featuredMovie?.title || "Mantolwane"}
                </h1>
                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto" data-testid="featured-movie-description">
                  {featuredMovie?.description || "A powerful story of heritage and resilience in modern South Africa. Experience authentic African storytelling through this critically acclaimed drama."}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    className="madifa-button-primary px-8 py-3 rounded-lg transition-colors flex items-center"
                    onClick={() => featuredMovie && navigate(`/player/${featuredMovie.id}`)}
                    data-testid="button-play-now"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </button>
                  <button 
                    className="madifa-button-secondary px-8 py-3 rounded-lg transition-colors flex items-center"
                    data-testid="button-add-to-list"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    My List
                  </button>
                  <button 
                    className="madifa-button-secondary px-8 py-3 rounded-lg transition-colors flex items-center"
                    data-testid="button-more-info"
                  >
                    <Info className="w-5 h-5 mr-2" />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Content Rows */}
      <section className="relative z-10 -mt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Trending African Cinema */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-madifa-gold" data-testid="text-trending-title">
              Trending African Cinema
            </h2>
            {trendingLoading ? (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 bg-gray-800 animate-pulse rounded-lg h-96" />
                ))}
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {trendingMovies?.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>

          {/* Original Madifa Productions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-madifa-purple" data-testid="text-originals-title">
              Original Madifa Productions
            </h2>
            {originalsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800 animate-pulse rounded-lg h-48" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {originalMovies?.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Performance Monitoring */}
      <PerformanceDashboard />

      {/* Error Handling */}
      <ErrorHandling />

      <Footer />
    </div>
  );
}
