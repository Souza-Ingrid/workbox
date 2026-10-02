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

function openModal() {
  const modal = document.getElementById('modalTermos');
  const modalBody = modal?.querySelector('.modal-body') || document.getElementById('modalTermosBody');

  if (modalBody) {
    modalBody.innerHTML = `
      <h3>Termos de Uso e Política de Privacidade (LGPD)</h3>
      <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), informamos como seus dados são tratados na plataforma WorkBox:</p>
      
      <ul>
        <li><strong>Coleta de Dados:</strong> Coletamos apenas as informações estritamente necessárias para a prestação de serviços (Nome, E-mail, Telefone, CPF/CNPJ e CEP).</li>
        <li><strong>Finalidade do Tratamento:</strong> Seus dados são utilizados exclusivamente para autenticação de conta, segurança da plataforma e intermediação entre clientes e profissionais.</li>
        <li><strong>Segurança e Armazenamento:</strong> Implementamos medidas de segurança técnicas (como controle de taxa de requisições e criptografia) para proteger seus dados contra acessos não autorizados.</li>
        <li><strong>Seus Direitos (Art. 18 LGPD):</strong> Você tem o direito de solicitar a confirmação da existência de tratamento, o acesso aos dados, a correção de dados incompletos e a eliminação de dados pessoais a qualquer momento.</li>
        <li><strong>Compartilhamento:</strong> Seus dados pessoais não serão vendidos ou compartilhados com terceiros sem o seu consentimento prévio, exceto por obrigação legal.</li>
      </ul>
      
      <p><small>Ao marcar a caixa de seleção e se cadastrar, você concorda expressamente com o tratamento dos seus dados nos termos acima.</small></p>
    `;
  }

  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modalTermos = document.getElementById('modalTermos');
  const securityModal = document.getElementById('securityModal');

  if (modalTermos) modalTermos.style.display = 'none';
  if (securityModal) securityModal.classList.remove('active');
}

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
    const cleanText = el.innerText.replace(/^[✔✖]\s*/, '');
    if (isValid) {
      el.classList.add('valid');
      el.innerText = `✔ ${cleanText}`;
    } else {
      el.classList.remove('valid');
      el.innerText = `✖ ${cleanText}`;
    }
  }
}

function isPasswordValid() {
  return passwordValidState;
}

function validateForm() {
  const nome = document.getElementById('nome')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const telefone = document.getElementById('telefone')?.value || '';
  const cpfCnpj = document.getElementById('cpfCnpj')?.value || '';
  const cep = document.getElementById('cep')?.value || '';
  const aceitaTermos = document.getElementById('aceitaTermos');
  const btnSubmit = document.getElementById('btnCadastrar');

  const camposBasicosPreenchidos = nome.trim() !== '' && email.trim() !== '' && telefone.trim() !== '' && cpfCnpj.trim() !== '' && cep.trim() !== '';
  const termosAceito = aceitaTermos ? aceitaTermos.checked : true;

  const isFormValid = camposBasicosPreenchidos && passwordValidState && termosAceito;

  if (btnSubmit) {
    btnSubmit.disabled = !isFormValid;
  }

  return isFormValid;
}

function iniciarTimerBloqueio(duracaoMinutos) {
  let tempoRestante = duracaoMinutos * 60;
  const timerDisplay = document.getElementById('timerDisplay');

  if (!timerDisplay) return;

  const intervalo = setInterval(() => {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;

    const minFormatado = String(minutos).padStart(2, '0');
    const segFormatado = String(segundos).padStart(2, '0');

    timerDisplay.innerText = `${minFormatado}:${segFormatado}`;

    if (--tempoRestante < 0) {
      clearInterval(intervalo);
      timerDisplay.innerText = "00:00";
    }
  }, 1000);
}

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

  if (cadastroForm) {
    cadastroForm.addEventListener('keyup', validateForm);
    cadastroForm.addEventListener('change', validateForm);

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone')?.value || '',
        cpfCnpj: document.getElementById('cpfCnpj')?.value || '',
        cep: document.getElementById('cep')?.value || '',
        senha: document.getElementById('senha').value,
        tipoUsuario: document.getElementById('tipoUsuario')?.value || 'CLIENTE',
        categoria: document.getElementById('categoria')?.value || null,
        atendimento24h: document.getElementById('atendimento24h')?.value || null,
        descricao: document.getElementById('descricao')?.value || null
      };

      try {
        const response = await fetch('/api/auth/cadastro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          alert('Cadastro realizado com sucesso! Redirecionando para o login...');
          window.location.href = 'login.html';
        } else {
          alert(`Erro no cadastro: ${result.message || 'Falha ao registrar dados.'}`);
        }
      } catch (error) {
        console.error('Erro no envio do cadastro:', error);
        alert('Não foi possível conectar ao servidor.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
      const senhaInput = document.getElementById('loginSenha') || document.getElementById('senha');

      const email = emailInput ? emailInput.value : '';
      const senha = senhaInput ? senhaInput.value : '';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        if (response.status === 429) {
          const securityModal = document.getElementById('securityModal');
          const modalMessage = document.getElementById('modalMessage');

          if (modalMessage) modalMessage.innerText = result.message;
          if (securityModal) securityModal.classList.add('active');

          iniciarTimerBloqueio(30);
          return;
        }

        if (!response.ok) {
          alert(result.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
          return;
        }

        if (result.token) localStorage.setItem('workbox_token', result.token);
        if (result.user) localStorage.setItem('workbox_user', JSON.stringify(result.user));

        alert('Login realizado com sucesso!');
        window.location.href = 'dashboard.html';

      } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Não foi possível conectar ao servidor backend.');
      }
    });
  }
});