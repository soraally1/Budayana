import HomePage from './components/HomePage';
import Navbar from './components/Section/Navbar';

function App() {
  return (
    <div className="relative min-h-screen bg-[#EBE3D5]">
      <Navbar />
      <main className="pt-24 pb-24 md:pt-28 md:pb-0">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
