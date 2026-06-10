// Router permite criar um conjunto separado de rotas de usuário.
import { Router } from "express";

// Controller com as ações relacionadas aos usuários.
import UsuarioController from "../controllers/usuario.controller.js";

// Middleware que valida o token JWT.
import autenticar from "../middlewares/autenticacao.middleware.js";

// Criamos o roteador de usuários.
const router = Router();

// Existem duas formas de aplicar o middleware "autenticar":
//
// 1) De forma GLOBAL, com router.use(autenticar).
//    Todas as rotas declaradas ABAIXO desta linha passam pelo middleware,
//    evitando repetir "autenticar" em cada uma. Ideal quando todas as
//    rotas do arquivo exigem autenticação (como é o caso aqui).
//
// 2) De forma INDIVIDUAL, passando o middleware como argumento na rota:
//       router.get("/perfil", autenticar, UsuarioController.perfil);
//    Aqui o middleware roda apenas naquela rota específica. Ideal quando
//    só algumas rotas do arquivo precisam de autenticação.
//
// Abaixo usamos a forma global, pois todas as rotas exigem token JWT.
router.use(autenticar);

// GET /api/usuarios/perfil
// Retorna os dados do usuário logado.
router.get("/perfil", UsuarioController.perfil);

// PATCH /api/usuarios/perfil
// Atualiza nome e/ou senha do usuário logado.
router.patch("/perfil", UsuarioController.atualizarPerfil);

// DELETE /api/usuarios/perfil
// Remove a conta do usuário logado.
router.delete("/perfil", UsuarioController.removerMinhaConta);

// Exportamos o roteador para o app.js.
export default router;
