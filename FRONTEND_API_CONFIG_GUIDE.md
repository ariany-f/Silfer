# Guia de Configuração da URL da API no Frontend

Este guia explica como configurar a URL da API no frontend para conectar corretamente com o backend.

## 🔍 Como Funciona

O frontend usa o arquivo `resources/pos/src/config/environment.js` para determinar a URL da API. Por padrão, ele detecta automaticamente a URL baseada na URL atual do navegador.

## ⚙️ Configuração Automática

O sistema detecta automaticamente:
- **Protocolo** (http ou https)
- **Hostname** (localhost, pos_saas.local, etc.)
- **Porta** (8000, 8080, etc.)

## 🎯 Configuração para Diferentes Cenários

### Cenário 1: Laravel Serve na Porta 8000

**Acesse o frontend em:**
```
http://localhost:8000
```

**A API será acessada em:**
```
http://localhost:8000/api
```

### Cenário 2: XAMPP na Porta 8080

**Acesse o frontend em:**
```
http://localhost:8080/possaas/pos-saas/public
```

**A API será acessada em:**
```
http://localhost:8080/possaas/pos-saas/public/api
```

### Cenário 3: Virtual Host (pos_saas.local)

**Configure o hosts:**
```
127.0.0.1    pos_saas.local
```

**Acesse o frontend em:**
```
http://pos_saas.local:8080
```

**A API será acessada em:**
```
http://pos_saas.local:8080/api
```

## 🔧 Solução de Problemas

### Erro: ERR_CONNECTION_REFUSED

**Causa:** O servidor não está rodando ou a URL está incorreta.

**Soluções:**

1. **Verifique se o servidor está rodando:**
   ```bash
   # Se usando Laravel serve
   php artisan serve --port=8080
   
   # Ou se usando XAMPP
   # Verifique se o Apache está rodando no painel do XAMPP
   ```

2. **Verifique a URL no navegador:**
   - O frontend deve estar acessível
   - A URL deve corresponder à configuração do servidor

3. **Teste a API diretamente:**
   ```
   http://localhost:8080/api/languages
   ```
   
   Se funcionar no navegador, o problema é apenas na configuração do frontend.

4. **Verifique o arquivo hosts (se usar domínio customizado):**
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```
   
   Deve conter:
   ```
   127.0.0.1    pos_saas.local
   ```

### Erro: CORS ou 404

**Causa:** A URL da API está incorreta ou o servidor não está configurado.

**Soluções:**

1. **Verifique o arquivo `.env` do Laravel:**
   ```env
   APP_URL=http://localhost:8080
   ```

2. **Limpe o cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Verifique as rotas da API:**
   ```bash
   php artisan route:list --path=api
   ```

## 🔄 Configuração Manual (Avançado)

Se precisar forçar uma URL específica, você pode modificar `environment.js`:

```javascript
export const environment = {
    // URL fixa (substitua pela sua URL)
    URL: 'http://localhost:8080',
    
    // Ou com caminho completo
    // URL: 'http://localhost:8080/possaas/pos-saas/public',
};
```

**⚠️ Atenção:** Após modificar, você precisa fazer o build novamente:

```bash
npm run production
```

## 📝 Checklist de Verificação

Use este checklist para garantir que tudo está configurado:

- [ ] Servidor está rodando (Laravel serve ou XAMPP Apache)
- [ ] MySQL está rodando (se usar XAMPP)
- [ ] URL do frontend corresponde à URL do backend
- [ ] Porta está correta (8080, 8000, etc.)
- [ ] Arquivo `.env` está configurado corretamente
- [ ] Cache do Laravel foi limpo
- [ ] Arquivo hosts está configurado (se usar domínio customizado)
- [ ] Build do frontend foi executado após mudanças

## 🧪 Teste Rápido

1. **Teste a API diretamente no navegador:**
   ```
   http://localhost:8080/api/languages
   ```
   
   Deve retornar JSON, não erro de conexão.

2. **Verifique o console do navegador:**
   - Abra DevTools (F12)
   - Vá na aba Network
   - Recarregue a página
   - Veja qual URL está sendo chamada

3. **Verifique os logs do Laravel:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

## 💡 Dicas

- **Sempre use a mesma porta** para frontend e backend
- **Se mudar a porta**, faça o build do frontend novamente
- **Limpe o cache** após mudanças no `.env`
- **Use Virtual Host** para URLs mais limpas

---

**Última atualização:** Dezembro 2024
