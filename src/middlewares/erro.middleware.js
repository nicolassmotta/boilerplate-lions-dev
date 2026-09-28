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

  // Código 11000 é erro de duplicidade no MongoDB: um campo com unique: true
  // recebeu um valor que já existe em outro documento.
  if (error.code === 11000) {
    // keyValue diz qual campo repetiu. Ex.: { email: "ana@email.com" }
    // Object.keys(...) pega os nomes dos campos; [0] pega o primeiro.
    const campo = Object.keys(error.keyValue || {})[0];

    if (campo === "email") {
      return res.status(409).json({ message: "Email já cadastrado." });
    }

    // Outros campos únicos que você criar (cpf, codigo, placa...) recebem
    // uma mensagem com o nome do campo, em vez de falar em email.
    return res.status(409).json({ message: `Já existe um registro com este valor de '${campo}'.` });
  }

  // Se o erro veio do nosso criarErro, ele terá status.
  // Se não tiver, tratamos como erro interno do servidor.
  let status = error.status;

  if (!status) {
    status = 500;
  }

  // Mensagem do erro que será enviada para o cliente.
  const message = error.message;

  // Erros 500 são problemas do servidor, então registramos no terminal.
  if (status >= 500) {
    console.error(error);
  }

  // Enviamos a resposta final de erro para o cliente.
  return res.status(status).json({ message });
}

export default erroMiddleware;
