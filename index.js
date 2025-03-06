const venom = require('venom-bot');
const userStage = {};
const userTimeouts = {}; // Para rastrear os timeouts por usuário

venom
  .create({
    session: 'my-session',
    folderNameToken: 'tokens',
    mkdirFolderToken: '',
    headless: 'new', // Atualizado para evitar aviso de deprecated
    useChrome: true, // Força o uso do Chrome instalado no sistema
    browserArgs: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'], // Adicionados argumentos para estabilidade
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Certifique-se de ajustar o caminho do Chrome
  })
  .then((client) => start(client))
  .catch((err) => console.log('Erro ao iniciar Venom:', err));


function start(client) {
    sendBotStatus(client); // Inicia o envio de status automático
    client.onMessage((message) => {
      const userMessage = message.body.trim().toLowerCase();
      const sender = message.from;
  
      if (message.isGroupMsg) return;
  
      // Reinicia o timeout do usuário (exceto durante o atendimento humano)
      if (userStage[sender] !== 'atendimento_humano') {
        resetUserTimeout(sender, client);
      }
  
      if (!userStage[sender]) {
        showMenu(sender, client);
      } else if (userStage[sender] === 'awaiting_choice') {
        handleUserChoice(userMessage, sender, client);
      } else if (userStage[sender] === 'awaiting_suite_choice') {
        handleSuiteChoice(userMessage, sender, client);
      } else if (userStage[sender] === 'awaiting_back_to_suites_or_main') {
        handleBackToSuitesOrMain(userMessage, sender, client);
      } else if (userStage[sender].endsWith('_follow_up')) {
        handleFollowUp(userMessage, sender, client);
      } else if (userStage[sender] === 'atendimento_humano') {
        handleAtendimentoHumano(userMessage, sender, client);
      }
    });
}

function sendBotStatus(client) {
  setInterval(() => {
      client.sendText('556195580895@c.us', 'Bot ainda está ativo.')
          .catch(err => console.error('Erro ao enviar mensagem de status:', err));
  }, 6000000); // A cada 30 minutos
}
  

// Função para mostrar o menu inicial
function showMenu(sender, client) {
  const menuMessage = 
`
  👋 Olá, como vai?

  Eu sou o *assistente virtual* da
  *Ame Mais Motel - Valparaíso.*

  Posso te ajudar?
  -----------------------------------
  1️⃣ 🔥 Suítes
  2️⃣ 🌙 Pernoites
  3️⃣ 📅 Reservas
  4️⃣ 🕒 Funcionamento
  5️⃣ 🚙 Posso entrar de Uber?
  6️⃣ 💳 Formas de Pagamento
  7️⃣ 📍 Unidades/Localização
  8️⃣ 🎁 Promoções
  9️⃣ 🟢 Falar com Atendente
  0️⃣ 🔞 Menores de 18 Anos
  `;
  console.log(`📨 Enviando menu inicial para ${sender}`);
    
    client.sendText(sender, menuMessage)
        .then(() => {
            userStage[sender] = 'awaiting_choice';
        })
        .catch((err) => {
            console.error(`❌ Erro ao enviar o menu inicial para ${sender}:`, err);
        });
}

// Função para tratar a escolha do usuário no menu
function handleUserChoice(userMessage, sender, client) {
  if (userMessage === '1') {
    showSuitesMenu(sender, client); // Função correta para exibir o menu de suítes
  } else if (userMessage === '2') {
    handlePernoitesOption(sender, client);
  } else if (userMessage === '3') {
    handleReservasOption(sender, client);
  } else if (userMessage === '4') {
    handleFuncionamentoOption(sender, client);
  } else if (userMessage === '5') {
    handleUberOption(sender, client);
  } else if (userMessage === '6') {
    handlePagamentoOption(sender, client);
  } else if (userMessage === '7') {
    handleLocalizaOption(sender, client);
  } else if (userMessage === '8') {
    handlePromocoesOption(sender, client);
  } else if (userMessage === '9') {
    handleAtendenteOption(sender, client);
  } else if (userMessage === '0') {
    handleMenoresOption(sender, client);
  } else {
    sendMessage("❌ Opção inválida. Por favor, digite uma das opções acima.", sender, client);
  }
}

// Função para tratar follow-ups genéricos
function handleFollowUp(userMessage, sender, client) {
  if (userMessage === 'sim') {
    sendMessage(
`📞 *Você foi encaminhado para um atendente.*

🔄 *Aguarde, você será atendido em instantes.*

🔚 *Digite 'Encerrar' para encerrar o atendimento...*`, sender, client);
    userStage[sender] = 'atendimento_humano';
  } else if (userMessage === 'menu') {
    showMenu(sender, client);
  } else {
    sendMessage(
`*❌ Resposta inválida.*

Digite *"Sim"* para ser atendido

Digite *"Menu"* para voltar ao menu principal.`, sender, client);
  }
}

// Função para gerenciar o atendimento humano
function handleAtendimentoHumano(userMessage, sender, client) {
  if (userMessage === 'encerrar') {
    sendMessage("✅ Atendimento encerrado. Caso precise de mais ajuda, digite qualquer mensagem para voltar ao menu principal.", sender, client);
    clearUserSession(sender);
  } else {
    // Durante o atendimento humano, nenhuma outra mensagem automática é enviada.
    console.log(`Mensagem do usuário (${sender}): ${userMessage}`);
  }
}

// Função para enviar a mensagem de mais informações com delay
function sendMoreInfoPromptWithDelay(sender, client) {
  setTimeout(() => {
    const promptMessage = `
❗​ Deseja mais informações sobre?

📞​ Digite "Sim" para falar com um atendente.

💬​ Digite "Menu" para voltar ao menu principal.`;

    sendMessage(promptMessage, sender, client);
    userStage[sender] = `${userStage[sender]}_follow_up`;
  }, 3000); // Delay de 2 segundos
}

// Função genérica para enviar mensagens
function sendMessage(message, sender, client) {
  client.sendText(sender, message).catch((error) => {
    console.error(`Erro ao enviar mensagem para ${sender}:`, error);
  });
}

// Função para resetar o timeout do usuário
function resetUserTimeout(sender, client) {
  if (userTimeouts[sender]) {
    clearTimeout(userTimeouts[sender]);
  }

  userTimeouts[sender] = setTimeout(() => {
    if (userStage[sender] !== 'atendimento_humano') {
      sendMessage(`
*Se até este momento suas dúvidas não foram sanadas por favor entre em contato ligando no número  61 99973-1278.*

*⏳Este atendimento será encerrado...*`, sender, client);
      clearUserSession(sender);
    }
  }, 180000); // 20 segundos para teste
}

// Função para limpar a sessão do usuário
function clearUserSession(sender) {
  delete userStage[sender];
  if (userTimeouts[sender]) {
    clearTimeout(userTimeouts[sender]);
    delete userTimeouts[sender];
  }
}

// Função para mostrar os detalhes de cada suíte
// Função para mostrar os detalhes de cada suíte
function showSuiteDetails(sender, client, suiteIndex) {
  const suites = [
    {
      name: "Suíte DESEJO",
      details: `*👄 Suíte DESEJO*\n\n*💠 TV, FRIGOBAR, SOM, AR CONDICIONADO E ILUMINAÇÃO ESPECIAL*\n\n*💸VALORES:*\n\n1h: R$89,90 \n2h: R$109,90 \n3h: R$129,90 \n4h: R$139,90 \n\n⚠️ Após 4 horas, será cobrado acréscimo de R$8,73 a cada 15 minutos.`,
      imagePath: './images/desejo.png',
    },
    {
      name: "Suíte FANTASIA",
      details: "*🎊 Suíte FANTASIA*\n\n*💠 BANHEIRA DE HIDROMASSAGEM, SAUNA, TV, SOM, FRIGOBAR, AR CONDICIONADO E ILUMINAÇÃO ESPECIAL*\n\n*💸VALORES:*\n\n2h: R$199,90 \n3h: R$229,90 \n4h: R$239,90\n\n⚠️ Após 4 horas, será cobrado acréscimo de R$15,00 a cada 15 minutos.",
      imagePath: './images/fantasia.jpg',
    },
    {
      name: "Suíte PAIXÃO",
      details: "*💖 Suíte PAIXÃO*\n\n*💠 TV, FRIGOBAR, SOM, AR CONDICIONADO E ILUMINAÇÃO ESPECIAL*\n\n*💸VALORES:*\n\n1h: R$96,90 \n2h: R$119,90 \n3h: R$139,90 \n4h: R$149,90\n\n⚠️ Após 4 horas, será cobrado acréscimo de R$9,36 a cada 15 minutos.",
      imagePath: './images/paixao.jpg',
    },
    {
      name: "Suíte SEDUÇÃO",
      details: "*🔥 Suíte SEDUÇÃO*\n\n*💠 BANHEIRA DE HIDROMASSAGEM, TV, SOM, FRIGOBAR, AR CONDICIONADO E ILUMINAÇÃO ESPECIAL*\n\n*💸VALORES:*\n\n2h: R$174,90 \n3h: R$189,90 \n4h: R$229,90\n\n⚠️ Após 4 horas, será cobrado acréscimo de R$14,37 a cada 15 minutos.",
      imagePath: './images/seducao.jpg',
    },
    {
      name: "Suíte TEMÁTICA",
      details: "*🎭 Suíte TEMÁTICA*\n\n*TEMAS: RETRÔ, HOLLYWOOD, COWBOY, OFICCE E DISCOVERY*\n\n*💠 TV, FRIGOBAR, SOM, AR CONDICIONADO E ILUMINAÇÃO ESPECIAL*\n\n*💸VALORES:*\n\n1h: R$109,90 \n2h: R$139,90 \n3h: R$149,90 \n4h: R$159,90\n\n⚠️ Após 4 horas, será cobrado acréscimo de R$9,99 a cada 15 minutos.",
      imagePath: './images/tematica.jpeg',
    },
  ];

  const suite = suites[suiteIndex];

  client
    .sendImage(sender, suite.imagePath, suite.name, suite.details)
    .then(() => {
      sendMessage(
`🔙 Digite *"voltar"* para retornar ao menu das suítes.
👨‍💻 Digite *"Sim"* para falar com um atendente.`, sender, client);
      userStage[sender] = 'awaiting_back_to_suites_or_main'; // Novo estado para capturar o "voltar"
    })
    .catch((err) => {
      console.error(`Erro ao enviar a imagem da suíte para ${sender}:`, err);
    });
}

// Função para tratar a escolha do usuário ao voltar
function handleBackToSuitesOrMain(userMessage, sender, client) {
  if (userMessage.toLowerCase() === 'voltar') {
    showSuitesMenu(sender, client); // Voltar ao menu das suítes
  } else if (userMessage.toLowerCase() === 'sim') {
    handleAtendenteOption(sender, client); // Encaminhar para um atendente
  } else {
    sendMessage("❌ Opção inválida. Digite 'voltar' para retornar ao menu das suítes ou 'Sim' para falar com um atendente.", sender, client);
  }
}

// Função para mostrar o menu das suítes
function showSuitesMenu(sender, client) {
  const suitesMenu = 
`*Escolha uma das suítes abaixo para ver mais detalhes:*

1️⃣ *Suíte DESEJO* 👄
2️⃣ *Suíte FANTASIA* 🎊
3️⃣ *Suíte PAIXÃO* 💖
4️⃣ *Suíte SEDUÇÃO* 🔥
5️⃣ *Suíte TEMÁTICA* 🎭

Digite *"voltar"* para voltar ao menu principal
  `;

  sendMessage(suitesMenu, sender, client);
  userStage[sender] = 'awaiting_suite_choice'; // Estado aguardando a escolha da suíte
}
// Função para tratar a escolha do usuário no menu de suítes
function handleSuiteChoice(userMessage, sender, client) {
  if (userMessage === '1') {
    showSuiteDetails(sender, client, 0); // Suíte DESEJO
  } else if (userMessage === '2') {
    showSuiteDetails(sender, client, 1); // Suíte FANTASIA
  } else if (userMessage === '3') {
    showSuiteDetails(sender, client, 2); // Suíte PAIXÃO
  } else if (userMessage === '4') {
    showSuiteDetails(sender, client, 3); // Suíte SEDUÇÃO
  } else if (userMessage === '5') {
    showSuiteDetails(sender, client, 4); // Suíte TEMÁTICA
  } else if (userMessage.toLowerCase() === 'voltar') {
    showMenu(sender, client); // Retorna ao menu das suítes
  } else {
    sendMessage("❌ Opção inválida. Por favor, escolha uma suíte válida ou digite 'voltar'.", sender, client);
  }
}


// Função para gerenciar a opção de falar com atendente
function handleAtendenteOption(sender, client) {
  const waitingMessage = 
`📞 *Você foi encaminhado para um atendente.*

🔄 *Aguarde, você será atendido em instantes, ou ligue para falar diretamente com a atendente no número 61999731278*

🔚 *Digite 'Encerrar' para encerrar o atendimento...*`;

  sendMessage(waitingMessage, sender, client);
  userStage[sender] = 'atendimento_humano';
}

function handlePernoitesOption(sender, client) {
  const pernoitesMessage = 
`*🌙 Pernoites*

📥 Entrada entre 22:00h e 05:00h, nas suítes Sedução (R$229,90) ou Fantasia (R$239,90).

🕒 Duração de 10 horas.

☕ Café da manhã não incluso.`;

  sendMessage(pernoitesMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'pernoites_follow_up';
}

function handleReservasOption(sender, client) {
  const reservasMessage = 
`*📅 Reservas*

⚠️ Não fazemos reservas!`;

  sendMessage(reservasMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'reservas_follow_up';
}

function handleFuncionamentoOption(sender, client) {
  const funcionamentoMessage =
`🕒 Funcionamento

Funcionamento 24 hrs.`;
  sendMessage(funcionamentoMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'funcionamento_follow_up';
}

function handleUberOption(sender, client) {
  const uberMessage =
`*🚙 Posso entrar de Uber?*

O DESEMBARQUE SERÁ FEITO NO CORREDOR, NÃO SENDO PERMITIDO ESTACIONAR NA GARAGEM!`;
  sendMessage(uberMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'uber_follow_up';
}

function handlePagamentoOption(sender, client) {
  const pagamentoMessage =
`*💰 Formas de Pagamento*

💳 Cartão de Crédito/Débito
💸 Dinheiro
📲 Pix
❌ *NÃO PARCELAMOS*`;
  sendMessage(pagamentoMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'pagamento_follow_up';
}

function handleLocalizaOption(sender, client) {
  const localMessage =
`*📍 Aqui está o endereço do nosso motel:*

https://maps.app.goo.gl/ptp4MZrt53vZtUFQA

*Endereço:* Parque Esplanada II, Valparaíso de Goiás - GO, 72878-039`;
  sendMessage(localMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'localiza_follow_up';
}

function handlePromocoesOption(sender, client) {
  const promocoesMessage =
`*🎁 Promoção Pernoite*

Pague 04 horas e ganhe 06 horas, válida somente nas suítes Sedução($229,90) ou fantasia($239,90) para entradas após 22:00h e antes de 05:00h da manhã. Duração total de 10 horas de hospedagem.`;
  sendMessage(promocoesMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'promocoes_follow_up';
}

function handleMenoresOption(sender, client) {
  const menoresMessage =
`*🔞 Menores de 18 Anos*

Entrada proibida para menores de 18 anos desacompanhados dos pais. Menores acompanhados dos pais têm acesso permitido somente com a apresentação de documento com foto que comprove a filiação.`;
  sendMessage(menoresMessage, sender, client);
  sendMoreInfoPromptWithDelay(sender, client);
  userStage[sender] = 'menores_follow_up';
}

function handleAtendenteOption(sender, client) {
  const waitingMessage = 
`📞 *Você foi encaminhado para um atendente.*

🔄 *Aguarde, você será atendido em instantes, ou ligue para falar diretamente com a atendente no número 61999731278*

🔚 *Digite "Encerrar" para encerrar o atendimento...*`;

  sendMessage(waitingMessage, sender, client);
  userStage[sender] = 'atendimento_humano';
}
