const errorBox = document.querySelector('#js-error');

export function throwError(msg) {
  return () => {
    errorBox.classList.add('bg-washed-red', 'red');
    errorBox.classList.remove('bg-light-gray');
    errorBox.innerHTML = `<p class="ma0">${ msg }</p>`;
  };
}

export function clearError() {
  console.log('CLEAR ERROR!');
  errorBox.classList.remove('bg-washed-red', 'red');
  errorBox.classList.add('bg-light-gray');
  errorBox.innerHTML = '';
}
