
import React, { useState } from 'react';
import { GameSettings } from '../types';
import { Save, RotateCcw, X, Settings } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../constants';

interface AdminPanelProps {
  currentSettings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentSettings, onSave, onClose }) => {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);

  const handleChange = (key: keyof GameSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (window.confirm('Reset all rules to default?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const SettingInput = ({ label, settingKey, min, max, step = 1 }: { label: string; settingKey: keyof GameSettings; min?: number; max?: number; step?: number }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase font-bold text-zinc-500">{label}</label>
      <div className="flex items-center gap-3">
        <input 
          type="number" 
          value={settings[settingKey]} 
          onChange={(e) => handleChange(settingKey, parseFloat(e.target.value))}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white w-20 font-mono"
          min={min}
          max={max}
          step={step}
        />
        <input 
          type="range" 
          value={settings[settingKey]} 
          onChange={(e) => handleChange(settingKey, parseFloat(e.target.value))}
          className="flex-1 accent-yellow-500"
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="text-zinc-400" />
            <h2 className="text-2xl font-bold text-white">Rule Configuration</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-yellow-500 font-bold border-b border-zinc-800 pb-2 mb-4">Core Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SettingInput label="Initial Health" settingKey="initialHealth" min={1} max={50} />
               <SettingInput label="Hand Size" settingKey="handSize" min={3} max={10} />
               <SettingInput label="Rounds per Game" settingKey="maxRounds" min={1} max={10} />
               <SettingInput label="Turns per Round" settingKey="turnsPerRound" min={1} max={10} />
            </div>
          </section>

          <section>
            <h3 className="text-indigo-500 font-bold border-b border-zinc-800 pb-2 mb-4">Alignment Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SettingInput label="Evil Threshold (Negative)" settingKey="evilThreshold" min={-20} max={-1} />
               <SettingInput label="Good Threshold (Positive)" settingKey="goodThreshold" min={1} max={20} />
               <SettingInput label="Min Alignment" settingKey="alignmentMin" min={-50} max={-5} />
               <SettingInput label="Max Alignment" settingKey="alignmentMax" min={5} max={50} />
            </div>
          </section>

          <section>
            <h3 className="text-emerald-500 font-bold border-b border-zinc-800 pb-2 mb-4">Economy & Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SettingInput label="Stat Upgrade Base Cost (XP)" settingKey="xpBaseCost" min={1} max={10} />
               <SettingInput label="Level Up Multiplier (XP)" settingKey="xpLevelUpMult" min={1} max={20} />
               <SettingInput label="Mana Cost (Extra Card)" settingKey="manaCostPerExtraCard" min={0} max={5} />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-between items-center bg-zinc-950/50 rounded-b-xl">
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded hover:bg-red-900/20 transition-colors"
            >
                <RotateCcw size={18} />
                Reset Defaults
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow-lg transition-colors"
            >
                <Save size={18} />
                Save Rules
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
