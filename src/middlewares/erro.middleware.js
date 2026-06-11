// Middleware central de erro.
// Ele fica no final do app.js e recebe todos os erros enviados por next(error).
function erroMiddleware(error, req, res, next) {
  // Erros de validação do Mongoose, como campo obrigatório ou email inválido.
  if (error.name === "ValidationError") {
    // Juntamos todas as mensagens de validação em uma resposta só.
    // Object.values(error.errors) vira um array com cada erro do Mongoose.
    // O .map percorre esse array, um erro por vez, e pega apenas erro.message.
    // No final, mensagens será um novo array contendo só os textos dos erros.
    const mensagens = Object.values(error.errors).map((erro) => erro.message);

    // join(" ") junta o array de mensagens em uma única string, separando por espaço.
    return res.status(400).json({ message: mensagens.join(" ") });
  }

  // CastError acontece, por exemplo, quando enviamos um ID do MongoDB em formato inválido.
  if (error.name === "CastError") {
    return res.status(400).json({ message: "ID inválido." });
  }

  // Código 11000 é erro de duplicidade no MongoDB.
  // Aqui usamos para email já cadastrado.
  if (error.code === 11000) {
    return res.status(409).json({ message: "Email já cadastrado." });
  }

  // Se o erro veio do nosso criarErro, ele terá status.
  // Se não tiver, assumimos erro interno do servidor.
  const status = error.status || 500;

  // Se não houver mensagem específica, usamos uma mensagem padrão.
  const message = error.message || "Erro interno do servidor.";

  // Erros 500 são problemas do servidor, então registramos no terminal.
  if (status >= 500) {
    console.error(error);
  }

  // Enviamos a resposta final de erro para o cliente.
  return res.status(status).json({ message });
}

export default erroMiddleware;
