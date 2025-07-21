let modalRoot = document.getElementById('modal-root');

if (!modalRoot) {
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
}

export default modalRoot;
