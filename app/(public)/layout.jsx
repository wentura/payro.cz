import PublicNav from "../components/PublicNav";

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNav />
      {children}
    </>
  );
}

