/* js/main.js */

// Controle de Perfil (CLIENTE x PROFISSIONAL)
function setRole(role) {
  document.getElementById('tipoUsuario').value = role;
  const btnCliente = document.getElementById('btn-cliente');
  const btnProfissional = document.getElementById('btn-profissional');
  const camposProfissional = document.getElementById('camposProfissional');

  if (role === 'CLIENTE') {
    btnCliente.classList.add('active');
    btnProfissional.classList.remove('active');
    camposProfissional.style.display = 'none';
  } else {
    btnProfissional.classList.add('active');
    btnCliente.classList.remove('active');
    camposProfissional.style.display = 'block';
  }
  validateForm();
}

// Controle do Modal de Termos
function openModal() {
  document.getElementById('modalTermos').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalTermos').style.display = 'none';
}

// Validação em Tempo Real da Senha e Form
document.addEventListener('DOMContentLoaded', () => {
  const senhaInput = document.getElementById('senha');
  const confirmaSenhaInput = document.getElementById('confirmaSenha');
  const aceitaTermos = document.getElementById('aceitaTermos');
  const form = document.getElementById('cadastroForm');

  if (senhaInput && confirmaSenhaInput) {
    senhaInput.addEventListener('input', validatePassword);
    confirmaSenhaInput.addEventListener('input', validatePassword);
  }

  if (aceitaTermos) {
    aceitaTermos.addEventListener('change', validateForm);
  }

  if (form) {
    form.addEventListener('input', validateForm);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm() && isPasswordValid()) {
        alert('Cadastro realizado com sucesso (Front-end)! Pronto para integrar o Back-end.');
      }
    });
  }
});

let passwordValidState = false;

function validatePassword() {
  const senha = document.getElementById('senha').value;
  const confirmaSenha = document.getElementById('confirmaSenha').value;

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
      el.innerHTML = `✔ ${el.innerText.substring(2)}`;
    } else {
      el.classList.remove('valid');
      el.innerHTML = `✖ ${el.innerText.substring(2)}`;
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

  const isFormValid = form.checkValidity() && passwordValidState && aceitaTermos.checked;

  if (btnSubmit) {
    btnSubmit.disabled = !isFormValid;
  }
  
  return isFormValid;
}