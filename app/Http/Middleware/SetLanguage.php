<?php

namespace App\Http\Middleware;

use App\Models\SadminSetting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $sadminSetting = SadminSetting::where('key', 'show_landing_page')->first()->value ?? '1';
        } catch (\Exception $e) {
            // Se houver erro de conexão com o banco, usa valor padrão
            $sadminSetting = '1';
        }
        
        if ($sadminSetting) {
            $userId = session()->get('auth');
            $localLanguage = session()->get('locale');
    
            if ($localLanguage) {
                App::setLocale($localLanguage);
            } elseif ($userId) {
                try {
                    $user = User::find($userId);
                    if ($user && $user->language) {
                        App::setLocale($user->language);
                    } else {
                        App::setLocale('pt');
                    }
                } catch (\Exception $e) {
                    App::setLocale('pt');
                }
            } else {
                App::setLocale('pt');
            }
    
            return $next($request);
        } else {
            return redirect()->route('app');
        }
    }
}
