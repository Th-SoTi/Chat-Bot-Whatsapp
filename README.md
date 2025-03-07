# Chatbot para WhatsApp com Node.js e Venom

Este é o meu primeiro projeto no GitHub: um chatbot para WhatsApp desenvolvido utilizando Node.js e a biblioteca Venom.

## Sobre o Projeto

Este chatbot foi projetado para automatizar o atendimento de um motel, fornecendo informações sobre as acomodações, formas de pagamento, reservas e outros serviços. O código permite a interação com os clientes por meio de um menu interativo, além de encaminhar o usuário para um atendente humano caso necessário.

## Funcionalidades

- **Atendimento automatizado**: O bot responde mensagens automaticamente, guiando o usuário por opções de atendimento.
- **Gerenciamento de estados**: O estado da conversa é armazenado para entender a interação do usuário.
- **Sistema de timeout**: O bot encerra automaticamente sessões inativas para otimizar recursos.
- **Encaminhamento para atendimento humano**: Caso solicitado, o usuário pode falar diretamente com um atendente.
- **Envio de status**: O bot pode enviar mensagens periódicas para indicar que está ativo.

## Tecnologias Utilizadas

- **Node.js**
- **Venom-bot** (para interação com o WhatsApp)
- **JavaScript**

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o bot:
   ```bash
   node index.js
   ```

## Trecho do Código

Aqui está um exemplo de código que gerencia os estados do bot e exibe o menu inicial:

```javascript
function showMenu(sender, client) {
  const menuMessage =
`
  👋 Olá, como vai?

  Eu sou o *assistente virtual* da
  *Motel (escolha o nome).*

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
```

## Contribuição

Se você deseja contribuir com melhorias ou correções para o projeto, fique à vontade para enviar um pull request ou abrir uma issue.

## Autor

[Thiago Soti](https://github.com/Th-SoTi) 

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

