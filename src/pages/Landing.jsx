import { useNavigate } from "react-router-dom";
import PageWrapper from "../PageWrapper";
import logo from "../assets/logo.jpg"


export default function Landing() {
        const navigate = useNavigate();

  return (
    
    <div className="min-h-screen flex flex-col justify-center 
                    bg-gradient-to-br from-[#0A0F1F] via-[#132A4C] to-[#1D4B73]
                    text-white">                
    <h1 className="text-7xl mb-16 font-extrabold text-center bg-clip-text text-transparent fcai-moving-bg"
    style={{backgroundImage: `url(${logo})`}}>
        Arcadia
    </h1>

    <div className="h-full flex flex-col justify-center gap-6 items-center">
    
    <button onClick={()=> navigate("/games")}
        className="px-6 py-3 bg-blue-500 cursor-pointer hover:bg-transparent border-2 border-transparent hover:border-blue-500
                rounded-xl text-xl font-semibold transition-all duration-300">
        Enter Games
    </button>
    <button onClick={()=> navigate("/how-to-play")}
      className="text-slate-500 hover:text-white text-lg transition underline decoration-slate-700 underline-offset-4"
    >
      How To Play
    </button>
    </div>
    </div>
   
  );
}
