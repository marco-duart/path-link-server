# PathLink - Modelos de Domínio e Relacionamentos

## 1. Estrutura Organizacional e de Acesso (Access & Org)

Estes modelos definem quem é o usuário e o que ele pode ver (`role`).

| Modelo | Atributo (em inglês) | Tipo | Relacionamento/Notas |
| :--- | :--- | :--- | :--- |
| `Department` | `id`, `name` | PK, String | - |
| `Team` | `id`, `name`, `department_id` | PK, String, FK | FK para `Department` |
| `User` | `id`, `name`, `email`, `password_digest`, `role`, `department_id`, `team_id` | PK, String, String, FK, FK, FK | FKs para `Department`, `Team` |

## 2. Itens Documentáveis (Reusable Assets)

São as entidades estáticas que são referenciadas nos Processos.

| Modelo | Atributo (em inglês) | Tipo | Notas |
| :--- | :--- | :--- | :--- |
| `Account` | `id`, `name`, `type`, `username`, `password`, `url`, `notes`, `required_role` | PK, String, String, String, **String (Criptografado)**, String, Text, FK | Ex: Contas Admin/Shared (Github, Sendgrid). |
| `Repository` | `id`, `name`, `url`, `tech_stack`, `description`, `required_role` | PK, String, String, String, Text, FK | Repositórios de código (Git). |
| `Database` | `id`, `name`, `type`, `host`, `port`, `credentials_fk`, `notes`, `required_role` | PK, String, String, String, Int, FK, Text, FK | Referência a credenciais salvas em `Account` ou outra tabela segura. |
| `EnvironmentVariable` | `id`, `name`, **`value_encrypted`**, `description`, `scope`, `required_role` | PK, String, **String (Criptografado)**, Text, String, FK | Variáveis de ambiente sensíveis. |
| `ConfigurationItem` | `id`, `name`, `type`, `details`, `notes`, `required_role` | PK, String, String, JSON/Text, Text, FK | Configurações de infraestrutura (VMs, Balanceadores). |
| `Deploy` | `id`, `name`, `type`, `environment`, `region`, `endpoint`, `description`, `notes`, `credentials_id`, `required_role` | PK, String, String, String, String, String, Text, Text, FK, FK | Ambientes de deploy (AWS, Google Cloud, Azure, Local VM, etc). Referencia credenciais em `Account`. |
| `Link` | `id`, `name`, `url`, `description`, `required_role` | PK, String, String, Text, FK | Links úteis para documentação externa. |
| `Asset` | `id`, `filename`, `url`, `mime_type`, `uploaded_by_id`, `required_role` | PK, String, String, String, FK, FK | Imagens e arquivos carregados (armazenados em S3/MinIO, URL no DB). |

## 3. Estrutura de Fluxo (Processes & Steps)

Estes modelos definem o Passo a Passo/Fluxo.

| Modelo | Atributo (em inglês) | Tipo | Relacionamento/Notas |
| :--- | :--- | :--- | :--- |
| `Process` | `id`, `name`, `description`, `category`, `is_active`, `created_by_id`, `required_role` | PK, String, Text, String, Boolean, FK, FK | Categoria crucial para busca (ex: 'Deploy', 'Atendimento', 'Sankhya'). |
| `Step` | `id`, `process_id`, `step_number`, `title`, `instructions`, `expected_result`, `notes`, `is_optional` | PK, FK, Int, String, Text, Text, Text, Boolean | O coração da instrução. `instructions` deve suportar Rich Text/Markdown. |

## 4. Relacionamentos (Interconnection Engine)

O segredo da flexibilidade e da busca avançada.

| Modelo | Atributo (em inglês) | Tipo | Relacionamento/Notas |
| :--- | :--- | :--- | :--- |
| **`StepRelationship`** | `id`, **`step_id`** (FK), **`related_model`** (String), **`related_id`** (Int/UUID) | PK, FK, String, Int/UUID | **Relacionamento Polimórfico:** Vincula um `Step` a *qualquer* Item Documentável. <br>Ex: `related_model='Account'`, `related_id=5`. |
| `StepAsset` | `id`, `step_id` (FK), `asset_id` (FK), `caption` | PK, FK, FK, String | Relacionamento 1:N entre `Step` e `Asset` (Imagens). |

### Diagrama de Alto Nível

```mermaid
graph TD
    subgraph A[Controle de Acesso]
        U(User) --> DEP(Department)
        U --> T(Team)
    end

    subgraph C[Fluxo Principal]
        PR(Process) --> S(Step)
        S --> SR(StepRelationship)
        S --> SA(StepAsset)
    end
    
    SR --> AC(Account)
    SR --> R(Repository)
    SR --> EV(EnvironmentVariable)
    SR --> CI(ConfigurationItem)
    SR --> DPL(Deploy)
    SR --> DB(Database)
    SR --> LK(Link)
    SA --> AS(Asset)

---

## 5. Exemplos de Uso: Deploy nos Processos

O modelo `Deploy` permite documentar e referenciar ambientes de deploy em Processos de Implantação.

### Exemplo: Processo "Deploy na Produção"

1. **Processo:** "Deploy na Produção"
   - **Categoria:** Deploy
   - **Descrição:** Guia passo a passo para colocar mudanças em produção

2. **Steps:**
   - Step 1: "Validar código e testes"
   - Step 2: "Conectar ao servidor AWS Production"
     - **StepRelationship:** Vincula ao Deploy `Deploy AWS Production`
     - **StepRelationship:** Vincula à Credencial `AWS Production Account`
   - Step 3: "Executar scripts de migração"
     - **StepRelationship:** Vincula ao Database `Production RDS`
   - Step 4: "Verificar status da aplicação"
     - **StepRelationship:** Vincula ao Link `Monitoring Dashboard`

### Tipos de Deploy Suportados

- **AWS:** EC2, ECS, Lambda, AppRunner
- **Google Cloud:** Compute Engine, Cloud Run, App Engine
- **Azure:** Virtual Machines, App Service, Container Instances
- **Local VM:** Servidores on-premise
- **Kubernetes:** Clusters gerenciados ou selfhosted

