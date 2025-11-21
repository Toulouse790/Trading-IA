
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Template, Channel } from '../types';
import { PlayIcon, TrashIcon, LayoutDashboardIcon } from './icons';

interface TemplateManagerProps {
  templates: Template[];
  channels: Channel[];
  onUseTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  channels,
  onUseTemplate,
  onDeleteTemplate
}) => {

  const getChannelName = (id: string) => channels.find(c => c.id === id)?.name || 'Chaîne inconnue';
  const getChannelColor = (id: string) => channels.find(c => c.id === id)?.color || 'text-gray-400';

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboardIcon className="w-8 h-8 text-indigo-500" />
            Modèles de Production
          </h2>
          <p className="text-gray-400 mt-2">
            Gagnez du temps en réutilisant vos configurations pour vos séries récurrentes.
            L'IA se souviendra de la structure et du ton.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div 
              key={template.id} 
              className="bg-[#1f1f1f] rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all group flex flex-col overflow-hidden shadow-lg"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full bg-gray-800 ${getChannelColor(template.channelId)}`}>
                        {getChannelName(template.channelId)}
                    </span>
                    {template.isSeries && (
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800">
                            Série
                        </span>
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {template.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-4">
                    <div className="bg-black/20 p-2 rounded">
                        <span className="block font-semibold">Format</span>
                        {template.format === 'shorts' ? 'Shorts (9:16)' : 'Long (16:9)'}
                    </div>
                    <div className="bg-black/20 p-2 rounded">
                        <span className="block font-semibold">Langue</span>
                        {template.language === 'fr' ? 'Français' : 'Anglais'}
                    </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800 bg-[#161616] flex items-center gap-3">
                 <button 
                    onClick={() => onUseTemplate(template)}
                    className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                 >
                     <PlayIcon className="w-4 h-4" />
                     Utiliser
                 </button>
                 <button 
                    onClick={() => onDeleteTemplate(template.id)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer le modèle"
                 >
                     <TrashIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}

          {/* Empty State Helper */}
          {templates.length === 0 && (
             <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                 <p>Aucun modèle sauvegardé.</p>
                 <p className="text-sm mt-2">Créez une configuration dans le Studio et cliquez sur "Sauvegarder comme modèle".</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
