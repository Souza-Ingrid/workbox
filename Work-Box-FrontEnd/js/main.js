/* --- WorkBox - JS Principal Atualizado --- */

// 1. Controle de Perfil no Cadastro (CLIENTE x PROFISSIONAL)
function setRole(role) {
  const tipoUsuarioInput = document.getElementById('tipoUsuario');
  if (tipoUsuarioInput) tipoUsuarioInput.value = role;

  const btnCliente = document.getElementById('btn-cliente');
  const btnProfissional = document.getElementById('btn-profissional');
  const camposProfissional = document.getElementById('camposProfissional');

  if (role === 'CLIENTE') {
    if (btnCliente) btnCliente.classList.add('active');
    if (btnProfissional) btnProfissional.classList.remove('active');
    if (camposProfissional) camposProfissional.style.display = 'none';
  } else {
    if (btnProfissional) btnProfissional.classList.add('active');
    if (btnCliente) btnCliente.classList.remove('active');
    if (camposProfissional) camposProfissional.style.display = 'block';
  }
  validateForm();
}

// 2. Controle do Modal de Termos e Modal de Segurança
function openModal() {
  const modal = document.getElementById('modalTermos');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modalTermos = document.getElementById('modalTermos');
  const securityModal = document.getElementById('securityModal');

  if (modalTermos) modalTermos.style.display = 'none';
  if (securityModal) securityModal.classList.remove('active');
}

// 3. Validação de Senha em Tempo Real
let passwordValidState = false;

function validatePassword() {
  const senhaInput = document.getElementById('senha');
  const confirmaSenhaInput = document.getElementById('confirmaSenha');
  if (!senhaInput || !confirmaSenhaInput) return;

  const senha = senhaInput.value;
  const confirmaSenha = confirmaSenhaInput.value;

  const reqs = {
    length: senha.length >= 8,
    upper: /[A-Z]/.test(senha),
    lower: /[a-z]/.test(senha),
    number: /[0-9]/.test(senha),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
    match: senha.length > 0 && senha === confirmaSenha
  };

  updateReqUI('req-length', reqs.length);
  updateReqUI('req-upper', reqs.upper);
  updateReqUI('req-lower', reqs.lower);
  updateReqUI('req-number', reqs.number);
  updateReqUI('req-symbol', reqs.symbol);
  updateReqUI('req-match', reqs.match);

  passwordValidState = Object.values(reqs).every(Boolean);
  validateForm();
}

function updateReqUI(elementId, isValid) {
  const el = document.getElementById(elementId);
  if (el) {
    if (isValid) {
      el.classList.add('valid');
      el.innerText = `✔ ${el.innerText.substring(2)}`;
    } else {
      el.classList.remove('valid');
      el.innerText = `✖ ${el.innerText.substring(2)}`;
    }
  }
}

function isPasswordValid() {
  return passwordValidState;
}

function validateForm() {
  const form = document.getElementById('cadastroForm');
  const aceitaTermos = document.getElementById('aceitaTermos');
  const btnSubmit = document.getElementById('btnCadastrar');

  if (!form) return false;

  const isFormValid = form.checkValidity() && passwordValidState && (aceitaTermos ? aceitaTermos.checked : true);

  if (btnSubmit) {
    btnSubmit.disabled = !isFormValid;
  }

  return isFormValid;
}

// 4. Event Listeners Globais ao Carregar a Página
document.addEventListener('DOMContentLoaded', () => {
  const senhaInput = document.getElementById('senha');
  const confirmaSenhaInput = document.getElementById('confirmaSenha');
  const aceitaTermos = document.getElementById('aceitaTermos');
  const cadastroForm = document.getElementById('cadastroForm');
  const loginForm = document.getElementById('loginForm');

  if (senhaInput && confirmaSenhaInput) {
    senhaInput.addEventListener('input', validatePassword);
    confirmaSenhaInput.addEventListener('input', validatePassword);
  }

  if (aceitaTermos) {
    aceitaTermos.addEventListener('change', validateForm);
  }

  // --- Fluxo de Cadastro de Usuário ---
  if (cadastroForm) {
    cadastroForm.addEventListener('input', validateForm);
    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cpfCnpj: document.getElementById('cpfCnpj').value,
        cep: document.getElementById('cep').value,
        senha: document.getElementById('senha').value,
        tipoUsuario: document.getElementById('tipoUsuario').value,
        categoria: document.getElementById('categoria')?.value || null,
        atendimento24h: document.getElementById('atendimento24h')?.value || null,
        descricao: document.getElementById('descricao')?.value || null
      };

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          alert('Cadastro realizado com sucesso! Redirecionando para o login...');
          window.location.href = 'login.html';
        } else {
          alert(`Erro no cadastro: ${result.message}`);
        }
      } catch (error) {
        alert('Não foi possível conectar ao servidor.');
      }
    });
  }

  // --- Fluxo de Login e Apresentação CID ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value;
      const senha = document.getElementById('loginSenha').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        // A. Atualiza o Painel Inspetor de Confidencialidade HTTP
        const jsonCodeElement = document.getElementById('jsonResponse')?.querySelector('code') || document.getElementById('jsonResponse');
        if (jsonCodeElement) {
          jsonCodeElement.innerText = JSON.stringify({
            statusHTTP: `${response.status} ${response.statusText || ''}`.trim(),
            headers: { 'content-type': response.headers.get('content-type') },
            respostaServidor: result
          }, null, 2);
        }

        // B. Trava de Disponibilidade (Status 429 - Rate Limit 3 Tentativas)
        if (response.status === 429) {
          const securityModal = document.getElementById('securityModal');
          const modalMessage = document.getElementById('modalMessage');

          if (modalMessage) modalMessage.innerText = result.message;
          if (securityModal) securityModal.classList.add('active');
          return;
        }

        // C. Erro de Autenticação Tradicional (Status 401)
        if (!response.ok) {
          alert(result.message);
          return;
        }

        // D. Sucesso de Autenticação
        localStorage.setItem('workbox_token', result.token);
        localStorage.setItem('workbox_user', JSON.stringify(result.user));

        window.location.href = 'dashboard.html';

      } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Não foi possível conectar ao servidor backend.');
      }
    });
  }
});