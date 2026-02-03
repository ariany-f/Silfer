# Onde a Aplicação Grava Logs

## 📍 Localização Principal dos Logs

### 1. Logs do Laravel (Aplicação)
**Caminho:** `storage/logs/laravel.log`

Este é o arquivo principal onde a aplicação Laravel grava todos os logs.

**Configuração:**
- Arquivo: `config/logging.php`
- Canal padrão: `stack` (que usa `single`)
- Nível de log: `debug` (configurável via `LOG_LEVEL` no `.env`)

**Como verificar:**
```bash
# Ver últimas linhas do log
tail -f storage/logs/laravel.log

# Ou no Windows PowerShell
Get-Content storage/logs/laravel.log -Tail 50 -Wait
```

### 2. Logs de Emergência
**Caminho:** `storage/logs/laravel.log` (mesmo arquivo)

Logs de emergência também são gravados no mesmo arquivo.

## 🔧 Configuração de Logging

### Variáveis de Ambiente (`.env`)
```env
LOG_CHANNEL=stack          # Canal padrão (stack, single, daily, etc.)
LOG_LEVEL=debug            # Nível de log (debug, info, warning, error, critical)
LOG_DEPRECATIONS_CHANNEL=null  # Canal para depreciações
```

### Canais Disponíveis

1. **`stack`** (padrão)
   - Combina múltiplos canais
   - Atualmente usa: `single`

2. **`single`**
   - Um único arquivo: `storage/logs/laravel.log`
   - Sem rotação automática

3. **`daily`**
   - Arquivos separados por data
   - Formato: `laravel-YYYY-MM-DD.log`
   - Mantém logs por 14 dias (configurável)

4. **`slack`**
   - Envia logs para Slack (via webhook)

5. **`syslog`**
   - Usa o syslog do sistema operacional

6. **`errorlog`**
   - Usa o error_log do PHP

## 📝 Como Usar Logs no Código

```php
use Illuminate\Support\Facades\Log;

// Log de informação
Log::info('Mensagem de informação');

// Log de erro
Log::error('Erro ocorrido', ['context' => $data]);

// Log de warning
Log::warning('Aviso');

// Log de debug
Log::debug('Debug info', ['var' => $value]);

// Log de emergência
Log::emergency('Emergência!');

// Usar canal específico
Log::channel('daily')->info('Log em canal específico');
```

## 🗂️ Estrutura de Diretórios

```
storage/
├── logs/
│   └── laravel.log          ← Log principal da aplicação
├── framework/
│   ├── cache/               ← Cache do framework
│   ├── sessions/            ← Sessões
│   └── views/              ← Views compiladas
└── app/
    └── public/             ← Arquivos públicos
```

## 🔍 Outros Locais de Logs (Sistema)

### Logs do PHP (XAMPP)
**Caminho:** `C:\xampp\php\logs\php_error_log`

Logs de erros do PHP são gravados aqui pelo XAMPP.

### Logs do Apache (XAMPP)
**Caminho:** `C:\xampp\apache\logs\`

Arquivos:
- `error.log` - Erros do Apache
- `access.log` - Acessos ao servidor

### Logs do MySQL (XAMPP)
**Caminho:** `C:\xampp\mysql\data\`

## 📊 Níveis de Log

Os níveis de log disponíveis (em ordem de severidade):

1. **`debug`** - Informações detalhadas para debug
2. **`info`** - Informações gerais
3. **`notice`** - Avisos normais mas significativos
4. **`warning`** - Avisos (algo inesperado, mas não erro)
5. **`error`** - Erros que não impedem a execução
6. **`critical`** - Erros críticos
7. **`alert`** - Ações imediatas necessárias
8. **`emergency`** - Sistema inutilizável

## 🛠️ Comandos Úteis

### Limpar Logs
```bash
# Limpar arquivo de log (cuidado!)
> storage/logs/laravel.log

# Ou via Artisan
php artisan log:clear  # Se o comando existir
```

### Ver Logs em Tempo Real
```bash
# Linux/Mac
tail -f storage/logs/laravel.log

# Windows PowerShell
Get-Content storage/logs/laravel.log -Tail 50 -Wait

# Windows CMD
powershell -Command "Get-Content storage/logs/laravel.log -Tail 50 -Wait"
```

### Filtrar Logs
```bash
# Ver apenas erros
grep "ERROR" storage/logs/laravel.log

# Ver logs de hoje
grep "$(date +%Y-%m-%d)" storage/logs/laravel.log
```

## ⚙️ Configuração Avançada

### Mudar para Logs Diários
No arquivo `.env`:
```env
LOG_CHANNEL=daily
```

Isso criará arquivos separados por data:
- `laravel-2025-01-15.log`
- `laravel-2025-01-16.log`
- etc.

### Mudar Nível de Log
No arquivo `.env`:
```env
LOG_LEVEL=error  # Apenas erros e acima
```

## 📌 Notas Importantes

1. **Permissões:** Certifique-se de que a pasta `storage/logs/` tem permissão de escrita
2. **Tamanho:** Monitore o tamanho do arquivo de log para não ocupar muito espaço
3. **Segurança:** Não exponha logs em produção (eles podem conter informações sensíveis)
4. **Rotação:** Use `daily` em produção para evitar arquivos muito grandes

## 🔐 Segurança

⚠️ **ATENÇÃO:** Os logs podem conter informações sensíveis:
- Senhas (se logadas acidentalmente)
- Tokens de autenticação
- Dados pessoais
- Informações de banco de dados

**Recomendações:**
- Não commite arquivos de log no Git (já está no `.gitignore`)
- Configure rotação de logs em produção
- Monitore o tamanho dos arquivos de log
- Use níveis de log apropriados em produção (`error` ou `warning`)
