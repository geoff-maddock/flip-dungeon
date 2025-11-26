import React from 'react';

export interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'gold' | 'xp' | 'mana' | 'info';
  x: number;
  y: number;
}

interface FloatingTextLayerProps {
  texts: FloatingText[];
}

const FloatingTextLayer: React.FC<FloatingTextLayerProps> = ({ texts }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {texts.map((ft) => (
        <div
          key={ft.id}
          className={`
            absolute font-black text-2xl md:text-4xl drop-shadow-md animate-[float-up-fade_1.5s_ease-out_forwards]
            ${ft.type === 'damage' ? 'text-red-500' : 
              ft.type === 'heal' ? 'text-green-400' :
              ft.type === 'gold' ? 'text-yellow-400' :
              ft.type === 'xp' ? 'text-purple-400' :
              ft.type === 'mana' ? 'text-blue-400' : 'text-white'}
          `}
          style={{ 
            left: `${ft.x}%`, 
            top: `${ft.y}%` 
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingTextLayer;