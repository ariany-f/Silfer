<?php
/**
 * Script para criar um segundo Super Admin via Laravel
 * 
 * Execute este script via tinker ou crie um comando artisan:
 * 
 * php artisan tinker
 * >>> require 'create_superadmin.php';
 * 
 * OU crie um comando artisan e execute:
 * php artisan make:command CreateSuperAdmin
 */

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

// Dados do novo superadmin
$input = [
    'first_name' => 'Super',
    'last_name' => 'Admin 2',
    'email' => 'superadmin2@example.com', // ALTERE O E-MAIL
    'phone' => null, // Opcional
    'region' => null, // Opcional
    'email_verified_at' => Carbon::now(),
    'password' => Hash::make('123456'), // ALTERE A SENHA
    'tenant_id' => null, // Superadmin sempre tem tenant_id = null
    'status' => 1, // 1 = ativo
    'language' => 'pt', // Idioma padrão
];

// Verificar se o role superadmin existe
$superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();

if (!$superAdminRole) {
    // Se não existir, criar o role
    $superAdminRole = Role::create([
        'name' => Role::SUPER_ADMIN,
        'display_name' => 'Super Admin',
        'guard_name' => 'web',
        'tenant_id' => null,
    ]);
    echo "Role 'superadmin' criado com sucesso!\n";
}

// Verificar se o e-mail já existe
if (User::where('email', $input['email'])->exists()) {
    echo "ERRO: Já existe um usuário com o e-mail: {$input['email']}\n";
    exit(1);
}

// Criar o usuário
$user = User::create($input);

// Atribuir o role de superadmin
$user->assignRole(Role::SUPER_ADMIN);

echo "Super Admin criado com sucesso!\n";
echo "ID: {$user->id}\n";
echo "Nome: {$user->first_name} {$user->last_name}\n";
echo "E-mail: {$user->email}\n";
echo "Role: " . Role::SUPER_ADMIN . "\n";
