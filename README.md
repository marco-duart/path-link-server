# PathLink: A Plataforma de Conhecimento Estruturado e Processos de TI

[![NestJs](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Typescript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Javascript](https://img.shields.io/badge/javascript%20-%23323330.svg?&style=for-the-badge&logo=javascript&logoColor=%23F7DF1E%22/%3E)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![PostgresSQL](https://img.shields.io/badge/PostgreSQL-000?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

PathLink é a solução definitiva para a gestão centralizada, estruturada e controlada de toda a documentação de TI. Nossa arquitetura é projetada para escalabilidade, segurança e interconexão de dados, permitindo que Contas, Variáveis de Ambiente, Repositórios e Fluxos de Trabalho (Passo a Passo) sejam relacionados e rastreáveis por Nível de Acesso.

## 🌟 O Conceito Principal: Interconexão de Dados

Diferente de wikis tradicionais, o PathLink é construído sobre **Modelos Relacionados**. O núcleo do sistema é a capacidade de um **Passo** (`Step`) dentro de um **Processo** (`Process`) se relacionar com qualquer outro Item Documentável (ex: uma `Account`, um `Repository`, ou uma `EnvironmentVariable`).

Este design garante que, ao atualizar uma Conta, o sistema saiba exatamente quais Processos e Passos são afetados, garantindo a integridade da documentação.

### Exemplo de Workflow Central

1.  **Criação da Base:** O time de Infra cadastra a `Account` de administrador do AWS e a marca com o `roleLevel` "Infra Devs".
2.  **Desenho do Processo:** O Arquiteto de Software cria o `Process` "Deploy do Serviço X" e o marca com o `roleLevel` "Devs Backend".
3.  **Montagem dos Passos:**
    * **Passo 1:** "Acessar a ferramenta de CI/CD."
    * **Passo 2:** "Logar no AWS." **Este Passo é relacionado com a `Account` de administrador (criada no passo 1).**
4.  **Controle de Acesso:** Apenas usuários com `roleLevel` "Devs Backend" ou superior podem **ver** o Processo. No entanto, para o Passo 2, eles precisam ter acesso à **própria Account** (que tem o `roleLevel` "Infra Devs"). O sistema deve garantir que o usuário tenha interseção nos dois Níveis de Acesso ou que o nível do usuário seja suficiente para ambos.

---

## 🚀 Inicializando o Projeto

PathLink é composto por duas aplicações principais: `pathlink-server` (Backend) e `pathlink-web` (Frontend).

### 1. Pré-requisitos

Certifique-se de ter instalado:

* Node.js (v18+)
* **Acesso à Storage:** Credenciais para AWS S3 ou MinIO (para o armazenamento de `Assets`).

### 2. Configuração do Ambiente (Backend - `pathlink-api`)

1.  **Variáveis de Ambiente:** Crie o arquivo `.env` na raiz do backend com as seguintes variáveis críticas:
    ```bash
    # Database
    DB_HOST="HOST_DO_SEU_BANCO_DE_DADOS"
    DB_PORT="PORTA_DO_SEU_BANCO_DE_DADOS"
    DB_USERNAME="USER_DO_SEU_BANCO_DE_DADOS"
    DB_PASSWORD="SENHA_DO_SEU_BANCO_DE_DADOS"
    DB_NAME="NOME_DO_SEU_BANCO_DE_DADOS"
    
    # Security
    JWT_SECRET="SUA_CHAVE_SECRETA_DO_SISTEMA"

    JWT_EXPIRATION
    
    # Storage (ex: S3)
    STORAGE_PROVIDER="S3" # "GOOGLE", "MINIO" ou "LOCAL"
    AWS_ACCESS_KEY_ID="SEU_ID"
    AWS_SECRET_ACCESS_KEY="SUA_CHAVE"
    AWS_BUCKET_NAME="pathlink-assets"

    ```
2.  **Inicialização do Banco de Dados (PostgreSQL):**
    ```bash

    
    ```
3.  **Execução da API:**
    ```bash
    npm start
    # A API estará disponível em http://localhost:3000
    ```

**Status Check:**

Após seguir os passos, verifique o acesso em `http://localhost:3000`. Se a página de login for carregada, o PathLink está pronto para o uso.