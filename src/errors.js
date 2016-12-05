const errorBox = document.querySelector('#js-error');

export function throwError(msg) {
  errorBox.innerHTML = `<p class="ma0">${ msg }</p>`;
}

export function clearError() {
  throwError('');
}
