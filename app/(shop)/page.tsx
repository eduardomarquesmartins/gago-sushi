
import { Header } from "@/components/shop/Header";
import { Hero } from "@/components/shop/Hero";

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      width: '100%',
      background: 'url(/papel.jpg)',
      backgroundSize: 'cover', // Garante que a imagem cubra todo o fundo
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center top', // Centraliza no topo (foco principal)
      backgroundColor: 'var(--background)'
    }}>
      <Header />
      <Hero />
    </main>
  );
}
