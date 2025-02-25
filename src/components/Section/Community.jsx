// import React from 'react';
import Community1 from "../../assets/Community.png";
// import Awan1 from "../../assets/Awan1.png";
const Community = () => {
  return (
    <div className="h-screen w-full flex justify-center bg-[#EBE3D5] px-4 mt-20">
      <div className="text-center flex flex-col items-center">
        <h1 className="font-fuzzy font-bold text-4xl md:text-6xl text-[#6F4E37] mb-6">
          Ikuti Komunitas Kami!
        </h1>
        <div className="relative w-full max-w-4xl flex flex-col items-center  justify-between">
          {/* Gambar utama */}
          <img
            src={Community1}
            alt="Community"
            className="rounded-2xl w-full"
          />
          {/* Dekorasi awan kanan */}
          {/* <div className="absolute left-0 -rotate-12 top-1/4 hidden md:block">
            <img src={Awan1} alt="cloud" className="w-" />
          </div> */}
        </div>
        <button className="bg-[#6F4E37] z-10 px-8 py-4 rounded-full text-white mt-6 text-xl md:text-2xl font-fuzzy font-bold shadow-lg">
          Ikuti Komunitas
        </button>
      </div>
    </div>
  );
};

export default Community;
