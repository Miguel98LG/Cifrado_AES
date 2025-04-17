const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const encryptSection = document.getElementById('encryptSection');
const decryptSection = document.getElementById('decryptSection');
const encryptAction = document.getElementById('encryptAction');
const decryptAction = document.getElementById('decryptAction');

encryptBtn.addEventListener('click', () => {
  encryptSection.classList.remove('hidden');
  decryptSection.classList.add('hidden');
});

decryptBtn.addEventListener('click', () => {
  decryptSection.classList.remove('hidden');
  encryptSection.classList.add('hidden');
});

async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(password);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

encryptAction.addEventListener('click', async () => {
  const message = document.getElementById('inputText').value.trim();
  const password = document.getElementById('encryptionKey').value.trim();

  if (message === '' || password.length !== 16) {
    alert('El mensaje no puede estar vacío y la clave debe tener 16 caracteres.');
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const key = await deriveKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );

  const blob = new Blob([iv, new Uint8Array(encrypted)], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'mensaje_cifrado.aes';
  link.click();
});

decryptAction.addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];
  const password = document.getElementById('decryptionKey').value.trim();
  const output = document.getElementById('outputText');

  if (!file || password.length !== 16) {
    alert('Debes cargar un archivo y la clave debe tener 16 caracteres.');
    return;
  }

  const buffer = await file.arrayBuffer();
  const iv = new Uint8Array(buffer.slice(0, 16));
  const data = buffer.slice(16);
  const key = await deriveKey(password);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    output.value = decoder.decode(decrypted);
  } catch (error) {
    alert('No se pudo descifrar el archivo. Verifica la clave.');
    output.value = '';
  }
});
