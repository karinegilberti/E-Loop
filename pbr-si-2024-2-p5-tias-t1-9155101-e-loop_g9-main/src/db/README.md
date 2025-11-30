[banco_dados.sql](https://github.com/user-attachments/files/23759515/banco_dados.sql)
CREATE DATABASE IF NOT EXISTS banco_dados;
USE banco_dados;

CREATE TABLE IF NOT EXISTS Categorias (
id int AUTO_INCREMENT primary key not null,
nome varchar (50) not null
);

create table Usuarios (
id int auto_increment primary key not null,
nome varchar (100) not null,
email varchar (100) not null unique,
senha_hash varchar (100) not null,
tipo_usuario enum('Consumidor', 'Vendedor', 'Organizador') not null,
cpf varchar (14) unique,
cnpj varchar (18) unique,
endereco text,
data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table Anuncio (
descricao text,
id int auto_increment primary key not null,
nome_produto varchar (100) not null,
usuario_id int not null,
tipo_anuncio enum('Venda', 'Doação'),
preco decimal (10, 2),
-- estoque int not null default 1,
condicao varchar(50),
categoria_id int,
-- status_produto varchar(20) default 'Disponivel',
-- cep varchar(9),
-- cidade varchar(100),
-- estado varchar(50),
-- data_cadastro timestamp default current_timestamp,

foreign key (usuario_id) references Usuarios(id),
foreign key (categoria_id) references Categorias(id) on delete set null
);

ALTER TABLE Anuncio ADD COLUMN imagem VARCHAR(255);

create table Anuncio_Procura(
id int auto_increment primary key not null,
receptor_id int not null,
titulo varchar(300),
descricao text,
categoria_id int,
cidade varchar(100),
estado varchar(50),
status_procura varchar(30) default 'Ativo',
data_publicacao timestamp default current_timestamp,

foreign key (receptor_id) references Usuarios(id),
foreign key (categoria_id) references Categorias(id) on delete set null
);

create table Favoritos(
idUsuario int not null,
idAnuncio int not null,
data_favorito timestamp default current_timestamp,

primary key (idUsuario, idAnuncio),

foreign key (idUsuario) references Usuarios(id) on delete cascade,
foreign key (idAnuncio) references Anuncio(id) on delete cascade
);

create table Conversa(
id int primary key auto_increment not null,
anuncio_id int not null unique,
interessado_id int not null unique, -- quem iniciou a converça (receptor)
anunciante_id int not null, -- o dono do anuncio
data_inicio timestamp default current_timestamp,

foreign key (anuncio_id) references Anuncio(id),
foreign key (interessado_id) references Usuarios(id),
foreign key (anunciante_id) references Usuarios(id)
);

create table Mensagens(
id int primary key not null,
conversa_id int not null,
remetente_id int not null,
conteudo text not null,
data_envio timestamp default current_timestamp,
msg_lida boolean default false,

foreign key (conversa_id) references Conversa(id),
foreign key (remetente_id) references Usuarios(id)
);

create table Pontos_de_Coleta(
id int primary key not null,
nome varchar(255) not null,
descricao text,
endereco text not null,
latitude decimal (10, 8),
longitude decimal (11, 8),
telefone varchar (11),
horario_funcionamento varchar(200),
materiais_aceitos text
);

create table Pedido(
id int auto_increment primary key,
usuario_id int not null,
total_valor decimal(10, 2) not null,
status_pedido varchar(30) default 'Processando',
endereço_entrega text not null,
data_pedido timestamp default current_timestamp,

foreign key (usuario_id) references Usuarios(id)
);

create table Itens_Pedidos(
id int auto_increment primary key,
pedido_id int not null,
anuncio_id int not null,
quantidade int not null,
preco_unitario decimal (10, 2) not null,

foreign key (pedido_id) references Pedido(id),
foreign key (anuncio_id) references Anuncio(id)
);

create table Doacao_transacao(
id int auto_increment primary key,
anuncio_id int not null,
doador_id int not null,
receptor_id int not null,
status_doacao enum('Aceito', 'Solicitado', 'Recusado', 'Finalizado') not null default 'Solicitado',
data_solicitacao timestamp default current_timestamp,
data_confirmado timestamp null,

foreign key (anuncio_id) references Anuncio(id),
foreign key (doador_id) references Usuarios(id),
foreign key (receptor_id) references Usuarios(id)
);
-- Corrigir enums para match com frontend
ALTER TABLE Anuncio 
MODIFY COLUMN tipo_anuncio ENUM('venda', 'doacao') NOT NULL;

-- Inserir categorias com IDs fixos
INSERT INTO Categorias (id, nome) VALUES
(1, 'Roupas'),
(2, 'Livros'), 
(3, 'Móveis'),
(4, 'Eletrônicos'),
(5, 'Artesanato')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

ALTER TABLE Usuarios 
ADD COLUMN id_custom VARCHAR(20) AFTER id;
ALTER TABLE Usuarios 
ADD COLUMN telefone VARCHAR(20) AFTER cpf;
ALTER TABLE Usuarios 
ADD COLUMN data_nascimento DATE AFTER endereco;
ALTER TABLE Usuarios ADD COLUMN bio TEXT;
ALTER TABLE Usuarios ADD COLUMN foto VARCHAR(255);
INSERT INTO Categorias (id, nome) VALUES (3, 'Vinil'), (4, 'CDs')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

ALTER TABLE Anuncio ADD COLUMN ativo TINYINT DEFAULT 1 AFTER categoria_id;

ALTER TABLE Usuarios MODIFY senha_hash VARCHAR(600);

USE banco_dados;
ALTER TABLE Usuarios 
ADD COLUMN cidade VARCHAR(100) NULL AFTER endereco;
ALTER TABLE Usuarios 
ADD COLUMN estado VARCHAR(50) NULL AFTER cidade;
ALTER TABLE Usuarios 
ADD COLUMN cidade VARCHAR(100) NULL AFTER endereco;
ALTER TABLE Usuarios 
MODIFY senha_hash VARCHAR(600);

USE banco_dados;
CREATE TABLE Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avaliador_uid VARCHAR(128) NOT NULL,
    avaliado_uid VARCHAR(128) NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avaliador FOREIGN KEY (avaliador_uid) REFERENCES Usuarios(firebase_uid),
    CONSTRAINT fk_avaliado FOREIGN KEY (avaliado_uid) REFERENCES Usuarios(firebase_uid)
);

CREATE TABLE Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avaliador_id INT NOT NULL,
    avaliado_id INT NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avaliador FOREIGN KEY (avaliador_id) REFERENCES Usuarios(id),
    CONSTRAINT fk_avaliado FOREIGN KEY (avaliado_id) REFERENCES Usuarios(id)
);

CREATE TABLE Carrinho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  itens JSON NOT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_carrinho FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

ALTER TABLE Favoritos CHANGE COLUMN idUsuario usuario_id INT NOT NULL;
ALTER TABLE Favoritos CHANGE COLUMN idAnuncio anuncio_id INT NOT NULL;

DELETE FROM Categorias WHERE id IN (3,4,5);
INSERT INTO Categorias (id, nome)
VALUES 
    (3, 'Vinil'),
    (4, 'CD')
AS novos
ON DUPLICATE KEY UPDATE nome = novos.nome;


ALTER TABLE Usuarios
ADD COLUMN reset_expira DATETIME;
