<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class CustomVerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'razorpay/success',
        'api/login',
        'api/register',
        'api/logout',
        'api/*',
        'api/sadmin/*',
    ];

    /**
     * Determine if the request should be excluded from CSRF verification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function shouldPassThrough($request)
    {
        // Exclui rotas de autenticação da API
        if ($request->is('api/login') || $request->is('api/register')) {
            return true;
        }

        return parent::shouldPassThrough($request);
    }
}
