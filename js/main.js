

'use strict';

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


function render(id, html, state = 'success') {
  const box = $(id);
  box.innerHTML = html;
  box.dataset.state = state;
}

function formatCRC(value) {
  return value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 });
}

function boolSpan(value) {
  return `<span class="val-${value}">${value}</span>`;
}

function parseNumberList(text) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}




function classifyGrade(grade) {
  if (grade >= 90) {
    return 'Aprobado con excelencia';
  } else if (grade >= 70) {
    return 'Aprobado';
  } else if (grade >= 60) {
    return 'Ampliación';
  } else {
    return 'Reprobado';
  }
}

$('grade-btn').addEventListener('click', () => {
  const raw = $('grade-input').value;
  const grade = Number(raw);

  if (raw === '' || grade < 0 || grade > 100) {
    render('grade-output', 'Ingrese una nota válida entre 0 y 100.', 'warning');
    return;
  }

  const result = classifyGrade(grade);
  const state = grade >= 70 ? 'success' : grade >= 60 ? 'warning' : 'error';
  render('grade-output', `Nota <strong>${grade}</strong> → <strong>${result}</strong>`, state);
});

// switch
const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function planForDay(day) {
  let message;
  switch (day) {
    case 'sabado':
    case 'domingo':
      message = 'Fin de semana: tiempo para descansar o hacer deporte.';
      break;
    case 'viernes':
      message = '¡Casi fin de semana! Último esfuerzo.';
      break;
    case 'lunes':
      message = 'Inicio de semana: organizar las tareas pendientes.';
      break;
    default:
      message = 'Día laboral: clases y trabajo.';
  }
  return message;
}

$('day-btn').addEventListener('click', () => {
  const day = $('day-select').value;
  render('day-output', `<strong>${$('day-select').selectedOptions[0].text}</strong>: ${planForDay(day)}`);
});

$('today-btn').addEventListener('click', () => {
  $('day-select').value = dayNames[new Date().getDay()];
  $('day-btn').click();
});


function validateAge(value) {
  const trimmed = value.trim();
  if (trimmed === '') throw new Error('El campo está vacío.');
  if (isNaN(trimmed)) throw new TypeError(`"${trimmed}" no es un número.`);
  const age = Number(trimmed);
  if (!Number.isInteger(age)) throw new TypeError('La edad debe ser un número entero.');
  if (age < 0 || age > 120) throw new RangeError('La edad debe estar entre 0 y 120.');
  return age;
}

$('age-btn').addEventListener('click', () => {
  const steps = [];
  let html;
  let state;

  try {
    steps.push('Entró al bloque <code>try</code>.');
    const age = validateAge($('age-input').value);
    steps.push('La validación no lanzó errores.');
    html = `Edad válida: <strong>${age}</strong> años${age >= 18 ? ' (mayor de edad)' : ' (menor de edad)'}.`;
    state = 'success';
  } catch (error) {
    steps.push('Se capturó el error en <code>catch</code>.');
    html = `<span class="error-name">${error.name}</span> ${escapeHtml(error.message)}`;
    state = 'error';
  } finally {
    steps.push('Se ejecutó <code>finally</code>.');
  }

  render('age-output', `<p>${html}</p><ol>${steps.map((s) => `<li>${s}</li>`).join('')}</ol>`, state);
});


class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const errorTriggers = {
  type: () => null.toUpperCase(),
  range: () => new Array(-1),
  reference: () => undefinedVariable, // eslint-disable-line no-undef
  syntax: () => JSON.parse('{ invalid json }'),
  custom: () => { throw new ValidationError('email', 'El correo no tiene un formato válido.'); },
};

document.querySelectorAll('[data-error]').forEach((button) => {
  button.addEventListener('click', () => {
    try {
      errorTriggers[button.dataset.error]();
    } catch (error) {
      const rows = [
        ['name', error.name],
        ['message', error.message],
        ['instanceof Error', String(error instanceof Error)],
      ];
      if (error instanceof ValidationError) rows.push(['field', error.field]);

      const table = rows
        .map(([key, value]) => `<tr><th><code>${key}</code></th><td>${escapeHtml(value)}</td></tr>`)
        .join('');
      render('error-output', `<span class="error-name">${error.name}</span><table>${table}</table>`, 'error');
    }
  });
});



// for
$('table-btn').addEventListener('click', () => {
  const n = Number($('table-input').value);
  if ($('table-input').value === '' || Number.isNaN(n)) {
    render('table-output', 'Ingrese un número.', 'warning');
    return;
  }

  const rows = [];
  for (let i = 1; i <= 12; i++) {
    rows.push(`<span class="chip">${n} × ${i} = <strong>${n * i}</strong></span>`);
  }
  render('table-output', `<div class="chips">${rows.join('')}</div>`);
});

// while
$('savings-btn').addEventListener('click', () => {
  const initial = Number($('savings-input').value);
  const rate = Number($('rate-input').value);

  if (initial <= 0 || rate <= 0) {
    render('savings-output', 'El ahorro y el interés deben ser mayores a 0.', 'warning');
    return;
  }

  let balance = initial;
  let years = 0;
  while (balance < initial * 2) {
    balance += balance * (rate / 100);
    years++;
  }

  render(
    'savings-output',
    `Con ${rate}% anual, ${formatCRC(initial)} se duplica en <strong>${years} años</strong> (saldo final: ${formatCRC(balance)}).`
  );
});

// do...while
$('dice-btn').addEventListener('click', () => {
  const rolls = [];
  let roll;
  do {
    roll = Math.floor(Math.random() * 6) + 1;
    rolls.push(roll);
  } while (roll !== 6);

  const chips = rolls
    .map((r) => `<span class="chip${r === 6 ? ' hit' : ''}">🎲 ${r}</span>`)
    .join('');
  render('dice-output', `<div class="chips">${chips}</div>Se necesitaron <strong>${rolls.length}</strong> lanzamiento(s) para sacar 6.`);
});



// Function declaration
function greet(name) {
  return `Hola, ${name}`;
}

// Function expression
const greetExp = function (name) {
  return `Buenos días, ${name}`;
};

// Arrow function
const greetArrow = (name) => `¡Pura vida, ${name}!`;

// Default parameter
function welcome(name = 'invitado') {
  return `Bienvenido, ${name}`;
}

// Rest parameters
function sumAll(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

$('fn-define-btn').addEventListener('click', () => {
  const name = escapeHtml($('fn-name-input').value.trim());
  const rows = [
    ['Declaración', `greet('${name}')`, greet(name || 'amigo')],
    ['Expresión', `greetExp('${name}')`, greetExp(name || 'amigo')],
    ['Flecha', `greetArrow('${name}')`, greetArrow(name || 'amigo')],
    ['Por defecto', name ? `welcome('${name}')` : 'welcome()', name ? welcome(name) : welcome()],
    ['Rest', 'sumAll(1, 2, 3, 4)', sumAll(1, 2, 3, 4)],
  ];

  const table = rows
    .map(([type, call, result]) => `<tr><td>${type}</td><td><code>${call}</code></td><td><strong>${result}</strong></td></tr>`)
    .join('');
  render('fn-define-output', `<table><tr><th>Tipo</th><th>Llamada</th><th>Resultado</th></tr>${table}</table>`);
});

// Calling functions and callbacks
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => {
  if (b === 0) throw new RangeError('No se puede dividir entre cero.');
  return a / b;
};

const operations = { add, subtract, multiply, divide };
const operationSymbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

function calculate(a, b, operation) {
  return operation(a, b);
}

$('calc-btn').addEventListener('click', () => {
  const a = Number($('calc-a').value);
  const b = Number($('calc-b').value);
  const op = $('calc-op').value;

  try {
    const result = calculate(a, b, operations[op]);
    render(
      'calc-output',
      `<code>calculate(${a}, ${b}, operations.${op})</code><br>${a} ${operationSymbols[op]} ${b} = <strong>${Number(result.toFixed(4))}</strong>`
    );
  } catch (error) {
    render('calc-output', `<span class="error-name">${error.name}</span> ${error.message}`, 'error');
  }
});

// Recursion
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

$('factorial-btn').addEventListener('click', () => {
  const n = Number($('factorial-input').value);
  if (!Number.isInteger(n) || n < 0 || n > 20) {
    render('factorial-output', 'Ingrese un entero entre 0 y 20.', 'warning');
    return;
  }

  const expansion = n <= 1 ? '1' : Array.from({ length: n }, (_, i) => n - i).join(' × ');
  render('factorial-output', `${n}! = ${expansion} = <strong>${factorial(n).toLocaleString('es-CR')}</strong>`);
});



// Assignment
let x = 10;
const assignmentHistory = [];

document.querySelectorAll('[data-assign]').forEach((button) => {
  button.addEventListener('click', () => {
    const y = Number($('assign-input').value);
    const before = x;

    switch (button.dataset.assign) {
      case '=': x = y; break;
      case '+=': x += y; break;
      case '-=': x -= y; break;
      case '*=': x *= y; break;
      case '/=': x /= y; break;
      case '%=': x %= y; break;
      case '**=': x **= y; break;
    }

    x = Number.isFinite(x) ? Number(x.toFixed(4)) : x;
    assignmentHistory.unshift(`x ${button.dataset.assign} ${y} → ${before} pasa a ${x}`);
    renderAssignment();
  });
});

function renderAssignment() {
  const history = assignmentHistory
    .slice(0, 5)
    .map((line) => `<li><code>${line}</code></li>`)
    .join('');
  render('assign-output', `<strong>x = ${x}</strong>${history ? `<ul>${history}</ul>` : ''}`);
}

$('assign-reset').addEventListener('click', () => {
  x = 10;
  assignmentHistory.length = 0;
  renderAssignment();
});

// Comparison
$('cmp-btn').addEventListener('click', () => {
  const a = Number($('cmp-a').value);
  const b = $('cmp-b').value;
  const shownB = `'${escapeHtml(b)}'`;

  const rows = [
    [`${a} == ${shownB}`, a == b], // eslint-disable-line eqeqeq
    [`${a} === ${shownB}`, a === b],
    [`${a} != ${shownB}`, a != b], // eslint-disable-line eqeqeq
    [`${a} !== ${shownB}`, a !== b],
    [`${a} &gt; ${shownB}`, a > b],
    [`${a} &lt;= ${shownB}`, a <= b],
    [`typeof A / typeof B`, `${typeof a} / ${typeof b}`],
  ];

  const table = rows
    .map(([expr, value]) => `<tr><td><code>${expr}</code></td><td>${typeof value === 'boolean' ? boolSpan(value) : value}</td></tr>`)
    .join('');
  render('cmp-output', `<table>${table}</table>`);
});

// Arithmetic
$('ar-btn').addEventListener('click', () => {
  let a = Number($('ar-a').value);
  let b = Number($('ar-b').value);
  const round = (n) => (Number.isFinite(n) ? Number(n.toFixed(4)) : n);

  const rows = [
    ['a + b', a + b],
    ['a - b', a - b],
    ['a * b', a * b],
    ['a / b', round(a / b)],
    ['a % b', a % b],
    ['a ** b', a ** b],
    ['-a', -a],
  ];

  const incremented = ++a;
  const decremented = --b;
  rows.push(['++a', incremented], ['--b', decremented]);

  const table = rows
    .map(([expr, value]) => `<tr><td><code>${expr}</code></td><td><strong>${value.toLocaleString('es-CR')}</strong></td></tr>`)
    .join('');
  render('ar-output', `<table>${table}</table>`);
});

// Logical
$('lg-btn').addEventListener('click', () => {
  const hasTicket = $('lg-ticket').checked;
  const isAdult = $('lg-adult').checked;
  const isVip = $('lg-vip').checked;
  const isStudent = $('lg-student').checked;
  const nicknameRaw = $('lg-nick').value.trim();
  const nickname = nicknameRaw === '' ? null : nicknameRaw;

  const canEnter = hasTicket && isAdult;
  const getsDiscount = isVip || isStudent;
  const mustBuy = !hasTicket;
  const displayName = nickname ?? 'Invitado';

  const rows = [
    ['hasTicket && isAdult', canEnter, 'Puede entrar'],
    ['isVip || isStudent', getsDiscount, 'Tiene descuento'],
    ['!hasTicket', mustBuy, 'Debe comprar entrada'],
  ];

  const table = rows
    .map(([expr, value, label]) => `<tr><td><code>${expr}</code></td><td>${boolSpan(value)}</td><td>${label}</td></tr>`)
    .join('');

  render(
    'lg-output',
    `<p>Hola, <strong>${escapeHtml(displayName)}</strong> <code>(nickname ?? 'Invitado')</code></p><table>${table}</table>`,
    canEnter ? 'success' : 'warning'
  );
});



// Number
$('num-btn').addEventListener('click', () => {
  const raw = $('num-input').value;
  const asNumber = Number(raw);
  const asInt = parseInt(raw, 10);
  const asFloat = parseFloat(raw);
  const shown = `'${escapeHtml(raw)}'`;

  const rows = [
    [`Number(${shown})`, asNumber],
    [`parseInt(${shown})`, asInt],
    [`parseFloat(${shown})`, asFloat],
    ['Number.isNaN(Number(valor))', boolSpan(Number.isNaN(asNumber))],
    ['Number.isInteger(parseFloat(valor))', boolSpan(Number.isInteger(asFloat))],
  ];

  if (!Number.isNaN(asFloat)) {
    rows.push(
      ['parseFloat(valor).toFixed(2)', `'${asFloat.toFixed(2)}'`],
      ['toLocaleString CRC', formatCRC(asFloat)]
    );
  }

  rows.push(['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER.toLocaleString('es-CR')]);

  const table = rows.map(([expr, value]) => `<tr><td><code>${expr}</code></td><td>${value}</td></tr>`).join('');
  render('num-output', `<table>${table}</table>`, Number.isNaN(asFloat) ? 'warning' : 'success');
});

// Math
$('math-btn').addEventListener('click', () => {
  const n = Number($('math-input').value);
  const list = parseNumberList($('math-list').value);

  if ($('math-input').value === '' || list.length === 0) {
    render('math-output', 'Ingrese un número y una lista de números separada por comas.', 'warning');
    return;
  }

  const rows = [
    [`Math.round(${n})`, Math.round(n)],
    [`Math.floor(${n})`, Math.floor(n)],
    [`Math.ceil(${n})`, Math.ceil(n)],
    [`Math.trunc(${n})`, Math.trunc(n)],
    [`Math.abs(${n})`, Math.abs(n)],
    [`Math.sqrt(Math.abs(${n}))`, Math.sqrt(Math.abs(n)).toFixed(4)],
    [`Math.max(...lista)`, Math.max(...list)],
    [`Math.min(...lista)`, Math.min(...list)],
    ['Math.PI', Math.PI.toFixed(6)],
  ];

  const table = rows.map(([expr, value]) => `<tr><td><code>${expr}</code></td><td><strong>${value}</strong></td></tr>`).join('');
  render('math-output', `<table>${table}</table>`);
});

$('random-btn').addEventListener('click', () => {
  const value = Math.floor(Math.random() * 100) + 1;
  render('math-output', `<code>Math.floor(Math.random() * 100) + 1</code> → <strong>${value}</strong>`);
});

// Date: live clock
function updateClock() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  $('clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  $('clock-date').textContent = now.toLocaleDateString('es-CR', { dateStyle: 'full' });
}

updateClock();
setInterval(updateClock, 1000);

// Date: age calculator and next birthday
$('birth-btn').addEventListener('click', () => {
  const value = $('birth-input').value;
  if (!value) {
    render('birth-output', 'Seleccione una fecha.', 'warning');
    return;
  }

  const [year, month, day] = value.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birth > today) {
    render('birth-output', 'La fecha de nacimiento no puede estar en el futuro.', 'error');
    return;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!birthdayPassed) age--;

  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);

  const daysLeft = Math.ceil((nextBirthday - today) / 86400000);
  const livedDays = Math.floor((today - birth) / 86400000);
  const weekday = birth.toLocaleDateString('es-CR', { weekday: 'long' });

  render(
    'birth-output',
    `<p>Edad: <strong>${age} años</strong> (${livedDays.toLocaleString('es-CR')} días vividos).</p>
     <p>Nació un <strong>${weekday}</strong>.</p>
     <p>${daysLeft === 0 ? '🎉 ¡Hoy es su cumpleaños!' : `Faltan <strong>${daysLeft}</strong> días para su próximo cumpleaños.`}</p>`
  );
});



// Template literals
$('tpl-btn').addEventListener('click', () => {
  const customer = escapeHtml($('tpl-customer').value.trim() || 'Cliente');
  const product = escapeHtml($('tpl-product').value.trim() || 'Producto');
  const qty = Number($('tpl-qty').value);
  const price = Number($('tpl-price').value);

  if (qty < 1 || price < 0) {
    render('tpl-output', 'La cantidad debe ser al menos 1 y el precio no puede ser negativo.', 'warning');
    return;
  }

  const subtotal = qty * price;
  const discount = qty >= 10 ? subtotal * 0.1 : 0;

  const receipt = `FACTURA ELECTRÓNICA
Fecha: ${new Date().toLocaleDateString('es-CR')}
Cliente: ${customer}
Producto: ${product}
Cantidad: ${qty} × ${formatCRC(price)}
Subtotal: ${formatCRC(subtotal)}
${discount > 0 ? `Descuento (10%): -${formatCRC(discount)}\n` : ''}Total: ${formatCRC(subtotal - discount)}`;

  render('tpl-output', `<pre>${receipt}</pre>`);
});

// String methods
$('str-btn').addEventListener('click', () => {
  const text = $('str-input').value;
  const search = $('str-search').value;
  const show = (value) => `'${escapeHtml(value)}'`;

  const rows = [
    ['length', text.length],
    ['trim()', show(text.trim())],
    ['toUpperCase()', show(text.toUpperCase())],
    ['toLowerCase()', show(text.toLowerCase())],
    [`includes('${escapeHtml(search)}')`, boolSpan(text.includes(search))],
    [`indexOf('${escapeHtml(search)}')`, text.indexOf(search)],
    ['trim().slice(0, 10)', show(text.trim().slice(0, 10))],
    ["replaceAll('a', '4')", show(text.replaceAll('a', '4'))],
    ["trim().split(' ')", `[${text.trim().split(' ').map(show).join(', ')}]`],
    ["trim().padStart(30, '*')", show(text.trim().padStart(30, '*'))],
    ["split('').reverse().join('')", show(text.split('').reverse().join(''))],
  ];

  const table = rows.map(([method, value]) => `<tr><td><code>${method}</code></td><td>${value}</td></tr>`).join('');
  render('str-output', `<table>${table}</table>`);
});



// Array manager
const initialList = ['Arroz', 'Frijoles', 'Café'];
let shoppingList = [...initialList];

function renderList(message = '') {
  const chips = shoppingList
    .map((item, index) => `<span class="chip">[${index}] ${escapeHtml(item)}</span>`)
    .join('');
  render(
    'arr-output',
    `${message ? `<p>${message}</p>` : ''}<div class="chips">${chips || '<em>Arreglo vacío</em>'}</div><p><code>length: ${shoppingList.length}</code></p>`,
    shoppingList.length ? 'success' : 'warning'
  );
}

document.querySelectorAll('[data-array]').forEach((button) => {
  button.addEventListener('click', () => {
    const item = $('arr-item').value.trim();
    let message = '';

    switch (button.dataset.array) {
      case 'push':
      case 'unshift':
        if (!item) {
          message = 'Escriba un artículo primero.';
          break;
        }
        shoppingList[button.dataset.array](item);
        message = `<code>${button.dataset.array}('${escapeHtml(item)}')</code> devolvió la nueva longitud: ${shoppingList.length}`;
        break;
      case 'pop':
      case 'shift': {
        const removed = shoppingList[button.dataset.array]();
        message = removed === undefined
          ? `<code>${button.dataset.array}()</code> devolvió undefined (arreglo vacío).`
          : `<code>${button.dataset.array}()</code> quitó: <strong>${escapeHtml(removed)}</strong>`;
        break;
      }
      case 'sort':
        shoppingList.sort((a, b) => a.localeCompare(b, 'es'));
        message = '<code>sort()</code> ordenó alfabéticamente.';
        break;
      case 'reverse':
        shoppingList.reverse();
        message = '<code>reverse()</code> invirtió el orden.';
        break;
      case 'reset':
        shoppingList = [...initialList];
        message = 'Lista reiniciada.';
        break;
    }

    renderList(message);
  });
});

renderList();

// Array transformation methods
$('nums-btn').addEventListener('click', () => {
  const nums = parseNumberList($('nums-input').value);
  if (nums.length === 0) {
    render('nums-output', 'Ingrese al menos un número.', 'warning');
    return;
  }

  const sum = nums.reduce((total, n) => total + n, 0);
  const rows = [
    ['original', `[${nums.join(', ')}]`],
    ['map(n => n * 2)', `[${nums.map((n) => n * 2).join(', ')}]`],
    ['filter(n => n % 2 === 0)', `[${nums.filter((n) => n % 2 === 0).join(', ')}]`],
    ['reduce(suma)', sum],
    ['promedio', (sum / nums.length).toFixed(2)],
    ['find(n => n > 10)', String(nums.find((n) => n > 10))],
    ['some(n => n > 20)', boolSpan(nums.some((n) => n > 20))],
    ['every(n => n > 0)', boolSpan(nums.every((n) => n > 0))],
    ['[...nums].sort((a, b) => a - b)', `[${[...nums].sort((a, b) => a - b).join(', ')}]`],
    ['includes(8)', boolSpan(nums.includes(8))],
  ];

  const table = rows.map(([method, value]) => `<tr><td><code>${method}</code></td><td>${value}</td></tr>`).join('');
  render('nums-output', `<table>${table}</table>`);
});

// Typed arrays
$('typed-btn').addEventListener('click', () => {
  const value = Number($('typed-input').value);
  if ($('typed-input').value === '' || Number.isNaN(value)) {
    render('typed-output', 'Ingrese un número.', 'warning');
    return;
  }

  const types = [
    ['Int8Array', Int8Array, '-128 a 127'],
    ['Uint8Array', Uint8Array, '0 a 255'],
    ['Uint8ClampedArray', Uint8ClampedArray, '0 a 255 (limitado)'],
    ['Int16Array', Int16Array, '-32 768 a 32 767'],
    ['Float32Array', Float32Array, 'decimal 32 bits'],
  ];

  const rows = types
    .map(([name, TypedArray, range]) => {
      const arr = new TypedArray(1);
      arr[0] = value;
      return `<tr><td><code>${name}</code></td><td>${range}</td><td><strong>${arr[0]}</strong></td><td>${arr.BYTES_PER_ELEMENT} B</td></tr>`;
    })
    .join('');

  // Two views over the same buffer
  const buffer = new ArrayBuffer(4);
  const view32 = new Uint32Array(buffer);
  const view8 = new Uint8Array(buffer);
  view32[0] = Math.abs(Math.trunc(value));

  render(
    'typed-output',
    `<table><tr><th>Tipo</th><th>Rango</th><th>Guardado</th><th>Tamaño</th></tr>${rows}</table>
     <p>Mismo <code>ArrayBuffer(4)</code>: <code>Uint32Array</code> = ${view32[0]} → <code>Uint8Array</code> = [${view8.join(', ')}]</p>`
  );
});


const playground = $('dom-playground');

function clearHighlight() {
  document.querySelectorAll('.dom-highlight').forEach((el) => el.classList.remove('dom-highlight'));
}

function highlight(elements) {
  clearHighlight();
  Array.from(elements).forEach((el) => el.classList.add('dom-highlight'));
  if (elements.length) playground.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function describe(el) {
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.replace('dom-highlight', '').trim().split(/\s+/).filter(Boolean).join('.')
    : '';
  const text = (el.textContent || el.value || el.alt || '').trim().slice(0, 40);
  return `<code>&lt;${el.tagName.toLowerCase()}${id}${cls === '.' ? '' : cls}&gt;</code> ${escapeHtml(text)}`;
}

function listElements(elements) {
  return `<ol>${Array.from(elements).map((el) => `<li>${describe(el)}</li>`).join('')}</ol>`;
}

// getElementById
$('dom-id-btn').addEventListener('click', () => {
  const id = $('dom-id-select').value;
  const element = document.getElementById(id);

  if (element === null) {
    clearHighlight();
    render('dom-id-output', `<code>getElementById('${id}')</code> devolvió <strong>null</strong>: no existe ese ID.`, 'warning');
    return;
  }

  highlight([element]);
  render('dom-id-output', `<code>getElementById('${id}')</code> encontró:<br>${describe(element)}`);
});

// getElementsByTagName
$('dom-tag-btn').addEventListener('click', () => {
  const tag = $('dom-tag-select').value;
  const elements = playground.getElementsByTagName(tag);
  highlight(elements);
  render(
    'dom-tag-output',
    `<code>getElementsByTagName('${tag}')</code> → HTMLCollection con <strong>${elements.length}</strong> elemento(s)${listElements(elements)}`
  );
});

// getElementsByClassName
$('dom-class-btn').addEventListener('click', () => {
  const className = $('dom-class-select').value;
  const elements = playground.getElementsByClassName(className);
  highlight(elements);
  render(
    'dom-class-output',
    `<code>getElementsByClassName('${className}')</code> → <strong>${elements.length}</strong> elemento(s)${listElements(elements)}`
  );
});

// querySelector / querySelectorAll
function runSelector(all) {
  const selector = $('dom-css-input').value.trim();
  const method = all ? 'querySelectorAll' : 'querySelector';

  if (!selector) {
    render('dom-css-output', 'Escriba un selector CSS.', 'warning');
    return;
  }

  try {
    if (all) {
      const elements = playground.querySelectorAll(selector);
      highlight(elements);
      render(
        'dom-css-output',
        `<code>${method}('${escapeHtml(selector)}')</code> → NodeList con <strong>${elements.length}</strong> elemento(s)${listElements(elements)}`,
        elements.length ? 'success' : 'warning'
      );
    } else {
      const element = playground.querySelector(selector);
      if (!element) {
        clearHighlight();
        render('dom-css-output', `<code>${method}('${escapeHtml(selector)}')</code> devolvió <strong>null</strong>.`, 'warning');
        return;
      }
      highlight([element]);
      render('dom-css-output', `<code>${method}('${escapeHtml(selector)}')</code> → primer elemento:<br>${describe(element)}`);
    }
  } catch (error) {
    clearHighlight();
    render('dom-css-output', `<span class="error-name">${error.name}</span> Selector inválido: ${escapeHtml(selector)}`, 'error');
  }
}

$('dom-css-one-btn').addEventListener('click', () => runSelector(false));
$('dom-css-all-btn').addEventListener('click', () => runSelector(true));

// HTML object collections
const collections = {
  forms: () => ({ label: 'document.forms', items: document.forms }),
  elements: () => ({ label: "document.forms['orderForm'].elements", items: document.forms['orderForm'].elements }),
  images: () => ({ label: 'document.images', items: document.images }),
  links: () => ({ label: 'document.links', items: document.links }),
};

document.querySelectorAll('[data-collection]').forEach((button) => {
  button.addEventListener('click', () => {
    const { label, items } = collections[button.dataset.collection]();
    const insidePlayground = Array.from(items).filter((el) => playground.contains(el));
    highlight(insidePlayground);

    // Show only the first 8 to keep the output readable
    const preview = Array.from(items).slice(0, 8);
    render(
      'dom-collection-output',
      `<code>${label}</code> → <strong>${items.length}</strong> elemento(s) en toda la página
       ${listElements(preview)}
       ${items.length > preview.length ? `<p>... y ${items.length - preview.length} más.</p>` : ''}
       <p><code>document.title</code>: ${escapeHtml(document.title)}</p>`
    );
  });
});

$('dom-clear-btn').addEventListener('click', clearHighlight);



$('footer-year').textContent = new Date().getFullYear();

const toTop = $('to-top');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('visible', window.scrollY > 500);
});

const navLinks = document.querySelectorAll('.topnav a');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

document.querySelectorAll('.section').forEach((section) => sectionObserver.observe(section));
