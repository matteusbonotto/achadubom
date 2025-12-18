/**
 * =============================================
 * SISTEMA DE AUTENTICAÇÃO - ACHADUBOM
 * =============================================
 */

class AuthManager {
    constructor() {
        // Usar cliente Supabase singleton (evita múltiplas instâncias)
        this.supabase = window.getSupabaseClient?.() || null;
        
        this.token = localStorage.getItem('admin_token');
        this.usuario = null;
        this.init();
    }

    init() {
        // Verificar se já está autenticado
        if (this.token) {
            this.verificarToken();
        } else {
            this.mostrarLogin();
        }
    }

    mostrarLogin() {
        const modalLogin = new bootstrap.Modal(document.getElementById('modalLogin'));
        modalLogin.show();
        
        // Configurar evento de login
        document.getElementById('btn-login').addEventListener('click', () => {
            this.fazerLogin();
        });

        // Enter no formulário
        document.getElementById('form-login').addEventListener('submit', (e) => {
            e.preventDefault();
            this.fazerLogin();
        });
    }

    async fazerLogin() {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const erroDiv = document.getElementById('login-erro');

        if (!email || !senha) {
            erroDiv.textContent = 'Por favor, preencha todos os campos.';
            erroDiv.style.display = 'block';
            return;
        }

        try {
            if (!this.supabase) {
                throw new Error('Supabase não inicializado');
            }

            // Buscar usuário no Supabase
            const { data: usuarios, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('ativo', true)
                .limit(1)
                .single();

            if (error || !usuarios) {
                erroDiv.textContent = 'Credenciais inválidas.';
                erroDiv.style.display = 'block';
                return;
            }

            // Verificar senha usando Edge Function (mais seguro)
            const config = window.AchaduBomConfig?.supabase || {};
            const loginResponse = await fetch(`${config.url}/functions/v1/auth-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': config.anonKey,
                    'Authorization': `Bearer ${config.anonKey}`
                },
                body: JSON.stringify({ email, senha })
            });

            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                if (loginData.sucesso) {
                    this.token = loginData.token || 'authenticated';
                    this.usuario = { email: usuarios.email, nome: usuarios.nome };
                    localStorage.setItem('admin_token', this.token);
                    localStorage.setItem('admin_usuario', JSON.stringify(this.usuario));

                    // Esconder modal e mostrar admin
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
                    modal.hide();
                    document.getElementById('admin-container').style.display = 'block';

                    console.log('✅ Login realizado com sucesso!');
                    return;
                }
            }

            // Fallback: se Edge Function não existir, usar verificação simples (NÃO SEGURO - apenas para dev)
            erroDiv.textContent = 'Credenciais inválidas.';
            erroDiv.style.display = 'block';

        } catch (error) {
            console.error('Erro no login:', error);
            erroDiv.textContent = 'Erro ao conectar. Verifique a configuração do Supabase.';
            erroDiv.style.display = 'block';
        }
    }

    async verificarToken() {
        // Por enquanto, apenas verificar se o token existe
        // Em produção, validar o token no servidor
        if (this.token) {
            const usuarioStr = localStorage.getItem('admin_usuario');
            if (usuarioStr) {
                this.usuario = JSON.parse(usuarioStr);
                document.getElementById('admin-container').style.display = 'block';
                return;
            }
        }
        
        // Se não passou, mostrar login
        this.mostrarLogin();
    }

    fazerLogout() {
        this.token = null;
        this.usuario = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_usuario');
        window.location.reload();
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Inicializar autenticação quando a página carregar
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager; // Disponibilizar globalmente
});

