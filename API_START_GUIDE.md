# Guia de Inicialização da API - POS SaaS

Este guia explica como iniciar e rodar a API Laravel do sistema POS SaaS.

## 📋 Pré-requisitos

Antes de iniciar a API, certifique-se de ter:

- **PHP** (versão 8.1 ou superior)
- **Composer** instalado
- **MySQL/MariaDB** rodando (via XAMPP ou outro)
- **XAMPP** ou servidor web configurado (Apache/Nginx)
- Arquivo `.env` configurado

## 🔧 Configuração Inicial

### 1. Verificar Instalação do PHP e Composer

```bash
php --version
composer --version
```

### 2. Instalar Dependências do Composer

```bash
cd pos-saas
composer install
```

**Nota:** Se já instalou antes, use `composer update` para atualizar.

### 3. Configurar o Arquivo .env

Certifique-se de que o arquivo `.env` existe e está configurado:

```bash
# Se não existir, copie do exemplo
copy .env.example .env
```

**Configurações importantes no `.env`:**

**Para porta padrão (80 ou 8000):**
```env
APP_NAME="POS SaaS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nome_do_banco
DB_USERNAME=root
DB_PASSWORD=
```

**Para XAMPP na porta 8080:**
```env
APP_NAME="POS SaaS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nome_do_banco
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Gerar Chave da Aplicação

```bash
php artisan key:generate
```

### 5. Executar Migrations

```bash
php artisan migrate
```

**Ou se quiser popular com dados de exemplo:**

```bash
php artisan migrate --seed
```

### 6. Criar Link Simbólico para Storage

```bash
php artisan storage:link
```

## 🚀 Iniciar a API

### Opção 1: Servidor de Desenvolvimento do Laravel (Recomendado para Desenvolvimento)

O Laravel possui um servidor embutido para desenvolvimento:

**Porta padrão (8000):**
```bash
php artisan serve
```
Isso iniciará o servidor em: **http://localhost:8000**

**Porta personalizada (exemplo: 8080):**
```bash
php artisan serve --port=8080
```
Isso iniciará o servidor em: **http://localhost:8080**

**Porta e host personalizados:**
```bash
php artisan serve --host=0.0.0.0 --port=8080
```

**Para rodar em background (Windows PowerShell):**
```powershell
Start-Process php -ArgumentList "artisan serve --port=8080" -WindowStyle Hidden
```

### Opção 2: Usando XAMPP (Produção/Desenvolvimento Local)

Se você está usando XAMPP:

1. **Inicie o Apache e MySQL** no painel do XAMPP

2. **Configure a porta do Apache** (se usar porta diferente de 80)

   Edite `C:\xampp\apache\conf\httpd.conf` e procure por:
   ```apache
   Listen 80
   ```
   
   **Para usar porta 8080:**
   ```apache
   Listen 8080
   ```
   
   **Para usar múltiplas portas (80 e 8080):**
   ```apache
   Listen 80
   Listen 8080
   ```
   
   **Importante:** Após alterar, reinicie o Apache no XAMPP.

3. **Configure o Virtual Host** (opcional, mas recomendado)

   Edite `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

   **Para porta 80 (padrão):**
   ```apache
   <VirtualHost *:80>
       ServerName pos-saas.local
       DocumentRoot "C:/xampp/htdocs/possaas/pos-saas/public"
       <Directory "C:/xampp/htdocs/possaas/pos-saas/public">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

   **Para porta 8080:**
   ```apache
   <VirtualHost *:8080>
       ServerName pos-saas.local
       DocumentRoot "C:/xampp/htdocs/possaas/pos-saas/public"
       <Directory "C:/xampp/htdocs/possaas/pos-saas/public">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

4. **Adicione ao hosts** (`C:\Windows\System32\drivers\etc\hosts`):

   ```
   127.0.0.1    pos-saas.local
   ```

5. **Acesse:**
   - Porta 80: http://pos-saas.local ou http://localhost/possaas/pos-saas/public
   - Porta 8080: http://pos-saas.local:8080 ou http://localhost:8080/possaas/pos-saas/public

### Opção 3: Usando PHP Built-in Server com Configuração Customizada

**Porta padrão (8000):**
```bash
php -S localhost:8000 -t public
```

**Porta personalizada (exemplo: 8080):**
```bash
php -S localhost:8080 -t public
```

**Para acessar de outros dispositivos na rede:**
```bash
php -S 0.0.0.0:8080 -t public
```

## ⚠️ Problema Comum: ERR_CONNECTION_REFUSED

Se você está recebendo `ERR_CONNECTION_REFUSED` ao acessar o frontend:

1. **Verifique se o servidor está rodando:**
   ```bash
   # Para Laravel serve
   php artisan serve --port=8080
   
   # Ou verifique se o Apache está rodando no XAMPP
   ```

2. **Teste a API diretamente no navegador:**
   ```
   http://localhost:8080/api/languages
   ```
   
   Se retornar JSON, o servidor está funcionando. Se der erro, o servidor não está rodando.

3. **Verifique a URL no console do navegador:**
   - Abra DevTools (F12)
   - Vá na aba Network
   - Veja qual URL está sendo chamada
   - Deve ser: `http://localhost:8080/api/...` ou `http://pos_saas.local:8080/api/...`

4. **Se usar domínio customizado (pos_saas.local):**
   - Verifique o arquivo hosts: `C:\Windows\System32\drivers\etc\hosts`
   - Deve conter: `127.0.0.1    pos_saas.local`
   - Reinicie o navegador após alterar

## 🔍 Verificar se a API Está Rodando

### Teste Básico

**Se usando `php artisan serve` na porta padrão:**
```
http://localhost:8000/api
```

**Se usando `php artisan serve --port=8080`:**
```
http://localhost:8080/api
```

**Se usando XAMPP na porta padrão (80):**
```
http://localhost/possaas/pos-saas/public/api
```

**Se usando XAMPP na porta 8080:**
```
http://localhost:8080/possaas/pos-saas/public/api
```

### Teste de Endpoint Específico

Teste um endpoint da API, por exemplo:

**Porta 8000 (padrão Laravel):**
```bash
# Via curl
curl http://localhost:8000/api/products

# Ou via navegador
http://localhost:8000/api/products
```

**Porta 8080 (XAMPP customizado):**
```bash
# Via curl
curl http://localhost:8080/api/products

# Ou via navegador
http://localhost:8080/api/products
```

## 📝 Comandos Úteis do Artisan

### Limpar Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Ver Rotas da API

```bash
php artisan route:list --path=api
```

### Verificar Configuração

```bash
php artisan config:show
```

### Executar Queue (se usar filas)

```bash
php artisan queue:work
```

## 🛠️ Solução de Problemas Comuns

### Erro: "Class not found" ou "Autoload error"

```bash
composer dump-autoload
```

### Erro: "Permission denied" no storage

**Windows:**
```bash
# Dar permissões às pastas
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T
```

**Linux/Mac:**
```bash
chmod -R 775 storage bootstrap/cache
```

### Erro: "SQLSTATE[HY000] [2002] No connection"

- Verifique se o MySQL está rodando
- Verifique as credenciais no `.env`
- Teste a conexão:

```bash
php artisan tinker
>>> DB::connection()->getPdo();
```

### Erro: "500 Internal Server Error"

1. Verifique os logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. Limpe o cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

3. Verifique permissões do storage

### Porta 8000 já está em uso

Use outra porta:

```bash
# Exemplo: usar porta 8080
php artisan serve --port=8080

# Ou qualquer outra porta disponível
php artisan serve --port=3000
php artisan serve --port=9000
```

**Verificar qual porta está em uso (Windows):**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

**Verificar qual porta está em uso (Linux/Mac):**
```bash
lsof -i :8000
lsof -i :8080
```

## 🔐 Configuração de Autenticação

A API usa autenticação via tokens. Certifique-se de que:

1. **Sanctum está configurado** (já vem com Laravel)
2. **CORS está configurado** em `config/cors.php`
3. **Middleware de autenticação** está aplicado nas rotas

## 📡 Endpoints da API

A API está disponível em:

**Porta padrão (8000):**
- **Base URL:** `http://localhost:8000/api`
- **Admin:** `http://localhost:8000/api/sadmin`

**Porta 8080 (XAMPP customizado):**
- **Base URL:** `http://localhost:8080/api`
- **Admin:** `http://localhost:8080/api/sadmin`

**Ou se usando XAMPP com caminho completo:**
- **Base URL:** `http://localhost:8080/possaas/pos-saas/public/api`
- **Admin:** `http://localhost:8080/possaas/pos-saas/public/api/sadmin`

### Exemplos de Endpoints:

```
GET    /api/products
POST   /api/products
GET    /api/main-products
POST   /api/main-products/bulk-update
POST   /api/main-products/bulk-duplicate
GET    /api/customers
GET    /api/sales
```

## 🚦 Status da API

Para verificar se tudo está funcionando:

```bash
php artisan about
```

Este comando mostra:
- Versão do Laravel
- Versão do PHP
- Status do ambiente
- Configurações importantes

## 📌 Comandos Rápidos de Inicialização

**Script completo de inicialização (execute na primeira vez):**

```bash
# 1. Instalar dependências
composer install

# 2. Configurar .env (se necessário)
copy .env.example .env

# 3. Gerar chave
php artisan key:generate

# 4. Executar migrations
php artisan migrate

# 5. Criar link de storage
php artisan storage:link

# 6. Limpar cache
php artisan cache:clear
php artisan config:clear

# 7. Iniciar servidor
# Porta padrão (8000):
php artisan serve

# Ou porta personalizada (8080):
php artisan serve --port=8080
```

## 🔧 Configuração de Porta no .env

Você também pode configurar a porta padrão no arquivo `.env`:

**Para Laravel serve na porta 8000:**
```env
APP_URL=http://localhost:8000
```

**Para Laravel serve na porta 8080:**
```env
APP_URL=http://localhost:8080
```

**Para XAMPP na porta padrão (80):**
```env
APP_URL=http://localhost
```

**Para XAMPP na porta 8080:**
```env
APP_URL=http://localhost:8080
```

**Para XAMPP na porta 8080 com caminho completo:**
```env
APP_URL=http://localhost:8080/possaas/pos-saas/public
```

**Importante:** Após alterar o `.env`, limpe o cache:

```bash
php artisan config:clear
php artisan cache:clear
```

## 🎯 Configuração Rápida para XAMPP na Porta 8080

**Passo a passo completo para usar XAMPP na porta 8080:**

1. **Configure o Apache para porta 8080:**
   - Abra `C:\xampp\apache\conf\httpd.conf`
   - Procure por `Listen 80`
   - Altere para `Listen 8080` (ou adicione `Listen 8080` se quiser manter ambas)
   - Salve o arquivo
   - Reinicie o Apache no painel do XAMPP

2. **Configure o .env:**
   ```env
   APP_URL=http://localhost:8080
   ```
   
   Ou se preferir com o caminho completo:
   ```env
   APP_URL=http://localhost:8080/possaas/pos-saas/public
   ```

3. **Limpe o cache do Laravel:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

4. **Acesse a API:**
   - **Com caminho completo:** `http://localhost:8080/possaas/pos-saas/public/api`
   - **Com Virtual Host (se configurado):** `http://pos-saas.local:8080/api`

5. **Configurar Virtual Host (Opcional, mas recomendado):**
   
   Edite `C:\xampp\apache\conf\extra\httpd-vhosts.conf` e adicione:
   ```apache
   <VirtualHost *:8080>
       ServerName pos-saas.local
       DocumentRoot "C:/xampp/htdocs/possaas/pos-saas/public"
       <Directory "C:/xampp/htdocs/possaas/pos-saas/public">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```
   
   Adicione ao arquivo hosts (`C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1    pos-saas.local
   ```
   
   Reinicie o Apache e acesse: `http://pos-saas.local:8080/api`

## 🔄 Reiniciar a API

Se precisar reiniciar:

1. **Pare o servidor:** Pressione `Ctrl + C` no terminal
2. **Limpe o cache:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```
3. **Inicie novamente:**
   ```bash
   php artisan serve
   ```

## 🌐 Acessar a API de Outros Dispositivos na Rede

Para acessar de outros dispositivos na mesma rede:

**Porta padrão (8000):**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

**Porta 8080:**
```bash
php artisan serve --host=0.0.0.0 --port=8080
```

Depois acesse de outro dispositivo usando o IP da máquina:

**Porta 8000:**
```
http://192.168.1.100:8000/api
```

**Porta 8080:**
```
http://192.168.1.100:8080/api
```

**Descobrir seu IP (Windows):**
```powershell
ipconfig
# Procure por "IPv4 Address"
```

**Descobrir seu IP (Linux/Mac):**
```bash
ifconfig
# ou
ip addr show
```

## 📚 Comandos Adicionais Úteis

### Ver Logs em Tempo Real

```bash
# Windows PowerShell
Get-Content storage\logs\laravel.log -Wait -Tail 50

# Linux/Mac
tail -f storage/logs/laravel.log
```

### Executar Tinker (Console Interativo)

```bash
php artisan tinker
```

### Verificar Rotas

```bash
php artisan route:list
```

### Otimizar Performance

```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## ⚠️ Notas Importantes

1. **O servidor `php artisan serve` é apenas para desenvolvimento**
   - Não use em produção
   - Use Apache/Nginx em produção

2. **Sempre verifique o `.env`** antes de iniciar
   - Certifique-se de que `APP_DEBUG=true` apenas em desenvolvimento
   - Em produção, use `APP_DEBUG=false`

3. **Mantenha o MySQL rodando** enquanto a API estiver ativa

4. **Para produção**, configure:
   - Servidor web (Apache/Nginx)
   - SSL/HTTPS
   - Firewall
   - Otimizações de performance

---

**Última atualização:** Dezembro 2024
