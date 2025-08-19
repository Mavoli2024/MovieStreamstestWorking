import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "@/components/video-player";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Movie } from "@shared/schema";
import { ArrowLeft, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Player() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const { data: movie, isLoading, error } = useQuery<Movie>({
    queryKey: ["/api/movies", id]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-madifa-dark to-madifa-gray text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madifa-orange"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-madifa-dark to-madifa-gray text-white">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-error-title">Movie Not Found</h1>
            <p className="text-gray-400 mb-8" data-testid="text-error-description">
              The movie you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => navigate("/")}
              className="madifa-button-primary px-8 py-3 rounded-lg"
              data-testid="button-back-home"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-madifa-dark to-madifa-gray text-white">
      <Header />
      
      <main className="pt-16">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center text-madifa-gold hover:text-madifa-orange transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Video Player */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-8">
            <VideoPlayer movie={movie} autoPlay={true} />
          </div>

          {/* Movie Details */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4" data-testid="text-movie-title">
                {movie.title}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6 text-gray-300">
                <span data-testid="text-movie-year">{movie.year}</span>
                <span data-testid="text-movie-genre">{movie.genre}</span>
                <span data-testid="text-movie-duration">
                  {movie.duration ? `${Math.floor(movie.duration / 60)}m` : 'N/A'}
                </span>
                {movie.rating && (
                  <div className="flex items-center" data-testid="movie-rating">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{movie.rating}</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-gray-300 leading-relaxed" data-testid="text-movie-description">
                {movie.description}
              </p>
            </div>

            <div className="space-y-6">
              {movie.isOriginal && (
                <div className="madifa-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-madifa-purple mb-2">
                    Madifa Original
                  </h3>
                  <p className="text-sm text-gray-400">
                    This is an original production by Madifa, featuring authentic African storytelling.
                  </p>
                </div>
              )}

              <div className="madifa-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-madifa-gold mb-4">
                  More Like This
                </h3>
                <p className="text-sm text-gray-400">
                  Discover more African cinema and original productions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
