import { useState } from 'react';
import HomePage from './components/HomePage';
import Navbar from './components/Section/Navbar';

function App() {
  return (
    <div className="relative min-h-screen bg-[#EBE3D5]">
      <Navbar />
      <main className="pb-24 md:pb-0">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
