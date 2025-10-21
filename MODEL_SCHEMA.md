# PathLink - Modelos de Domínio e Relacionamentos

## 1. Estrutura Organizacional e de Acesso (Access & Org)

Estes modelos definem quem é o usuário e o que ele pode ver (`AccessLevel`).

| Modelo | Atributo (em inglês) | Tipo | Relacionamento/Notas |
| :--- | :--- | :--- | :--- |
| `Department` | `id`, `name` | PK, String | - |
| `Team` | `id`, `name`, `department_id` | PK, String, FK | FK para `Department` |
| `AccessLevel` | `id`, `name`, `description` | PK, String, Text | **Ponto de Controle:** Define a visibilidade de todos os Itens Documentáveis. |
| `User` | `id`, `name`, `email`, `password_digest`, `department_id`, `team_id`, `access_level_id` | PK, String, String, FK, FK, FK | FKs para `Department`, `Team`, `AccessLevel` |

## 2. Itens Documentáveis (Reusable Assets)

São as entidades estáticas que são referenciadas nos Processos.

| Modelo | Atributo (em inglês) | Tipo | Notas |
| :--- | :--- | :--- | :--- |
| `Account` | `id`, `name`, `type`, `username`, `password`, `url`, `notes`, `access_level_id` | PK, String, String, String, **String (Criptografado)**, String, Text, FK | Ex: Contas Admin/Shared (Github, Sendgrid). |
| `Repository` | `id`, `name`, `url`, `tech_stack`, `description`, `access_level_id` | PK, String, String, String, Text, FK | Repositórios de código (Git). |
| `Database` | `id`, `name`, `type`, `host`, `port`, `credentials_fk`, `notes`, `access_level_id` | PK, String, String, String, Int, FK, Text, FK | Referência a credenciais salvas em `Account` ou outra tabela segura. |
| `EnvironmentVariable` | `id`, `name`, **`value_encrypted`**, `description`, `scope`, `access_level_id` | PK, String, **String (Criptografado)**, Text, String, FK | Variáveis de ambiente sensíveis. |
| `ConfigurationItem` | `id`, `name`, `type`, `details`, `notes`, `access_level_id` | PK, String, String, JSON/Text, Text, FK | Configurações de infraestrutura (VMs, Balanceadores). |
| `Link` | `id`, `name`, `url`, `description`, `access_level_id` | PK, String, String, Text, FK | Links úteis para documentação externa. |
| `Asset` | `id`, `filename`, `url`, `mime_type`, `uploaded_by_id`, `access_level_id` | PK, String, String, String, FK, FK | Imagens e arquivos carregados (armazenados em S3/MinIO, URL no DB). |

## 3. Estrutura de Fluxo (Processes & Steps)

Estes modelos definem o Passo a Passo/Fluxo.

| Modelo | Atributo (em inglês) | Tipo | Relacionamento/Notas |
| :--- | :--- | :--- | :--- |
| `Process` | `id`, `name`, `description`, `category`, `is_active`, `created_by_id`, `access_level_id` | PK, String, Text, String, Boolean, FK, FK | Categoria crucial para busca (ex: 'Deploy', 'Atendimento', 'Sankhya'). |
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
        U(User) --> AL(AccessLevel)
        U --> DEP(Department)
        U --> T(Team)
    end
    
    subgraph B[Itens Documentáveis]
        AL --> AC(Account)
        AL --> R(Repository)
        AL --> EV(EnvironmentVariable)
        AL --> CI(ConfigurationItem)
    end

    subgraph C[Fluxo Principal]
        PR(Process) --> AL
        PR --> S(Step)
        S --> SR(StepRelationship)
        S --> SA(StepAsset)
    end
    
    SR --> AC
    SR --> R
    SR --> EV
    SR --> CI
    SA --> AS(Asset)