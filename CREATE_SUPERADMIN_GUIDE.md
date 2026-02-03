# Guia: Como Criar um Segundo Super Admin

Este guia explica quais tabelas precisam ser preenchidas para criar um segundo superadmin no sistema.

## Tabelas Necessárias

### 1. Tabela `users`
Campos obrigatórios:
- `first_name` - Primeiro nome
- `last_name` - Sobrenome (pode ser NULL)
- `email` - E-mail (deve ser único)
- `password` - Senha (hash bcrypt)
- `tenant_id` - Deve ser **NULL** para superadmin
- `status` - 1 = ativo, 0 = inativo
- `email_verified_at` - Data de verificação (pode ser NOW())
- `created_at` - Data de criação
- `updated_at` - Data de atualização

Campos opcionais:
- `phone` - Telefone
- `region` - Região
- `language` - Idioma (ex: 'pt', 'en')

### 2. Tabela `roles`
- Deve existir um role com `name = 'superadmin'`
- Se não existir, precisa criar primeiro

### 3. Tabela `model_has_roles` (Spatie Permission)
- Relaciona o usuário com o role
- Campos:
  - `role_id` - ID do role 'superadmin'
  - `model_type` - 'App\\Models\\User'
  - `model_id` - ID do usuário criado

## Métodos para Criar

### Método 1: Via SQL (Direto no Banco)

1. **Gerar hash da senha** (use PHP):
```bash
php artisan tinker
>>> Hash::make('sua_senha_aqui')
```

2. **Executar o script SQL** (`create_superadmin.sql`):
```sql
-- Inserir usuário
INSERT INTO `users` (
    `first_name`, `last_name`, `email`, `password`, 
    `tenant_id`, `status`, `email_verified_at`, 
    `language`, `created_at`, `updated_at`
) VALUES (
    'Super', 'Admin 2', 'superadmin2@example.com',
    '$2y$10$...', -- Cole o hash gerado
    NULL, 1, NOW(), 'pt', NOW(), NOW()
);

-- Associar ao role (substitua os IDs)
INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`)
VALUES (
    (SELECT id FROM roles WHERE name = 'superadmin'),
    'App\\Models\\User',
    (SELECT id FROM users WHERE email = 'superadmin2@example.com')
);
```

### Método 2: Via Laravel Tinker (Recomendado)

1. **Edite o arquivo `create_superadmin.php`** com seus dados

2. **Execute via tinker**:
```bash
php artisan tinker
>>> require 'create_superadmin.php';
```

### Método 3: Via Comando Artisan (Mais Seguro)

Crie um comando artisan:

```bash
php artisan make:command CreateSuperAdmin
```

Edite o arquivo `app/Console/Commands/CreateSuperAdmin.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CreateSuperAdmin extends Command
{
    protected $signature = 'user:create-superadmin 
                            {email : E-mail do superadmin}
                            {--first-name=Super : Primeiro nome}
                            {--last-name=Admin : Sobrenome}
                            {--password=123456 : Senha}';

    protected $description = 'Cria um novo usuário superadmin';

    public function handle()
    {
        $email = $this->argument('email');
        
        if (User::where('email', $email)->exists()) {
            $this->error("Já existe um usuário com o e-mail: {$email}");
            return 1;
        }

        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        
        if (!$superAdminRole) {
            $superAdminRole = Role::create([
                'name' => Role::SUPER_ADMIN,
                'display_name' => 'Super Admin',
                'guard_name' => 'web',
                'tenant_id' => null,
            ]);
        }

        $user = User::create([
            'first_name' => $this->option('first-name'),
            'last_name' => $this->option('last-name'),
            'email' => $email,
            'password' => Hash::make($this->option('password')),
            'tenant_id' => null,
            'status' => 1,
            'email_verified_at' => Carbon::now(),
            'language' => 'pt',
        ]);

        $user->assignRole(Role::SUPER_ADMIN);

        $this->info("Super Admin criado com sucesso!");
        $this->info("ID: {$user->id}");
        $this->info("E-mail: {$user->email}");

        return 0;
    }
}
```

Depois execute:
```bash
php artisan user:create-superadmin novo@superadmin.com --first-name="Novo" --last-name="Super Admin" --password="sua_senha_segura"
```

## Verificação

Após criar, verifique se funcionou:

```sql
-- Verificar usuário
SELECT id, first_name, last_name, email, tenant_id, status 
FROM users 
WHERE email = 'superadmin2@example.com';

-- Verificar role atribuído
SELECT u.email, r.name as role_name
FROM users u
JOIN model_has_roles mhr ON u.id = mhr.model_id
JOIN roles r ON mhr.role_id = r.id
WHERE u.email = 'superadmin2@example.com';
```

## Importante

1. **tenant_id deve ser NULL** para superadmin
2. **E-mail deve ser único** no sistema
3. **Senha deve ser hash bcrypt** (use `Hash::make()`)
4. **Role 'superadmin' deve existir** na tabela `roles`
5. **Associação** deve ser feita na tabela `model_has_roles`

## Troubleshooting

- **Erro: E-mail já existe** → Use outro e-mail
- **Erro: Role não encontrado** → Crie o role 'superadmin' primeiro
- **Erro: Foreign key constraint** → Verifique se o role_id existe
