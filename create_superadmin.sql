-- Script para criar um segundo Super Admin
-- Execute este script no seu banco de dados MySQL

-- 1. Primeiro, verifique se o role 'superadmin' existe na tabela 'roles'
-- Se não existir, você precisará criá-lo primeiro (geralmente já existe)

-- 2. Inserir o novo usuário na tabela 'users'
-- IMPORTANTE: Substitua os valores abaixo pelos seus dados
INSERT INTO `users` (
    `first_name`,
    `last_name`,
    `email`,
    `phone`,
    `region`,
    `email_verified_at`,
    `password`,
    `tenant_id`,
    `status`,
    `language`,
    `created_at`,
    `updated_at`
) VALUES (
    'Super',                    -- Primeiro nome
    'Admin 2',                  -- Sobrenome
    'superadmin2@example.com',  -- E-mail (deve ser único)
    NULL,                       -- Telefone (opcional)
    NULL,                       -- Região (opcional)
    NOW(),                      -- Data de verificação do e-mail
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Senha: 'password' (ALTERE ISSO!)
    NULL,                       -- tenant_id deve ser NULL para superadmin
    1,                          -- status: 1 = ativo, 0 = inativo
    'pt',                       -- Idioma padrão
    NOW(),                      -- created_at
    NOW()                       -- updated_at
);

-- 3. Obter o ID do usuário recém-criado e o ID do role 'superadmin'
-- Execute estas queries para obter os IDs:
-- SELECT id FROM users WHERE email = 'superadmin2@example.com';
-- SELECT id FROM roles WHERE name = 'superadmin';

-- 4. Associar o usuário ao role 'superadmin' na tabela 'model_has_roles'
-- IMPORTANTE: Substitua :user_id e :role_id pelos IDs obtidos acima
INSERT INTO `model_has_roles` (
    `role_id`,
    `model_type`,
    `model_id`
) VALUES (
    (SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1),  -- ID do role superadmin
    'App\\Models\\User',                                        -- Tipo do modelo
    (SELECT id FROM users WHERE email = 'superadmin2@example.com' LIMIT 1)  -- ID do usuário criado
);

-- OU, se preferir fazer em uma única query (mais seguro):
-- Primeiro obtenha os IDs manualmente e depois execute:
-- INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) 
-- VALUES (1, 'App\\Models\\User', LAST_INSERT_ID());

-- NOTA: Para gerar uma senha hash correta, use o comando PHP:
-- php artisan tinker
-- >>> Hash::make('sua_senha_aqui')
-- Copie o hash gerado e use no INSERT acima
