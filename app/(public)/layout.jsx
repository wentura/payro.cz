import Footer from "../components/Footer";
import PublicNav from "../components/PublicNav";
export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNav />
      {children}
      <Footer />
    </div>
  );
}
