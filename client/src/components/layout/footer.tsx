import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-madifa-dark border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-madifa-gold mb-4" data-testid="logo-footer">
              <i className="fas fa-play-circle mr-2"></i>Madifa
            </div>
            <p className="text-gray-400 mb-4" data-testid="text-tagline">
              Content for the world with Africans at heart
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-madifa-gold transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-madifa-gold transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-madifa-gold transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-madifa-gold transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-madifa-purple">Content</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-movies">Movies</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-series">TV Series</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-documentaries">Documentaries</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-music">Music</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-theatre">Theatre</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-madifa-purple">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-help-center">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-technical-issues">Technical Issues</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-account-settings">Account Settings</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-feedback">Feedback</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-madifa-purple">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-terms">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-cookies">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-licensing">Licensing</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-accessibility">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p data-testid="text-copyright">
            &copy; 2024 Madifa. All rights reserved. Based in Durban, South Africa.
          </p>
          <p className="mt-2 text-sm" data-testid="text-community">
            Streaming African stories to the world • 8,781+ community members
          </p>
        </div>
      </div>
    </footer>
  );
}
