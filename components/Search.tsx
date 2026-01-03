"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllErrorCodes } from "@/lib/errors"; 
import Link from "next/link";

// 👇 BU KISIM EKSİKTİ (Verinin kimlik kartı)
interface ErrorCode {
  provider: string;
  code: string | number;
  title: string;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // 👇 BURADA TİP TANIMLAMASI YAPTIK ("as ErrorCode[]")
  const allErrors = getAllErrorCodes() as ErrorCode[];

  // Arama mantığı
  const filteredErrors = query === ""
    ? []
    : allErrors.filter((error) => {
        // Hata olmaması için string'e çevirerek arıyoruz
        const codeStr = String(error.code).toLowerCase();
        const titleStr = (error.title || "").toLowerCase();
        const searchStr = query.toLowerCase();
        
        return codeStr.includes(searchStr) || titleStr.includes(searchStr);
      }).slice(0, 5); 

  // Pencere dışına tıklanınca kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sayfa değişince arama kutusunu kapat
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [router]);

  return (
    <div className="relative">
      {/* Tetikleyici Buton */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-md hover:border-gray-600 hover:text-gray-200 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span className="hidden sm:inline">Search...</span>
      </button>

      {/* Açılır Pencere */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[90vw] max-w-md sm:w-96 p-0">
          <div 
            ref={searchRef}
            className="bg-[#0a0a0a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Input */}
            <div className="flex items-center border-b border-gray-800 px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Type error code (e.g. 301)..."
                className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-600 h-10 focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300 text-xs px-2">ESC</button>
            </div>

            {/* Sonuçlar */}
            <div className="max-h-64 overflow-y-auto bg-[#0a0a0a]">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((error) => (
                  <Link
                    key={`${error.provider}-${error.code}`}
                    href={`/errors/${error.provider}/${error.code}`}
                    className="block px-4 py-3 hover:bg-gray-900 border-l-2 border-transparent hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-400 group-hover:text-blue-300">{error.code}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase border border-gray-800 rounded px-1.5 py-0.5 bg-gray-900">{error.provider}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5 truncate group-hover:text-gray-200">{error.title}</div>
                  </Link>
                ))
              ) : query !== "" ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No results found.
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-gray-600 text-center">
                  Search by code or name
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


