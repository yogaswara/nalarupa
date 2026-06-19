import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return (
      <footer className="bg-surface-container-low border-t border-outline-variant">
        <div className="w-full py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface">Nalarupa</div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              Empowering educators with AI-driven visuals that enhance student understanding and engagement.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-label-md text-label-md text-on-surface">Product</span>
              <Link to="/generator" className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors">
                Generator
              </Link>
              <Link to="/gallery" className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors">
                Library
              </Link>
              <Link to="/gallery" className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors">
                Templates
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-label-md text-label-md text-on-surface">Resources</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">Teaching Guides</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">Help Center</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">Classroom Safety</span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-label-md text-label-md text-on-surface">Legal</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">Privacy Policy</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="w-full py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/30">
          <p className="font-body-md text-body-md text-on-surface-variant/80">
            © 2024 Nalarupa. Ensuring classroom safety and academic integrity.
          </p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">language</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">share</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="w-full py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Nalarupa</span>
          <p className="text-on-surface-variant font-label-sm text-label-sm text-center md:text-left">
            © 2024 Nalarupa. Ensuring classroom safety and academic integrity.
          </p>
        </div>
        <div className="flex gap-6">
          <span className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm cursor-pointer">
            Privacy Policy
          </span>
          <span className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm cursor-pointer">
            Terms of Service
          </span>
          <span className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm cursor-pointer">
            Classroom Safety
          </span>
        </div>
      </div>
    </footer>
  );
}
