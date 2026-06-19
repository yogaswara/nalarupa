import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-outline-variant fixed top-0 w-full z-50">
        <nav aria-label="Main navigation" className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            Nalarupa
          </Link>

          <div className="hidden md:flex items-center gap-8 h-full">
            <Link
              to="/generator"
              className={`h-full flex items-center font-label-md text-label-md transition-colors ${
                location.pathname === '/generator'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Generator
            </Link>
            <Link
              to="/gallery"
              className={`h-full flex items-center font-label-md text-label-md transition-colors ${
                location.pathname === '/gallery'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Gallery
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDurhoc7IiWt2Q-FT-l4UCj_4Gr4LUoBEWrybzGlZz9SxSgnEMjwyir8TZmltCz6_wQ1vUfadI_udfpl_2cN3AP_IATbiJoA-w821GzU5Fw44UTUUTapRI5s0ra5EHV27Z0FHeLsdo-J-hAp2IJ4PbSxN_Dx8QmTZNREZtOwxJa1VkTpVXiaK8VivaGtM8IS4DB3hekSy5na7SuSJ8ADQMiGrYkQEHqNWGq66HMfzhtGbDpfqlAXgrsI8hAwDSzT5rRxdpraDIJspNA"
                alt="User avatar"
              />
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}