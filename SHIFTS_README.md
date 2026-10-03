# Módulo de Gestão de Turno — FASE 1

## Status: ✅ IMPLEMENTAÇÃO COMPLETA

A FASE 1 foi totalmente implementada com:

### Base de Dados
- ✅ Schema completo (shifts, task_templates, task_executions, qsl_points, audit_log)
- ✅ Índices para performance
- ✅ Seed com dados reais do restaurante
  - 3 tipos de turno (Abertura, Transição, Fecho)
  - 5 áreas (Sala, Balcão, Produção, Áreas Internas, Sanitários)
  - 5 pontos QSL
  - 15+ tarefas de exemplo

### API Endpoints
- ✅ POST /api/shifts — Iniciar turno
- ✅ GET /api/shifts — Obter turno atual
- ✅ GET /api/shifts/:id — Detalhes do turno
- ✅ PUT /api/shifts/:id — Atualizar notas
- ✅ POST /api/shifts/:id/end — Finalizar turno
- ✅ GET /api/tasks — Listar tarefas
- ✅ POST /api/tasks/:id/complete — Marcar tarefa completa
- ✅ GET /api/admin/tasks — Listar tarefas (admin)
- ✅ POST /api/admin/tasks — Criar tarefa
- ✅ GET/PUT /api/admin/tasks/:id — Editar tarefa
- ✅ GET /api/admin/shift-types — Tipos de turno
- ✅ GET /api/admin/areas — Áreas

### Frontend
- ✅ /shifts/page.tsx — Dashboard do gerente
  - Formulário para iniciar turno
  - Lista de tarefas com status visual
  - Progresso em tempo real
  - Modal para completar tarefas
- ✅ /admin/tasks/ — Painel de admin
  - Listar todas as tarefas
  - Criar nova tarefa
  - Editar tarefa existente
  - Visualizar tipos de turno e áreas

### Features Implementadas
- ✅ Autenticação via ChatGPT headers (reutilizado)
- ✅ Mobile-first responsive design
- ✅ Auditoria completa de todas as ações
- ✅ Validação de dados (frontend + backend)
- ✅ Tratamento de erros
- ✅ Refresco automático cada 30s
- ✅ Estados visuais por criticidade
- ✅ Suporte a N/A para tarefas

---

## Como Usar

### Começar um Turno (Gerente)
1. Aceder a `/shifts`
2. Se não há turno ativo:
   - Selecionar tipo de turno (Abertura, Transição, Fecho)
   - Clicar "Iniciar Turno"
3. Dashboard mostra:
   - Progresso das tarefas (%)
   - Próxima tarefa
   - Não conformidades abertas

### Completar uma Tarefa
1. Clicar em qualquer tarefa da lista
2. Modal abre com:
   - Status: Conforme / Não Conforme / Não Aplicável
   - Campo de resposta (se aplicável)
   - Notas
3. Clicar "Guardar"
4. Progresso atualiza automaticamente

### Finalizar Turno
1. Clicar "Finalizar Turno" no topo
2. Confirmar ação
3. Turno fica em estado "closed"
4. Não pode ser reabertu

### Gerir Tarefas (Admin)
1. Aceder a `/admin/tasks`
2. Ver todas as tarefas por turno
3. "+ Nova Tarefa" para criar
4. Clicar "Editar" para modificar
5. Configurar:
   - Nome, descrição
   - Hora prevista/limite
   - Criticidade
   - Tipo de resposta
   - Requisitos (foto, QR code)
   - Permitir N/A

---

## Estrutura de Ficheiros

```
app/shifts/
├── layout.tsx          # Layout do módulo
├── page.tsx            # Página principal (turno ou formulário)
├── ShiftDashboard.tsx  # Dashboard do turno
└── TaskCompleteModal.tsx  # Modal de conclusão

app/api/shifts/
├── route.ts            # POST/GET turnos
├── [id]/route.ts       # GET/PUT turno específico
└── [id]/end/route.ts   # POST finalizar turno

app/api/tasks/
├── route.ts            # GET tarefas
└── [id]/complete/route.ts  # POST completar tarefa

app/admin/
├── layout.tsx          # Layout do admin
├── tasks/
│   ├── page.tsx        # Listar tarefas
│   ├── new/page.tsx    # Criar tarefa
│   └── [id]/page.tsx   # Editar tarefa
├── shift-types/page.tsx  # Visualizar tipos
└── areas/page.tsx      # Visualizar áreas

app/api/admin/
├── tasks/
│   ├── route.ts        # CRUD tarefas
│   └── [id]/route.ts   # GET/PUT tarefa
├── shift-types/route.ts
└── areas/route.ts

db/
├── shifts.ts           # Schemas e init
├── audit.ts            # Auditoria
└── seed.ts             # Dados iniciais
```

---

## Dados de Seed

### Tipos de Turno
| Código | Nome | Hora | Frequência QSL |
|--------|------|------|----------------|
| ABERTURA | Abertura | 06:00-12:00 | 60 min |
| TRANSICAO | Transição | 12:00-17:00 | 60 min |
| FECHO | Fecho | 22:00-23:30 | 45 min |

### Áreas
1. Sala (#4CAF50)
2. Balcão (#2196F3)
3. Produção (#FF9800)
4. Áreas Internas (#9C27B0)
5. Sanitários (#F44336)

### Pontos QSL
1. QSL-SALA → Sala
2. QSL-BALCAO → Balcão
3. QSL-PRODUCAO → Produção
4. QSL-AREAS-INT → Áreas Internas
5. QSL-SANITARIOS → Sanitários

---

## Próximas Fases

### FASE 2 — Volta QSL (PRÓXIMA)
- Cronograma automático de voltas (1/hora para abertura)
- Scanner QR code
- Verificações por ponto
- Registro de problemas encontrados

### FASE 3 — Não Conformidades
- Criar ocorrência quando marcar NC
- Estados: ABERTA → EM TRATAMENTO → RESOLVIDA
- Ações corretivas
- Passagem de turno

### FASE 4 — Dashboard de Gestão
- Cumprimento % por turno/gerente
- Indicadores de performance
- Histórico e evolução
- Relatórios

---

## Testes Recomendados

- [ ] Aceder a /shifts sem turno ativo
- [ ] Selecionar tipo de turno e iniciar
- [ ] Verificar dashboard com progresso 0%
- [ ] Clicar numa tarefa e abrir modal
- [ ] Marcar tarefa como "Conforme"
- [ ] Verificar progresso atualizar
- [ ] Finalizar turno
- [ ] Aceder a /admin/tasks
- [ ] Criar nova tarefa
- [ ] Editar tarefa existente
- [ ] Verificar Health Portal ainda funciona

---

## Notas de Implementação

- Todos os timestamps em ISO 8601
- Auditoria automática para todas as ações
- Validação tanto em frontend como backend
- Sem alterações às funcionalidades existentes (Health, Finance)
- Branch: `claude/wizardly-johnson-2lnbh7`

