import React from 'react';
import { Facebook, MessageCircle } from 'lucide-react';

const Footer = ({ isDarkMode }) => (
  <footer className={`border-t py-10 mt-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-6">
        <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>NEED HELP?</h3>
        <p className="text-gray-400 text-sm">Contact us directly for support.</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
        <a href="https://facebook.com/garena000456" target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 group ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white'}`}>
          <Facebook className="group-hover:scale-110 transition-transform" size={24} />
          <span>CLICK DIAMS</span>
        </a>
        <a href="https://wa.me/261388297737" target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 group ${isDarkMode ? 'bg-slate-800 text-green-400 hover:bg-green-600 hover:text-white' : 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white'}`}>
          <MessageCircle className="group-hover:scale-110 transition-transform" size={24} />
          <span>038 82 977 37</span>
        </a>
      </div>
      <div className={`text-center mt-8 pt-8 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
        <p className="text-xs text-gray-400 font-medium">© 2026 <strong> CLICK DIAMS</strong>. All rights reserved.</p>
      </div>  
    </div>
  </footer>
);

export default Footer;