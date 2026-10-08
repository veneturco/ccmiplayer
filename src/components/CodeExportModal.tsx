import React, { useState, useEffect } from 'react';
import {
  Code, Copy, Check, Download, FileText, Server, Layers, Cpu,
  Sparkles, ExternalLink, X, Search, Terminal, AlertCircle
} from 'lucide-react';

interface ProjectFile {
  path: string;
  name: string;
  content: string;
  size: number;
  category: string;
}

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('server.ts');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/project/files')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.files) {
            setFiles(data.files);
            if (!data.files.some((f: ProjectFile) => f.path === selectedPath)) {
              setSelectedPath(data.files[0]?.path || 'server.ts');
            }
          }
        })
        .catch((err) => {
          console.error('Error loading project files:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFile = files.find((f) => f.path === selectedPath) || files[0];

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...Array.from(new Set(files.map((f) => f.category)))];

  const handleCopyCurrent = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content).then(() => {
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2200);
    });
  };

  const handleCopyAll = () => {
    let fullPromptBundle = `# PROYECTO COMPLETO PARA IA (Google Ecosystem + Free Tools)\n\n`;
    files.forEach((f) => {
      fullPromptBundle += `\n/* ==========================================\n * ARCHIVO: ${f.path}\n * ========================================== */\n\n${f.content}\n\n`;
    });

    navigator.clipboard.writeText(fullPromptBundle).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  const handleDownloadBundle = () => {
    window.location.href = '/api/project/bundle';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-on-surface">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-xl">code</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-on-surface">
                  Código Fuente de la Aplicación para IAs
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 border border-primary/30 text-primary uppercase">
                  STITCH EXPORT
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Pasa estos archivos a cualquier IA para continuar programando o agregando funciones sin costo adicional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBundle}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/40 active:scale-95"
              title="Descargar archivo .md completo con todos los archivos"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Bundle (.md)</span>
            </button>

            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 transition shadow-md shadow-cyan-950/40 active:scale-95"
              title="Copiar código completo del proyecto al portapapeles"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? '¡Todo Copiado!' : 'Copiar Todo para IA'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/70 flex flex-col shrink-0">
            {/* Search and filters */}
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar archivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-500">Cargando archivos del proyecto...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No se encontraron archivos.</div>
              ) : (
                filteredFiles.map((f) => {
                  const isSelected = f.path === selectedPath;
                  return (
                    <button
                      key={f.path}
                      onClick={() => setSelectedPath(f.path)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 font-bold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {f.path.includes('server') ? (
                          <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : f.path.includes('utils') ? (
                          <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        ) : f.path.includes('components') ? (
                          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Helper Note */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¿Cómo usar con otra IA?</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Copia el archivo que deseas modificar (ej. <code className="text-cyan-300">server.ts</code> o <code className="text-cyan-300">TimelineEditor.tsx</code>) y pídele a la IA la función específica que necesitas.
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Viewer Top Toolbar */}
            {currentFile && (
              <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">{currentFile.path}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    {currentFile.content.split('\n').length} líneas
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-cyan-800/40">
                    {currentFile.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCurrent}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copiar este archivo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed selection:bg-cyan-500/30 selection:text-white">
              {currentFile ? (
                <pre className="whitespace-pre">
                  <code>{currentFile.content}</code>
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Selecciona un archivo del panel izquierdo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Total: <strong>{files.length} archivos fuente</strong> listos para exportar.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadBundle}
              className="sm:hidden text-emerald-400 font-bold hover:underline"
            >
              Descargar Bundle (.md)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
