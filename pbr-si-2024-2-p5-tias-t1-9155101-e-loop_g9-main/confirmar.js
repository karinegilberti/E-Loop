//const form = document.getElementById('formConfirmar');
//const inputCodigo = document.getElementById('codigo');
//const btnReenviar = document.getElementById('reenviarCodigo');

// Simulando o código armazenado após o cadastro
//let codigoEnviado = localStorage.getItem('codigoConfirmacao');

// Se não tiver código (usuário entrou direto nessa tela), gerar um novo
//if (!codigoEnviado) {
  //codigoEnviado = gerarCodigo();
  //localStorage.setItem('codigoConfirmacao', codigoEnviado);
//}

// Ao enviar o formulário
//form.addEventListener('submit', e => {
 // e.preventDefault();
  //const codigoDigitado = inputCodigo.value.trim();

  //if (codigoDigitado === codigoEnviado) {
    //alert('Conta confirmada com sucesso! 🎉');
    //localStorage.setItem('contaConfirmada', true);
    //window.location.href = 'login.html';
  //} else {
    //alert('Código incorreto! Verifique seu e-mail e tente novamente.');
  //}
//});

// Botão de reenviar código (gera novo e “envia”)
//btnReenviar.addEventListener('click', e => {
  //e.preventDefault();
  //codigoEnviado = gerarCodigo();
  //localStorage.setItem('codigoConfirmacao', codigoEnviado);
  //alert(`Novo código enviado para seu e-mail! (Código simulado: ${codigoEnviado})`);//
//});

// Função para gerar código aleatório
//function gerarCodigo() {
  //return Math.floor(100000 + Math.random() * 900000).toString();
//}
