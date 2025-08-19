import { useState } from "react";
import { Search, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-madifa-dark/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="text-2xl font-bold text-madifa-gold cursor-pointer"
              onClick={() => navigate("/")}
              data-testid="logo-madifa"
            >
              <i className="fas fa-play-circle mr-2"></i>Madifa
            </div>
            <nav className="hidden md:flex space-x-6">
              <a 
                href="/" 
                className="text-white hover:text-madifa-gold transition-colors"
                data-testid="link-home"
              >
                Home
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-madifa-gold transition-colors"
                data-testid="link-movies"
              >
                Movies
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-madifa-gold transition-colors"
                data-testid="link-series"
              >
                Series
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-madifa-gold transition-colors"
                data-testid="link-african-cinema"
              >
                African Cinema
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-madifa-gold transition-colors"
                data-testid="link-music"
              >
                Music
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-madifa-gold transition-colors"
                data-testid="link-theatre"
              >
                Theatre
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-madifa-gray rounded-full px-4 py-2">
              <Search className="text-gray-400 w-4 h-4 mr-2" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder-gray-400 outline-none w-64"
                data-testid="input-search"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <div className="w-8 h-8 bg-madifa-purple rounded-full flex items-center justify-center">
                    <User className="text-white w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-sm text-white">John Doe</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-madifa-dark border-gray-800">
                <DropdownMenuItem className="text-white hover:bg-madifa-gray">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-madifa-gray">
                  My List
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-madifa-gray">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-madifa-gray">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
