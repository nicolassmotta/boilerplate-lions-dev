// ============================================================================
// autenticar: o middleware que protege as rotas com token JWT
// ============================================================================
//
// O objetivo deste middleware: rodar ANTES das rotas protegidas e só deixar
// passar quem enviou um token JWT válido.
//
// Repare que ele JÁ tem a assinatura de middleware (req, res, next). Por isso,
// na rota usamos só o NOME da função, SEM os parênteses:
//
//     router.use(autenticar);          // certo: passamos a função
//     router.use(autenticar());        // errado: aqui chamaríamos cedo demais
//
// (Passar a função sem parênteses é o que permite o Express chamá-la, sozinho,
//  a cada requisição.)

// jsonwebtoken permite verificar se o token JWT é válido.
import jwt from "jsonwebtoken";

// Helper para criar erros padronizados (mensagem + status).
import criarErro from "../utils/criarErro.js";

// O Express vai executar esta função em cada requisição da rota protegida.
function autenticar(req, res, next) {
  // PASSO 1: pegar o token.
  // Por convenção, o token chega no cabeçalho Authorization.
  // Exemplo: Authorization: Bearer eyJhbGciOi...
  const authHeader = req.headers.authorization;

  // PASSO 2: o cabeçalho existe?
  // Se nem veio Authorization, a pessoa não está autenticada.
  //
  // Sobre o "return next(...)": diferente de uma rota, um middleware não
  // responde sozinho. Ele AVISA o Express o que fazer chamando next():
  //   - next(erro)  -> pula para o tratador de erros (acesso negado)
  //   - next()      -> segue para o próximo middleware/controller (acesso ok)
  // O "return" aqui só serve para PARAR a função e não executar o resto.
  if (!authHeader) {
    return next(criarErro("Token não informado.", 401));
  }

  // PASSO 3: conferir o formato.
  // O cabeçalho tem duas partes separadas por espaço: "Bearer" e o token.
  // Ao desestruturar, tipo = "Bearer" e token = "eyJ..."
  const [tipo, token] = authHeader.split(" ");

  // Se não veio no formato "Bearer TOKEN", barramos o acesso.
  if (tipo !== "Bearer" || !token) {
    return next(criarErro("Formato do token inválido. Use: Bearer TOKEN.", 401));
  }

  // PASSO 4: validar o token de verdade.
  // Usamos try/catch porque jwt.verify LANÇA um erro quando o token é
  // inválido ou está expirado. O catch é quem captura essa falha.
  try {
    // jwt.verify confere a assinatura usando o mesmo JWT_SECRET que gerou o token.
    // Se estiver tudo certo, ela devolve os dados que guardamos dentro do token.
    const dadosDoToken = jwt.verify(token, process.env.JWT_SECRET);

    // PASSO 5: guardar quem está logado dentro da requisição.
    // Assim os próximos controllers conseguem saber quem fez a requisição
    // lendo req.usuario, sem precisar decodificar o token de novo.
    req.usuario = {
      id: dadosDoToken.id,
      email: dadosDoToken.email,
    };

    // Token válido: liberamos a requisição para seguir até a rota/controller.
    return next();
  } catch (error) {
    // Caímos aqui quando jwt.verify falhou (token inválido ou expirado).
    // Bloqueamos o acesso encaminhando um erro 401 para o tratador de erros.
    return next(criarErro("Token inválido ou expirado.", 401));
  }
}

export default autenticar;
