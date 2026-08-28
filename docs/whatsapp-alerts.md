# Central de Alertas WhatsApp

## Visão geral

A Central de Alertas permite criar alertas programados, condicionais e de antecipação, selecionar destinatários individuais ou grupos, testar mensagens e consultar o histórico de execução. O fuso horário apresentado é `Europe/Lisbon`; datas persistentes e chaves de execução usam UTC.

## Permissões

- `admin`: consulta, configuração, criação, edição, testes, ativação e eliminação.
- `editor`: consulta, criação, edição, testes e ativação.
- `consulta`: leitura da Central e do histórico.

Todas as decisões de autorização são validadas novamente no servidor. A eliminação definitiva está limitada ao administrador.

## Variáveis de ambiente

| Variável | Finalidade |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Token da WhatsApp Cloud API. |
| `WHATSAPP_PHONE_NUMBER_ID` | Identificador do número remetente. |
| `WHATSAPP_API_VERSION` | Versão da Graph API; configurável sem alterar código. |
| `ALERTS_SCHEDULER_SECRET` | Protege o endpoint chamado pelo agendador. |
| `N8N_ALERTS_WEBHOOK_URL` | Webhook opcional do n8n. |
| `N8N_ALERTS_WEBHOOK_SECRET` | Segredo opcional enviado ao webhook n8n. |

Nunca guardar valores reais no repositório. Sem as duas credenciais do WhatsApp, o portal entra automaticamente em modo de simulação: cria logs e permite testes, mas não envia mensagens reais.

## Agendador

Um serviço externo de cron deve chamar `POST /api/alerts/run` com `Authorization: Bearer <ALERTS_SCHEDULER_SECRET>`. O endpoint procura alertas ativos vencidos, resolve grupos e pessoas, envia a cada destinatário e calcula a execução seguinte.

Eventos externos podem chamar `POST /api/alerts/trigger` com a mesma autenticação e um objeto `{ "source": "...", "values": { "campo": "valor" } }`. O portal avalia os alertas condicionais ativos dessa origem e executa apenas os que cumprem a condição.

A chave de idempotência tem a estrutura `alert_id:recipient_id:scheduled_at` e possui uma restrição única na base de dados, impedindo o mesmo envio agendado de ser registado duas vezes. Alertas de execução única são pausados depois de processados.

## Mensagens e dados pessoais

Os modelos suportam `{{nome}}`, `{{data}}` e `{{alerta}}`. O contacto completo fica apenas na lista protegida de destinatários; o histórico guarda uma versão mascarada. Os erros do fornecedor são guardados para diagnóstico sem guardar tokens ou credenciais.

## Integração n8n

Um alerta pode usar WhatsApp, n8n ou ambos. Quando o webhook não está configurado, o ramo n8n também funciona em simulação. A estrutura permite acrescentar novas fontes condicionais e fornecedores sem depender do navegador.

## Operação inicial

1. Aplicar a migração D1 gerada para as tabelas de alertas.
2. Definir os segredos no alojamento, sem os colocar em ficheiros versionados.
3. Registar destinatários e grupos no portal.
4. Criar um alerta, usar **Testar** e confirmar o histórico.
5. Só depois ativar o alerta e ligar o cron protegido.
