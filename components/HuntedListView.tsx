
import React from 'react';
import { RawDataRow } from '../types';
import { SendIcon, SkullIcon } from './NeonIcons';

interface HuntedListViewProps {
  rawData: RawDataRow[];
}

export const HuntedListView: React.FC<HuntedListViewProps> = ({ rawData }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20 px-4">
      
      {/* Botões de Ação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Botão Sugerir Hunted */}
        <button className="bg-neon-surface border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center group hover:border-neon-blue/40 transition-all duration-300 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
          
          <div className="w-14 h-14 bg-black/40 border border-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-neon-blue/30 transition-all duration-500 shadow-inner">
            <SendIcon className="w-7 h-7 text-gray-500 group-hover:text-neon-blue transition-colors duration-300" />
          </div>
          
          <h3 className="text-lg font-display font-black text-white mb-2 tracking-tight uppercase">Sugerir Hunted</h3>
          <p className="text-gray-500 text-[11px] leading-tight max-w-[200px] font-medium">
            Enviar sugestão de hunted para análise da guild com imagens e prova
          </p>
        </button>

        {/* Botão Black List */}
        <button className="bg-neon-surface border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center group hover:border-red-500/30 transition-all duration-300 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
          
          {/* Badge Em Construção */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[8px] font-black text-yellow-500 uppercase tracking-widest shadow-sm">
            <span className="animate-pulse">🚧</span>
            <span>Em Construção</span>
          </div>

          <div className="w-14 h-14 bg-black/40 border border-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-red-500/30 transition-all duration-500 shadow-inner">
            <SkullIcon className="w-7 h-7 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
          </div>
          
          <h3 className="text-lg font-display font-black text-white mb-2 tracking-tight uppercase">Black List</h3>
          <p className="text-gray-500 text-[11px] leading-tight max-w-[200px] font-medium">
            Consultar lista de hunteds ativos por nome, vocação ou servidor
          </p>
        </button>
      </div>
    </div>
  );
};
