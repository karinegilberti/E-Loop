// serverAPI.js - API E-Loop completa

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const fs = require("fs");
const nodemailer = require("nodemailer");

// ============================
// FUNÇÕES DE SENHA (PBKDF2)
// ============================
function hashPasswordPBKDF2(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `pbkdf2$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  try {
    // Hash PBKDF2 (novo padrão)
    if (storedHash.startsWith("pbkdf2$")) {
      const parts = storedHash.split("$");
      const salt = parts[1];
      const hash = parts[2];
      const derived = crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");
      return derived === hash;
    }

    // Suporte opcional a bcrypt (se existir no banco)
    if (storedHash.startsWith("$2")) {
      try {
        const bcrypt = require("bcryptjs");
        return bcrypt.compareSync(password, storedHash);
      } catch (e) {
        console.warn(
          "bcryptjs não disponível; não foi possível verificar hash bcrypt"
        );
        return false;
      }
    }

    // Qualquer outra coisa, considera inválido
    return false;
  } catch (e) {
    console.error("Erro ao verificar senha:", e);
    return false;
  }
}

// ============================
// APP / MIDDLEWARES
// ============================
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// Pasta de uploads
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ============================
// BANCO DE DADOS
// ============================
let db;

(async () => {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log("✅ Conectado ao MySQL (Railway)");

  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  }
})();

// ============================
// ROTA TESTE
// ============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API E-Loop funcionando!",
  });
});

// ============================
// CADASTRO DE USUÁRIO
// ============================
app.post("/api/cadastro", async (req, res) => {
  try {
    const { nome, email, dataNascimento, cpf, telefone, cidade, estado, senha } =
      req.body;

    console.log("📥 Dados recebidos para cadastro:", { nome, email });

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ success: false, message: "Nome, email e senha são obrigatórios" });
    }

    const [exist] = await db
      .promise()
      .query("SELECT id FROM Usuarios WHERE email = ?", [email]);
    if (exist.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email já cadastrado" });
    }

    const usuarioIdCustom = "USR-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const enderecoCompleto = `${cidade || ""}${
      cidade && estado ? ", " : ""
    }${estado || ""}`;

    const senhaHash = hashPasswordPBKDF2(senha);

    const insertSql = `
      INSERT INTO Usuarios
      (id_custom, nome, email, senha_hash, tipo_usuario, cpf, telefone, endereco, cidade)
      VALUES (?, ?, ?, ?, 'Consumidor', ?, ?, ?, ?)
    `;
    const valores = [
      usuarioIdCustom,
      nome,
      email,
      senhaHash,
      cpf || null,
      telefone || null,
      enderecoCompleto || null,
      cidade || null,
    ];

    const [result] = await db.promise().query(insertSql, valores);

    console.log("✅ Usuário cadastrado com ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso!",
      usuario: {
        id: result.insertId,
        id_custom: usuarioIdCustom,
        nome,
        email,
      },
    });
  } catch (err) {
    console.error("❌ Erro no cadastro:", err);

    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage.includes("cpf")) {
        return res
          .status(409)
          .json({ success: false, message: "CPF já cadastrado" });
      }
      if (err.sqlMessage.includes("email")) {
        return res
          .status(409)
          .json({ success: false, message: "Email já cadastrado" });
      }
    }

    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});

// ============================
// LOGIN
// ============================
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res
      .status(400)
      .json({ success: false, message: "Email e senha são obrigatórios" });
  }

  const sql =
    "SELECT id, nome, email, senha_hash, tipo_usuario FROM Usuarios WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("❌ Erro no login:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor" });
    }

    if (results.length === 0) {
      console.log("❌ Email não encontrado:", email);
      return res
        .status(401)
        .json({ success: false, message: "Email ou senha incorretos" });
    }

    const usuario = results[0];

    try {
      const hash = usuario.senha_hash || "";
      const senhaValida = verifyPassword(senha, hash);

      if (!senhaValida) {
        console.log("❌ Senha incorreta para:", email);
        return res
          .status(401)
          .json({ success: false, message: "Email ou senha incorretos" });
      }

      console.log("✅ Login bem-sucedido para:", usuario.nome);

      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
        },
      });
    } catch (error) {
      console.error("❌ Erro ao validar senha:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno ao validar senha" });
    }
  });
});

// === SOLICITAR RECUPERAÇÃO DE SENHA ===
app.post("/api/recuperar-senha", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Informe o e-mail" });

  try {
    const [rows] = await db.promise().query("SELECT id, nome FROM Usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "E-mail não encontrado" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1h

    await db.promise().query(
      "UPDATE Usuarios SET reset_token=?, reset_expira=? WHERE email=?",
      [token, expires, email]
    );

    const link = `http://localhost:5500/esqueci-senha.html?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "eloop.suporte@gmail.com",
        pass: "xjdbbwrvslwnhvtu" // SENHA DO APP
      }
    });

    await transporter.sendMail({
      from: "E-Loop <suporte@eloop.com>",
      to: email,
      subject: "Recuperação de Senha - E-Loop",
      html: `
        <p>Olá <b>${rows[0].nome}</b>,</p>
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique abaixo para redefinir:</p>
        <a href="${link}" style="color:#007bff; font-weight:bold;">REDEFINIR SENHA</a>
        <p><br>Se você não solicitou, ignore este e-mail.</p>
      `
    });

    res.json({ success: true, message: "Link enviado ao e-mail!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao enviar e-mail" });
  }
});


// === FINALIZAR REDEFINIÇÃO DE SENHA ===
app.post("/api/redefinir-senha", async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res.status(400).json({ success: false, message: "Dados insuficientes" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id FROM Usuarios WHERE reset_token=? AND reset_expira > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Token inválido ou expirado" });
    }

    const senhaHash = hashPasswordPBKDF2(novaSenha);

    await db.promise().query(
      "UPDATE Usuarios SET senha_hash=?, reset_token=NULL, reset_expira=NULL WHERE reset_token=?",
      [senhaHash, token]
    );

    res.json({ success: true, message: "Senha atualizada com sucesso!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao redefinir senha" });
  }
});



// ============================
// LISTAR USUÁRIOS (DEBUG)
// ============================
app.get("/api/usuarios", (req, res) => {
  db.query(
    "SELECT id, nome, email, data_cadastro FROM Usuarios ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error("❌ Erro ao listar usuários:", err);
        return res
          .status(500)
          .json({ success: false, message: "Erro interno" });
      }
      res.json({ success: true, total: results.length, usuarios: results });
    }
  );
});

// ============================
// PERFIL / USUÁRIO POR ID
// ============================
app.get("/api/usuario/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId))
    return res
      .status(400)
      .json({ success: false, message: "ID inválido" });

  const sql = `
    SELECT 
      id, id_custom, nome, email, tipo_usuario, cpf, cnpj,
      endereco, cidade, telefone, bio, foto, data_cadastro
    FROM Usuarios
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Erro ao buscar usuário:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno" });
    }
    if (results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    res.json({ success: true, usuario: results[0] });
  });
});

// ============================
// ATUALIZAR PERFIL
// ============================
app.put("/api/usuario/:id", (req, res) => {
  const userId = req.params.id;
  const { nome, email, telefone, endereco, bio, cidade } = req.body;

  const sql = `
    UPDATE Usuarios
    SET nome = ?, email = ?, telefone = ?, endereco = ?, bio = ?, cidade = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [nome, email, telefone, endereco, bio, cidade, userId],
    (err, result) => {
      if (err) {
        console.error("❌ Erro ao atualizar usuário:", err);
        return res
          .status(500)
          .json({ success: false, message: "Erro ao atualizar perfil." });
      }

      return res.json({
        success: true,
        message: "Perfil atualizado com sucesso!",
      });
    }
  );
});

// ============================
// CADASTRAR ANÚNCIO
// ============================
app.post("/api/anuncios", upload.single("imagem"), (req, res) => {
  try {
    console.log("📦 NOVO ANÚNCIO RECEBIDO");
    const {
      nome_produto,
      tipo_anuncio,
      categoria_id,
      preco,
      condicao,
      descricao,
      usuario_id,
    } = req.body;

    console.log("🧾 Dados do anúncio:", { nome_produto, tipo_anuncio, usuario_id });

    if (
      !nome_produto ||
      !tipo_anuncio ||
      !categoria_id ||
      !preco ||
      !condicao ||
      !descricao ||
      !usuario_id
    ) {
      console.log("❌ Campos obrigatórios faltando");
      return res.status(400).json({
        success: false,
        message: "Preencha todos os campos obrigatórios",
      });
    }

    const imagemPath = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
      INSERT INTO Anuncio
      (nome_produto, tipo_anuncio, categoria_id, preco, condicao, descricao, usuario_id, imagem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      nome_produto,
      tipo_anuncio,
      parseInt(categoria_id),
      parseFloat(preco),
      condicao,
      descricao,
      parseInt(usuario_id),
      imagemPath,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ Erro ao inserir anúncio:", err);
        return res.status(500).json({
          success: false,
          message: "Erro ao cadastrar anúncio",
          error: err.sqlMessage || err,
        });
      }

      console.log("✅ Anúncio cadastrado ID:", result.insertId);
      res.status(201).json({
        success: true,
        message: "Anúncio cadastrado com sucesso!",
        anuncio: {
          id: result.insertId,
          nome_produto,
          tipo_anuncio,
          categoria_id,
          preco,
          condicao,
          descricao,
          usuario_id,
          imagem: imagemPath,
        },
      });
    });
  } catch (error) {
    console.error("❌ Erro no endpoint /api/anuncios:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ============================
// LISTAR TODOS OS ANÚNCIOS
// ============================
app.get("/api/anuncios", (req, res) => {
  const sql = `
    SELECT 
      a.*,
      u.nome AS vendedor_nome,
      u.telefone AS vendedor_telefone,
      u.cidade AS vendedor_cidade,
      u.endereco AS vendedor_endereco,
      c.nome AS categoria_nome
    FROM Anuncio a
    LEFT JOIN Usuarios u ON a.usuario_id = u.id
    LEFT JOIN Categorias c ON a.categoria_id = c.id
    ORDER BY a.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erro ao buscar anúncios:", err);
      return res
        .status(500)
        .json({ message: "Erro ao buscar anúncios", error: err });
    }
    res.json(results);
  });
});

// ============================
// ANÚNCIOS POR USUÁRIO
// ============================
app.get("/api/anuncios/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId))
    return res
      .status(400)
      .json({ success: false, message: "ID inválido" });

  const sql = `
    SELECT 
      a.*,
      c.nome AS categoria_nome
    FROM Anuncio a
    LEFT JOIN Categorias c ON a.categoria_id = c.id
    WHERE a.usuario_id = ?
    ORDER BY a.id DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Erro ao buscar anúncios do usuário:", err);
      return res.status(500).json({
        message: "Erro ao buscar anúncios do usuário",
        error: err,
      });
    }
    res.json(results);
  });
});

// ============================
// EDITAR ANÚNCIO
// ============================
app.put("/api/anuncios/:id", upload.single("imagem"), (req, res) => {
  const anuncioId = parseInt(req.params.id, 10);
  const { nome_produto, preco, condicao, descricao } = req.body;

  console.log("🔄 Solicitacao de edicao de anuncio:", anuncioId);

  if (isNaN(anuncioId)) {
    return res
      .status(400)
      .json({ success: false, message: "ID do anúncio inválido" });
  }

  if (!nome_produto || !preco || !condicao) {
    return res.status(400).json({
      success: false,
      message: "Nome, preço e condição são obrigatórios",
    });
  }

  const checkSql = "SELECT id FROM Anuncio WHERE id = ?";
  db.query(checkSql, [anuncioId], (err, results) => {
    if (err) {
      console.error("❌ Erro ao verificar anúncio:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Anúncio não encontrado" });
    }

    let updateSql =
      "UPDATE Anuncio SET nome_produto = ?, preco = ?, condicao = ?, descricao = ?";
    const values = [nome_produto, parseFloat(preco), condicao, descricao || ""];

    if (req.file) {
      const novaImagem = `/uploads/${req.file.filename}`;
      updateSql += ", imagem = ?";
      values.push(novaImagem);
    }

    updateSql += " WHERE id = ?";
    values.push(anuncioId);

    db.query(updateSql, values, (err2) => {
      if (err2) {
        console.error("❌ Erro ao atualizar anúncio:", err2);
        return res.status(500).json({
          success: false,
          message: "Erro ao atualizar anúncio",
          error: err2.sqlMessage || err2,
        });
      }

      db.query(
        `
        SELECT 
          a.*,
          u.nome AS vendedor_nome,
          u.telefone AS vendedor_telefone
        FROM Anuncio a
        LEFT JOIN Usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `,
        [anuncioId],
        (err3, rows) => {
          if (err3) {
            console.error("❌ Erro ao buscar anuncio atualizado:", err3);
            return res.status(500).json({
              success: false,
              message: "Erro após atualização",
            });
          }
          return res.json({
            success: true,
            message: "Anúncio atualizado com sucesso!",
            anuncio: rows[0],
          });
        }
      );
    });
  });
});

// ============================
// DELETAR ANÚNCIO
// ============================
app.delete("/api/anuncios/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM Anuncio WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Erro ao deletar anúncio:", err);
      return res
        .status(500)
        .json({ message: "Erro ao deletar anúncio", error: err });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Anúncio não encontrado" });
    res.status(204).send();
  });
});

// ============================
// DETALHES DO ANÚNCIO POR ID
// ============================
app.get("/api/anuncios/:id", (req, res) => {
  const anuncioId = parseInt(req.params.id, 10);
  if (isNaN(anuncioId) || anuncioId <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID do anúncio inválido",
      anuncio: null,
    });
  }

  const sql = `
    SELECT 
      a.*,
      u.nome AS vendedor_nome,
      u.telefone AS vendedor_telefone,
      u.email AS vendedor_email,           -- 👈 AQUI
      u.cidade AS vendedor_cidade,
      u.endereco AS vendedor_endereco
    FROM Anuncio a
    LEFT JOIN Usuarios u ON a.usuario_id = u.id
    WHERE a.id = ?
    LIMIT 1
  `;

  db.query(sql, [anuncioId], (err, results) => {
    if (err) {
      console.error("❌ Erro no banco de dados:", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar anúncio",
        anuncio: null,
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Anúncio não encontrado",
        anuncio: null,
      });
    }

    res.json({
      success: true,
      message: "Anúncio encontrado com sucesso",
      anuncio: results[0],
    });
  });
});


// ============================
// ANÚNCIOS POR CATEGORIA
// ============================
app.get("/api/anuncios/categoria/:categoriaId", async (req, res) => {
  try {
    const { categoriaId } = req.params;
    console.log(`📂 Buscando anúncios por categoria: ${categoriaId}`);

    const [anuncios] = await db
      .promise()
      .query(
        `
      SELECT 
        a.*,
        u.nome AS vendedor_nome,
        u.telefone AS vendedor_telefone,
        c.nome AS categoria_nome
      FROM Anuncio a
      LEFT JOIN Usuarios u ON a.usuario_id = u.id
      LEFT JOIN Categorias c ON a.categoria_id = c.id
      WHERE a.categoria_id = ?
      ORDER BY a.id DESC
    `,
        [categoriaId]
      );

    res.json({
      success: true,
      anuncios,
      total: anuncios.length,
      categoria_id: categoriaId,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios por categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar anúncios por categoria",
    });
  }
});

// ============================
// EXPLORAR (TODOS ANÚNCIOS)
// ============================
app.get("/api/explorar/anuncios", async (req, res) => {
  try {
    const [anuncios] = await db.promise().query(`
      SELECT 
        a.*,
        u.nome as vendedor_nome,
        u.cidade as vendedor_cidade,
        u.endereco as vendedor_endereco,
        u.telefone as vendedor_telefone,
        c.nome as categoria_nome
      FROM Anuncio a
      LEFT JOIN Usuarios u ON a.usuario_id = u.id
      LEFT JOIN Categorias c ON a.categoria_id = c.id
      ORDER BY a.id DESC
    `);

    res.json({
      success: true,
      anuncios,
      total: anuncios.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios para explorar:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// ============================
// AVALIAÇÕES
// ============================
app.post("/api/avaliacao", async (req, res) => {
  try {
    const { avaliador_id, avaliado_id, nota, comentario } = req.body;

    if (!avaliador_id || !avaliado_id || !nota) {
      return res.status(400).json({
        success: false,
        message:
          "Campos obrigatórios faltando (avaliador_id, avaliado_id, nota).",
      });
    }

    const n = Number(nota);
    if (n < 1 || n > 5) {
      return res.status(400).json({
        success: false,
        message: "A nota deve ser entre 1 e 5.",
      });
    }

    if (Number(avaliador_id) === Number(avaliado_id)) {
      return res.status(400).json({
        success: false,
        message: "Você não pode se autoavaliar.",
      });
    }

    const [existEval] = await db
      .promise()
      .query(
        "SELECT id FROM Avaliacoes WHERE avaliador_id = ? AND avaliado_id = ?",
        [avaliador_id, avaliado_id]
      );

    if (existEval.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Você já avaliou este vendedor.",
      });
    }

    await db
      .promise()
      .query(
        `
        INSERT INTO Avaliacoes (avaliador_id, avaliado_id, nota, comentario)
        VALUES (?, ?, ?, ?)
      `,
        [avaliador_id, avaliado_id, n, comentario || null]
      );

    return res.json({
      success: true,
      message: "Avaliação enviada com sucesso!",
    });
  } catch (error) {
    console.error("❌ Erro ao criar avaliação:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar avaliação.",
    });
  }
});

// listar avaliações de um vendedor
app.get("/api/avaliacao/:idVendedor", async (req, res) => {
  try {
    const idVendedor = parseInt(req.params.idVendedor, 10);
    if (isNaN(idVendedor)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de vendedor inválido" });
    }

    const [rows] = await db
      .promise()
      .query(
        `
        SELECT A.nota, A.comentario, A.data_avaliacao, U.nome AS avaliador
        FROM Avaliacoes A
        INNER JOIN Usuarios U ON U.id = A.avaliador_id
        WHERE A.avaliado_id = ?
        ORDER BY A.data_avaliacao DESC
      `,
        [idVendedor]
      );

    const total = rows.length;
    const media =
      total > 0
        ? (rows.reduce((sum, r) => sum + r.nota, 0) / total).toFixed(1)
        : 0;

    return res.json({
      success: true,
      total,
      media,
      avaliacoes: rows,
    });
  } catch (error) {
    console.error("❌ Erro ao listar avaliações:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao listar avaliações.",
    });
  }
});

// alias plural
app.get("/api/avaliacoes/:idVendedor", (req, res) => {
  req.url = req.url.replace("/avaliacoes/", "/avaliacao/");
  app._router.handle(req, res);
});

// ============================
// FAVORITOS
// ============================

// ➕ ADICIONAR FAVORITO
app.post("/api/favoritos/add", async (req, res) => {
  const { usuario_id, anuncio_id } = req.body;

  if (!usuario_id || !anuncio_id) {
    return res.status(400).json({ success: false, message: "Dados incompletos" });
  }

  try {
    await db.promise().query(
      "INSERT IGNORE INTO Favoritos (idUsuario, idAnuncio) VALUES (?, ?)",
      [usuario_id, anuncio_id]
    );
    res.json({ success: true, message: "Favorito adicionado!" });
  } catch (error) {
    console.error("❌ ERRO AO ADICIONAR FAVORITO:", error);
    res.status(500).json({ success: false, message: "Erro ao favoritar" });
  }
});

// ❌ REMOVER FAVORITO
app.post("/api/favoritos/remove", async (req, res) => {
  const { usuario_id, anuncio_id } = req.body;

  try {
    await db.promise().query(
      "DELETE FROM Favoritos WHERE idUsuario = ? AND idAnuncio = ?",
      [usuario_id, anuncio_id]
    );
    res.json({ success: true, message: "Favorito removido!" });
  } catch (error) {
    console.error("❌ ERRO AO REMOVER FAVORITO:", error);
    res.status(500).json({ success: false, message: "Erro ao remover favorito" });
  }
});

// 📌 LISTAR FAVORITOS DO USUÁRIO (RETORNA IDs)
app.get("/api/favoritos/:usuarioId", async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);

    const [rows] = await db.promise().query(`
      SELECT idAnuncio AS idAnuncio
      FROM Favoritos WHERE idUsuario = ?
    `, [usuarioId]);

    res.json({ success: true, favoritos: rows });

  } catch (error) {
    console.error("❌ ERRO AO BUSCAR FAVORITOS:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar favoritos" });
  }
});

// ============================
// CARRINHO (SALVA JSON NO MYSQL)
// ============================

/// Buscar carrinho do usuário
app.get("/api/carrinho/:usuarioId", async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);

    const [rows] = await db
      .promise()
      .query("SELECT itens FROM Carrinho WHERE usuario_id = ?", [usuarioId]);

    if (rows.length === 0) return res.json({ itens: [] });

    let itens = rows[0].itens;

    // 🔧 CORREÇÃO: Só dá JSON.parse se for string
    try {
      if (typeof itens === "string") itens = JSON.parse(itens);
    } catch {
      itens = [];
    }

    return res.json({ itens });

  } catch (error) {
    console.error("❌ Erro ao buscar carrinho:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar carrinho" });
  }
});


// Salvar/atualizar carrinho
app.put("/api/carrinho/:usuarioId", async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const itens = req.body.itens || [];

    const [rows] = await db
      .promise()
      .query("SELECT id FROM Carrinho WHERE usuario_id = ?", [usuarioId]);

    if (rows.length === 0) {
      await db
        .promise()
        .query("INSERT INTO Carrinho (usuario_id, itens) VALUES (?, ?)", [
          usuarioId,
          JSON.stringify(itens)
        ]);
    } else {
      await db
        .promise()
        .query("UPDATE Carrinho SET itens = ? WHERE usuario_id = ?", [
          JSON.stringify(itens),
          usuarioId
        ]);
    }

    res.json({ success: true, message: "Carrinho salvo!" });

  } catch (error) {
    console.error("❌ Erro ao salvar carrinho:", error);
    res.status(500).json({ success: false, message: "Erro ao salvar carrinho" });
  }
});

// Limpar carrinho
app.delete("/api/carrinho/:usuarioId", async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    await db
      .promise()
      .query("DELETE FROM Carrinho WHERE usuario_id = ?", [usuarioId]);
    res.json({ success: true, message: "Carrinho apagado!" });
  } catch (error) {
    console.error("❌ Erro ao limpar carrinho:", error);
    res.status(500).json({ success: false, message: "Erro ao limpar carrinho" });
  }
});


// ============================
// INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
);