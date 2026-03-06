// Para funcionar com CSRF, frontend e backend devem usar a mesma porta
// Se o backend está na porta 80, o frontend também deve usar porta 80
const getOrigin = () => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Se está na porta 8080, mantém a porta 8080 (para XAMPP na porta 8080)
    // Isso garante que os cookies CSRF funcionem corretamente
    if (port === '8080') {
        // Mantém a porta 8080 se o XAMPP estiver configurado nessa porta
        return protocol + '//' + hostname + ':8080';
    }
    
    // Se não tem porta ou é porta padrão, não inclui
    if (!port) {
        return protocol + '//' + hostname;
    }
    
    // Inclui a porta se não for padrão
    const defaultPort = protocol === 'https:' ? '443' : '80';
    if (port === defaultPort) {
        return protocol + '//' + hostname;
    }
    
    return protocol + '//' + hostname + ':' + port;
};

export const environment = {
    URL: getOrigin(),
};
