const cobrinha = document.querySelector('#div-cobrinha');
const campo = document.querySelector('#table-campo');   
const divCampo = document.querySelector('#div-campo');   
const divGameOver = document.querySelector('#div-game-over');   
const btnRecomecar = document.querySelector('#btn-recomecar');   
const spanQtdBonus = document.querySelector('#qtd-bonus');   
const txtNome = document.querySelector('#txt-nome');   
const listaRecordes = document.querySelector('#lista-recordes');   
const cordenadaCobrinha = { 
        cabeca: { linha: 15, coluna: 26 },
        corpo: [{linha: 16, coluna: 26}, {linha: 17, coluna: 26}]
    } // valores de inicio padrao, pra começar no centro da tela
let timer = null;
let teclaPressionada = null;
let intervalo = 200;
let jogoInterrompido = false
let qtdBonusColetados = 0;
let txtNomeTemFoco = false;

contruirCampo();
colorirCobrinha();
inicializarBonus();
carregarRecordes();

spanQtdBonus.innerHTML = qtdBonusColetados;
divGameOver.classList.add('desabilitado');

txtNome.addEventListener('focus', () => {txtNomeTemFoco= true}); //para caso tiver sendo escrito nome, não dispare o timer de inicio de jogo
txtNome.addEventListener('blur', () => {txtNomeTemFoco= false});
btnRecomecar.addEventListener('click', recomecarJogo);
document.addEventListener('keydown', moverCobrinha);

function moverCobrinha(event){
  if(jogoInterrompido){
    return;
  }

  if(pressionarTecla(event.key) && !timer){
    timer = setInterval(posicionarCobrinha, intervalo);
  }
}

function pressionarTecla(tecla){
  let valido = true;  
  if(txtNomeTemFoco){
    return false;
  }

  switch (tecla) {
    case 'w':
      teclaPressionada = 'w';
      break;
    case 's':
      teclaPressionada = 's'
      break;
    case 'a':
      teclaPressionada = 'a'
      break;
    case 'd':
      teclaPressionada = 'd'
      break;
    default:
      valido = false;
  }

  return valido;
}

function contruirCampo(){
  for( let i = 0; i < 30; i++ ){
    const tr = document.createElement('tr');
    tr.id = i;

    for( let j = 0; j < 55; j++ ){
      const td = document.createElement('td');
      td.id = j;
      tr.appendChild(td);
    }

    campo.appendChild(tr);
  }
}

function posicionarCobrinha(){
  let proximaPosicao = setarProximaPosicao(teclaPressionada);

  if(!proximaPosicao|| (proximaPosicao.linha < 0 || proximaPosicao.linha > 29) ||
    (proximaPosicao.coluna < 0 || proximaPosicao.coluna > 54) || verificarBarrou(proximaPosicao) ){
    apresentarGameOver();
    return;
  }

  getPosicao(cordenadaCobrinha.cabeca.linha, cordenadaCobrinha.cabeca.coluna).classList.remove('quadrado-vermelho');

  if( verificarBonus(proximaPosicao.linha, proximaPosicao.coluna) ){
    cordenadaCobrinha.corpo.push({linha:0, coluna:0});
  }
  else{
    let ultimaCordenada = cordenadaCobrinha.corpo.at(-1);
    getPosicao(ultimaCordenada.linha, ultimaCordenada.coluna).classList.remove('quadrado-preto');
  }

  let linhaProxima = 0;
  let colunaProxima = 0;
  let linhaAtual = 0;
  let colunaAtual = 0;

  cordenadaCobrinha.corpo.forEach(e => {
    linhaAtual = e.linha;
    colunaAtual = e.coluna;

    e.linha = linhaProxima;
    e.coluna = colunaProxima;

    linhaProxima = linhaAtual;
    colunaProxima = colunaAtual;
  });

  cordenadaCobrinha.corpo.at(0).linha = cordenadaCobrinha.cabeca.linha;
  cordenadaCobrinha.corpo.at(0).coluna = cordenadaCobrinha.cabeca.coluna;

  cordenadaCobrinha.cabeca.linha = proximaPosicao.linha;
  cordenadaCobrinha.cabeca.coluna = proximaPosicao.coluna;
  
  colorirCobrinha();
}

function apresentarGameOver(){
  clearInterval(timer);
  timer = null;
  jogoInterrompido = true;
  divCampo.classList.add('campo-gameover');
  divGameOver.classList.remove('desabilitado');

  registrarRecorde()
}

function registrarRecorde(){
  if(qtdBonusColetados == 0 || !txtNome.value){
    return;
  }

  let recordes = localStorage.getItem('recordes-jogo-cobrinha-joas');

  if(!recordes){
    console.log('sssssssss');
    recordes = localStorage.setItem('recordes-jogo-cobrinha-joas', JSON.stringify([{nome: txtNome.value, qtd: qtdBonusColetados}]));
  }
  else{
    // cordenadaCobrinha.corpo.length > 10
    let recordesObj = JSON.parse(recordes);
    let lista = recordesObj.concat([{nome: txtNome.value, qtd: qtdBonusColetados}]);
    // console.log(teste);

    lista.sort((a, b) => b.qtd - a.qtd);
    if(lista.length > 10){
      lista.pop(); //remove o decimo primeiro pra sempre ficar 10
    }
    localStorage.setItem('recordes-jogo-cobrinha-joas', JSON.stringify(lista));
  }

  carregarRecordes(); 
}

function carregarRecordes(){
  let recordes = localStorage.getItem('recordes-jogo-cobrinha-joas');

  if(!recordes){
    return;
  }

  let lista = JSON.parse(recordes);

  for (let i = 0; i < listaRecordes.children.length; i++) {  
    listaRecordes.children[i].innerHTML = "";
  }

  lista.forEach((valor, index)=> {
    listaRecordes.children[index].innerHTML = valor.nome + ": " + valor.qtd;
  });
}

function verificarBarrou(proximaPosicao){
  let barrou = false;

  cordenadaCobrinha.corpo.forEach(e => {
    if(e.linha === proximaPosicao.linha && e.coluna === proximaPosicao.coluna){
      barrou = true;
    }
  });

  return barrou;
}

function colorirCobrinha(){
  getPosicao(cordenadaCobrinha.cabeca.linha, cordenadaCobrinha.cabeca.coluna).classList.add('quadrado-vermelho');

  cordenadaCobrinha.corpo.forEach(e => {
    getPosicao(e.linha, e.coluna).classList.add('quadrado-preto');
  })
}

function setarProximaPosicao(tecla) {
  let proximaPosicao = null;
  switch (tecla) {
    case 'w':
      proximaPosicao = { 
        linha: cordenadaCobrinha.cabeca.linha - 1, 
        coluna: cordenadaCobrinha.cabeca.coluna 
      };
      break;
    case 's':
      proximaPosicao = {
        linha: cordenadaCobrinha.cabeca.linha + 1, 
        coluna: cordenadaCobrinha.cabeca.coluna 
      };
      break;
    case 'a':
      proximaPosicao = {
        linha: cordenadaCobrinha.cabeca.linha, 
        coluna: cordenadaCobrinha.cabeca.coluna - 1
      };
      break;
    case 'd':
        proximaPosicao = {
        linha: cordenadaCobrinha.cabeca.linha, 
        coluna: cordenadaCobrinha.cabeca.coluna + 1
      };
      break;
  }

  if(proximaPosicao.linha === cordenadaCobrinha.corpo[0].linha && proximaPosicao.coluna === cordenadaCobrinha.corpo[0].coluna){
    let linhaAnterior = cordenadaCobrinha.corpo[0].linha;
    let colunaAnterior = cordenadaCobrinha.corpo[0].coluna;

    let resultadoLinha = cordenadaCobrinha.cabeca.linha - linhaAnterior;
    let resultadoColuna = cordenadaCobrinha.cabeca.coluna - colunaAnterior;

    // verifica se é na vertical
    if(resultadoLinha != 0){
      // descendo
      if(resultadoLinha > 0){
        teclaPressionada = 's';
      }
      // subindo
      else{
        teclaPressionada = 'w';
      }
    }
    // verifica se é na horizontal
    else if(resultadoColuna != 0){
      // direita
      if(resultadoColuna > 0){
        teclaPressionada = 'd';
      }
      // esquerda
      else{
        teclaPressionada = 'a';
      }
    }

    proximaPosicao = setarProximaPosicao(teclaPressionada);
  }

  return proximaPosicao;
}

function inicializarBonus(){
  let coluna;
  let linha;
  for(let i = 0; i < 20; i++){
    coluna = Math.floor(Math.random() * 54);
    linha = Math.floor(Math.random() * 29);
    
    if(!gerarBonusAleatorio()){
      i--;
    }
  }
}

function gerarBonusAleatorio(){
  let coluna = Math.floor(Math.random() * 54);
  let linha = Math.floor(Math.random() * 29);
  let gerarPosicao = true;

  if( coluna === cordenadaCobrinha.cabeca.coluna && linha === cordenadaCobrinha.cabeca.linha ){
    return false;
  }
  else{
    cordenadaCobrinha.corpo.forEach(e => {
      if(e.linha === linha && e.coluna === coluna){
        return false;
      }
    });
  }

  if(gerarPosicao){
    getPosicao(linha, coluna).classList.add('quadrado-verde');
  }

  return gerarPosicao;
}

function getPosicao(linha, coluna){
  try {
    return campo.children[linha].children[coluna];
  } catch (erro) {
    console.log('posição não existe:\n'+erro);
    return null;
  }
}

function verificarBonus(linha, coluna){
  if(getPosicao(linha, coluna).classList.contains('quadrado-verde')){
    getPosicao(linha, coluna).classList.remove('quadrado-verde')

    if(intervalo > 50){
      intervalo -= 10;
      clearInterval(timer);
      timer = setInterval(posicionarCobrinha, intervalo);
    }

    while (!gerarBonusAleatorio()){
      console.log('gerando bonus aleatorio');
    } 

    spanQtdBonus.innerHTML = ++qtdBonusColetados;

    return true;
  }

  return false;
}

function recomecarJogo(){
  // remove os estilos de cada quadrado
  for (let i = 0; i < campo.children.length; i++) {
    for (let j = 0; j < campo.children[i].children.length; j++) {
      campo.children[i].children[j].classList.remove('quadrado-preto');
      campo.children[i].children[j].classList.remove('quadrado-vermelho');
      campo.children[i].children[j].classList.remove('quadrado-verde');
    }
  }

  intervalo = 200;
  qtdBonusColetados = 0;
  jogoInterrompido = false;
  spanQtdBonus.innerHTML = qtdBonusColetados;
  divCampo.classList.remove('campo-gameover');
  divGameOver.classList.add('desabilitado');

  // reseta os valores de inicio padrao, pra começar no centro da tela
  cordenadaCobrinha.cabeca.linha = 15;
  cordenadaCobrinha.cabeca.coluna = 26;

  cordenadaCobrinha.corpo = [{linha: 16, coluna: 26}, {linha: 17, coluna: 26}];

  colorirCobrinha();
  inicializarBonus();
}