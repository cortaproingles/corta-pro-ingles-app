/**
 * CORTA INGLÊS - SCRIPT.JS (Versão Homologada para APK)
 *
 * Versão corrigida com suporte a sincronização dinâmica via GitHub,
 * quebra automática de cache e normalização de categorias (musica, series, ia).
 */

// URL oficial do seu banco de dados no GitHub com quebra de cache ativa
const URL_GITHUB = 'https://raw.githubusercontent.com/cortaproingles/Cortaproingles/main/videos.json';

// Banco de dados local como backup de segurança (caso o GitHub falhe)
let listaDeVideos = [
  {
    id: "friends_01",
    titulo: "Rachel ajuda Chandler a encontrar seu smoking (Friends)",
    categoria: "series",
    playlist: "friends",
    youtubeId: "vqqMTqd7BRE",
    descricao: "Cena clássica para praticar pronúncia com diálogos cotidianos.",
    frases: [
      {
        id: "f1-1",
        inicio: 5,
        fim: 9,
        textoIngles: "Hello, how are you?",
        textoPortugues: "Olá, como vai você?"
      }
    ]
  },
  {
    id: "friends_02",
    titulo: "Rachel 2 3Helps Chandler Find His Wedding Tuxedo",
    categoria: "series",
    playlist: "friends",
    youtubeId: "VwM6-v7P8Xk",
    descricao: "Prática avançada de Shadowing.",
    frases: [
      {
        id: "f2-1",
        inicio: 1,
        fim: 9,
        textoIngles: "Hello, how are you?",
        textoPortugues: "Olá, como vai você?"
      }
    ]
  },
  {
    id: "friends_03",
    titulo: "Rachel3 Helps Chandler Find His Wedding Tuxedo (Música)",
    categoria: "musica",
    playlist: "",
    youtubeId: "VwM6-Xk",
    descricao: "Prática com canção.",
    frases: [
      {
        id: "f3-1",
        inicio: 15,
        fim: 20,
        textoIngles: "Hello, how are you?",
        textoPortugues: "Olá, como vai você?"
      }
    ]
  },
  {
    id: "friends_04",
    titulo: "Rachel3 Helps Chandler Find His Wedding Tuxedo (IA)",
    categoria: "ia",
    playlist: "",
    youtubeId: "VwM6-Xk",
    descricao: "Prática de pronúncia guiada por inteligência artificial.",
    frases: [
      {
        id: "f4-1",
        inicio: 15,
        fim: 20,
        textoIngles: "Hello, how are you?",
        textoPortugues: "Olá, como vai você?"
      }
    ]
  }
];

// Estados de controle globais da aplicação (Sempre no singular e sem acento para casar com o GitHub)
let categoriaAtiva = "series";
let playlistAtiva = "todos";
let videoAtual = null;
let frasesDominadas = carregarProgressoDoStorage();

// Função de mapeamento para normalizar e garantir consistência nos campos vindos do GitHub
function mapGitHubJsonToLocal(dados) {
  return dados.map((item, itemIdx) => {
    let rawCat = (item.categoria || item.category || "series").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    let normalizedCategory = "series";
    if (rawCat === "musicas" || rawCat === "musica" || rawCat === "music" || rawCat === "songs" || rawCat === "song") {
      normalizedCategory = "musicas";
    } else if (rawCat === "ia" || rawCat === "corta pro ingles" || rawCat === "cortaproingles" || rawCat === "corta_pro_ingles") {
      normalizedCategory = "ia";
    }

    return {
      id: item.id || `lesson-${itemIdx}`,
      titulo: item.titulo || item.título || "Sem título",
      youtubeId: item.youtubeId || "",
      descricao: item.descricao || item.descrição || "Prática de Shadowing",
      categoria: normalizedCategory,
      playlist: (item.playlist || "").toLowerCase(),
      frases: (item.frases || item.phrases || []).map((p, pIdx) => ({
        id: p.id || `${item.id || itemIdx}-f-${pIdx}`,
        inicio: Number(p.inicio !== undefined ? p.inicio : p.timeStart || 0),
        fim: Number(p.fim !== undefined ? p.fim : p.timeEnd || 5),
        textoIngles: p.textoIngles || p.english || "",
        textoPortugues: p.textoPortugues || p.portuguese || ""
      }))
    };
  });
}

// Busca os dados dinamicamente no GitHub injetando timestamp anti-cache
async function buscarVideosOnline() {
  try {
    // Adiciona um número único no fim da URL para forçar o celular a baixar o arquivo fresquinho do GitHub
    const urlAntiCache = `${URL_GITHUB}?t=${new Date().getTime()}`;
    const resposta = await fetch(urlAntiCache);
    
    if (!resposta.ok) throw new Error("Erro na requisição: " + resposta.status);
    const dados = await resposta.json();
    
    if (Array.isArray(dados) && dados.length > 0) {
      listaDeVideos = mapGitHubJsonToLocal(dados);
      console.log("Banco de dados sincronizado com o GitHub:", listaDeVideos);
      
      videoAtual = listaDeVideos[0];
      atualizarOpcoesDePlaylists();
      sortearEExibirVideoDoDia();
      renderizarBiblioteca(categoriaAtiva, playlistAtiva);
    }
  } catch (erro) {
    console.error("Usando banco de dados local como backup:", erro);
    videoAtual = listaDeVideos[0];
    sortearEExibirVideoDoDia();
    renderizarBiblioteca(categoriaAtiva, playlistAtiva);
  }
}

// Atualiza o seletor de playlists com base nas existentes na categoria 'series'
function atualizarOpcoesDePlaylists() {
  const selecionarPlaylist = document.getElementById("seletor-playlist-series");
  if (!selecionarPlaylist) return;

  const playlistsUnicas = new Set();
  listaDeVideos.forEach(video => {
    if (video.categoria === "series" && video.playlist && video.playlist.trim() !== "") {
      playlistsUnicas.add(video.playlist.trim().toLowerCase());
    }
  });

  selecionarPlaylist.innerHTML = '<option value="todos">Todas as Séries</option>';
  playlistsUnicas.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    selecionarPlaylist.appendChild(option);
  });
}

// Realiza o sorteio diário baseado no dia atual para manter estabilidade na indicação de hoje
function sortearEExibirVideoDoDia() {
  const secaoVideoDia = document.getElementById("secao-video-dia");
  if (!secaoVideoDia) return;

  if (listaDeVideos.length === 0) {
    secaoVideoDia.classList.add("escondido");
    return;
  }

  const hojeStr = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < hojeStr.length; i++) {
    hash = hojeStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % listaDeVideos.length;
  const videoDoDia = listaDeVideos[index];

  const imgThumb = document.getElementById("dia-thumb");
  const txtTitulo = document.getElementById("dia-titulo");
  const txtDescricao = document.getElementById("dia-descricao");
  const txtFrasesCount = document.getElementById("dia-frases-count");

  if (imgThumb) {
    imgThumb.src = `https://img.youtube.com/vi/${videoDoDia.youtubeId}/mqdefault.jpg`;
    imgThumb.alt = videoDoDia.titulo;
  }
  if (txtTitulo) txtTitulo.textContent = videoDoDia.titulo;
  if (txtDescricao) txtDescricao.textContent = videoDoDia.descricao;
  if (txtFrasesCount) txtFrasesCount.textContent = `${videoDoDia.frases.length} frases`;

  const cardVideoDia = document.getElementById("card-video-dia");
  if (cardVideoDia) {
    const novoCard = cardVideoDia.cloneNode(true);
    cardVideoDia.parentNode.replaceChild(novoCard, cardVideoDia);
    novoCard.addEventListener("click", () => carregarVideoNoTreino(videoDoDia));
  }

  secaoVideoDia.classList.remove("escondido");
}

function irParaTela(idDaTela) {
  const telas = ["front-page", "tela-biblioteca", "tela-treino"];
  telas.forEach(telaId => {
    const elementoTela = document.getElementById(telaId);
    if (elementoTela) {
      if (telaId === idDaTela) elementoTela.classList.remove("escondido");
      else elementoTela.classList.add("escondido");
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function inicializarBannerAdMob() {
  console.log("AdMob: Inicializando espaço reservado para Banner...");
}

function mostrarIntersticialEVoltar() {
  console.log("AdMob: Mostrando anúncio Intersticial de tela cheia...");
  irParaTela("tela-biblioteca");
  renderizarBiblioteca(categoriaAtiva, playlistAtiva);
}

// Renderização dinâmica corrigida (Filtra exatamente os termos do GitHub: 'series', 'musica', 'ia')
function renderizarBiblioteca(categoriaSelecionada, playlistSelecionada = "todos") {
  // Limpa acentos caso o botão do HTML envie com acento
  categoriaAtiva = categoriaSelecionada.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  playlistAtiva = playlistSelecionada.toLowerCase();

  const containerGrade = document.getElementById("grade-videos");
  if (!containerGrade) return;

  containerGrade.innerHTML = "";

  const videosFiltrados = listaDeVideos.filter(video => {
    const correspondeCategoria = video.categoria === categoriaAtiva;
    if (!correspondeCategoria) return false;

    if (categoriaAtiva === "series" && playlistAtiva !== "todos") {
      return video.playlist && video.playlist.toLowerCase().trim() === playlistAtiva;
    }
    return true;
  });

  if (videosFiltrados.length === 0) {
    containerGrade.innerHTML = `
      <div class="py-12 text-center text-slate-500 col-span-full">
        <p class="text-xs">Nenhum vídeo nesta categoria ainda.</p>
      </div>
    `;
    return;
  }

  videosFiltrados.forEach(video => {
    const totalFrases = video.frases.length;
    const dominadas = video.frases.filter(f => frasesDominadas.includes(f.id)).length;
    const pct = totalFrases > 0 ? Math.round((dominadas / totalFrases) * 100) : 0;

    const card = document.createElement("div");
    card.className = "bg-slate-950 border border-slate-850 rounded-2xl p-4 hover:border-violet-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-violet-600/5 flex flex-col gap-3 group";
    
    card.innerHTML = `
      <div class="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
        <img src="https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg" alt="${video.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2.5">
          <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-600 text-white shadow-md">
            ${video.categoria === 'series' ? (video.playlist || 'Séries') : (video.categoria === 'ia' ? 'Corta pro inglês' : 'Músicas')}
          </span>
        </div>
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">${video.titulo}</h3>
        <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${video.descricao}</p>
      </div>
      <div class="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px]">
        <span class="text-slate-500 font-medium">${totalFrases} frases</span>
        <span class="font-mono ${pct === 100 ? 'text-emerald-400' : 'text-violet-400'} font-bold">${pct}% concluído</span>
      </div>
    `;

    card.addEventListener("click", () => carregarVideoNoTreino(video));
    containerGrade.appendChild(card);
  });
}

function carregarVideoNoTreino(video) {
  videoAtual = video;
  irParaTela("tela-treino");

  const tituloTreino = document.getElementById("titulo-video-treino");
  if (tituloTreino) tituloTreino.textContent = video.titulo;

  const playerConteudo = document.getElementById("player-conteudo-treino");
  const isVideoIdValid = video.youtubeId && video.youtubeId.trim() !== "" && video.youtubeId.trim() !== "null" && video.youtubeId.trim() !== "undefined" && video.youtubeId.trim().length === 11;

  if (!isVideoIdValid) {
    console.warn("YouTube ID inválido ou ausente:", video.youtubeId);
    alert("Pedimos desculpas pelo transtorno. O identificador deste vídeo possui caracteres incorretos ou comprimento inválido. Por favor, reporte este problema ao administrador (ADM) para que possamos corrigi-lo.");
    if (playerConteudo) {
      playerConteudo.innerHTML = `
        <div style="color: #ef4444; font-weight: bold; margin-bottom: 8px; font-size: 13px;">⚠️ Pedimos desculpas pelo transtorno</div>
        <p style="font-size: 10px; color: #94a3b8; margin-bottom: 12px; max-width: 280px; margin-left: auto; margin-right: auto; line-height: 1.4;">Este vídeo possui caracteres incorretos ou um identificador inválido "${video.youtubeId || '(vazio)'}". Por favor, reporte este problema ao administrador (ADM).</p>
        <button class="btn-voltar-biblioteca btn-acao" style="font-size: 10px; font-weight: 700; padding: 6px 12px; display: inline-flex; align-items: center; justify-content: center; background-color: #1e293b; color: #ffffff; border: 1px solid #334155; border-radius: 8px; cursor: pointer; text-transform: uppercase; tracking-wider: 0.05em;">
          ← Voltar para a Biblioteca
        </button>
      `;
      // Vincula o evento do novo botão de voltar inserido dinamicamente
      const btnNovoVoltar = playerConteudo.querySelector(".btn-voltar-biblioteca");
      if (btnNovoVoltar) {
        btnNovoVoltar.addEventListener("click", () => {
          mostrarIntersticialEVoltar();
        });
      }
    }
  } else {
    // Restaura o conteúdo original do player se o ID for válido
    if (playerConteudo) {
      playerConteudo.innerHTML = `
        <p style="font-weight: 700; color: #f1f5f9; margin-bottom: 4px;" id="titulo-video-treino">${video.titulo}</p>
        <p style="font-size: 10px; color: #64748b;">[Player do YouTube integrado no Shadowing]</p>
      `;
    }

    if (typeof inicializarPlayerYoutube === "function") {
      try {
        inicializarPlayerYoutube(video.youtubeId);
      } catch (err) {
        console.error("Erro ao chamar inicializarPlayerYoutube nativo:", err);
      }
    }
  }
  
  renderizarFrasesNoTreino();
  atualizarBarraDeProgresso();
}

function toggleCheckFrase(idDaFrase, elementoBotao) {
  const index = frasesDominadas.indexOf(idDaFrase);
  if (index > -1) {
    frasesDominadas.splice(index, 1);
    elementoBotao.className = "botao-check p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-500 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer";
  } else {
    frasesDominadas.push(idDaFrase);
    elementoBotao.className = "botao-check p-2 rounded-xl border border-emerald-500 bg-emerald-500/25 text-emerald-400 shadow-sm shadow-emerald-500/15 transition-all duration-200 cursor-pointer checked";
  }
  salvarProgressoNoStorage();
  atualizarBarraDeProgresso();
}

function actualizarBarraDeProgresso() {
  if (!videoAtual) return;
  const totalFrases = videoAtual.frases.length;
  const dominadas = videoAtual.frases.filter(f => frasesDominadas.includes(f.id)).length;
  const porcentagem = totalFrases > 0 ? Math.round((dominadas/totalFrases) * 100) : 0;

  const textoProgresso = document.getElementById("texto-progresso");
  const preenchimentoProgresso = document.getElementById("preenchimento-progresso");

  if (textoProgresso) textoProgresso.textContent = `${dominadas} de ${totalFrases} frases dominadas (${porcentagem}%)`;
  if (preenchimentoProgresso) preenchimentoProgresso.style.width = `${porcentagem}%`;
}

function salvarProgressoNoStorage() {
  try {
    localStorage.setItem("corta_ingles_checked_phrases", JSON.stringify(frasesDominadas));
  } catch (erro) {
    console.error("Erro ao salvar progresso:", erro);
  }
}

function carregarProgressoDoStorage() {
  try {
    const salvo = localStorage.getItem("corta_ingles_checked_phrases");
    return salvo ? JSON.parse(salvo) : [];
  } catch (erro) {
    return [];
  }
}

function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

// Declarações fictícias ou globais para evitar erros de lint no escopo do arquivo (serão providos pelo HTML/YouTube API)
/* global inicializarPlayerYoutube, tocarAudioFrase */

function renderizarFrasesNoTreino() {
  const containerFrases = document.getElementById("lista-frases-treino");
  if (!containerFrases) return;

  containerFrases.innerHTML = "";

  videoAtual.frases.forEach((frase, index) => {
    const isChecked = frasesDominadas.includes(frase.id);
    const fraseDiv = document.createElement("div");
    fraseDiv.className = "bg-slate-900 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-750 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4";
    
    fraseDiv.innerHTML = `
      <div class="space-y-1 flex-1">
        <div class="flex items-center gap-2">
          <span class="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded">#${index + 1}</span>
          <span class="text-[10px] text-slate-500 font-mono">${formatarTempo(frase.inicio)} - ${formatarTempo(frase.fim)}</span>
        </div>
        <p class="text-sm font-semibold text-slate-100 font-sans tracking-wide leading-relaxed">${frase.textoIngles}</p>
        <p class="text-xs text-slate-400 italic">${frase.textoPortugues}</p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        <button id="btn-ouvir-${frase.id}" class="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
        </button>
        <button id="btn-check-${frase.id}" class="botao-check p-2 rounded-xl border transition-all duration-200 cursor-pointer ${isChecked ? 'border-emerald-500 bg-emerald-500/25 text-emerald-400 checked' : 'border-slate-800 bg-slate-950 text-slate-500'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
      </div>
    `;

    const btnCheck = fraseDiv.querySelector(`#btn-check-${frase.id}`);
    if (btnCheck) {
      btnCheck.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCheckFrase(frase.id, btnCheck);
      });
    }

    const btnOuvir = fraseDiv.querySelector(`#btn-ouvir-${frase.id}`);
    if (btnOuvir && typeof tocarAudioFrase === "function") {
      btnOuvir.addEventListener("click", (e) => {
        e.stopPropagation();
        tocarAudioFrase(frase);
      });
    }

    containerFrases.appendChild(fraseDiv);
  });
}

// Dispara a carga inicial do app buscando os dados na nuvem assim que a página abre
document.addEventListener("DOMContentLoaded", () => {
  buscarVideosOnline();
  inicializarBannerAdMob();

  // Entrar na biblioteca a partir da front-page
  const btnEntrar = document.getElementById("btn-entrar-biblioteca");
  if (btnEntrar) {
    btnEntrar.addEventListener("click", () => {
      irParaTela("tela-biblioteca");
      renderizarBiblioteca(categoriaAtiva, playlistAtiva);
    });
  }

  // Voltar para a front-page a partir da biblioteca
  const btnVoltarFront = document.getElementById("btn-voltar-front");
  if (btnVoltarFront) {
    btnVoltarFront.addEventListener("click", () => {
      irParaTela("front-page");
    });
  }

  // Voltar para a biblioteca a partir do treino
  const botoesVoltarBib = document.querySelectorAll(".btn-voltar-biblioteca");
  botoesVoltarBib.forEach(btn => {
    btn.addEventListener("click", () => {
      mostrarIntersticialEVoltar();
    });
  });

  // Alternar categorias (abas)
  const botoesCategoria = document.querySelectorAll(".btn-categoria");
  botoesCategoria.forEach(btn => {
    btn.addEventListener("click", () => {
      botoesCategoria.forEach(b => b.classList.remove("aba-ativa"));
      btn.classList.add("aba-ativa");
      
      const cat = btn.getAttribute("data-categoria") || "series";
      
      // Controlar exibição do filtro de séries
      const containerPlaylist = document.getElementById("container-playlist-series");
      if (containerPlaylist) {
        if (cat === "series") {
          containerPlaylist.style.display = "flex";
        } else {
          containerPlaylist.style.display = "none";
        }
      }
      
      renderizarBiblioteca(cat, "todos");
    });
  });

  // Filtrar playlist de séries
  const seletorPlaylist = document.getElementById("seletor-playlist-series");
  if (seletorPlaylist) {
    seletorPlaylist.addEventListener("change", (e) => {
      renderizarBiblioteca("series", e.target.value);
    });
  }
});
