DROP TABLE IF EXISTS Carrinho;
DROP TABLE IF EXISTS Avaliacoes;
DROP TABLE IF EXISTS Favoritos;
DROP TABLE IF EXISTS Anuncio;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Categorias;

CREATE TABLE Categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL
);

CREATE TABLE Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_custom VARCHAR(20),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(600) NOT NULL,
  tipo_usuario ENUM('Consumidor','Vendedor','Organizador') NOT NULL,
  cpf VARCHAR(14) UNIQUE NULL,
  cnpj VARCHAR(18) UNIQUE NULL,
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(50),
  bio TEXT,
  foto VARCHAR(255),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_nascimento DATE,
  reset_token VARCHAR(255),
  reset_expira DATETIME
);

CREATE TABLE Anuncio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_produto VARCHAR(100) NOT NULL,
  usuario_id INT NOT NULL,
  tipo_anuncio ENUM('venda','doacao') NOT NULL,
  preco DECIMAL(10,2),
  condicao VARCHAR(50),
  descricao TEXT,
  categoria_id INT,
  imagem VARCHAR(255),
  ativo TINYINT DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
  FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE SET NULL
);

CREATE TABLE Favoritos (
  usuario_id INT NOT NULL,
  anuncio_id INT NOT NULL,
  data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, anuncio_id),
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (anuncio_id) REFERENCES Anuncio(id) ON DELETE CASCADE
);

CREATE TABLE Avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliador_id INT NOT NULL,
  avaliado_id INT NOT NULL,
  nota INT NOT NULL,
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (avaliador_id) REFERENCES Usuarios(id),
  FOREIGN KEY (avaliado_id) REFERENCES Usuarios(id)
);

CREATE TABLE Carrinho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  itens JSON NOT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

INSERT INTO Categorias (id, nome) VALUES
(1, 'Roupas'),
(2, 'Livros'),
(3, 'Vinil'),
(4, 'CD'),
(5, 'Eletrônicos')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
