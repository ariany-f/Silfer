# Guia de Arquivos para Deploy no Servidor Remoto

Este guia lista exatamente quais pastas e arquivos precisam ser atualizados no servidor remoto após fazer o build do frontend.

## 📦 Arquivos Gerados pelo Build

Após executar `npm run production`, os seguintes arquivos são gerados e **DEVEM** ser enviados ao servidor:

### ✅ Pastas e Arquivos Obrigatórios para Deploy

```
pos-saas/
├── public/
│   ├── js/
│   │   ├── app.js              ⭐ OBRIGATÓRIO
│   │   ├── app.js.map          ⭐ OBRIGATÓRIO (source map)
│   │   └── chunks/             ⭐ OBRIGATÓRIO
│   │       └── *.js            ⭐ Todos os arquivos de chunks
│   ├── assets/
│   │   └── js/
│   │       └── custom/
│   │           └── custom.js  ⭐ OBRIGATÓRIO
│   ├── mix-manifest.json       ⭐ OBRIGATÓRIO
│   └── images/                 ⭐ OBRIGATÓRIO (se houver imagens)
│
└── resources/
    └── pos/
        └── src/
            └── assets/
                └── css/        ⚠️ OPCIONAL (apenas se usar RTL)
                    └── *.rtl.css
```

## 🚀 Processo de Deploy Simplificado

### Opção 1: Deploy Direto no Servidor (Recomendado)

**Execute o build diretamente no servidor de produção:**

```bash
# 1. Conecte-se ao servidor via SSH
ssh usuario@seu-servidor.com

# 2. Navegue até o diretório do projeto
cd /caminho/para/pos-saas

# 3. Faça pull das últimas alterações (se usar Git)
git pull origin main

# 4. Instale/atualize dependências (se necessário)
npm install

# 5. Execute o build de produção
npm run production

# 6. (Opcional) Se usar RTL
npm run rtl

# 7. Limpe o cache do Laravel
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 8. Ajuste permissões
chmod -R 755 public/js public/css public/assets
```

### Opção 2: Deploy via Upload de Arquivos

**Se você fez o build localmente e quer enviar apenas os arquivos compilados:**

#### Arquivos que DEVEM ser enviados:

```bash
# Estrutura completa dos arquivos a enviar:
public/
├── js/
│   ├── app.js
│   ├── app.js.map
│   └── chunks/
│       └── [todos os arquivos .js]
├── assets/
│   └── js/
│       └── custom/
│           └── custom.js
└── mix-manifest.json
```

#### Comandos para copiar apenas os arquivos necessários:

**No seu computador local (após o build):**

```bash
# Criar um arquivo tar com apenas os arquivos compilados
tar -czf frontend-build.tar.gz \
  public/js/ \
  public/assets/js/custom/ \
  public/mix-manifest.json

# Ou usar zip
zip -r frontend-build.zip \
  public/js/ \
  public/assets/js/custom/ \
  public/mix-manifest.json
```

**No servidor remoto:**

```bash
# 1. Fazer upload do arquivo (via SCP, FTP, etc)
# Exemplo com SCP:
scp frontend-build.tar.gz usuario@servidor:/caminho/para/pos-saas/

# 2. Conectar ao servidor
ssh usuario@servidor

# 3. Navegar até o diretório
cd /caminho/para/pos-saas

# 4. Extrair os arquivos
tar -xzf frontend-build.tar.gz

# 5. Ajustar permissões
chmod -R 755 public/js public/assets

# 6. Limpar cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

## 📋 Checklist de Deploy

Use este checklist para garantir que tudo foi atualizado:

- [ ] Arquivos em `public/js/app.js` e `app.js.map` atualizados
- [ ] Todos os arquivos em `public/js/chunks/` atualizados
- [ ] Arquivo `public/assets/js/custom/custom.js` atualizado
- [ ] Arquivo `public/mix-manifest.json` atualizado
- [ ] (Se usar RTL) Arquivos CSS RTL em `resources/pos/src/assets/css/` atualizados
- [ ] Permissões dos arquivos ajustadas (755)
- [ ] Cache do Laravel limpo
- [ ] Testado no navegador (Ctrl+F5 para limpar cache do browser)

## 🔍 Verificando se o Deploy Funcionou

### 1. Verificar arquivos no servidor:

```bash
# Verificar se os arquivos existem
ls -lh public/js/app.js
ls -lh public/js/chunks/
ls -lh public/mix-manifest.json

# Verificar tamanho dos arquivos (devem ter tamanho significativo)
du -sh public/js/*
```

### 2. Verificar no navegador:

1. Abra o site no navegador
2. Abra o DevTools (F12)
3. Vá na aba **Network**
4. Recarregue a página (Ctrl+F5)
5. Verifique se os arquivos `app.js` estão sendo carregados
6. Verifique se não há erros 404 para arquivos JavaScript

### 3. Verificar console do navegador:

- Não deve haver erros de JavaScript
- Não deve haver erros de "arquivo não encontrado"

## 🗂️ Estrutura Detalhada dos Arquivos

### Arquivos Principais:

```
public/js/
├── app.js                    # Aplicação React compilada (~2-5MB em produção)
├── app.js.map               # Source map para debug
└── chunks/
    ├── vendors.js           # Bibliotecas externas
    ├── vendors.js.map
    └── [outros chunks]     # Código dividido por rotas/componentes

public/assets/js/custom/
└── custom.js                # JavaScript customizado

public/mix-manifest.json     # Manifesto do Laravel Mix com versões dos arquivos
```

### Exemplo de conteúdo do `mix-manifest.json`:

```json
{
    "/js/app.js": "/js/app.js?id=abc123def456",
    "/assets/js/custom/custom.js": "/assets/js/custom/custom.js?id=xyz789"
}
```

## ⚠️ Arquivos que NÃO devem ser enviados

**NÃO envie estes arquivos ao servidor:**

```
node_modules/          # Dependências (instalar no servidor)
resources/pos/src/     # Código fonte (não necessário em produção)
.git/                  # Controle de versão
.env                   # Variáveis de ambiente (configurar separadamente)
storage/logs/          # Logs locais
bootstrap/cache/       # Cache local
```

## 🔄 Atualização Incremental

Se você fez apenas pequenas alterações e quer atualizar apenas arquivos específicos:

### Atualizar apenas JavaScript:

```bash
# No servidor
scp public/js/app.js usuario@servidor:/caminho/para/pos-saas/public/js/
scp -r public/js/chunks usuario@servidor:/caminho/para/pos-saas/public/js/
```

### Atualizar apenas manifest:

```bash
scp public/mix-manifest.json usuario@servidor:/caminho/para/pos-saas/public/
```

## 🛠️ Script de Deploy Automatizado

Você pode criar um script para automatizar o processo:

**`deploy-frontend.sh`:**

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do frontend..."

# Build de produção
echo "📦 Executando build..."
npm run production

# Verificar se o build foi bem-sucedido
if [ ! -f "public/js/app.js" ]; then
    echo "❌ Erro: Build falhou!"
    exit 1
fi

# Listar arquivos que serão enviados
echo "📋 Arquivos gerados:"
ls -lh public/js/app.js
ls -lh public/mix-manifest.json

echo "✅ Build concluído com sucesso!"
echo "📤 Próximo passo: Enviar arquivos ao servidor"
```

**Tornar executável:**

```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## 📝 Notas Importantes

1. **Sempre faça backup** antes de atualizar arquivos no servidor
2. **Teste em ambiente de staging** antes de produção
3. **Limpe o cache do navegador** após o deploy (Ctrl+F5)
4. **Verifique os logs** do servidor se houver problemas
5. **Mantenha versões antigas** dos arquivos por segurança

## 🆘 Solução de Problemas

### Arquivos não estão sendo carregados:

```bash
# Verificar permissões
ls -la public/js/

# Ajustar permissões
chmod -R 755 public/js public/assets

# Verificar se o servidor web tem acesso
sudo chown -R www-data:www-data public/js
```

### Cache do navegador:

- Use Ctrl+F5 para limpar cache
- Ou abra em modo anônimo/privado

### Erro 404 nos arquivos:

- Verifique se o `mix-manifest.json` está atualizado
- Verifique se os caminhos no HTML estão corretos
- Limpe o cache do Laravel: `php artisan cache:clear`

---

**Última atualização:** Dezembro 2024
