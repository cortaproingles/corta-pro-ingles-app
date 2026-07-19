/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Film,
  Maximize2,
  ListRestart,
  Check,
  AlertCircle,
  HelpCircle as HelpIcon,
  Repeat,
  Gauge,
  Music,
  Tv,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import logoImg from "./assets/images/1783564778919.png";

interface Phrase {
  id: string;
  english: string;
  portuguese: string;
  timeStart: number; // in seconds
  timeEnd?: number; // optional end time for loop
}

interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  phrases: Phrase[];
  category: "series" | "musicas" | "ia";
  playlist?: string;
}

const fallbackVideos: Lesson[] = [
  {
    id: "friends_01",
    title: "Rachel Helps Chandler Find His Wedding Tuxedo",
    youtubeId: "vqqMTqd7BRE",
    description: "Cena clássica para praticar pronúncia com diálogos cotidianos.",
    category: "series",
    playlist: "friends",
    phrases: [
      {
        id: "f1-1",
        english: "Hello, how are you?",
        portuguese: "Olá, como vai você?",
        timeStart: 5,
        timeEnd: 9
      }
    ]
  },
  {
    id: "friends_02",
    title: "Rachel 2 3Helps Chandler Find His Wedding Tuxedo",
    youtubeId: "VwM6-v7P8Xk",
    description: "Prática avançada de Shadowing.",
    category: "series",
    playlist: "friends",
    phrases: [
      {
        id: "f2-1",
        english: "Hello, how are you?",
        portuguese: "Olá, como vai você?",
        timeStart: 1,
        timeEnd: 9
      }
    ]
  },
  {
    id: "friends_03",
    title: "Rachel3 Helps Chandler Find His Wedding Tuxedo (Música)",
    youtubeId: "VwM6-Xk",
    description: "Prática com canção.",
    category: "musicas",
    playlist: "",
    phrases: [
      {
        id: "f3-1",
        english: "Hello, how are you?",
        portuguese: "Olá, como vai você?",
        timeStart: 15,
        timeEnd: 20
      }
    ]
  },
  {
    id: "friends_04",
    title: "Rachel3 Helps Chandler Find His Wedding Tuxedo (IA)",
    youtubeId: "VwM6-Xk",
    description: "Prática de pronúncia guiada por inteligência artificial.",
    category: "ia",
    playlist: "",
    phrases: [
      {
        id: "f4-1",
        english: "Hello, how are you?",
        portuguese: "Olá, como vai você?",
        timeStart: 15,
        timeEnd: 20
      }
    ]
  }
];

const WORD_DICTIONARY: Record<string, string> = {
  "hello": "olá / oi",
  "how": "como",
  "are": "está / estão / somos",
  "you": "você / vocês",
  "i": "eu",
  "need": "preciso / necessito",
  "to": "para / de",
  "change": "trocar / mudar",
  "your": "seu / sua",
  "tire": "pneu / cansar",
  "welcome": "bem-vindo",
  "the": "o / a / os / as",
  "office": "escritório / consultório",
  "good": "bom / boa",
  "morning": "manhã",
  "can": "posso / pode",
  "help": "ajudar / socorro",
  "please": "por favor",
  "thank": "agradecer",
  "thanks": "obrigado",
  "friend": "amigo / amiga",
  "car": "carro",
  "wheel": "roda",
  "road": "estrada",
  "flat": "murcho / plano / apartamento",
  "today": "hoje",
  "look": "olhar / olhe",
  "stars": "estrelas",
  "shine": "brilham / brilho",
  "everything": "tudo / todas as coisas",
  "yellow": "amarelo / amarela",
  "going": "indo / vai",
  "with": "com",
  "doing": "fazendo / indo",
  "great": "ótimo / grande",
  "wonderful": "maravilhoso / maravilhosa",
  "day": "dia",
  "ahead": "pela frente / adiante",
  "work": "trabalho / trabalhar",
  "meeting": "reunião",
  "boss": "chefe",
  "coffee": "café",
  "english": "inglês",
  "practice": "prática / praticar",
  "video": "vídeo",
  "shadowing": "sombreamento"
};

export default function App() {
  // Controle de Telas (Front Page, Biblioteca e Treino)
  const [currentScreen, setCurrentScreen] = useState<"front-page" | "library" | "training">("front-page");
  const [selectedCategory, setSelectedCategory] = useState<"series" | "musicas" | "ia">("series");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("todos");
  const [videosList, setVideosList] = useState<Lesson[]>(fallbackVideos);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(fallbackVideos[0]);

  // Configurações e estados iniciais dinâmicos
  const [videoId, setVideoId] = useState<string>(fallbackVideos[0].youtubeId);
  const [phrases, setPhrases] = useState<Phrase[]>(fallbackVideos[0].phrases);
  const [recommendedLesson, setRecommendedLesson] = useState<Lesson>(fallbackVideos[0]);

  // Busca assíncrona do banco de dados de vídeos do GitHub
  useEffect(() => {
    console.log("AdMob: Inicializando espaço reservado para Banner...");
    const fetchVideos = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/cortaproingles/Cortaproingles/main/videos.json");
        if (!response.ok) throw new Error("Erro na rede: " + response.status);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Lesson[] = data.map((item: any, itemIdx: number) => {
            const rawCat = (item.categoria || item.category || "series").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            let normCat: "series" | "musicas" | "ia" = "series";
            if (rawCat === "musicas" || rawCat === "musica" || rawCat === "music" || rawCat === "songs" || rawCat === "song") {
              normCat = "musicas";
            } else if (rawCat === "ia" || rawCat === "corta pro ingles" || rawCat === "cortaproingles" || rawCat === "corta_pro_ingles") {
              normCat = "ia";
            }

            return {
              id: item.id || `lesson-${itemIdx}`,
              title: item.titulo || item.title || "Sem título",
              youtubeId: item.youtubeId || "",
              description: item.descricao || item.description || "Prática de Shadowing",
              category: normCat,
              playlist: item.playlist || "",
              phrases: (item.frases || item.phrases || []).map((p: any, pIdx: number) => ({
                id: p.id || `${item.id || itemIdx}-f-${pIdx}`,
                english: p.textoIngles || p.english || "",
                portuguese: p.textoPortugues || p.portuguese || "",
                timeStart: Number(p.inicio !== undefined ? p.inicio : p.timeStart || 0),
                timeEnd: Number(p.fim !== undefined ? p.fim : p.timeEnd || 5)
              }))
            };
          });
          setVideosList(mapped);
          setSelectedLesson(mapped[0]);
          setVideoId(mapped[0].youtubeId);
          setPhrases(mapped[0].phrases);

          // Sorteio de vídeo do dia baseado na data atual para manter estabilidade durante o dia
          const hojeStr = new Date().toDateString();
          let hash = 0;
          for (let i = 0; i < hojeStr.length; i++) {
            hash = hojeStr.charCodeAt(i) + ((hash << 5) - hash);
          }
          const index = Math.abs(hash) % mapped.length;
          setRecommendedLesson(mapped[index]);
        }
      } catch (error) {
        console.error("Não foi possível buscar os vídeos online. Usando banco local como backup:", error);
        
        // Em caso de falha, realiza o sorteio com o banco de backup
        const hojeStr = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < hojeStr.length; i++) {
          hash = hojeStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % fallbackVideos.length;
        setRecommendedLesson(fallbackVideos[index]);
      }
    };

    fetchVideos();
  }, []);

  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [currentPlayingPhraseId, setCurrentPlayingPhraseId] = useState<string | null>(null);
  const [clickedWord, setClickedWord] = useState<{
    word: string;
    translation: string;
    phraseId: string;
    wordIndex: number;
    relativeLeft: number;
    arrowLeft: number;
  } | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<number>(-1); // -1 = unstarted, 1 = playing, 2 = paused
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [loopMode, setLoopMode] = useState<boolean>(true); // Se ativado, repete a frase atual

  // Estados de Voz / Feedback e Progresso
  const [speakingPhraseId, setSpeakingPhraseId] = useState<string | null>(null);
  const [checkedPhrases, setCheckedPhrases] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("corta_ingles_checked_phrases");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar checkedPhrases do localStorage", e);
      return [];
    }
  });

  // Persistir checkedPhrases no localStorage
  useEffect(() => {
    try {
      localStorage.setItem("corta_ingles_checked_phrases", JSON.stringify(checkedPhrases));
    } catch (e) {
      console.error("Erro ao salvar checkedPhrases no localStorage", e);
    }
  }, [checkedPhrases]);

  // Alternar o status de Check da frase
  const toggleCheckPhrase = (phraseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedPhrases((prev) => {
      if (prev.includes(phraseId)) {
        return prev.filter((id) => id !== phraseId);
      } else {
        return [...prev, phraseId];
      }
    });
  };

  // Modais e Configurações extras
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Novos campos para adicionar frases
  const [newEnglish, setNewEnglish] = useState("");
  const [newPortuguese, setNewPortuguese] = useState("");
  const [newTimeStart, setNewTimeStart] = useState<string>("0");
  const [newTimeEnd, setNewTimeEnd] = useState<string>("5");

  const playerRef = useRef<any>(null);
  const loopIntervalRef = useRef<any>(null);

  // Fechar tooltip ao clicar fora das palavras
  useEffect(() => {
    const handleOutsideClick = () => {
      setClickedWord(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Inicializar o YouTube Player IFrame API
  useEffect(() => {
    // Só construir o player se estivermos na tela de treino
    if (currentScreen !== "training") return;

    setPlayerError(null);

    const isVideoIdValid = videoId && videoId.trim() !== "" && videoId.trim() !== "null" && videoId.trim() !== "undefined" && videoId.trim().length === 11;
    if (!isVideoIdValid) {
      setIsPlayerReady(false);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Erro ao destruir player:", e);
        }
        playerRef.current = null;
      }
      return;
    }

    // 1. Carrega o script da API do YouTube se ainda não foi carregado
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    // 2. Define a função global que a API do YT chama assim que carrega
    (window as any).onYouTubeIframeAPIReady = () => {
      buildPlayer();
    };

    // Caso a API já esteja carregada (HMR ou re-renderizações)
    if ((window as any).YT && (window as any).YT.Player) {
      buildPlayer();
    }

    function buildPlayer() {
      try {
        if (!(window as any).YT || !(window as any).YT.Player) {
          console.warn("YouTube API Player class not loaded yet.");
          return;
        }

        // Garantir que o container realmente existe no DOM antes de instanciar
        const playerContainer = document.getElementById("youtube-player");
        if (!playerContainer) {
          console.warn("Container 'youtube-player' não encontrado no DOM ainda.");
          return;
        }

        // Garantir que o videoId é válido
        const isVideoIdValidInner = videoId && videoId.trim() !== "" && videoId.trim() !== "null" && videoId.trim() !== "undefined" && videoId.trim().length === 11;
        if (!isVideoIdValidInner) {
          console.warn("Tentativa de criar player com videoId inválido:", videoId);
          return;
        }

        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.error("Erro ao destruir player anterior", e);
          }
          playerRef.current = null;
        }

        playerRef.current = new (window as any).YT.Player("youtube-player", {
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            fs: 1,
          },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              setPlayerError(null);
            },
            onStateChange: (event: any) => {
              setPlayerState(event.data);
            },
            onError: (event: any) => {
              console.error("Erro interno no player do YouTube:", event.data);
              let msg = "Erro desconhecido ao carregar o vídeo.";
              if (event.data === 2) {
                msg = "O identificador deste vídeo possui caracteres incorretos ou comprimento inválido.";
              } else if (event.data === 5) {
                msg = "Este vídeo não pode ser reproduzido no player HTML5 ou ocorreu um erro de reprodução.";
              } else if (event.data === 100) {
                msg = "O vídeo do YouTube não foi encontrado. Ele pode ter sido removido ou configurado como privado.";
              } else if (event.data === 101 || event.data === 150) {
                msg = "O proprietário do vídeo desativou a reprodução fora do YouTube (incorporação desativada).";
              }
              setPlayerError(msg);
            }
          },
        });
      } catch (error) {
        console.error("Erro crítico ao instanciar player do YouTube:", error);
      }
    }

    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [videoId, currentScreen]);

  // Monitorar loop de repetição da frase selecionada
  useEffect(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    if (activePhraseId && loopMode && isPlayerReady && playerRef.current && playerState === 1) {
      const activePhrase = phrases.find(p => p.id === activePhraseId);
      if (activePhrase) {
        const start = activePhrase.timeStart;
        const end = activePhrase.timeEnd || (start + 4);

        loopIntervalRef.current = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
            const currentTime = playerRef.current.getCurrentTime();
            if (currentTime >= end || currentTime < start - 1) {
              playerRef.current.seekTo(start, true);
            }
          }
        }, 150);
      }
    }

    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [activePhraseId, loopMode, isPlayerReady, playerState, phrases]);

  // Monitorar o tempo atual do vídeo para destacar a frase sendo falada em tempo real
  useEffect(() => {
    let interval: any = null;

    if (isPlayerReady && playerRef.current && playerState === 1) {
      interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const currentTime = playerRef.current.getCurrentTime();
          
          // Encontrar a frase que corresponde ao tempo atual
          const active = phrases.find(p => {
            const start = p.timeStart;
            const end = p.timeEnd || (start + 4);
            return currentTime >= start && currentTime <= end;
          });

          if (active) {
            setCurrentPlayingPhraseId(active.id);
          } else {
            setCurrentPlayingPhraseId(null);
          }
        }
      }, 100); // 100ms para uma detecção precisa e rápida
    } else {
      setCurrentPlayingPhraseId(null);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlayerReady, playerState, phrases]);



  // Renderizar as palavras individuais clicáveis para tradução
  const renderClickableWords = (text: string, phraseId: string) => {
    const words = text.split(/(\s+)/); // Preserva espaços para manter o espaçamento correto

    // Encontrar índices de palavras clicáveis reais para determinar posicionamento inteligente
    const clickableWordsIndexes = words
      .map((w, i) => {
        if (/^\s+$/.test(w)) return -1;
        const clean = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
        return clean ? i : -1;
      })
      .filter(i => i !== -1);

    const totalClickable = clickableWordsIndexes.length;

    return words.map((chunk, idx) => {
      if (/^\s+$/.test(chunk)) {
        return <span key={idx}>{chunk}</span>;
      }

      // Limpar pontuação para buscar no dicionário
      const cleanWord = chunk.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
      if (!cleanWord) {
        return <span key={idx}>{chunk}</span>;
      }

      // Separar pontuação ao redor do núcleo da palavra
      const match = chunk.match(/^([^a-zA-Z]*)(.*?)([^a-zA-Z]*)$/);
      const prefix = match ? match[1] : "";
      const coreWord = match ? match[2] : chunk;
      const suffix = match ? match[3] : "";

      const translation = WORD_DICTIONARY[cleanWord] || null;
      const isClicked = clickedWord?.phraseId === phraseId && clickedWord?.wordIndex === idx;

      return (
        <span key={idx} className="relative inline-block">
          {prefix}
          <span
            onClick={(e) => {
              e.stopPropagation(); // Evita ativar a frase inteira
              const wordRect = e.currentTarget.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              const tooltipWidth = 192; // 12rem = 192px
              const margin = 12; // safety margin from screen edges

              const wordCenterX = wordRect.left + wordRect.width / 2;
              let idealTooltipLeft = wordCenterX - tooltipWidth / 2;
              
              // Clamp tooltip so it is strictly inside screen bounds
              let clampedTooltipLeft = Math.max(margin, Math.min(idealTooltipLeft, viewportWidth - tooltipWidth - margin));

              // Relative position of tooltip left boundary relative to the clicked word's left boundary
              const relativeLeft = clampedTooltipLeft - wordRect.left;

              // Position of the arrow relative to the tooltip left boundary
              const arrowLeft = wordCenterX - clampedTooltipLeft;

              setClickedWord({
                word: coreWord,
                translation: translation || "Clique para buscar tradução direta ou consulte dicionários",
                phraseId: phraseId,
                wordIndex: idx,
                relativeLeft: relativeLeft,
                arrowLeft: arrowLeft
              });
            }}
            className={`cursor-pointer px-0.5 rounded-md transition-colors font-semibold border-b border-dashed ${
              isClicked 
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md" 
                : "text-white border-slate-500 hover:bg-violet-500/20 hover:border-violet-400"
            }`}
          >
            {coreWord}
          </span>
          {suffix}

          {/* Tooltip Popup acima da palavra clicada */}
          <AnimatePresence>
            {isClicked && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                className="absolute z-50 bottom-full mb-2 w-48 bg-slate-950 text-white text-xs border border-amber-400 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1 pointer-events-auto"
                style={{ left: `${clickedWord.relativeLeft}px` }}
                onClick={(e) => e.stopPropagation()} // Evita cliques indesejados no balão fechar tudo
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-1 shrink-0">
                  <span className="font-bold text-amber-400 font-mono text-[9px] uppercase tracking-wider">Tradução Rápida</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedWord(null);
                    }}
                    className="p-0.5 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="py-1">
                  <p className="font-bold text-slate-200 text-xs">"{coreWord}"</p>
                  <p className="text-[11px] text-amber-300 leading-tight mt-0.5 font-medium">
                    {clickedWord.translation}
                  </p>
                </div>
                {/* Seta do Balão */}
                <div 
                  className="absolute top-full -mt-1 border-4 border-transparent border-t-slate-950 z-10"
                  style={{ left: `${clickedWord.arrowLeft - 4}px` }}
                ></div>
                <div 
                  className="absolute top-full -mt-0.5 border-4 border-transparent border-t-amber-400"
                  style={{ left: `${clickedWord.arrowLeft - 4}px` }}
                ></div>
              </motion.div>
            )}
          </AnimatePresence>
        </span>
      );
    });
  };

  // Funções de controle de mídia e ações do usuário
  const selectPhrase = (phrase: Phrase) => {
    if (!phrase) return;
    setActivePhraseId(phrase.id);

    if (isPlayerReady && playerRef.current) {
      try {
        if (typeof playerRef.current.seekTo === "function") {
          playerRef.current.seekTo(phrase.timeStart, true);
        }
        
        // Se estiver pausado ou não iniciado, dá play
        if (typeof playerRef.current.getPlayerState === "function") {
          const state = playerRef.current.getPlayerState();
          if (state !== 1 && typeof playerRef.current.playVideo === "function") {
            playerRef.current.playVideo();
          }
        }
      } catch (err) {
        console.error("Erro ao controlar o player no selectPhrase:", err);
      }
    }
  };

  const handlePlayPausePhrase = (phrase: Phrase, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phrase) return;
    if (!isPlayerReady || !playerRef.current) return;

    const isActive = activePhraseId === phrase.id;
    const isPlaying = playerState === 1;

    try {
      if (isActive) {
        if (isPlaying) {
          if (typeof playerRef.current.pauseVideo === "function") {
            playerRef.current.pauseVideo();
          }
        } else {
          if (typeof playerRef.current.playVideo === "function") {
            playerRef.current.playVideo();
          }
        }
      } else {
        selectPhrase(phrase);
      }
    } catch (err) {
      console.error("Erro ao pausar/reproduzir frase no handlePlayPausePhrase:", err);
    }
  };

  // Pronunciar a frase (Text to Speech - TTS)
  const speakText = (text: string, phraseId: string) => {
    if ("speechSynthesis" in window) {
      // Cancela qualquer fala anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = playbackRate; // respeita a velocidade atual!

      utterance.onstart = () => {
        setSpeakingPhraseId(phraseId);
      };

      utterance.onend = () => {
        setSpeakingPhraseId(null);
      };

      utterance.onerror = () => {
        setSpeakingPhraseId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("A síntese de voz não é suportada no seu navegador.");
    }
  };



  // Ajustar velocidade de reprodução do vídeo e da voz
  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlayerReady && playerRef.current && typeof playerRef.current.setPlaybackRate === "function") {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  // Adicionar uma nova frase
  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnglish || !newPortuguese) return;

    const newPhrase: Phrase = {
      id: Date.now().toString(),
      english: newEnglish,
      portuguese: newPortuguese,
      timeStart: parseFloat(newTimeStart) || 0,
      timeEnd: parseFloat(newTimeEnd) || (parseFloat(newTimeStart) + 4)
    };

    setPhrases([...phrases, newPhrase]);
    setNewEnglish("");
    setNewPortuguese("");
    setNewTimeStart("0");
    setNewTimeEnd("5");
    setShowAddModal(false);
  };

  // Deletar frase
  const deletePhrase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhrases(phrases.filter(p => p.id !== id));
    if (activePhraseId === id) {
      setActivePhraseId(null);
    }
  };

  // Selecionar uma lição/vídeo da biblioteca
  const selectLesson = (lesson: Lesson) => {
    if (!lesson) return;
    setSelectedLesson(lesson);
    const ytid = typeof lesson.youtubeId === "string" ? lesson.youtubeId : "";
    setVideoId(ytid);
    
    // Validar se o ID possui caracteres incorretos ou comprimento inválido (não tem exatamente 11 caracteres)
    const trimmedId = ytid.trim();
    if (trimmedId === "" || trimmedId === "null" || trimmedId === "undefined" || trimmedId.length !== 11) {
      alert("Pedimos desculpas pelo transtorno. O identificador deste vídeo possui caracteres incorretos ou comprimento inválido. Por favor, reporte este problema ao administrador (ADM) para que possamos corrigi-lo.");
    }
    
    setPhrases(Array.isArray(lesson.phrases) ? [...lesson.phrases] : []);
    
    // Resetar estados ativos da lição anterior
    setActivePhraseId(null);
    setCurrentPlayingPhraseId(null);
    setClickedWord(null);
    setIsPlayerReady(false);
    
    setCurrentScreen("training");
  };

  // Voltar para a Biblioteca de Vídeos
  const handleBackToLibrary = () => {
    // Pausar o vídeo se estiver tocando
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try {
        playerRef.current.pauseVideo();
      } catch (e) {
        console.error("Erro ao pausar o vídeo ao voltar", e);
      }
    }
    console.log("AdMob: Mostrando anúncio Intersticial de tela cheia...");
    setCurrentScreen("library");
  };

  // Reiniciar lista para os padrões originais da lição ativa
  const resetPhrasesToDefault = () => {
    if (!selectedLesson) return;
    const originalLesson = videosList.find(l => l.id === selectedLesson.id);
    if (originalLesson) {
      setPhrases(Array.isArray(originalLesson.phrases) ? [...originalLesson.phrases] : []);
    }
    setActivePhraseId(null);
  };

  return (
    <div id="app-container" className="min-h-screen bg-slate-950 text-white font-sans flex justify-center items-center p-0 sm:p-4 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Wrapper Estilo Aplicativo Nativo no Celular, Centralizado no Desktop */}
      <div className="w-full max-w-md h-screen sm:h-[850px] sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            {currentScreen === "training" ? (
              <button 
                onClick={handleBackToLibrary}
                className="flex items-center gap-0.5 bg-slate-800 hover:bg-slate-700 text-violet-300 hover:text-white px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all border border-slate-750 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Biblioteca</span>
              </button>
            ) : currentScreen === "library" ? (
              <button 
                onClick={() => setCurrentScreen("front-page")}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-violet-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-slate-750 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Início</span>
              </button>
            ) : (
              <img 
                src={logoImg} 
                alt="Corta pro Inglês Logo" 
                className="w-10 h-10 object-contain rounded-full border border-slate-800 bg-slate-950 p-0.5 shadow-md shadow-violet-500/10"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                {currentScreen === "training" ? (
                  <span className="truncate block max-w-[130px] sm:max-w-[160px]">{selectedLesson?.title || "Sem título"}</span>
                ) : (
                  <>Corta pro Inglês <span className="text-[9px] font-semibold text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded-full border border-violet-400/20">Shadowing</span></>
                )}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {currentScreen === "training" ? "Prática de Shadowing ativa" : "Sua prática diária de pronúncia e fluência"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => setShowHelpModal(true)} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Ajuda"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* FRONT PAGE - BOAS-VINDAS */}
        <div id="front-page" className={`flex-1 flex flex-col overflow-y-auto px-5 py-6 space-y-6 scrollbar-thin ${currentScreen === "front-page" ? "" : "escondido"}`}>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img 
                src={logoImg} 
                alt="Corta pro Inglês Logo" 
                className="w-20 h-20 object-contain rounded-full border border-slate-850 bg-slate-950 p-1 shadow-xl shadow-violet-500/10"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-violet-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-violet-400">
                PRO
              </span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Corta pro Inglês <span className="text-violet-400">Shadowing</span>
              </h2>
              <p className="text-xs text-violet-300 font-semibold uppercase tracking-wider">O método definitivo de imitação</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Fale inglês com a entonação, ritmo e velocidade de nativos. Pratique o método <span className="font-bold text-violet-400">Shadowing</span> repetindo diálogos reais do cotidiano e ganhe fluência imediatamente!
            </p>
          </div>

          {/* DESTAQUE DA LIÇÃO DO DIA */}
          <div className="bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-500/10 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>Lição recomendada para hoje</span>
              </span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                DIÁRIA
              </span>
            </div>

            <div 
              onClick={() => selectLesson(recommendedLesson)}
              className="bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-all group"
            >
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                {recommendedLesson?.youtubeId && recommendedLesson.youtubeId.trim() !== "" && recommendedLesson.youtubeId.trim() !== "null" && recommendedLesson.youtubeId.trim() !== "undefined" && recommendedLesson.youtubeId.trim().length >= 5 ? (
                  <>
                    <img 
                      src={`https://img.youtube.com/vi/${recommendedLesson.youtubeId}/mqdefault.jpg`} 
                      alt={recommendedLesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                    {recommendedLesson?.category === "musicas" ? (
                      <Music className="w-8 h-8 text-violet-500/70" />
                    ) : (
                      <Film className="w-8 h-8 text-violet-500/70" />
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Prática de Shadowing</span>
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[9px] text-slate-300 font-mono bg-slate-950/60 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-800">
                  <Film className="w-2.5 h-2.5 text-violet-400" />
                  <span>{recommendedLesson?.phrases?.length || 0} frases</span>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-500 text-white rounded-full p-2.5 shadow-lg shadow-violet-600/30 transform scale-90 group-hover:scale-100 transition-all">
                  <Play className="w-4 h-4 fill-current text-white" />
                </div>
              </div>

              <div className="p-3 space-y-1">
                <h4 className="font-bold text-xs text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                  {recommendedLesson?.title || "Sem título"}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {recommendedLesson?.description || "Prática de Shadowing"}
                </p>
              </div>
            </div>
          </div>

          {/* BOTÃO GRANDE DE ENTRAR NA BIBLIOTECA */}
          <button
            onClick={() => setCurrentScreen("library")}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group text-sm"
          >
            <BookOpen className="w-5 h-5 text-violet-100" />
            <span>Entrar na Biblioteca</span>
          </button>
        </div>

        {/* TELA DA BIBLIOTECA */}
        <div id="tela-biblioteca" className={`flex-1 flex flex-col overflow-hidden ${currentScreen === "library" ? "" : "escondido"}`}>
          
          {/* CATEGORIAS / ABAS DE FILTRO */}
          <div className="px-4 pt-4 pb-2.5 bg-slate-900 border-b border-slate-800/80 shrink-0 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span>Categorias</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "series", label: "Séries", icon: Tv },
                  { id: "musicas", label: "Músicas", icon: Music },
                  { id: "ia", label: "Corta pro inglês", icon: Sparkles }
                ].map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id as any);
                        setSelectedPlaylist("todos"); // Reset subcategory filter on changing main category
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-violet-600/15 border-violet-500 text-violet-300 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/5 font-bold"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-750"
                      }`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-violet-400" : "text-slate-500"}`} />
                      <span className="truncate">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategorias de Séries (Playlists) */}
            {selectedCategory === "series" && (
              <div className="pt-2 border-t border-slate-800/50 flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Film className="w-3 h-3 text-slate-500" />
                  <span>Escolha a Playlist</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedPlaylist}
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-violet-500 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all outline-hidden appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  >
                    <option value="todos">Todas</option>
                    {Array.from(new Set(videosList
                      .filter(v => v.category === "series" && v.playlist)
                      .map(v => v.playlist?.toLowerCase().trim() as string)
                    ))
                      .filter(Boolean)
                      .map((p: string) => (
                        <option key={p} value={p}>
                          {p ? (p.charAt(0).toUpperCase() + p.slice(1)) : ""}
                        </option>
                      ))
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            <div className="pb-1">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {selectedCategory === "series" 
                    ? `Séries (${selectedPlaylist === "todos" ? "Todas" : selectedPlaylist})` 
                    : selectedCategory === "musicas" 
                      ? "Músicas" 
                      : "Corta pro inglês"}
                </span>
                <span className="text-[10px] font-normal lowercase text-slate-500">
                  ({
                    videosList.filter(lesson => {
                      const matchesCategory = lesson.category === selectedCategory;
                      if (!matchesCategory) return false;
                      if (selectedCategory === "series" && selectedPlaylist !== "todos") {
                        return lesson.playlist?.toLowerCase().trim() === selectedPlaylist;
                      }
                      return true;
                    }).length
                  } lições)
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {videosList
                .filter((lesson) => {
                  const matchesCategory = lesson.category === selectedCategory;
                  if (!matchesCategory) return false;
                  if (selectedCategory === "series" && selectedPlaylist !== "todos") {
                    return lesson.playlist?.toLowerCase().trim() === selectedPlaylist;
                  }
                  return true;
                })
                .map((lesson) => (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectLesson(lesson)}
                    className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden hover:border-violet-500/40 cursor-pointer transition-all flex flex-col group shadow-lg"
                  >
                    {/* Thumbnail do YouTube */}
                    <div className="relative aspect-video w-full bg-slate-950 border-b border-slate-900 overflow-hidden flex items-center justify-center">
                      {lesson.youtubeId && lesson.youtubeId.trim() !== "" && lesson.youtubeId.trim() !== "null" && lesson.youtubeId.trim() !== "undefined" && lesson.youtubeId.trim().length >= 5 ? (
                        <>
                          <img 
                            src={`https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`} 
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {/* Overlay Escuro Gradiente */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                          {lesson.category === "musicas" ? (
                            <Music className="w-8 h-8 text-violet-500/70" />
                          ) : (
                            <Film className="w-8 h-8 text-violet-500/70" />
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Prática de Shadowing</span>
                        </div>
                      )}
                      
                      {/* Play Badge */}
                      <div className="absolute bottom-3 right-3 bg-violet-600 text-white rounded-full p-2 shadow-lg shadow-violet-600/20 transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current text-white" />
                      </div>

                      {/* Badge de Duração/Frases */}
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                        <Film className="w-3 h-3 text-violet-400" />
                        <span>{lesson.phrases.length} frases</span>
                      </div>
                    </div>

                    {/* Detalhes da Lição */}
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm tracking-tight text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-900/60 mt-2">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                          Inicie o Treino
                        </span>
                        <span className="text-xs font-bold text-violet-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Praticar →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              
              {/* Se não houver vídeos */}
              {videosList.filter((lesson) => {
                const matchesCategory = lesson.category === selectedCategory;
                if (!matchesCategory) return false;
                if (selectedCategory === "series" && selectedPlaylist !== "todos") {
                  return lesson.playlist?.toLowerCase().trim() === selectedPlaylist;
                }
                return true;
              }).length === 0 && (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Nenhum vídeo nesta categoria ainda.</p>
                </div>
              )}
            </div>
          </main>

          {/* CONTAINER DE ANÚNCIO BANNER ADMOB (FIXADO NO RODAPÉ) */}
          <div id="admob-banner-container" className="h-[50px] min-h-[50px] bg-slate-900 border-t border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium shrink-0 w-full text-center box-border bg-gradient-to-b from-slate-950 to-slate-900">
            <span className="bg-violet-600 text-white px-1.5 py-0.5 rounded-sm font-bold text-[9px] mr-2 uppercase tracking-wider shadow-sm shadow-violet-600/10">Anúncio</span>
            <span className="font-semibold tracking-wide">Google AdMob Banner (320x50)</span>
          </div>
        </div>

        {/* TELA DE TREINO */}
        <div id="tela-treino" className={`flex-1 flex flex-col overflow-hidden ${currentScreen === "training" ? "" : "escondido"}`}>
          
          {/* CONTAINER DO PLAYER DO YOUTUBE (PARTE SUPERIOR) */}
          <section className="relative w-full aspect-video bg-black flex flex-col justify-center items-center overflow-hidden border-b border-slate-800 shrink-0 shadow-inner">
            {(videoId && videoId.trim() !== "" && videoId.trim() !== "null" && videoId.trim() !== "undefined" && videoId.trim().length === 11) ? (
              <>
                <div id="youtube-player" className="w-full h-full pointer-events-auto" />
                
                {/* Indicador de Erro se houver */}
                {playerError ? (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 p-4 text-center z-10">
                    <span className="text-red-500 text-3xl">⚠️</span>
                    <p className="text-sm font-bold text-red-400">Erro ao carregar o vídeo</p>
                    <p className="text-[11px] text-slate-400 max-w-[320px] leading-relaxed">{playerError}</p>
                    <button
                      onClick={handleBackToLibrary}
                      className="mt-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wider rounded-xl border border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer"
                    >
                      ← Voltar para a Biblioteca
                    </button>
                  </div>
                ) : !isPlayerReady ? (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400">Carregando player do YouTube...</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <span className="text-red-500 text-3xl">⚠️</span>
                <p className="text-sm font-bold text-red-400">Pedimos desculpas pelo transtorno</p>
                <p className="text-[11px] text-slate-400 max-w-[320px]">Este vídeo possui caracteres incorretos ou um identificador inválido "{videoId || '(vazio)'}". Por favor, reporte este problema ao administrador (ADM).</p>
                <button
                  onClick={handleBackToLibrary}
                  className="mt-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wider rounded-xl border border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer"
                >
                  ← Voltar para a Biblioteca
                </button>
              </div>
            )}
          </section>

          {/* BARRA DE CONTROLE DE VELOCIDADE DO VÍDEO (PERMANENTE ABAIXO DO VÍDEO) */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-violet-400" />
              <span>Velocidade de Reprodução:</span>
            </div>
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    playbackRate === rate 
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/10 font-bold" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE FRASES (PARTE INFERIOR) */}
          <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-thin">
            
            {/* BARRA DE PROGRESSO VISUAL DISCRETA */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 shrink-0 shadow-lg shadow-black/10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Progresso da Lição</span>
                <span className="font-mono text-violet-400 font-bold">
                  {phrases.filter(p => checkedPhrases.includes(p.id)).length} de {phrases.length} frases dominadas ({
                    phrases.length > 0 
                      ? Math.round((phrases.filter(p => checkedPhrases.includes(p.id)).length / phrases.length) * 100) 
                      : 0
                  }%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                <div 
                  className="h-full bg-violet-600 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${
                      phrases.length > 0 
                        ? (phrases.filter(p => checkedPhrases.includes(p.id)).length / phrases.length) * 100 
                        : 0
                    }%` 
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pb-1">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>Frases para Praticar</span>
                <span className="text-[10px] font-normal lowercase text-slate-500">({phrases.length} frases)</span>
              </h2>
            </div>

            <div className="space-y-3.5">
              {phrases.map((phrase, index) => {
                const isActive = activePhraseId === phrase.id;
                const isSpeaking = speakingPhraseId === phrase.id;
                const isCurrentlyPlaying = currentPlayingPhraseId === phrase.id;
                
                return (
                  <motion.div
                    key={phrase.id}
                    layoutId={`phrase-card-${phrase.id}`}
                    onClick={() => selectPhrase(phrase)}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                      isCurrentlyPlaying
                        ? "bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10"
                        : isActive 
                          ? "bg-slate-800/80 border-violet-500/50 shadow-lg shadow-violet-500/5" 
                          : "bg-slate-900 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-800"
                    }`}
                    style={{ minHeight: "100px" }}
                  >
                    {/* Índice, Botão deletar e Tempo */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          Frase #{index + 1}
                        </span>
                        {isCurrentlyPlaying && (
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>No Vídeo</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Botão de Excluir Frase */}
                        <button
                          onClick={(e) => deletePhrase(phrase.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Excluir frase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="text-[10px] font-mono bg-slate-950/80 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                          {Math.floor(phrase.timeStart / 60)}:{(phrase.timeStart % 60).toString().padStart(2, "0")}
                          {phrase.timeEnd ? ` - ${Math.floor(phrase.timeEnd / 60)}:${(phrase.timeEnd % 60).toString().padStart(2, "0")}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Textos */}
                    <div className="space-y-1.5 my-1">
                      <div className={`text-base font-bold tracking-wide transition-colors ${
                        isCurrentlyPlaying ? "text-amber-300" : isActive ? "text-violet-200" : "text-white"
                      }`}>
                        {renderClickableWords(phrase.english, phrase.id)}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {phrase.portuguese}
                      </p>
                    </div>

                    {/* Barra de ações específicas para o card ativo ou hover */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        {/* Botão de Ouvir Pronúncia (TTS) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(phrase.english, phrase.id);
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                            isSpeaking 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 animate-pulse" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                          title="Ouvir pronúncia original lenta"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Botão de Check (Marcar como Concluído) */}
                        <button
                          onClick={(e) => toggleCheckPhrase(phrase.id, e)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                            checkedPhrases.includes(phrase.id)
                              ? "bg-emerald-500/25 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/15" 
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700"
                          }`}
                          title={checkedPhrases.includes(phrase.id) ? "Dominado! Clique para desmarcar" : "Marcar como dominada"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* Botão de Loop individual */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive && loopMode) {
                              setLoopMode(false);
                            } else {
                              selectPhrase(phrase);
                              setLoopMode(true);
                            }
                          }}
                          className={`px-2.5 py-2 rounded-xl border flex items-center gap-1 transition-all text-[10px] font-bold ${
                            isActive && loopMode
                              ? "bg-violet-600/30 border-violet-500 text-violet-300 shadow-sm" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                          title={isActive && loopMode ? "Desativar Repetição" : "Repetir esta Frase em Loop"}
                        >
                          <Repeat className={`w-3.5 h-3.5 ${isActive && loopMode ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                          <span>{isActive && loopMode ? "Loop Ativo" : "Loop"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Botão de Play/Pause do Vídeo */}
                        <button
                          onClick={(e) => handlePlayPausePhrase(phrase, e)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            isActive && playerState === 1
                              ? "bg-amber-600/20 border-amber-500/30 text-amber-400 hover:bg-amber-600/30"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                          title={isActive && playerState === 1 ? "Pausar Vídeo" : "Reproduzir Vídeo"}
                        >
                          {isActive && playerState === 1 ? (
                            <Pause className="w-4 h-4 fill-current text-amber-400" />
                          ) : (
                            <Play className="w-4 h-4 fill-current text-slate-400 group-hover:text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Controle para resetar lista */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={resetPhrasesToDefault}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <ListRestart className="w-4 h-4 text-violet-500" />
                <span>Resetar Frases desta Lição</span>
              </button>
            </div>
          </main>
        </div>

        {/* MODAL: AJUDA & EXPLICAÇÃO SOBRE O MÉTODO SHADOWING */}
        <AnimatePresence>
          {showHelpModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                    <HelpIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">Como fazer o Shadowing?</h3>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <p>
                    O método de <strong>Shadowing</strong> (sombreamento) consiste em ouvir uma frase dita por um falante nativo e repeti-la quase que simultaneamente ou logo em seguida, imitando a entonação, ritmo e pronúncia.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-600/15 border border-violet-500/30 text-[10px] font-bold text-violet-300 flex items-center justify-center shrink-0">1</span>
                      <p>Clique em uma frase. O player irá pular para o momento exato em que ela é dita no vídeo.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-600/15 border border-violet-500/30 text-[10px] font-bold text-violet-300 flex items-center justify-center shrink-0">2</span>
                      <p>Escute a frase com atenção. Se quiser, use o botão de <strong>Ouvir (volume)</strong> para escutar uma pronúncia lenta isolada.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-600/15 border border-violet-500/30 text-[10px] font-bold text-violet-300 flex items-center justify-center shrink-0">3</span>
                      <p>Repita em voz alta imitando o som. Quando dominar a frase, clique no botão de <strong>Check (verificado)</strong> para salvar seu progresso!</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-center mt-2 cursor-pointer shadow-lg shadow-violet-600/10"
                  >
                    Entendido! Começar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: ADICIONAR NOVA FRASES */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">Criar Nova Frase</h3>
                </div>

                <form onSubmit={handleAddPhrase} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium block">Frase em Inglês:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Good morning, how can I help you?"
                      value={newEnglish}
                      onChange={(e) => setNewEnglish(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium block">Tradução em Português:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bom dia, como posso te ajudar?"
                      value={newPortuguese}
                      onChange={(e) => setNewPortuguese(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium block">Segundos de Início:</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={newTimeStart}
                        onChange={(e) => setNewTimeStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium block">Segundos de Fim:</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={newTimeEnd}
                        onChange={(e) => setNewTimeEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold transition-all text-center cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-center cursor-pointer shadow-lg shadow-violet-600/10"
                    >
                      Salvar Frase
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
