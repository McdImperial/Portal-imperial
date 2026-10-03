# 📋 Guia de Utilização - Controlo de Faturação

## O que é?
A página de **Controlo de Faturação** verifica automaticamente se todos os produtos que foram entregues pelos fornecedores estão corretamente registados no My Store, com preços e quantidades corretos.

---

## Passo a Passo

### **Passo 1: Aceder à Página**
1. Abra o Portal Soutelo
2. Na barra lateral esquerda, clique em **"Controlo de Faturação"** (📋)
3. A página irá carregar os dados de faturas e registos do My Store

```
Áreas:
├─ Financeiro
├─ Controlo de Faturação ← CLIQUE AQUI
└─ Saúde
```

---

### **Passo 2: Ver o Resumo Geral**
Assim que a página carrega, verá 4 cartões com as estatísticas:

| Ícone | Significado | O que indica |
|-------|-------------|-------------|
| ⚠️ | **Produtos Não Registados** | Quantos produtos foram entregues mas não estão no My Store |
| 💰 | **Diferenças de Preço** | Quantos produtos têm preços diferentes |
| 📦 | **Diferenças de Quantidade** | Quantos produtos têm quantidades diferentes |
| ✓ | **Total de Discrepâncias** | Número total de problemas encontrados |

**Exemplo:**
```
⚠️ Produtos Não Registados: 2
💰 Diferenças de Preço: 1
📦 Diferenças de Quantidade: 1
✓ Total: 4
```

---

### **Passo 3: Filtrar os Problemas**

#### **Opção A - Por Tipo de Problema:**

1. Localize a secção **"Filtrar por tipo"**
2. Clique num botão para ver apenas esse tipo:
   - **"Todas (4)"** - Mostra todos os problemas
   - **"Não registados (2)"** - Apenas produtos que faltam no My Store
   - **"Preço (1)"** - Apenas diferenças de preço
   - **"Quantidade (1)"** - Apenas diferenças de quantidade

#### **Opção B - Por Fatura:**

1. Localize a secção **"Filtrar por fatura"**
2. Clique no dropdown e selecione uma fatura específica:
   ```
   Todas as faturas
   ZF2 BW1X/7131341744
   ZG2 BW8X/7138470161
   ```

---

### **Passo 4: Analisar a Tabela de Problemas**

A tabela mostra cada problema encontrado com:

| Coluna | Significado |
|--------|-------------|
| **Tipo** | 🔴 Não registado / 💰 Preço diferente / 📦 Qtd diferente |
| **Código** | Código único do produto (ex: 08272-835) |
| **Descrição** | Nome do produto (ex: PAO PHILLY) |
| **Fatura** | Número da fatura que o contém |
| **Data** | Data de entrega/faturação |
| **Fornecedor** | Nome do fornecedor (HAVI Logistics, etc.) |
| **Quantidade** | Qtd faturada (e registada se houver diferença) |
| **Preço Unit.** | Preço por unidade na fatura |
| **Detalhes** | Explicação específica do problema |

---

### **Passo 5: Interpretar os Problemas**

#### **Exemplo 1: Produto Não Registado**
```
Tipo: ⚠️ Não registado
Produto: CARNE ROYAL (00006-493)
Fatura: ZG2 BW8X/7138470161
Data: 04/08/2026
Detalhes: "Produto não encontrado no My Store"

❌ AÇÃO: Adicione este produto ao My Store
```

#### **Exemplo 2: Diferença de Preço**
```
Tipo: 💰 Preço diferente
Produto: CARNE ROYAL (00006-493)
Quantidade: 24 BX1
Preço Fatura: €120,82
Detalhes: "Registado: €122.00 (+1.18)"

⚠️ AÇÃO: Atualize o preço no My Store (fatura está MAIS BARATA)
```

#### **Exemplo 3: Diferença de Quantidade**
```
Tipo: 📦 Qtd diferente
Produto: CARNE REG (00005-084)
Fatura: 16 BX1
Detalhes: "Diferença: -1"

⚠️ AÇÃO: Registou 15 em vez de 16. Adicione 1 unidade.
```

---

### **Passo 6: Tomar Ações**

Para cada problema encontrado, siga estas ações:

| Tipo | Ação |
|------|------|
| **Não Registado** | 1. Vá ao My Store 2. Crie novo registo do produto 3. Adicione quantidade e preço da fatura |
| **Preço Diferente** | 1. Vá ao My Store 2. Encontre o produto 3. Corrija o preço para o valor da fatura |
| **Quantidade Diferente** | 1. Vá ao My Store 2. Encontre o produto 3. Ajuste a quantidade para o valor da fatura |

---

### **Passo 7: Verificar Novamente**

1. Após fazer as correções no My Store
2. **Recarregue a página** (F5 ou botão atualizar)
3. Verifique se o problema desapareceu da lista

---

## 📊 Exemplo Prático Completo

**Cenário:** Você recebeu uma fatura e quer verificar se tudo está correto.

```
PASSO 1: Abre Controlo de Faturação
         ↓
PASSO 2: Vê que tem 4 problemas no total
         ↓
PASSO 3: Filtra por fatura "ZG2 BW8X/7138470161"
         ↓
PASSO 4: Vê uma tabela com 2 problemas dessa fatura:
         • CARNE REG: Registou 15, fatura tem 16
         • CARNE ROYAL: Preço registado é €122, fatura é €120,82
         ↓
PASSO 5: Vai ao My Store e:
         • Aumenta quantidade de CARNE REG de 15 para 16
         • Reduz preço de CARNE ROYAL de €122 para €120,82
         ↓
PASSO 6: Volta a Controlo de Faturação e carrega a página
         ↓
RESULTADO: Os 2 problemas desapareceram ✓
```

---

## 💡 Dicas Úteis

1. **Revisar por fornecedor**: Se trabalha com vários fornecedores, filtre por fatura para ver cada um separadamente

2. **Priorizar problemas**: Comece pelos "Não registados" (⚠️) pois são mais críticos

3. **Verificar à chegada**: Revise a fatura assim que chega, enquanto ainda tem a mercadoria

4. **Atualizar regularmente**: Consulte regularmente esta página para manter o My Store exato

---

## ❓ Perguntas Frequentes

**P: Por que aparecem diferenças se a fatura está correta?**
A: Pode haver um erro no registo anterior do My Store. A fatura é a fonte de verdade.

**P: E se o produto na fatura estiver errado?**
A: Contacte o fornecedor para corrigir a fatura antes de atualizar o My Store.

**P: Posso ignorar as diferenças de preço pequenas?**
A: Não recomenda-se. Mesmo diferenças pequenas afetam o controlo financeiro.

**P: Com que frequência devo revisar?**
A: Idealmente após cada entrega de fatura, no mínimo semanalmente.

---

## 📞 Suporte

Se tiver dúvidas ou encontrar problemas:
1. Verifique se os dados do Google Drive estão atualizados
2. Confirme que o My Store tem dados coerentes
3. Contacte o administrador do sistema

---

**Última atualização:** Outubro 2026
**Versão:** 1.0
