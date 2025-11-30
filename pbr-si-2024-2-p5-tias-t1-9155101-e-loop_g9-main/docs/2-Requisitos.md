# 2 Requisitos
Nesta seção (2) deve-se descrever os requisitos comtemplados na descrição arquitetural, divididos em dois grupos: funcionais e não funcionais. 

## 2.1 Lista de Atores

 Doadores
	
* Quem são: Pessoas físicas ou jurídicas que possuem itens em bom estado e desejam doá-los ou repassá-los para reutilização.
* Necessidades/Dores: Encontrar um canal confiável e simples para se desfazer de itens sem precisar descartar; garantir que o objeto vá para alguém que realmente precisa; praticidade no cadastro dos itens.
* Contribuição: Alimentam a plataforma com objetos disponíveis, fortalecendo a rede colaborativa.

Receptores
* Quem são: Indivíduos, famílias ou instituições que buscam itens reutilizáveis ou doados.
* Necessidades/Dores: Localizar itens em bom estado de forma rápida; evitar custos desnecessários; ter confiança na procedência dos objetos.
* Contribuição: Mantêm a plataforma ativa ao acessar, retirar e reutilizar os itens disponibilizados.

Gestores/Administradores da Plataforma
* Quem são: Equipe responsável pelo funcionamento técnico, moderação de conteúdo e atualização das informações (incluindo pontos de coleta).
* Necessidades/Dores: Garantir que a plataforma seja segura, funcional e confiável; gerenciar denúncias ou informações incorretas; oferecer uma boa experiência ao usuário.
* Contribuição: Mantêm a credibilidade do sistema e organizam o fluxo de informações.

## 2.2 Lista de Funcionalidades
Os requisitos aqui apresentados correspondem às funcionalidades solicitadas pelo parceiro/cliente na visão de negócio, tais como:
* Cadastrar usuário
* Cadastrar produto a ser vendido
* Logar usuário
* Gerenciar pedido
* Conversar por via chat com o vendedor
* Pesquisar por produto
* Publicar produto para venda
* Selecionar produto desejado
* Adicionar produto ao carrinho
* Remover produto do carrinho
* Excluir publicação
* Editar publicação


## 2.3 Requisitos Funcionais
Enumerem os requisitos funcionais previstos para a aplicação a ser desenvolvida. Lembrem-se de listar todos os requisitos que serão implementados, com a dificuldade e a prioridade relativa de cada um no projeto. A dificuldade prevista tem relação com o esforço necessário para implementação, e a prioridade tem relação com a importância daquele requisito específico.

| ID   | Descrição Resumida                                                                     | Dificuldade <br> (B/M/A)* | Prioridade <br> (B/M/A)* |
|------|----------------------------------------------------------------------------------------|---------------------------|------------|
| RF01 | O sistema deve permitir o cadastramento do usuário                                     | B                         | A          |
| RF02 | O sistema deve permitir o cadastro de produtos para doação, venda ou reutilização      | M                         | A          |
| RF03 | O sistema deve permitir busca e filtros de produtos por categoria, localização e tipo  | M                         | A          |
| RF04 | O sistema deve permitir que usuários editem e excluam seus anúncios de produtos        | B                         | A          |
| RF05 | O sistema deve permitir que usuários favoritem ou salvem itens de interesse            | B                         | M          |
| RF06 | O sistema deve permitir que os usuários interajam entre si por meio de chat            | A                         | A          |
| RF07 | O sistema deve permitir que usuários publiquem anúncios do produdos desejados          | B                         | A          |
| RF08 | O sistema deve permitir o usuário logar no site                                        | B                         | A          |



*B=Baixa, M=Média, A=Alta.
Obs: acrescente quantas linhas forem  necessárias.

## 2.4 Requisitos Não Funcionais

| ID | Descrição Resumida | Prioridade <br> (B/M/A)* |
| -- | ------------------ | ------------------------ |
| RNF01 | O sistema deve ser acessível via navegadores web (Chrome, Firefox, Edge e Safari) | A |
| RNF02 | O sistema deve garantir que notificações por e-mail sejam entregues em até 1 minuto após o evento, para manter os usuários informados em tempo hábil  | B |
| RNF03 | O sistema deve oferecer suporte multilíngue (inicialmente português e inglês)  | B |
| RNF04 | O sistema deve deixar claro nos termos de uso que não realiza transações financeiras entre usuários | A |
| RNF05 | O sistema deve possuir documentação técnica atualizada para suporte e evolução futura  | B |
| RNF06 | O sistema deve seguir práticas de segurança da informação, incluindo criptografia de senhas e conformidade com a LGPD  | A |
| RNF07 | O sistema deve ser responsivo, permitindo navegação adequada em diferentes tamanhos de tela (desktop, notebook, tablet, smartphone via navegador) | A |
| RNF08 | O sistema deve permitir escalabilidade para suportar até 10.000 acessos simultâneos, garantindo estabilidade em períodos de alta demanda  | A |



## 2.5 Descrição Resumida dos Casos de Uso ou Histórias de Usuários
Apresente uma modelagem dos requisitos funcionais previstos para sua aplicação, utilizando a descrição resumida de Casos de Uso ou o formato de Histórias de Usuário.

Exemplo de descrição resumida de Casos de Uso:

| UC01 | Cadastro de Usuário |
| ---- | ----------- |
| Descrição | Permite que novos usuários realizem cadastro na plataforma |
| Atores    | Doadores, Receptores |
| Prioridade |Alta |
| Requisitos associados | RF01 |
| Fluxo Principal |1.Usuário acessa a tela de cadastro, 2.Preenche dados obrigatórios (nome, e-mail, senha), 3.Confirma cadastro, 4.Sistema armazena informações e libera acesso|

| UC02 | Cadastro de Produto |
| ---- | ----------- |
| Descrição | Permite os usuários cadastrem produtos para doação, venda ou reutilização |
| Atores    | Doadores |
| Prioridade |Alta |
| Requisitos associados | RF02 |
| Fluxo Principal |1.Doador seleciona a opção “Cadastrar produto”, 2.Informa detalhes (nome, descrição, categoria, tipo – doação/venda/reutilização), 3.Publica anúncio., 4.Sistema armazena e exibe o produto na plataforma.|

| UC03 | Buscar e Filtrar Produtos |
| ---- | ----------- |
| Descrição | Permite que usuários encontrem produtos por categoria, localização ou tipo |
| Atores    | Doadores, Receptores |
| Prioridade |Alta |
| Requisitos associados | RF03 |
| Fluxo Principal |1.Usuário acessa a área de busca, 2.Aplica filtros (categoria, localização, tipo), 3.Sistema exibe resultados compatíveis, 4.Usuário visualiza detalhes do item |

| UC04 | Editar e Excluir Anúncios |
| ---- | ----------- |
| Descrição | Permite que os usuários editem ou removam anúncios que publicaram|
| Atores    | Doadores|
| Prioridade |Alta|
| Requisitos associados |RF04|
| Fluxo Principal |1.Doador acessa seus anúncios cadastrados, 2.Seleciona opção de edição ou exclusão, 3.Sistema atualiza ou remove o anúncio, 4.Alteração reflete imediatamente na plataforma |

| UC05 | Favoritar Produtos |
| ---- | ----------- |
| Descrição | Adicionar produto ao carrinho / salvar como favorito |
| Atores    | Receptores |
| Prioridade |Média |
| Requisitos associados | RF05 |
| Fluxo Principal |1.Usuário visualiza produto publicado, 2.Seleciona opção de “Favoritar/Salvar”, 3.Sistema registra o item como favorito, 4.Usuário pode acessar seus favoritos em área dedicada |

| UC06 | Chat entre Usuários |
| ---- | ----------- |
| Descrição | Permite que usuários conversem entre si para negociar produtos. |
| Atores    | Doadores, Receptores |
| Prioridade |Alta |
| Requisitos associados | RF06 |
| Fluxo Principal |1. Usuário acessa um anúncio; 2. Seleciona a opção “Enviar mensagem”; 3. Sistema abre janela de chat; 4. Usuários trocam mensagens em tempo real. |

| UC07 | Publicar Anúncio de Produto Desejado |
| ---- | ----------- |
| Descrição | Publicar produto desejado |
| Atores    | Receptores |
| Prioridade |Alta |
| Requisitos associados | RF07 |
| Fluxo Principal |1. Receptor seleciona a opção “Publicar produto desejado”, 2. Informa detalhes (nome do produto, descrição, categoria, localização); 3. Sistema registra e exibe o anúncio de procura. |

| UC08 | Login de Usuário |
| ---- | ----------- |
| Descrição | Permite que usuários acessem a plataforma com credenciais cadastradas. |
| Atores    | Doadores, Receptores |
| Prioridade |Alta |
| Requisitos associados | RF08 |
| Fluxo Principal |1. Usuário acessa a tela de login; 2. Informa e-mail e senha; 3. Sistema valida credenciais; 4. Usuário é redirecionado para a página inicial. |


## 2.6 Restrições Arquiteturais
Enumerem as principais restrições arquiteturais. Restrições arquiteturais geralmente não são consideradas requisitos, mas apenas limitam a solução a ser desenvolvida, obrigando-a a atendê-las. 

1. O sistema deverá ser desenvolvido utilizando **HTML e CSS** com o framework **React**, para garantir a navegação Web em diversos servidores.  
2. O banco de dados deverá ser **SQLite** em ambiente local de desenvolvimento e poderá ser migrado para **MYSQL** em produção, garantindo escalabilidade.  
3. A API deverá seguir o padrão **RESTful**, possibilitando integração futura com sistemas de parceiros (ONGs e empresas).  
4. O sistema deverá ser projetado de forma **modular**, permitindo manutenção e evolução incremental.  
5. O armazenamento de dados sensíveis (como credenciais de login) deverá respeitar boas práticas de **segurança e criptografia**.  
6. A aplicação deverá priorizar **responsividade**, garantindo uso adequado em dispositivos móveis e navegadores web.  
7. O repositório do projeto deverá ser versionado em **GitHub**, com padronização de commits e organização em branches.  


## 2.7 Mecanismos Arquiteturais 
Esta seção deve apresentar uma visão geral dos mecanismos que compõem a arquitetura do sosftware baseando-se em três estados: (1) análise, (2) design e (3) implementação. 
Na coluna Análise devem ser listados os aspectos gerais que compõem a arquitetura do software, tais como: persistência, integração com 

| Análise                  | Design                        | Implementação                                  |
|---------------------------|-------------------------------|-----------------------------------------------|
| Persistência              | ORM                          | MySQL |
| Front-end                 | Framework multiplataforma    | HTML e CSS                                |
| Back-end                  | API RESTful                  | React      |
| Integração                | Serviços externos via API    | Google Maps API (localização de pontos de coleta) |
| Deploy                    | Ambiente em nuvem            | Firebase Hosting / Vercel / Heroku             |
| Segurança                 | Autenticação e Criptografia  | Firebase Authentication / JWT                  |
| Logs e Monitoramento      | Registro de eventos do sistema | Firebase Crashlytics / Console do servidor    |


