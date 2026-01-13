import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 1. استنى 3 ثواني وبعدين ابدأ الـ Fade Out (التلاشي)
    const timer = setTimeout(() => {
      setFade(true);
    }, 3000);

    // 2. بعد ما التلاشي يخلص (مثلاً ثانية كمان)، بلغ الأب إننا خلصنا
    const cleanup = setTimeout(() => {
      onFinish();
    }, 4000); // 3000 + 1000 animation duration

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a] transition-opacity duration-1000 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* تأثير إضاءة خلفي */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0f172a] to-[#0f172a]" />

      <div className="relative z-10 flex flex-col items-center animate-pulse">
        {/* اللوجو أو اسم اللعبة */}
        <div className="mb-8 relative">
           {/* ممكن تحط صورة اللوجو هنا بـ img tag لو عندك */}
           {/* <img src="/logo.png" className="w-40 h-40 object-contain" /> */}
           
           {/* أو نكتبها بتصميم نيون */}
           <img src="../../public/logo.png" className="w-80 h-52" />
        </div>

        {/* النص بتاع "من تطوير..." */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-gray-400 text-sm tracking-[0.2em] uppercase">
            Developed By
          </p>
          <h2 className="text-2xl font-bold text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] tracking-widest">
            Mohamed Hussein
          </h2>
        </div>
      </div>

      {/* شريط تحميل وهمي كشكل جمالي */}
      <div className="absolute bottom-20 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-[loading_3s_ease-in-out_forwards]" style={{width: '0%'}} />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}