import { Star } from "lucide-react";
import { useLocation } from "wouter";
import type { Movie } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  compact?: boolean;
}

export function MovieCard({ movie, compact = false }: MovieCardProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/player/${movie.id}`);
  };

  return (
    <div 
      className={cn(
        "group cursor-pointer",
        compact ? "flex-shrink-0" : "flex-shrink-0 w-64"
      )}
      onClick={handleClick}
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative rounded-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
        <img 
          src={movie.thumbnailUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600'} 
          alt={movie.title}
          className={cn(
            "object-cover",
            compact ? "w-full h-48" : "w-full h-96"
          )}
          data-testid={`img-movie-${movie.id}`}
        />
        
        {movie.isOriginal && (
          <div className="absolute top-2 left-2">
            <span className="bg-madifa-purple text-white text-xs px-2 py-1 rounded" data-testid="badge-original">
              ORIGINAL
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-semibold mb-1" data-testid={`text-movie-title-${movie.id}`}>
              {movie.title}
            </h3>
            <p className="text-sm text-gray-300" data-testid={`text-movie-info-${movie.id}`}>
              {movie.genre} • {movie.year} • {movie.duration ? `${Math.floor(movie.duration / 60)}m` : 'N/A'}
            </p>
            {movie.rating && (
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(Number(movie.rating)) ? "fill-current" : ""
                      )}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-300" data-testid={`text-rating-${movie.id}`}>
                  {movie.rating}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {compact && (
        <h3 className="mt-2 font-medium text-sm" data-testid={`text-compact-title-${movie.id}`}>
          {movie.title}
        </h3>
      )}
    </div>
  );
}
