# 1 Apresentação

A sociedade contemporânea enfrenta um dos seus maiores desafios ambientais: a gestão de resíduos sólidos urbanos. O consumo acelerado, o crescimento populacional e práticas de descarte inadequadas geram impactos severos ao meio ambiente e à saúde pública. O cenário brasileiro é crítico. Em 2022, a produção média de resíduos por cidadão foi de 1,04 kg ao dia, totalizando cerca de 380 kg por ano (ABREMA, 2023). No ano seguinte, o volume total alcançou 81 milhões de toneladas, das quais um alarmante índice de 41,5% foi destinado a lixões ou áreas irregulares, evidenciando uma falha sistêmica na gestão desses materiais (AGÊNCIA BRASIL, 2023; UOL NOTÍCIAS, 2023).

Diante desta realidade, a economia circular surge como um modelo alternativo essencial, focado em prolongar a vida útil de produtos por meio da reutilização, reaproveitamento e reciclagem. Como aponta o Ministério do Meio Ambiente, a transição para este modelo é fundamental e depende do engajamento social e da criação de ferramentas inovadoras (BRASIL, 2025). É neste contexto que se insere o projeto E-Loop: uma plataforma digital projetada para ser um elo facilitador na cadeia da economia circular.

A proposta visa criar um ecossistema colaborativo onde cidadãos, pequenos produtores e organizações possam conectar-se para comprar, vender e doar produtos reutilizáveis. O E-Loop foi concebido não apenas como uma solução tecnológica, mas como uma iniciativa de conscientização com forte caráter socioambiental, aplicando o conhecimento técnico adquirido na academia para gerar impacto positivo e tangível na comunidade.

## 1.1 Cliente
O  cliente-alvo deste projeto são organizações de impacto socioambiental, como ONGs e cooperativas de reciclagem, que desempenham um papel crucial na coleta, triagem e redistribuição de materiais e produtos doados. Embora não haja um parceiro único definido nesta fase, a plataforma é projetada para atender às necessidades de entidades que, tipicamente, enfrentam os seguintes desafios:

__Baixa Visibilidade:__ Dificuldade em alcançar um público doador mais amplo além de sua comunidade local.

__Logística Ineficiente:__ Dependência de doações presenciais e falta de ferramentas para coordenar coletas.

__Gestão Manual:__ Controle de inventário e comunicação com beneficiários feitos de forma analógica, consumindo tempo e recursos.

Para atender a este e outros públicos, o E-Loop foi projetado com base nos seguintes perfis de usuários:

<h3>Personas</h3><br>

**Persona 1:** O Consumidor Consciente (Lucas, 28 anos)

Perfil: Morador de área urbana, com ensino superior, Lucas se interessa por práticas sustentáveis e busca alinhar seu consumo aos seus valores. Ele procura por produtos de segunda mão tanto por economia quanto por princípio ambiental.

Necessidades: Encontrar uma plataforma segura e fácil de usar para adquirir itens reutilizados e, eventualmente, doar objetos que não precisa mais.

Dores: Insegurança em marketplaces generalistas e falta de um local centralizado que reúna opções de consumo consciente.

**Persona 2:** A Vendedora Artesanal/Ecológica (Sofia, 35 anos)

Perfil: Pequena empreendedora que cria produtos (ex: bolsas, decoração) a partir de materiais reciclados. Seu negócio promove a sustentabilidade, mas tem alcance limitado.

Necessidades: Um marketplace de nicho para cadastrar e vender seus produtos, conectando-se com um público que valoriza a economia circular e o trabalho artesanal.

Dores: Dificuldade em competir em grandes plataformas de e-commerce e em encontrar clientes interessados em produtos ecológicos.

**Persona 3:** A Gestora da ONG (Cláudia, 48 anos)

Perfil: Coordenadora de uma ONG local que recebe doações para apoiar famílias em vulnerabilidade. Ela gerencia voluntários e a logística de doações.

Necessidades: Aumentar o volume e a qualidade das doações, dar visibilidade ao trabalho da ONG e gerenciar os itens recebidos de forma mais organizada.

Dores: Fluxo de doações imprevisível, falta de um canal direto para comunicar necessidades específicas (ex: "precisamos de cobertores") e sobrecarga com processos manuais.

## 1.2 Problema
O problema central é a desconexão sistêmica entre o descarte de produtos reutilizáveis e a demanda por esses mesmos itens, o que alimenta o ciclo de desperdício. Apesar da crescente conscientização ambiental, a falta de canais eficientes para o reaproveitamento gera um gargalo logístico e informacional. Esta "dor" se manifesta de três formas:

* Para o Cidadão: A ausência de uma maneira simples e confiável de doar ou vender itens usados leva ao descarte inadequado. A complexidade de encontrar pontos de coleta ou pessoas interessadas torna o lixo a opção mais conveniente, ainda que não seja a mais desejada.

* Para o Consumidor e Empreendedor Sustentável: A falta de um ecossistema focado na economia circular dificulta o acesso a produtos de segunda mão e limita a visibilidade de negócios que transformam resíduos em novos produtos.

* Para as Organizações (O Cliente): A dependência de um fluxo de doações passivo e desorganizado impede que ONGs e cooperativas maximizem seu impacto. A incapacidade de comunicar suas necessidades e gerenciar o que recebem de forma eficaz limita seu potencial de transformação social e ambiental.

## 1.3 Objetivo do trabalho
**Objetivo Geral** <br>
Desenvolver uma aplicação que facilite a reconexão entre doadores, receptores e organizações, promovendo o consumo responsável e a economia circular por meio da tecnologia.

**Objetivos Específicos**<br>
* Criar uma plataforma acessível que conecte usuários interessados em doar, vender, comprar ou reutilizar itens, promovendo um ambiente colaborativo e de fácil utilização.

* Mapear e divulgar locais de coleta e pontos de apoio para a destinação adequada de materiais, oferecendo aos usuários informações confiáveis para uma logística sustentável.

* Incentivar práticas de consumo consciente por meio de ferramentas tecnológicas que sirvam como meio de sensibilização e fortaleçam a cultura da sustentabilidade.

* Adicionalmente, será apresentada uma descrição arquitetural da solução, detalhando sua modelagem e diagramas, o que permitirá o aprofundamento técnico e a futura implementação do projeto.

## 1.4 Definições e Abreviaturas
**Economia Circular:** Modelo econômico focado na redução, reutilização, recuperação e reciclagem de materiais e energia, visando estender o ciclo de vida dos produtos e minimizar o desperdício.

**Logística Reversa:** Processo de planejamento e controle do fluxo de produtos e materiais desde o ponto de consumo até o ponto de origem, com o objetivo de recapturar valor ou realizar o descarte adequado.

**Sustentabilidade:** Princípio de desenvolvimento que visa satisfazer as necessidades do presente sem comprometer a capacidade das futuras gerações de satisfazerem as suas próprias, equilibrando os pilares ambiental, social e econômico.

**Plataforma Digital:** Ambiente online que permite a interação e transação entre diferentes grupos de usuários, mediada pela tecnologia.

**ONG:** Organização Não Governamental.
