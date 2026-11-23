const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameWrapper = document.querySelector(".game-wrapper");

// Elementos dos degraus Mínimo e Intermediário
const btnTema = document.getElementById("btnTema");
const inputNome = document.getElementById("inputNome");
const inputMeta = document.getElementById("inputMeta");
const btnConfirmar = document.getElementById("btnConfirmar");
const mensagemValidacao = document.getElementById("mensagemValidacao");

ctx.imageSmoothingEnabled = false;

// =========================================================
// DEGRAU MÍNIMO: Botão que muda a página com if/else
// =========================================================
let modoClaroAtivo = false;

btnTema.addEventListener("click", () => {
  if (modoClaroAtivo === false) {
    document.body.classList.add("tema-claro");
    btnTema.textContent = "Modo Escuro";
    modoClaroAtivo = true;
  } else {
    document.body.classList.remove("tema-claro");
    btnTema.textContent = "Modo Claro";
    modoClaroAtivo = false;
  }
});

// =========================================================
// DEGRAU INTERMEDIÁRIO: Leitura e validação de campos
// =========================================================
let nomeJogador = localStorage.getItem("dinoNomeJogador") || "JOGADOR";
let metaPontos = Number(localStorage.getItem("dinoMetaPontos")) || 300;

inputNome.value = nomeJogador !== "JOGADOR" ? nomeJogador : "";
inputMeta.value = metaPontos;

btnConfirmar.addEventListener("click", () => {
  const nomeDigitado = inputNome.value.trim();
  const metaDigitada = inputMeta.value.trim();

  // 1. Valida se algum campo está vazio
  if (nomeDigitado === "" || metaDigitada === "") {
    mensagemValidacao.textContent = "Erro: Preenche o nome e a meta antes de confirmar!";
    mensagemValidacao.className = "mensagem-status erro";
    return;
  }

  // 2. Valida se foi digitada letra no lugar de número
  if (isNaN(Number(metaDigitada)) || Number(metaDigitada) <= 0) {
    mensagemValidacao.textContent = "Erro: A meta deve ser um número válido maior que zero!";
    mensagemValidacao.className = "mensagem-status erro";
    return;
  }

  // Guarda os dados validados no localStorage (Degrau Completo)
  nomeJogador = nomeDigitado.toUpperCase();
  metaPontos = Math.floor(Number(metaDigitada));
  localStorage.setItem("dinoNomeJogador", nomeJogador);
  localStorage.setItem("dinoMetaPontos", metaPontos);

  mensagemValidacao.textContent = `Pronto, ${nomeJogador}! Meta definida para ${metaPontos} pontos.`;
  mensagemValidacao.className = "mensagem-status sucesso";
});

// =========================================================
// JOGO 2D PIXELADO + ARRAYS COM LAÇOS + LOCALSTORAGE
// =========================================================
const PALETA_CENARIO = [
  "#a8dadc", // Azul céu
  "#ffd166", // Amarelo sol
  "#cdb4db", // Lilás
  "#b7e4c7", // Verde menta
  "#ffafcc", // Rosa pastel
  "#bde0fe", // Azul claro
  "#fbc4ab", // Pêssego
  "#e2ece9"  // Cinza gelo
];

let indiceCor = 0;

const SPRITES = {
  dinoRun1: [
    ".......XXXXXXXX",
    "......XX.XXXXXX",
    "......XXXXXXXXX",
    "......XXXXXXXXX",
    "......XXXXX....",
    "......XXXXXXXX.",
    "X....XXXXXX....",
    "XX..XXXXXXX....",
    "XXXXXXXXXXXX...",
    ".XXXXXXXXXX....",
    "..XXXXXXXX.....",
    "...XXXXXX......",
    "...XX..XX......",
    "...XX...X......",
    "...XX..........",
    "...XXX........."
  ],
  dinoRun2: [
    ".......XXXXXXXX",
    "......XX.XXXXXX",
    "......XXXXXXXXX",
    "......XXXXXXXXX",
    "......XXXXX....",
    "......XXXXXXXX.",
    "X....XXXXXX....",
    "XX..XXXXXXX....",
    "XXXXXXXXXXXX...",
    ".XXXXXXXXXX....",
    "..XXXXXXXX.....",
    "...XXXXXX......",
    "...XX..XX......",
    "....X..XX......",
    ".......XX......",
    ".......XXX....."
  ],
  dinoJump: [
    ".......XXXXXXXX",
    "......XX.XXXXXX",
    "......XXXXXXXXX",
    "......XXXXXXXXX",
    "......XXXXX....",
    "......XXXXXXXX.",
    "X....XXXXXX....",
    "XX..XXXXXXX....",
    "XXXXXXXXXXXX...",
    ".XXXXXXXXXX....",
    "..XXXXXXXX.....",
    "...XXXXXX......",
    "...XX..XX......",
    "...XXX.XXX.....",
    "...............",
    "..............."
  ],
  cactoSimples: [
    "....XX....",
    "....XX....",
    ".X..XX..X.",
    "XX..XX..XX",
    "XX..XX..XX",
    "XX..XX..XX",
    "XXXXXX..XX",
    ".XXXXX..XX",
    "....XXXXXX",
    "....XXXXX.",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX...."
  ],
  cactoDuplo: [
    "..XX........XX..",
    "..XX...XX...XX..",
    "X.XX.X.XX.X.XX.X",
    "XXXX.XXXX.XXXX.X",
    "XXXX.XXXX.XXXX.X",
    ".XXX..XXX..XXXX.",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX..",
    "..XX...XX...XX.."
  ],
  passaro1: [
    ".....XX.........",
    ".....XXX........",
    ".....XXXX.......",
    "...XXXXXXX......",
    ".XXXXXXXXXX.....",
    "XXXXXXXXXXXXX...",
    "..XXXXXXXXXXXXXX",
    "....XXXXXXXXXX..",
    "......XXXXX.....",
    "................",
    "................",
    "................"
  ],
  passaro2: [
    "................",
    "................",
    "...XXXX.........",
    ".XXXXXXXX.......",
    "XXXXXXXXXXXXX...",
    "..XXXXXXXXXXXXXX",
    "....XXXXXXXXXX..",
    ".....XXXXXXX....",
    ".....XXXXX......",
    ".....XXXX.......",
    ".....XXX........",
    ".....XX........."
  ],
  nuvem: [
    "......XXXXXX......",
    "....XXXXXXXXXX....",
    "..XXXXXXXXXXXXXX..",
    ".XXXXXXXXXXXXXXXX.",
    "XXXXXXXXXXXXXXXXXX"
  ]
};

function desenharSprite(matriz, x, y, escala, cor = "#222222") {
  ctx.fillStyle = cor;
  for (let linha = 0; linha < matriz.length; linha++) {
    for (let col = 0; col < matriz[linha].length; col++) {
      if (matriz[linha][col] === "X") {
        ctx.fillRect(
          Math.floor(x + col * escala),
          Math.floor(y + linha * escala),
          escala,
          escala
        );
      }
    }
  }
}

const CHAO_Y = 250;
const ESCALA_PIXEL = 3;

let estadoJogo = "INICIO";
let tempoGameOver = 0;
let pontuacao = 0;
let recorde = Number(localStorage.getItem("dinoColorRecorde")) || 0;
let velocidade = 6;
let frameContador = 0;

const dino = {
  x: 70,
  y: CHAO_Y - 16 * ESCALA_PIXEL,
  largura: 15 * ESCALA_PIXEL,
  altura: 16 * ESCALA_PIXEL,
  velY: 0,
  gravidade: 0.65,
  forcaPulo: -12.8,
  noChao: true
};

// Arrays percorridos com laços (Degrau Completo)
let obstaculos = [];
let nuvens = [
  { x: 200, y: 55, vel: 1.2 },
  { x: 520, y: 85, vel: 0.9 },
  { x: 740, y: 45, vel: 1.5 }
];
let pedrinhasChao = [];
for (let i = 0; i < 25; i++) {
  pedrinhasChao.push({
    x: Math.random() * canvas.width,
    y: CHAO_Y + 6 + Math.random() * 25,
    largura: Math.random() > 0.5 ? 6 : 3
  });
}

let proximoSpawn = 90;

function mudarCorCenario() {
  indiceCor = (indiceCor + 1) % PALETA_CENARIO.length;
  gameWrapper.style.backgroundColor = PALETA_CENARIO[indiceCor];
}

function pular() {
  if (estadoJogo === "INICIO") {
    iniciarJogo();
    return;
  }

  if (estadoJogo === "GAMEOVER") {
    if (Date.now() - tempoGameOver > 350) {
      iniciarJogo();
    }
    return;
  }

  if (dino.noChao) {
    dino.velY = dino.forcaPulo;
    dino.noChao = false;
    mudarCorCenario();
  }
}

function iniciarJogo() {
  estadoJogo = "JOGANDO";
  pontuacao = 0;
  velocidade = 6;
  obstaculos = [];
  dino.y = CHAO_Y - dino.altura;
  dino.velY = 0;
  dino.noChao = true;
  proximoSpawn = 70;
  mudarCorCenario();
}

function gerarObstaculo() {
  const sorteio = Math.random();

  if (pontuacao > 150 && sorteio < 0.32) {
    const alturaVoo = Math.random() > 0.5 ? CHAO_Y - 42 : CHAO_Y - 72;
    obstaculos.push({
      tipo: "passaro",
      x: canvas.width + 20,
      y: alturaVoo,
      largura: 16 * ESCALA_PIXEL,
      altura: 12 * ESCALA_PIXEL
    });
  } else if (sorteio < 0.68) {
    obstaculos.push({
      tipo: "cactoSimples",
      x: canvas.width + 20,
      y: CHAO_Y - 16 * ESCALA_PIXEL,
      largura: 10 * ESCALA_PIXEL,
      altura: 16 * ESCALA_PIXEL
    });
  } else {
    obstaculos.push({
      tipo: "cactoDuplo",
      x: canvas.width + 20,
      y: CHAO_Y - 14 * ESCALA_PIXEL,
      largura: 16 * ESCALA_PIXEL,
      altura: 14 * ESCALA_PIXEL
    });
  }
}

function colidiu(a, b) {
  const margem = 7;
  return (
    a.x + margem < b.x + b.largura - margem &&
    a.x + a.largura - margem > b.x + margem &&
    a.y + margem < b.y + b.altura - margem &&
    a.y + a.altura - margem > b.y + margem
  );
}

function atualizar(dt) {
  frameContador++;

  for (let i = 0; i < nuvens.length; i++) {
    nuvens[i].x -= nuvens[i].vel * dt;
    if (nuvens[i].x < -70) nuvens[i].x = canvas.width + 30;
  }

  if (estadoJogo !== "JOGANDO") return;

  dino.velY += dino.gravidade * dt;
  dino.y += dino.velY * dt;

  const chaoDino = CHAO_Y - dino.altura;
  if (dino.y >= chaoDino) {
    dino.y = chaoDino;
    dino.velY = 0;
    dino.noChao = true;
  }

  for (let i = 0; i < pedrinhasChao.length; i++) {
    pedrinhasChao[i].x -= velocidade * dt;
    if (pedrinhasChao[i].x < 0) pedrinhasChao[i].x = canvas.width + Math.random() * 20;
  }

  proximoSpawn -= dt;
  if (proximoSpawn <= 0) {
    gerarObstaculo();
    const minIntervalo = Math.max(48, 95 - velocidade * 3);
    const maxIntervalo = Math.max(85, 145 - velocidade * 3);
    proximoSpawn = minIntervalo + Math.random() * (maxIntervalo - minIntervalo);
  }

  for (let i = obstaculos.length - 1; i >= 0; i--) {
    const obs = obstaculos[i];
    const velAtual = obs.tipo === "passaro" ? velocidade * 1.15 : velocidade;
    obs.x -= velAtual * dt;

    if (colidiu(dino, obs)) {
      estadoJogo = "GAMEOVER";
      tempoGameOver = Date.now();
      if (Math.floor(pontuacao) > recorde) {
        recorde = Math.floor(pontuacao);
        localStorage.setItem("dinoColorRecorde", recorde);
      }
    }

    if (obs.x + obs.largura < -20) {
      obstaculos.splice(i, 1);
    }
  }

  pontuacao += 0.18 * dt;
  velocidade = Math.min(13, 6 + pontuacao * 0.004);
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < nuvens.length; i++) {
    desenharSprite(SPRITES.nuvem, nuvens[i].x, nuvens[i].y, 3, "rgba(255, 255, 255, 0.75)");
  }

  ctx.fillStyle = "#222222";
  ctx.fillRect(0, CHAO_Y, canvas.width, 3);
  for (let i = 0; i < pedrinhasChao.length; i++) {
    const p = pedrinhasChao[i];
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.largura, 3);
  }

  let spriteDino = SPRITES.dinoJump;
  if (dino.noChao) {
    spriteDino = Math.floor(frameContador / 7) % 2 === 0 ? SPRITES.dinoRun1 : SPRITES.dinoRun2;
  }
  desenharSprite(spriteDino, dino.x, dino.y, ESCALA_PIXEL, "#222222");

  for (let i = 0; i < obstaculos.length; i++) {
    const obs = obstaculos[i];
    if (obs.tipo === "passaro") {
      const spriteAsa = Math.floor(frameContador / 10) % 2 === 0 ? SPRITES.passaro1 : SPRITES.passaro2;
      desenharSprite(spriteAsa, obs.x, obs.y, ESCALA_PIXEL, "#222222");
    } else {
      desenharSprite(SPRITES[obs.tipo], obs.x, obs.y, ESCALA_PIXEL, "#1b4332");
    }
  }

  // Informações no topo do ecrã do jogo (Nome, Meta, Recorde e Pontos)
  ctx.fillStyle = "#222222";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.textAlign = "left";
  const metaAtingida = Math.floor(pontuacao) >= metaPontos ? " [META OK!]" : "";
  ctx.fillText(`${nomeJogador} | META:${metaPontos}${metaAtingida}`, 16, 28);

  ctx.textAlign = "right";
  const textoRecorde = `HI ${String(recorde).padStart(5, "0")}`;
  const textoPontos = String(Math.floor(pontuacao)).padStart(5, "0");
  ctx.fillText(`${textoRecorde} ${textoPontos}`, canvas.width - 16, 28);

  ctx.textAlign = "center";
  if (estadoJogo === "INICIO") {
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillText("CLICA AQUI PARA COMECAR", canvas.width / 2, 135);
  } else if (estadoJogo === "GAMEOVER") {
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.fillText("GAME OVER", canvas.width / 2, 125);
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText("CLICA PARA JOGAR NOVAMENTE", canvas.width / 2, 155);
  }
}

let ultimoTempo = performance.now();
function loop(agora) {
  const deltaSegundos = Math.min((agora - ultimoTempo) / 1000, 0.05);
  ultimoTempo = agora;
  const dt = deltaSegundos * 60;

  atualizar(dt);
  desenhar();
  requestAnimationFrame(loop);
}

// Clique apenas dentro do canvas para não interferir com os campos de texto
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  pular();
});

window.addEventListener("keydown", (e) => {
  // Não salta se o utilizador estiver a escrever nos campos de texto
  if (document.activeElement.tagName === "INPUT") return;

  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    pular();
  }
});

requestAnimationFrame(loop);