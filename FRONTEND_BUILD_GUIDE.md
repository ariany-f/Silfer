# Guia de Build do Frontend - POS SaaS

Este guia explica como fazer o build do sistema frontend do POS SaaS.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 14.x ou superior recomendada)
- **npm** (geralmente vem com Node.js) ou **yarn**
- **Git** (para clonar o repositório, se necessário)

### Verificando as versões instaladas

```bash
node --version
npm --version
```

## 🚀 Instalação das Dependências

1. **Navegue até o diretório do projeto:**

```bash
cd pos-saas
```

2. **Instale as dependências do npm:**

```bash
npm install
```

Este comando irá instalar todas as dependências listadas no `package.json`, incluindo:
- React e suas bibliotecas relacionadas
- Laravel Mix (ferramenta de build)
- Bootstrap e outras bibliotecas de UI
- Redux e outras dependências do projeto

**Nota:** A primeira instalação pode levar alguns minutos dependendo da sua conexão com a internet.

## 🔨 Comandos de Build Disponíveis

O projeto possui vários comandos de build configurados no `package.json`:

### 1. **Desenvolvimento (Development)**

Compila os assets sem minificação, ideal para desenvolvimento:

```bash
npm run dev
# ou
npm run development
```

**Características:**
- Compilação rápida
- Sem minificação
- Source maps habilitados para debug
- Arquivos gerados em `public/js/` e `public/css/`

### 2. **Watch Mode (Modo de Observação)**

Compila os assets e observa mudanças nos arquivos, recompilando automaticamente:

```bash
npm run watch
```

**Características:**
- Recompila automaticamente quando arquivos são modificados
- Ideal para desenvolvimento contínuo
- Mantém o processo rodando até ser interrompido (Ctrl+C)

### 3. **Watch Poll (Para Sistemas de Arquivos Remotos)**

Similar ao watch, mas usa polling para detectar mudanças (útil para sistemas de arquivos remotos ou WSL):

```bash
npm run watch-poll
```

### 4. **Hot Module Replacement (HMR)**

Compila com hot reload, atualizando o navegador automaticamente:

```bash
npm run hot
```

**Características:**
- Atualiza o navegador automaticamente quando há mudanças
- Mantém o estado da aplicação
- Requer configuração adicional no Laravel

### 5. **Produção (Production)**

Compila os assets para produção com otimizações:

```bash
npm run prod
# ou
npm run production
```

**Características:**
- Minificação de código JavaScript e CSS
- Otimizações de performance
- Remoção de código não utilizado
- Gera arquivos otimizados em `public/js/` e `public/css/`
- Adiciona hash aos nomes dos arquivos para cache busting

### 6. **Build RTL (Right-to-Left)**

Gera versões RTL dos arquivos CSS para idiomas como árabe:

```bash
npm run rtl
```

**Características:**
- Gera arquivos CSS com suporte RTL
- Arquivos gerados em `resources/pos/src/assets/css/`
- Cria arquivos `.rtl.css` correspondentes

## 📁 Estrutura de Arquivos do Build

Após executar o build, os arquivos compilados serão gerados em:

```
pos-saas/
├── public/
│   ├── js/
│   │   ├── app.js          # Aplicação React principal
│   │   └── chunks/         # Chunks de código divididos
│   └── css/
│       └── app.css         # Estilos compilados
└── resources/
    └── pos/
        └── src/
            └── assets/
                └── css/    # Arquivos CSS RTL (se gerados)
```

## 🔧 Configuração do Webpack

O projeto usa **Laravel Mix** que é uma camada de abstração sobre o Webpack. Os arquivos de configuração são:

- `webpack.mix.js` - Configuração principal do Mix
- `webpack-rtl.config.js` - Configuração para build RTL

### Entradas principais (Entry Points)

Conforme configurado no `webpack.mix.js`:

1. **Aplicação React Principal:**
   - Entrada: `resources/pos/src/index.js`
   - Saída: `public/js/app.js`

2. **JavaScript Customizado:**
   - Entrada: `resources/assets/js/custom.js`
   - Saída: `public/assets/js/custom/custom.js`

3. **JavaScript Admin:**
   - Entrada: `resources/js/app.js`
   - Saída: `public/js/app.js`

## 🛠️ Processo de Build Completo

### Para Desenvolvimento:

```bash
# 1. Instalar dependências (apenas na primeira vez)
npm install

# 2. Iniciar modo watch para desenvolvimento
npm run watch
```

### Para Produção:

```bash
# 1. Instalar dependências (apenas na primeira vez)
npm install

# 2. Executar build de produção
npm run production

# 3. (Opcional) Gerar arquivos RTL se necessário
npm run rtl
```

## 🐛 Solução de Problemas Comuns

### Erro: "Cannot find module"

**Problema:** Dependências não instaladas ou corrompidas.

**Solução:**
```bash
# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar dependências
npm install
```

### Erro: "ENOSPC: System limit for number of file watchers reached"

**Problema:** Limite do sistema para observadores de arquivos excedido (Linux).

**Solução:**
```bash
# Aumentar o limite temporariamente
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

### Build muito lento

**Soluções:**
- Use `npm run production` apenas para builds finais
- Use `npm run watch` durante desenvolvimento
- Considere aumentar a memória do Node.js:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  ```

### Arquivos não estão sendo atualizados

**Solução:**
```bash
# Limpar cache e rebuildar
npm run production
# ou
php artisan cache:clear
php artisan config:clear
```

## 📝 Variáveis de Ambiente

Certifique-se de que o arquivo `.env` está configurado corretamente:

```env
APP_URL=http://localhost
MIX_APP_URL="${APP_URL}"
```

## 🔍 Verificando o Build

Após executar o build, você pode verificar se os arquivos foram gerados:

```bash
# Verificar arquivos JavaScript gerados
ls -lh public/js/

# Verificar arquivos CSS gerados
ls -lh public/css/

# Verificar manifest do Mix
cat public/mix-manifest.json
```

## 🚀 Deploy em Produção

Para fazer deploy em produção:

1. **No servidor de produção, execute:**

```bash
# Instalar dependências de produção
npm ci --production

# Executar build de produção
npm run production

# (Opcional) Gerar arquivos RTL
npm run rtl
```

2. **Certifique-se de que os arquivos em `public/` têm as permissões corretas:**

```bash
chmod -R 755 public/js public/css
```

3. **Limpar cache do Laravel:**

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

## 📚 Comandos Úteis Adicionais

### Limpar arquivos compilados:

```bash
# Remover arquivos gerados
rm -rf public/js public/css
```

### Verificar tamanho dos arquivos gerados:

```bash
du -sh public/js/*
du -sh public/css/*
```

### Verificar dependências desatualizadas:

```bash
npm outdated
```

## ⚙️ Otimizações de Build

### Para reduzir o tamanho do bundle:

1. **Análise do bundle:**
   - Use ferramentas como `webpack-bundle-analyzer` para identificar dependências grandes

2. **Code Splitting:**
   - O projeto já está configurado com code splitting através do Laravel Mix
   - Chunks são gerados automaticamente em `public/js/chunks/`

3. **Tree Shaking:**
   - O build de produção já remove código não utilizado automaticamente

## 📞 Suporte

Se encontrar problemas durante o build:

1. Verifique os logs de erro no terminal
2. Certifique-se de que todas as dependências estão instaladas
3. Verifique se a versão do Node.js é compatível
4. Consulte a documentação do Laravel Mix: https://laravel-mix.com/

## 📌 Notas Importantes

- **Sempre execute `npm run production` antes de fazer deploy em produção**
- **Não commite os arquivos em `public/js/` e `public/css/` se estiverem usando Git** (adicionar ao `.gitignore`)
- **O build de produção pode levar alguns minutos dependendo do hardware**
- **Mantenha as dependências atualizadas regularmente para segurança**

---

**Última atualização:** Dezembro 2024
