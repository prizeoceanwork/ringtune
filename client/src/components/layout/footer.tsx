import logoImage from "@assets/Logo_1758887059353.gif";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="RingToneRiches Logo" 
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
              <span className="text-lg md:text-xl font-bold gradient-text">RINGTONE RICHES</span>
            </div>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61579695463356" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-facebook">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="https://www.tiktok.com/@ringtone.riches?_t=ZN-90jrPt73hTi&_r=1" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-instagram">
                <i className="fab fa-tiktok text-xl"></i>
              </a>
              
            </div>
            <div className="flex space-x-2">
              <div className="h-6 w-12 bg-muted rounded flex items-center justify-center text-xs">VISA</div>
              <div className="h-6 w-12 bg-muted rounded flex items-center justify-center text-xs">MC</div>
              <div className="h-6 w-12 bg-muted rounded flex items-center justify-center text-xs">PP</div>
            </div>
          </div>

          {/* Useful Information */}
          <div className="space-y-4">
            <h4 className="text-primary font-bold">USEFUL INFORMATION</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-competitions">
                Competitions
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-be-aware">
                Be Aware
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-how-to-play">
                How to Play
              </a>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="text-primary font-bold">POLICIES</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                Privacy & Cookies Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
                Terms & Conditions
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-responsible-gaming">
                Responsible Gaming
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-primary font-bold">CONTACT</h4>
            <div className="space-y-2">
              <p className="text-muted-foreground" data-testid="text-email">
                support@ringtoneriches.com
              </p>
              <p className="text-muted-foreground" data-testid="text-live-chat">
                Live Chat Available
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 RingToneRiches. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
