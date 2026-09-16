document.addEventListener('DOMContentLoaded', () => {
  const telInput = document.getElementById('telefone');
  const cpfCnpjInput = document.getElementById('cpfCnpj');
  const cepInput = document.getElementById('cep');

  if (telInput) {
    telInput.addEventListener('input', (e) => {
      e.target.value = maskPhone(e.target.value);
    });
  }

  if (cpfCnpjInput) {
    cpfCnpjInput.addEventListener('input', (e) => {
      e.target.value = maskCpfCnpj(e.target.value);
    });
  }

  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      e.target.value = maskCep(e.target.value);
    });
  }
});

function maskPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15);
}

function maskCpfCnpj(value) {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 11) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  } else {
    return cleanValue
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  }
}

function maskCep(value) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}