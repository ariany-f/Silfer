<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-superadmin 
                            {email : E-mail do superadmin}
                            {--first-name=Super : Primeiro nome}
                            {--last-name=Admin : Sobrenome}
                            {--password= : Senha (será solicitada se não informada)}
                            {--language=pt : Idioma padrão}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria um novo usuário superadmin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $firstName = $this->option('first-name');
        $lastName = $this->option('last-name');
        $language = $this->option('language');

        // Validar e-mail
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            $this->error('Erro de validação:');
            foreach ($validator->errors()->all() as $error) {
                $this->error("  - {$error}");
            }
            return 1;
        }

        // Verificar se já existe
        if (User::where('email', $email)->exists()) {
            $this->error("Já existe um usuário com o e-mail: {$email}");
            return 1;
        }

        // Solicitar senha se não foi informada
        $password = $this->option('password');
        if (!$password) {
            $password = $this->secret('Digite a senha do superadmin');
            $passwordConfirm = $this->secret('Confirme a senha');
            
            if ($password !== $passwordConfirm) {
                $this->error('As senhas não conferem!');
                return 1;
            }
        }

        // Verificar/criar role superadmin
        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        
        if (!$superAdminRole) {
            $this->info('Criando role "superadmin"...');
            $superAdminRole = Role::create([
                'name' => Role::SUPER_ADMIN,
                'display_name' => 'Super Admin',
                'guard_name' => 'web',
                'tenant_id' => null,
            ]);
            $this->info('Role criado com sucesso!');
        }

        // Criar usuário
        $this->info('Criando usuário superadmin...');
        
        try {
            $user = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'password' => Hash::make($password),
                'tenant_id' => null, // Superadmin sempre tem tenant_id = null
                'status' => 1, // Ativo
                'email_verified_at' => Carbon::now(),
                'language' => $language,
            ]);

            // Atribuir role
            $user->assignRole(Role::SUPER_ADMIN);

            $this->info('');
            $this->info('═══════════════════════════════════════════════════');
            $this->info('  Super Admin criado com sucesso!');
            $this->info('═══════════════════════════════════════════════════');
            $this->table(
                ['Campo', 'Valor'],
                [
                    ['ID', $user->id],
                    ['Nome', "{$user->first_name} {$user->last_name}"],
                    ['E-mail', $user->email],
                    ['Role', Role::SUPER_ADMIN],
                    ['Status', $user->status ? 'Ativo' : 'Inativo'],
                    ['Idioma', $user->language ?? 'pt'],
                    ['Tenant ID', $user->tenant_id ?? 'NULL (Super Admin)'],
                ]
            );
            $this->info('');

            return 0;
        } catch (\Exception $e) {
            $this->error('Erro ao criar superadmin: ' . $e->getMessage());
            return 1;
        }
    }
}
