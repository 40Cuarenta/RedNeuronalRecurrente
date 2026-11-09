/**
 * app.js
 * Aplicación didáctica e interactiva para explicar visualmente el funcionamiento interno
 * de las Redes Neuronales Recurrentes (RNN).
 * Implementado en JavaScript vainilla puro (sin frameworks, sin backend, sin ML libraries).
 */

// =============================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// =============================================================================
const appState = {
  activeType: 'one-to-many',     // 'one-to-many' | 'many-to-one' | 'many-to-many'
  exampleIndex: 0,               // Índice del ejemplo seleccionado
  currentStep: 0,                // Paso temporal activo (t)
  viewMode: 'rolled',            // 'rolled' (enrollada) | 'unrolled' (desenrollada)
  isPlaying: false,              // Estado del reproductor
  playbackSpeed: 1300,           // Intervalo en ms entre pasos
  playbackTimer: null,           // Referencia al temporizador setInterval
  pulseProgress: 0,              // Progreso de animación del pulso (0..1)
  animationFrameId: null         // Referencia a requestAnimationFrame
};

// =============================================================================
// SELECTORES DEL DOM
// =============================================================================
const DOM = {
  // Tarjetas principales (solo estas tres)
  cards: {
    'one-to-many': document.getElementById('card-one-to-many'),
    'many-to-one': document.getElementById('card-many-to-one'),
    'many-to-many': document.getElementById('card-many-to-many')
  },

  // Encabezado del escenario
  stageTag: document.getElementById('stage-tag'),
  stageApp: document.getElementById('stage-app'),
  stageDesc: document.getElementById('stage-desc'),
  examplePills: document.getElementById('example-pills'),

  // Selector de medidor de sentimiento
  sideSentimentMeter: document.getElementById('side-sentiment-meter'),
  sentimentMeterVal: document.getElementById('sentiment-meter-val'),
  sentimentMeterFill: document.getElementById('sentiment-meter-fill'),

  // Vistas y lienzos SVG
  btnViewRolled: document.getElementById('btn-view-rolled'),
  btnViewUnrolled: document.getElementById('btn-view-unrolled'),
  paneRolled: document.getElementById('pane-rolled'),
  paneUnrolled: document.getElementById('pane-unrolled'),
  svgRolled: document.getElementById('svg-rolled'),
  svgUnrolled: document.getElementById('svg-unrolled'),
  unrolledScroll: document.getElementById('unrolled-scroll-container'),

  // Controles de reproducción
  btnReset: document.getElementById('btn-reset'),
  btnPrev: document.getElementById('btn-prev'),
  btnPlayPause: document.getElementById('btn-play-pause'),
  btnNext: document.getElementById('btn-next'),
  iconPlay: document.getElementById('icon-play'),
  iconPause: document.getElementById('icon-pause'),
  playText: document.getElementById('play-text'),
  speedButtons: document.querySelectorAll('.speed-btn'),
  stepCurr: document.getElementById('step-curr'),
  stepTotal: document.getElementById('step-total'),
  timelineTicks: document.getElementById('timeline-ticks'),

  // Banners y textos explicativos
  bannerStepIndicator: document.getElementById('banner-step-indicator'),
  bannerStepText: document.getElementById('banner-step-text'),
  footerStepTitle: document.getElementById('footer-step-title'),
  footerStepDesc: document.getElementById('footer-step-desc'),

  // Panel lateral: Estado interno
  sideTBadge: document.getElementById('side-t-badge'),
  sideXType: document.getElementById('side-x-type'),
  sideXText: document.getElementById('side-x-text'),
  sideXSub: document.getElementById('side-x-sub'),
  sideHPrevDisplay: document.getElementById('side-h-prev-display'),
  sideHCurrDisplay: document.getElementById('side-h-curr-display'),
  sideHCurrTag: document.getElementById('side-h-curr-tag'),
  sideYStatus: document.getElementById('side-y-status'),
  sideYVal: document.getElementById('side-y-val'),
  sideYText: document.getElementById('side-y-text'),
  sideYConfidence: document.getElementById('side-y-confidence'),
  formulaDisplay: document.getElementById('formula-display'),
  sideFormulaNote: document.getElementById('side-formula-note')
};

// =============================================================================
// INICIALIZACIÓN
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  selectType('one-to-many');
  startPulseAnimation();
});

// =============================================================================
// EVENT LISTENERS Y ATRIBUTOS DE ACCESIBILIDAD
// =============================================================================
function initEventListeners() {
  // Selección de tarjetas principales
  Object.keys(DOM.cards).forEach(typeKey => {
    DOM.cards[typeKey].addEventListener('click', () => {
      if (appState.activeType !== typeKey) {
        selectType(typeKey);
      }
    });
  });

  // Alternador de vistas Enrollada / Desenrollada
  DOM.btnViewRolled.addEventListener('click', () => setViewMode('rolled'));
  DOM.btnViewUnrolled.addEventListener('click', () => setViewMode('unrolled'));

  // Controles de reproducción
  DOM.btnReset.addEventListener('click', resetSimulation);
  DOM.btnPrev.addEventListener('click', stepPrevious);
  DOM.btnPlayPause.addEventListener('click', togglePlayPause);
  DOM.btnNext.addEventListener('click', stepNext);

  // Control de velocidad
  DOM.speedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      DOM.speedButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const newSpeed = parseInt(e.currentTarget.getAttribute('data-speed'), 10);
      appState.playbackSpeed = newSpeed;
      if (appState.isPlaying) {
        clearInterval(appState.playbackTimer);
        appState.playbackTimer = setInterval(advanceStepAutomatically, appState.playbackSpeed);
      }
    });
  });

  // Atajos de teclado para facilitar la presentación
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      stepNext();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      stepPrevious();
    }
  });
}

// =============================================================================
// GESTIÓN DE ARQUITECTURAS Y EJEMPLOS
// =============================================================================
function selectType(typeKey) {
  pauseSimulation();

  appState.activeType = typeKey;
  appState.exampleIndex = 0;
  appState.currentStep = 0;

  // Actualizar tarjetas en el DOM
  Object.keys(DOM.cards).forEach(key => {
    const isTarget = (key === typeKey);
    DOM.cards[key].classList.toggle('active', isTarget);
    DOM.cards[key].setAttribute('aria-pressed', isTarget ? 'true' : 'false');
  });

  const typeConfig = RNN_DATA[typeKey];

  // Actualizar encabezados informativos
  DOM.stageTag.textContent = typeConfig.tag;
  DOM.stageApp.textContent = typeConfig.application;
  DOM.stageDesc.textContent = typeConfig.description;

  // Poblar el selector de ejemplos específico
  populateExampleSelector(typeConfig.examples);

  // Renderizar
  renderAll();
}

function populateExampleSelector(examples) {
  DOM.examplePills.innerHTML = '';

  examples.forEach((example, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `example-btn ${idx === appState.exampleIndex ? 'active' : ''}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', idx === appState.exampleIndex ? 'true' : 'false');

    if (example.icon) {
      btn.innerHTML = `<span style="font-size: 16px;">${example.icon}</span> <span>${example.name}</span>`;
    } else if (example.label) {
      const isPos = example.sentimentType === 'positive';
      btn.innerHTML = `<span>${example.name}</span> <small style="color:${isPos ? 'var(--sentiment-pos)' : 'var(--sentiment-neg)'}; font-weight:600;">(${example.label})</small>`;
    } else {
      btn.innerHTML = `<span>${example.name}</span>`;
    }

    btn.addEventListener('click', () => {
      if (appState.exampleIndex !== idx) {
        pauseSimulation();
        appState.exampleIndex = idx;
        appState.currentStep = 0;

        document.querySelectorAll('.example-btn').forEach((b, i) => {
          b.classList.toggle('active', i === idx);
          b.setAttribute('aria-checked', i === idx ? 'true' : 'false');
        });

        renderAll();
      }
    });

    DOM.examplePills.appendChild(btn);
  });
}

function setViewMode(mode) {
  appState.viewMode = mode;
  const isRolled = (mode === 'rolled');

  DOM.btnViewRolled.classList.toggle('active', isRolled);
  DOM.btnViewRolled.setAttribute('aria-selected', isRolled ? 'true' : 'false');
  DOM.btnViewUnrolled.classList.toggle('active', !isRolled);
  DOM.btnViewUnrolled.setAttribute('aria-selected', !isRolled ? 'true' : 'false');

  // Transición suave entre paneles
  DOM.paneRolled.classList.toggle('active', isRolled);
  DOM.paneUnrolled.classList.toggle('active', !isRolled);

  if (!isRolled) {
    setTimeout(scrollToActiveCell, 60);
  }
}

// =============================================================================
// CONTROLADOR DEL MOTOR DE PASOS
// =============================================================================
function getCurrentExample() {
  const typeConfig = RNN_DATA[appState.activeType];
  return typeConfig.examples[appState.exampleIndex];
}

function getTotalSteps() {
  const example = getCurrentExample();
  return example.steps.length;
}

function togglePlayPause() {
  if (appState.isPlaying) {
    pauseSimulation();
  } else {
    playSimulation();
  }
}

function playSimulation() {
  const total = getTotalSteps();
  if (appState.currentStep >= total - 1) {
    appState.currentStep = 0;
  }

  appState.isPlaying = true;
  DOM.iconPlay.classList.add('hidden');
  DOM.iconPause.classList.remove('hidden');
  DOM.playText.textContent = 'Pausar';

  renderAll();

  clearInterval(appState.playbackTimer);
  appState.playbackTimer = setInterval(advanceStepAutomatically, appState.playbackSpeed);
}

function pauseSimulation() {
  appState.isPlaying = false;
  DOM.iconPlay.classList.remove('hidden');
  DOM.iconPause.classList.add('hidden');
  DOM.playText.textContent = 'Reproducir';
  clearInterval(appState.playbackTimer);
}

function advanceStepAutomatically() {
  const total = getTotalSteps();
  if (appState.currentStep < total - 1) {
    appState.currentStep++;
    renderAll();
  } else {
    pauseSimulation();
  }
}

function stepNext() {
  pauseSimulation();
  const total = getTotalSteps();
  if (appState.currentStep < total - 1) {
    appState.currentStep++;
    renderAll();
  }
}

function stepPrevious() {
  pauseSimulation();
  if (appState.currentStep > 0) {
    appState.currentStep--;
    renderAll();
  }
}

function resetSimulation() {
  pauseSimulation();
  appState.currentStep = 0;
  renderAll();
}

function jumpToStep(stepIdx) {
  pauseSimulation();
  appState.currentStep = stepIdx;
  renderAll();
}

// =============================================================================
// RENDERIZADO CENTRAL
// =============================================================================
function renderAll() {
  const example = getCurrentExample();
  const step = example.steps[appState.currentStep];
  const totalSteps = example.steps.length;

  // Actualizar indicadores numéricos y estados de botones
  DOM.stepCurr.textContent = appState.currentStep + 1;
  DOM.stepTotal.textContent = totalSteps;
  DOM.btnPrev.disabled = (appState.currentStep === 0);
  DOM.btnNext.disabled = (appState.currentStep === totalSteps - 1);

  // Barra de pasos interactiva
  renderTimelineTicks(totalSteps);

  // Banners y explicaciones
  renderBanners(step, example);

  // Panel lateral: Estado interno y fórmula
  renderInternalState(step, example);

  // Vistas SVG
  renderRolledSVG(step, example);
  renderUnrolledSVG(step, example);

  if (appState.viewMode === 'unrolled') {
    scrollToActiveCell();
  }
}

// -----------------------------------------------------------------------------
// Barra de Ticks temporales
// -----------------------------------------------------------------------------
function renderTimelineTicks(totalSteps) {
  DOM.timelineTicks.innerHTML = '';
  for (let i = 0; i < totalSteps; i++) {
    const tick = document.createElement('button');
    tick.type = 'button';
    tick.className = `timeline-tick-btn ${i === appState.currentStep ? 'active' : ''} ${i < appState.currentStep ? 'visited' : ''}`;
    tick.title = `Ir al paso t = ${i}`;
    tick.setAttribute('aria-label', `Paso ${i + 1} de ${totalSteps}`);
    tick.addEventListener('click', () => jumpToStep(i));
    DOM.timelineTicks.appendChild(tick);
  }
}

// -----------------------------------------------------------------------------
// Banners de texto didáctico
// -----------------------------------------------------------------------------
function renderBanners(step, example) {
  let stepPrefix = `Paso t = ${step.t}`;
  if (step.phase) {
    stepPrefix = `[${step.role}] Paso t = ${step.t}`;
  }

  DOM.bannerStepIndicator.textContent = stepPrefix;

  if (appState.activeType === 'one-to-many') {
    if (step.t === 0) {
      DOM.bannerStepText.textContent = `Inyección de imagen ${example.icon} en t=0 → Predice primera palabra "${step.y}"`;
    } else {
      DOM.bannerStepText.textContent = `Retroalimenta token anterior "${step.x}" → Predice "${step.y}"`;
    }
  } else if (appState.activeType === 'many-to-one') {
    if (step.isFinal) {
      DOM.bannerStepText.textContent = `Paso final: Emisión de clasificación ${step.y}`;
    } else {
      DOM.bannerStepText.textContent = `Procesa "${step.x}" → Acumula carga semántica en h_${step.t} (Paso ${appState.currentStep + 1}/${example.steps.length})`;
    }
  } else if (appState.activeType === 'many-to-many') {
    if (step.phase === 'encoder') {
      if (step.isContextTransition) {
        DOM.bannerStepText.textContent = `Fin de codificación: El vector h_${step.t} se convierte en el Vector de Contexto c`;
      } else {
        DOM.bannerStepText.textContent = `Encoder: Lee "${step.x}" (sin emisión de salida)`;
      }
    } else {
      DOM.bannerStepText.textContent = `Decoder: Entrada "${step.x}" → Predice palabra traducida "${step.y}"`;
    }
  }

  DOM.footerStepTitle.textContent = `Paso t = ${step.t}: ${step.x ? `Entrada: ${step.x}` : ''} ${step.y ? `→ Salida: ${step.y}` : ''}`;
  DOM.footerStepDesc.textContent = step.explanation;
}

// -----------------------------------------------------------------------------
// Panel Lateral: Estado Interno y Resaltado Dinámico de Fórmula
// -----------------------------------------------------------------------------
function renderInternalState(step, example) {
  DOM.sideTBadge.textContent = `t = ${step.t}`;

  // 1. Entrada actual x_t
  DOM.sideXText.textContent = step.x || '—';
  if (step.xType === 'image') {
    DOM.sideXType.textContent = 'Vector Imagen';
    DOM.sideXSub.textContent = 'Vector de características visuales CNN';
  } else if (step.isFeedback) {
    DOM.sideXType.textContent = 'Token Retroalimentado';
    DOM.sideXSub.textContent = `Proviene de la salida y_{${step.t - 1}}`;
  } else if (step.phase === 'decoder' && step.x === '<INICIO>') {
    DOM.sideXType.textContent = 'Token Control';
    DOM.sideXSub.textContent = 'Señal de inicio de decodificación (SOS)';
  } else {
    DOM.sideXType.textContent = 'Token de Entrada';
    DOM.sideXSub.textContent = step.xRaw || 'Representación embedding';
  }

  // 2. Vector previo h_{t-1}
  renderVectorCells(DOM.sideHPrevDisplay, step.h_prev, 'h_prev', step, example);

  // 3. Vector actual h_t
  renderVectorCells(DOM.sideHCurrDisplay, step.h_curr, 'h_curr', step, example);
  if (step.isContextTransition) {
    DOM.sideHCurrTag.textContent = '★ Vector Contexto';
  } else {
    DOM.sideHCurrTag.textContent = 'tanh activada';
  }

  // 4. Salida actual y_t
  DOM.sideYVal.classList.remove('sentiment-pos', 'sentiment-neg');

  if (appState.activeType === 'many-to-one') {
    if (step.isFinal) {
      DOM.sideYStatus.textContent = 'Clasificación Final';
      DOM.sideYText.textContent = step.y;
      DOM.sideYConfidence.textContent = `Confianza global: ${example.finalConfidence}`;
      if (example.sentimentType === 'positive') {
        DOM.sideYVal.classList.add('sentiment-pos');
      } else {
        DOM.sideYVal.classList.add('sentiment-neg');
      }
    } else {
      DOM.sideYStatus.textContent = 'Atenuada (Acumulando)';
      DOM.sideYText.textContent = '(Sin emisión en pasos intermedios)';
      DOM.sideYConfidence.textContent = 'El significado se preserva en h_t';
    }
  } else if (appState.activeType === 'many-to-many') {
    if (step.phase === 'encoder') {
      DOM.sideYStatus.textContent = step.isContextTransition ? 'Transición' : 'Inactiva (Encoder)';
      DOM.sideYText.textContent = step.isContextTransition ? '★ Vector de Contexto c' : '(Solo codificación - Sin salida)';
      DOM.sideYConfidence.textContent = step.isContextTransition ? 'Transferido al Decoder' : 'Compresión secuencial';
    } else {
      DOM.sideYStatus.textContent = 'Token Emitido';
      DOM.sideYText.textContent = step.y;
      DOM.sideYConfidence.textContent = step.yConfidence ? `Confianza: ${step.yConfidence}` : 'Predicción autoregresiva';
    }
  } else {
    // One-to-Many
    DOM.sideYStatus.textContent = 'Palabra Generada';
    DOM.sideYText.textContent = step.y;
    DOM.sideYConfidence.textContent = step.yConfidence ? `Probabilidad: ${step.yConfidence}` : '';
  }

  // 5. Fórmula dinámica con términos resaltados según el paso actual
  renderFormulaWithHighlights(step);
}

/**
 * Renderiza la fórmula matemática y resalta los términos pertinentes al paso
 */
function renderFormulaWithHighlights(step) {
  if (appState.activeType === 'many-to-many') {
    if (step.phase === 'encoder') {
      if (step.isContextTransition) {
        DOM.formulaDisplay.innerHTML = `
          <span class="formula-term active-highlight" style="color:#B45309; background:#FEF3C7;">c = h<sub>${step.t}</sub></span>
          <span class="formula-op">→</span>
          <span class="formula-term active-highlight" style="color:#2F6F67; background:#EDF7F6;">s<sub>0</sub> = c</span>
        `;
        DOM.sideFormulaNote.innerHTML = `<strong>Vector de Contexto c</strong>: El último estado oculto del encoder encapsula la totalidad de la frase de entrada y se inyecta como estado inicial <strong>s₀</strong> del decoder.`;
      } else {
        DOM.formulaDisplay.innerHTML = `
          <span class="formula-term formula-target">h<sub>t</sub></span>
          <span class="formula-op">=</span>
          <span class="formula-act">tanh</span>
          <span class="formula-paren">(</span>
          <span class="formula-term term-x active-highlight">W<sub>xh</sub>·x<sub>t</sub></span>
          <span class="formula-op">+</span>
          <span class="formula-term term-h ${step.t === 0 ? 'dimmed' : 'active-highlight'}">W<sub>hh</sub>·h<sub>t-1</sub></span>
          <span class="formula-op">+</span>
          <span class="formula-term term-b">b</span>
          <span class="formula-paren">)</span>
        `;
        DOM.sideFormulaNote.innerHTML = `Fase <strong>Encoder</strong>: Procesa la entrada en español token por token sin emitir salida externa, actualizando el vector oculto <strong>h<sub>t</sub></strong>.`;
      }
    } else {
      // Decoder
      DOM.formulaDisplay.innerHTML = `
        <span class="formula-term" style="color:#2F6F67; background:#EDF7F6;">s<sub>t</sub></span>
        <span class="formula-op">=</span>
        <span class="formula-act">tanh</span>
        <span class="formula-paren">(</span>
        <span class="formula-term term-x active-highlight">W<sub>ys</sub>·y<sub>t-1</sub></span>
        <span class="formula-op">+</span>
        <span class="formula-term term-h active-highlight">W<sub>ss</sub>·s<sub>t-1</sub></span>
        <span class="formula-paren">)</span>
      `;
      DOM.sideFormulaNote.innerHTML = `Fase <strong>Decoder</strong>: Genera palabras en inglés utilizando la palabra anterior <strong>y<sub>t-1</sub></strong> y la memoria del decoder <strong>s<sub>t-1</sub></strong>.`;
    }
  } else {
    // One-to-Many y Many-to-One
    const isFirstStep = (step.t === 0);
    DOM.formulaDisplay.innerHTML = `
      <span class="formula-term formula-target">h<sub>t</sub></span>
      <span class="formula-op">=</span>
      <span class="formula-act">tanh</span>
      <span class="formula-paren">(</span>
      <span class="formula-term term-x active-highlight" title="Entrada proyectada">W<sub>xh</sub>·x<sub>t</sub></span>
      <span class="formula-op">+</span>
      <span class="formula-term term-h ${isFirstStep ? 'dimmed' : 'active-highlight'}" title="Memoria recurrente previa">W<sub>hh</sub>·h<sub>t-1</sub></span>
      <span class="formula-op">+</span>
      <span class="formula-term term-b">b</span>
      <span class="formula-paren">)</span>
    `;

    if (isFirstStep) {
      DOM.sideFormulaNote.innerHTML = `En <strong>t=0</strong>, como no existe historial previo (<strong>h<sub>-1</sub> = 0</strong>), el estado <strong>h₀</strong> responde íntegramente al estímulo de entrada <strong>W<sub>xh</sub>·x₀</strong>.`;
    } else if (appState.activeType === 'many-to-one' && step.isFinal) {
      DOM.sideFormulaNote.innerHTML = `En el último paso, se aplica la capa de decisión final: <strong>y = softmax(W<sub>hy</sub>·h<sub>T</sub> + b<sub>y</sub>)</strong> clasificando el sentimiento acumulado.`;
    } else {
      DOM.sideFormulaNote.innerHTML = `El estado <strong>h<sub>t</sub></strong> fusiona la entrada actual <strong>x<sub>t</sub></strong> con la memoria acumulada <strong>h<sub>t-1</sub></strong> mediante la función tangente hiperbólica.`;
    }
  }
}

/**
 * Renderiza los 4 valores de un vector [-1, 1] como celdas con barra de intensidad y gradiente
 */
function renderVectorCells(container, vectorValues, prefix, step, example) {
  container.innerHTML = '';
  if (!vectorValues) return;

  vectorValues.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.className = 'vector-cell';

    const indexLabel = document.createElement('span');
    indexLabel.className = 'vector-index';
    indexLabel.textContent = `[${idx}]`;

    const gaugeWrapper = document.createElement('div');
    gaugeWrapper.className = 'vector-gauge-wrapper';

    const centerLine = document.createElement('div');
    centerLine.className = 'vector-gauge-center';

    const fill = document.createElement('div');
    fill.className = `vector-gauge-fill ${val >= 0 ? 'pos' : 'neg'}`;

    // Desplazamiento progresivo del color hacia verde o rojo en análisis de sentimiento
    if (appState.activeType === 'many-to-one' && prefix === 'h_curr') {
      const score = step.sentimentScore || 0;
      if (example.sentimentType === 'positive') {
        fill.classList.add('sentiment-green');
        const intensity = Math.min(Math.abs(score) * 0.8 + 0.2, 1);
        fill.style.backgroundColor = `rgba(46, 125, 99, ${intensity})`;
      } else {
        fill.classList.add('sentiment-red');
        const intensity = Math.min(Math.abs(score) * 0.8 + 0.2, 1);
        fill.style.backgroundColor = `rgba(192, 78, 78, ${intensity})`;
      }
    }

    const pct = Math.min(Math.abs(val) * 50, 50); // máx 50% hacia un lado desde el centro
    fill.style.width = `${pct}%`;

    const valNum = document.createElement('span');
    valNum.className = 'vector-val-num';
    valNum.textContent = (val >= 0 ? '+' : '') + val.toFixed(2);

    gaugeWrapper.appendChild(centerLine);
    gaugeWrapper.appendChild(fill);
    gaugeWrapper.appendChild(valNum);

    cell.appendChild(indexLabel);
    cell.appendChild(gaugeWrapper);
    container.appendChild(cell);
  });
}

// =============================================================================
// DIBUJADO SVG: VISTA ENROLLADA (Rolled View)
// =============================================================================
function renderRolledSVG(step, example) {
  const svg = DOM.svgRolled;
  const isEncoderDecoder = (appState.activeType === 'many-to-many');

  svg.innerHTML = '';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="arrow-rolled" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#8E95A5" />
    </marker>
    <marker id="arrow-rolled-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#5266EB" />
    </marker>
    <marker id="arrow-rolled-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4FA39B" />
    </marker>
    <marker id="arrow-rolled-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
    </marker>
  `;
  svg.appendChild(defs);

  if (isEncoderDecoder) {
    renderRolledEncoderDecoder(svg, step, example);
  } else {
    renderRolledSingleCell(svg, step, example);
  }
}

/**
 * Dibuja la celda única enrollada con bucle sobre sí misma
 */
function renderRolledSingleCell(svg, step, example) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const cx = 320;
  const cyCell = 210;
  const cyInput = 350;
  const cyOutput = 70;
  const cellW = 160;
  const cellH = 90;

  // 1. Contador temporal t = n
  const tBadge = createSVGElement('g', { transform: 'translate(40, 36)' });
  tBadge.innerHTML = `
    <rect x="0" y="0" width="116" height="42" rx="8" fill="#FFFFFF" stroke="#DDE0EA" stroke-width="1.5"/>
    <text x="14" y="26" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#1F2330">
      t = <tspan fill="#5266EB">${step.t}</tspan>
    </text>
  `;
  g.appendChild(tBadge);

  // 2. Bucle recurrente curvo (h_{t-1} -> h_t)
  const loopPathStr = `M ${cx + cellW/2} ${cyCell} C ${cx + cellW/2 + 80} ${cyCell - 10}, ${cx + cellW/2 + 80} ${cyCell - 80}, ${cx + 35} ${cyCell - cellH/2}`;
  const loopPath = createSVGElement('path', {
    id: 'rolled-loop-path',
    d: loopPathStr,
    fill: 'none',
    stroke: '#4FA39B',
    'stroke-width': '2.5',
    'marker-end': 'url(#arrow-rolled-teal)'
  });
  g.appendChild(loopPath);

  const loopLabel = createSVGElement('text', {
    x: cx + cellW/2 + 25,
    y: cyCell - 50,
    'font-family': 'Newsreader, Georgia, serif',
    'font-size': '13',
    'font-style': 'italic',
    fill: '#2F6F67'
  });
  loopLabel.textContent = 'Whh · ht-1';
  g.appendChild(loopLabel);

  // 3. Flecha Entrada -> Celda (x_t -> h_t)
  const inputWire = createSVGElement('path', {
    id: 'rolled-input-wire',
    d: `M ${cx} ${cyInput - 24} L ${cx} ${cyCell + cellH/2}`,
    fill: 'none',
    stroke: '#5266EB',
    'stroke-width': '2.5',
    'marker-end': 'url(#arrow-rolled-active)'
  });
  g.appendChild(inputWire);

  // 4. Flecha Celda -> Salida (h_t -> y_t)
  const hasOutput = (step.y !== null && step.y !== '(Sin salida)');
  const outputWire = createSVGElement('path', {
    id: 'rolled-output-wire',
    d: `M ${cx} ${cyCell - cellH/2} L ${cx} ${cyOutput + 24}`,
    fill: 'none',
    stroke: hasOutput ? '#5266EB' : '#D1D5DB',
    'stroke-width': hasOutput ? '2.5' : '1.5',
    'stroke-dasharray': hasOutput ? 'none' : '4 3',
    'marker-end': hasOutput ? 'url(#arrow-rolled-active)' : 'url(#arrow-rolled)'
  });
  g.appendChild(outputWire);

  // 5. En One-to-Many: Retroalimentación y_{t-1} -> x_t
  if (appState.activeType === 'one-to-many') {
    const isFeedbackActive = (step.t > 0);
    const fbPathStr = `M ${cx - 75} ${cyOutput} C ${cx - 200} ${cyOutput + 35}, ${cx - 200} ${cyInput - 35}, ${cx - 75} ${cyInput}`;
    const fbWire = createSVGElement('path', {
      id: 'rolled-fb-path',
      d: fbPathStr,
      fill: 'none',
      stroke: isFeedbackActive ? '#5266EB' : '#E2E5EB',
      'stroke-width': isFeedbackActive ? '2' : '1.2',
      'stroke-dasharray': '5 3',
      'marker-end': isFeedbackActive ? 'url(#arrow-rolled-active)' : 'url(#arrow-rolled)'
    });
    g.appendChild(fbWire);

    const fbText = createSVGElement('text', {
      x: cx - 180,
      y: (cyOutput + cyInput) / 2,
      'font-family': 'Inter, sans-serif',
      'font-size': '10.5',
      'font-weight': '600',
      fill: isFeedbackActive ? '#5266EB' : '#9599A6'
    });
    fbText.textContent = 'Retroalimentación y_{t-1} → x_t';
    g.appendChild(fbText);
  }

  // 6. Nodo de Entrada (x_t)
  const inputNode = createSVGElement('g', { transform: `translate(${cx}, ${cyInput})` });
  inputNode.innerHTML = `
    <rect x="-75" y="-22" width="150" height="44" rx="10" fill="#FFFFFF" stroke="#5266EB" stroke-width="2"/>
    <text x="0" y="-4" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#6B7080" letter-spacing="0.05em">
      ENTRADA (xt)
    </text>
    <text x="0" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#1F2330">
      ${truncateText(step.x, 16)}
    </text>
  `;
  g.appendChild(inputNode);

  // 7. Celda Recurrente (h_t)
  let cellColor = '#4FA39B';
  if (appState.activeType === 'many-to-one') {
    cellColor = example.sentimentType === 'positive' ? 'var(--sentiment-pos)' : 'var(--sentiment-neg)';
  }

  const cellNode = createSVGElement('g', { transform: `translate(${cx}, ${cyCell})` });
  cellNode.innerHTML = `
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="${cellH}" rx="14" fill="#FFFFFF" stroke="${cellColor}" stroke-width="2.5" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.04))"/>
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="26" rx="14" fill="${cellColor}" opacity="0.12"/>
    <text x="0" y="-${cellH/2 - 17}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="${cellColor}" letter-spacing="0.04em">
      CELDA RNN (ht)
    </text>
    <g transform="translate(-54, 2)">
      ${step.h_curr.map((v, i) => `
        <rect x="${i * 28}" y="0" width="24" height="22" rx="4" fill="${v >= 0 ? 'rgba(79, 163, 155, 0.15)' : 'rgba(196, 104, 104, 0.15)'}" stroke="#DDE0EA" stroke-width="1"/>
        <text x="${i * 28 + 12}" y="15" text-anchor="middle" font-family="monospace" font-size="9.5" font-weight="600" fill="#1F2330">${(v >= 0 ? '+' : '') + v.toFixed(1)}</text>
      `).join('')}
    </g>
    <text x="0" y="34" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="11" font-style="italic" fill="#6B7080">
      ht = tanh(Wxh·xt + Whh·ht-1)
    </text>
  `;
  g.appendChild(cellNode);

  // 8. Nodo de Salida (y_t)
  const outputNode = createSVGElement('g', { transform: `translate(${cx}, ${cyOutput})` });
  const outputText = step.y ? truncateText(step.y, 22) : '(Sin emisión)';
  outputNode.innerHTML = `
    <rect x="-85" y="-22" width="170" height="44" rx="10" fill="${hasOutput ? '#FFFFFF' : '#F7F7F5'}" stroke="${hasOutput ? '#5266EB' : '#D1D5DB'}" stroke-width="${hasOutput ? '2' : '1.5'}"/>
    <text x="0" y="-4" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="${hasOutput ? '#5266EB' : '#9599A6'}" letter-spacing="0.05em">
      SALIDA (yt)
    </text>
    <text x="0" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="${hasOutput ? '#1F2330' : '#9599A6'}">
      ${outputText}
    </text>
  `;
  g.appendChild(outputNode);

  // 9. Pulsos dinámicos en movimiento
  const pulseIn = createSVGElement('circle', {
    id: 'rolled-pulse-in',
    r: '4.5',
    fill: '#5266EB',
    filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
  });
  g.appendChild(pulseIn);

  const pulseLoop = createSVGElement('circle', {
    id: 'rolled-pulse-loop',
    r: '4',
    fill: '#4FA39B',
    filter: 'drop-shadow(0 0 3px rgba(79, 163, 155, 0.7))'
  });
  g.appendChild(pulseLoop);

  if (hasOutput) {
    const pulseOut = createSVGElement('circle', {
      id: 'rolled-pulse-out',
      r: '4.5',
      fill: '#5266EB',
      filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
    });
    g.appendChild(pulseOut);
  }

  if (appState.activeType === 'one-to-many' && step.t > 0) {
    const pulseFb = createSVGElement('circle', {
      id: 'rolled-pulse-fb',
      r: '4',
      fill: '#5266EB',
      filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
    });
    g.appendChild(pulseFb);
  }

  svg.appendChild(g);
}

/**
 * Dibuja la arquitectura enrollada para Encoder-Decoder
 */
function renderRolledEncoderDecoder(svg, step, example) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const cxEnc = 180;
  const cxDec = 460;
  const cyCell = 210;
  const cyInput = 350;
  const cyOutput = 70;
  const cellW = 140;
  const cellH = 90;

  const isEncPhase = (step.phase === 'encoder');

  // Indicador de fase actual y paso
  const phaseBadge = createSVGElement('g', { transform: 'translate(40, 30)' });
  phaseBadge.innerHTML = `
    <rect x="0" y="0" width="170" height="42" rx="8" fill="#FFFFFF" stroke="#DDE0EA" stroke-width="1.5"/>
    <text x="14" y="26" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#1F2330">
      ${isEncPhase ? 'Fase: <tspan fill="#5266EB">Encoder</tspan>' : 'Fase: <tspan fill="#2E7D63">Decoder</tspan>'} (t=${step.t})
    </text>
  `;
  g.appendChild(phaseBadge);

  // 1. ZONA ENCODER
  const encCell = createSVGElement('g', { transform: `translate(${cxEnc}, ${cyCell})` });
  encCell.innerHTML = `
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="${cellH}" rx="12" fill="#FFFFFF" stroke="${isEncPhase ? '#5266EB' : '#DDE0EA'}" stroke-width="${isEncPhase ? '2.5' : '1.5'}" ${isEncPhase ? 'filter="drop-shadow(0 2px 8px rgba(82,102,235,0.15))"' : ''}/>
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="24" rx="12" fill="${isEncPhase ? '#EEF0FD' : '#F5F6F9'}"/>
    <text x="0" y="-${cellH/2 - 16}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="${isEncPhase ? '#5266EB' : '#6B7080'}">
      ENCODER (ht)
    </text>
    <text x="0" y="10" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#6B7080">
      Lee secuencia ES
    </text>
    <text x="0" y="30" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="11" font-style="italic" fill="#9599A6">
      Sin salida externa
    </text>
  `;
  g.appendChild(encCell);

  const encLoop = createSVGElement('path', {
    id: 'enc-loop-path',
    d: `M ${cxEnc + cellW/2} ${cyCell} C ${cxEnc + cellW/2 + 50} ${cyCell - 10}, ${cxEnc + cellW/2 + 50} ${cyCell - 65}, ${cxEnc + 25} ${cyCell - cellH/2}`,
    fill: 'none',
    stroke: isEncPhase ? '#5266EB' : '#DDE0EA',
    'stroke-width': '2',
    'marker-end': isEncPhase ? 'url(#arrow-rolled-active)' : 'url(#arrow-rolled)'
  });
  g.appendChild(encLoop);

  const encInputWire = createSVGElement('path', {
    id: 'enc-input-wire',
    d: `M ${cxEnc} ${cyInput - 22} L ${cxEnc} ${cyCell + cellH/2}`,
    fill: 'none',
    stroke: isEncPhase ? '#5266EB' : '#DDE0EA',
    'stroke-width': '2',
    'marker-end': isEncPhase ? 'url(#arrow-rolled-active)' : 'url(#arrow-rolled)'
  });
  g.appendChild(encInputWire);

  const encInputNode = createSVGElement('g', { transform: `translate(${cxEnc}, ${cyInput})` });
  encInputNode.innerHTML = `
    <rect x="-65" y="-20" width="130" height="40" rx="8" fill="#FFFFFF" stroke="${isEncPhase ? '#5266EB' : '#DDE0EA'}" stroke-width="1.5"/>
    <text x="0" y="-3" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="${isEncPhase ? '#5266EB' : '#9599A6'}">ENTRADA (xt)</text>
    <text x="0" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#1F2330">${isEncPhase ? step.x : '...'}</text>
  `;
  g.appendChild(encInputNode);

  // 2. PUENTE: VECTOR DE CONTEXTO c (Encoder -> Decoder)
  const contextBridge = createSVGElement('path', {
    id: 'rolled-context-bridge',
    d: `M ${cxEnc + cellW/2} ${cyCell} L ${cxDec - cellW/2} ${cyCell}`,
    fill: 'none',
    stroke: '#D97706',
    'stroke-width': step.isContextTransition ? '3' : '2',
    'stroke-dasharray': step.isContextTransition ? 'none' : '4 3',
    'marker-end': 'url(#arrow-rolled-gold)'
  });
  g.appendChild(contextBridge);

  const bridgeBadge = createSVGElement('g', { transform: `translate(${(cxEnc + cxDec)/2}, ${cyCell - 16})` });
  bridgeBadge.innerHTML = `
    <rect x="-60" y="-12" width="120" height="24" rx="12" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.2"/>
    <text x="0" y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#B45309">
      Vector de Contexto c
    </text>
  `;
  g.appendChild(bridgeBadge);

  // 3. ZONA DECODER
  const decCell = createSVGElement('g', { transform: `translate(${cxDec}, ${cyCell})` });
  decCell.innerHTML = `
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="${cellH}" rx="12" fill="#FFFFFF" stroke="${!isEncPhase ? '#2E7D63' : '#DDE0EA'}" stroke-width="${!isEncPhase ? '2.5' : '1.5'}" ${!isEncPhase ? 'filter="drop-shadow(0 2px 8px rgba(46,125,99,0.15))"' : ''}/>
    <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="24" rx="12" fill="${!isEncPhase ? '#EBF7F2' : '#F5F6F9'}"/>
    <text x="0" y="-${cellH/2 - 16}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="${!isEncPhase ? '#2E7D63' : '#6B7080'}">
      DECODER (st)
    </text>
    <text x="0" y="10" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#6B7080">
      Genera secuencia EN
    </text>
    <text x="0" y="30" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="11" font-style="italic" fill="#9599A6">
      s₀ = Vector Contexto
    </text>
  `;
  g.appendChild(decCell);

  const decLoop = createSVGElement('path', {
    id: 'dec-loop-path',
    d: `M ${cxDec + cellW/2} ${cyCell} C ${cxDec + cellW/2 + 50} ${cyCell - 10}, ${cxDec + cellW/2 + 50} ${cyCell - 65}, ${cxDec + 25} ${cyCell - cellH/2}`,
    fill: 'none',
    stroke: !isEncPhase ? '#2E7D63' : '#DDE0EA',
    'stroke-width': '2',
    'marker-end': !isEncPhase ? 'url(#arrow-rolled-teal)' : 'url(#arrow-rolled)'
  });
  g.appendChild(decLoop);

  const decInputWire = createSVGElement('path', {
    id: 'dec-input-wire',
    d: `M ${cxDec} ${cyInput - 22} L ${cxDec} ${cyCell + cellH/2}`,
    fill: 'none',
    stroke: !isEncPhase ? '#2E7D63' : '#DDE0EA',
    'stroke-width': '2',
    'marker-end': !isEncPhase ? 'url(#arrow-rolled-teal)' : 'url(#arrow-rolled)'
  });
  g.appendChild(decInputWire);

  const decInputNode = createSVGElement('g', { transform: `translate(${cxDec}, ${cyInput})` });
  decInputNode.innerHTML = `
    <rect x="-65" y="-20" width="130" height="40" rx="8" fill="#FFFFFF" stroke="${!isEncPhase ? '#2E7D63' : '#DDE0EA'}" stroke-width="1.5"/>
    <text x="0" y="-3" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="${!isEncPhase ? '#2E7D63' : '#9599A6'}">ENTRADA (yt-1)</text>
    <text x="0" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#1F2330">${!isEncPhase ? step.x : '...'}</text>
  `;
  g.appendChild(decInputNode);

  const decOutputWire = createSVGElement('path', {
    id: 'dec-output-wire',
    d: `M ${cxDec} ${cyCell - cellH/2} L ${cxDec} ${cyOutput + 22}`,
    fill: 'none',
    stroke: (!isEncPhase && step.y) ? '#2E7D63' : '#DDE0EA',
    'stroke-width': '2',
    'marker-end': (!isEncPhase && step.y) ? 'url(#arrow-rolled-teal)' : 'url(#arrow-rolled)'
  });
  g.appendChild(decOutputWire);

  const decOutputNode = createSVGElement('g', { transform: `translate(${cxDec}, ${cyOutput})` });
  decOutputNode.innerHTML = `
    <rect x="-70" y="-20" width="140" height="40" rx="8" fill="#FFFFFF" stroke="${(!isEncPhase && step.y) ? '#2E7D63' : '#DDE0EA'}" stroke-width="1.5"/>
    <text x="0" y="-3" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="${(!isEncPhase && step.y) ? '#2E7D63' : '#9599A6'}">SALIDA (yt)</text>
    <text x="0" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#1F2330">${(!isEncPhase && step.y) ? step.y : '—'}</text>
  `;
  g.appendChild(decOutputNode);

  // Pulsos en Encoder-Decoder
  if (isEncPhase) {
    const pEncIn = createSVGElement('circle', {
      id: 'enc-pulse-in',
      r: '4',
      fill: '#5266EB',
      filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
    });
    g.appendChild(pEncIn);
  } else {
    const pDecIn = createSVGElement('circle', {
      id: 'dec-pulse-in',
      r: '4',
      fill: '#2E7D63',
      filter: 'drop-shadow(0 0 3px rgba(46, 125, 99, 0.7))'
    });
    g.appendChild(pDecIn);

    if (step.y) {
      const pDecOut = createSVGElement('circle', {
        id: 'dec-pulse-out',
        r: '4',
        fill: '#2E7D63',
        filter: 'drop-shadow(0 0 3px rgba(46, 125, 99, 0.7))'
      });
      g.appendChild(pDecOut);
    }
  }

  if (step.isContextTransition) {
    const pBridge = createSVGElement('circle', {
      id: 'bridge-pulse',
      r: '5',
      fill: '#D97706',
      filter: 'drop-shadow(0 0 4px rgba(217, 119, 6, 0.8))'
    });
    g.appendChild(pBridge);
  }

  svg.appendChild(g);
}

// =============================================================================
// DIBUJADO SVG: VISTA DESENROLLADA (Unrolled View)
// =============================================================================
function renderUnrolledSVG(activeStep, example) {
  const svg = DOM.svgUnrolled;
  const steps = example.steps;
  const totalSteps = steps.length;

  const isEncoderDecoder = (appState.activeType === 'many-to-many');

  const stepWidth = 145;
  const marginX = 80;
  const totalSvgWidth = Math.max(920, marginX * 2 + totalSteps * stepWidth);
  const totalSvgHeight = 440;

  svg.setAttribute('viewBox', `0 0 ${totalSvgWidth} ${totalSvgHeight}`);
  svg.innerHTML = '';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="arrow-unroll" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#8E95A5" />
    </marker>
    <marker id="arrow-unroll-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#5266EB" />
    </marker>
    <marker id="arrow-unroll-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4FA39B" />
    </marker>
    <marker id="arrow-axis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#A0A6B5" />
    </marker>
    <marker id="arrow-context" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
    </marker>
  `;
  svg.appendChild(defs);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const cyCell = 195;
  const cyInput = 330;
  const cyOutput = 65;
  const cellW = 95;
  const cellH = 68;

  // 1. En Encoder-Decoder: Dibujar los dos bloques diferenciados con sus dimensiones
  if (isEncoderDecoder) {
    const encStepsCount = example.inputLength;
    const decStepsCount = totalSteps - encStepsCount;

    const encStart = marginX - 30;
    const encWidth = encStepsCount * stepWidth;
    const decStart = encStart + encWidth + 10;
    const decWidth = decStepsCount * stepWidth + 20;

    // Badge comparador de longitudes distintas
    const diffBadge = createSVGElement('g', { transform: `translate(${(encStart + decStart + decWidth)/2}, 24)` });
    diffBadge.innerHTML = `
      <rect x="-140" y="-12" width="280" height="24" rx="12" fill="#FFFFFF" stroke="#DDE0EA" stroke-width="1.2"/>
      <text x="0" y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#1F2330">
        Entrada N = ${example.inputLength} tokens ≠ Salida M = ${example.outputLength} tokens
      </text>
    `;
    g.appendChild(diffBadge);

    // Bloque Encoder
    const encBlock = createSVGElement('g', {});
    encBlock.innerHTML = `
      <rect x="${encStart}" y="42" width="${encWidth}" height="330" rx="14" class="svg-phase-block-encoder"/>
      <text x="${encStart + 16}" y="64" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#5266EB" letter-spacing="0.04em">
        CODIFICADOR (ENCODER) — Español (${example.inputLength} pasos)
      </text>
    `;
    g.appendChild(encBlock);

    // Bloque Decoder
    const decBlock = createSVGElement('g', {});
    decBlock.innerHTML = `
      <rect x="${decStart}" y="42" width="${decWidth}" height="330" rx="14" class="svg-phase-block-decoder"/>
      <text x="${decStart + 16}" y="64" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#2E7D63" letter-spacing="0.04em">
        DECODIFICADOR (DECODER) — Inglés (${example.outputLength} palabras + control)
      </text>
    `;
    g.appendChild(decBlock);
  }

  // 2. Conexiones horizontales entre celdas recurrentes (h_{t-1} -> h_t)
  for (let i = 0; i < totalSteps - 1; i++) {
    const x1 = marginX + i * stepWidth + cellW/2;
    const x2 = marginX + (i + 1) * stepWidth - cellW/2;
    const isTrans = (isEncoderDecoder && i === example.inputLength - 1);

    const wire = createSVGElement('path', {
      d: `M ${x1} ${cyCell} L ${x2} ${cyCell}`,
      fill: 'none',
      stroke: isTrans ? '#D97706' : (i < appState.currentStep ? '#4FA39B' : '#CCD1DE'),
      'stroke-width': isTrans ? '2.5' : (i < appState.currentStep ? '2' : '1.5'),
      'stroke-dasharray': isTrans ? '5 3' : 'none',
      'marker-end': isTrans ? 'url(#arrow-context)' : (i < appState.currentStep ? 'url(#arrow-unroll-teal)' : 'url(#arrow-unroll)')
    });
    g.appendChild(wire);

    if (isTrans) {
      const transBadge = createSVGElement('g', { transform: `translate(${(x1 + x2)/2}, ${cyCell - 16})` });
      transBadge.innerHTML = `
        <rect x="-48" y="-10" width="96" height="20" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
        <text x="0" y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="#B45309">
          ★ Vector Contexto c
        </text>
      `;
      g.appendChild(transBadge);
    }
  }

  // 3. En One-to-Many: Curvas de retroalimentación de y_{t-1} a x_t
  if (appState.activeType === 'one-to-many') {
    for (let i = 0; i < totalSteps - 1; i++) {
      const xOutput = marginX + i * stepWidth;
      const xInputNext = marginX + (i + 1) * stepWidth;
      const fbPath = createSVGElement('path', {
        d: `M ${xOutput} ${cyOutput + 18} C ${xOutput} ${cyOutput + 50}, ${xInputNext - 30} ${cyInput - 40}, ${xInputNext - 38} ${cyInput}`,
        fill: 'none',
        stroke: (i < appState.currentStep) ? '#5266EB' : '#E2E5EB',
        'stroke-width': '1.5',
        'stroke-dasharray': '4 3',
        'marker-end': (i < appState.currentStep) ? 'url(#arrow-unroll-active)' : 'url(#arrow-unroll)'
      });
      g.appendChild(fbPath);
    }
  }

  // 4. Dibujar cada paso desenrollado
  steps.forEach((st, idx) => {
    const cx = marginX + idx * stepWidth;
    const isActive = (idx === appState.currentStep);
    const isPast = (idx < appState.currentStep);
    const isFuture = (idx > appState.currentStep);

    const stepGroup = createSVGElement('g', {
      id: `unroll-step-${idx}`,
      opacity: isFuture ? '0.45' : '1',
      cursor: 'pointer'
    });

    stepGroup.addEventListener('click', () => jumpToStep(idx));

    // Flecha Entrada -> Celda (x_t -> h_t)
    const inWire = createSVGElement('path', {
      d: `M ${cx} ${cyInput - 20} L ${cx} ${cyCell + cellH/2}`,
      fill: 'none',
      stroke: isActive ? '#5266EB' : (isPast ? '#4FA39B' : '#CCD1DE'),
      'stroke-width': isActive ? '2.5' : '1.5',
      'marker-end': isActive ? 'url(#arrow-unroll-active)' : 'url(#arrow-unroll)'
    });
    stepGroup.appendChild(inWire);

    // Flecha Celda -> Salida (h_t -> y_t)
    const hasOut = (st.y !== null && st.y !== '(Sin salida)' && st.y !== '(Vector de Contexto)');
    if (hasOut || appState.activeType === 'many-to-one') {
      const outWire = createSVGElement('path', {
        d: `M ${cx} ${cyCell - cellH/2} L ${cx} ${cyOutput + 20}`,
        fill: 'none',
        stroke: (isActive && hasOut) ? '#5266EB' : (hasOut && isPast ? '#4FA39B' : '#E2E5EB'),
        'stroke-width': (isActive && hasOut) ? '2.5' : '1.5',
        'stroke-dasharray': hasOut ? 'none' : '3 3',
        'marker-end': hasOut ? 'url(#arrow-unroll-active)' : 'url(#arrow-unroll)'
      });
      stepGroup.appendChild(outWire);
    }

    // Nodo Entrada (x_t)
    const inNode = createSVGElement('g', { transform: `translate(${cx}, ${cyInput})` });
    inNode.innerHTML = `
      <rect x="-42" y="-18" width="84" height="36" rx="8" fill="#FFFFFF" stroke="${isActive ? '#5266EB' : '#DDE0EA'}" stroke-width="${isActive ? '2' : '1.2'}"/>
      <text x="0" y="-3" text-anchor="middle" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#6B7080">x${st.t}</text>
      <text x="0" y="11" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#1F2330">${truncateText(st.x, 9)}</text>
    `;
    stepGroup.appendChild(inNode);

    // Celda Recurrente (h_t) con desplazamiento de color en Many-to-One
    let cellStroke = '#4FA39B';
    let cellBgFill = '#FFFFFF';

    if (isActive) {
      cellStroke = '#5266EB';
    } else if (appState.activeType === 'many-to-one') {
      const isPos = (example.sentimentType === 'positive');
      cellStroke = isPos ? 'var(--sentiment-pos)' : 'var(--sentiment-neg)';
      const score = Math.abs(st.sentimentScore || 0);
      if (isPos) {
        cellBgFill = `rgba(235, 247, 242, ${Math.min(score * 0.9 + 0.1, 1)})`;
      } else {
        cellBgFill = `rgba(252, 240, 240, ${Math.min(score * 0.9 + 0.1, 1)})`;
      }
    }

    const cellNode = createSVGElement('g', { transform: `translate(${cx}, ${cyCell})` });
    cellNode.innerHTML = `
      <rect x="-${cellW/2}" y="-${cellH/2}" width="${cellW}" height="${cellH}" rx="10" fill="${cellBgFill}" stroke="${cellStroke}" stroke-width="${isActive ? '2.5' : '1.8'}" ${isActive ? 'filter="drop-shadow(0 2px 10px rgba(82,102,235,0.25))"' : ''}/>
      <text x="0" y="-${cellH/2 - 15}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="${cellStroke}">
        h${st.t}
      </text>
      <!-- 4 mini barras con valores del vector -->
      <g transform="translate(-36, -8)">
        ${st.h_curr.map((v, idxV) => `
          <rect x="${idxV * 18}" y="0" width="16" height="14" rx="2" fill="${v >= 0 ? 'rgba(79, 163, 155, 0.2)' : 'rgba(196, 104, 104, 0.2)'}"/>
          <text x="${idxV * 18 + 8}" y="10" text-anchor="middle" font-family="monospace" font-size="8" font-weight="600" fill="#1F2330">${(v >= 0 ? '+' : '') + v.toFixed(1)}</text>
        `).join('')}
      </g>
      <text x="0" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="8.5" fill="#9599A6">
        ${st.role ? (st.phase === 'encoder' ? 'Encoder' : 'Decoder') : 'RNN Cell'}
      </text>
    `;
    stepGroup.appendChild(cellNode);

    // Nodo Salida (y_t)
    const outNode = createSVGElement('g', { transform: `translate(${cx}, ${cyOutput})` });
    if (appState.activeType === 'many-to-one' && !st.isFinal) {
      outNode.innerHTML = `
        <rect x="-42" y="-18" width="84" height="36" rx="8" fill="#F7F7F5" stroke="#E2E4EB" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="0" y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#9599A6">
          (Inactiva)
        </text>
      `;
    } else if (isEncoderDecoder && st.phase === 'encoder') {
      outNode.innerHTML = `
        <rect x="-42" y="-18" width="84" height="36" rx="8" fill="#F7F7F5" stroke="#E2E4EB" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="0" y="4" text-anchor="middle" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#9599A6">
          ${st.isContextTransition ? '★ Contexto' : '(Codificando)'}
        </text>
      `;
    } else {
      const outText = st.y ? truncateText(st.y, 11) : '—';
      const isPositive = (example.sentimentType === 'positive');
      outNode.innerHTML = `
        <rect x="-46" y="-18" width="92" height="36" rx="8" fill="#FFFFFF" stroke="${isActive ? '#5266EB' : '#DDE0EA'}" stroke-width="${isActive ? '2' : '1.2'}"/>
        <text x="0" y="-3" text-anchor="middle" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="${isActive ? '#5266EB' : '#6B7080'}">y${st.t}</text>
        <text x="0" y="11" text-anchor="middle" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" fill="${st.isFinal ? (isPositive ? 'var(--sentiment-pos)' : 'var(--sentiment-neg)') : '#1F2330'}">
          ${outText}
        </text>
      `;
    }
    stepGroup.appendChild(outNode);

    // Eje de Tiempo (ticks)
    const timeTick = createSVGElement('g', { transform: `translate(${cx}, 395)` });
    timeTick.innerHTML = `
      <circle cx="0" cy="0" r="${isActive ? '5' : '3'}" fill="${isActive ? '#5266EB' : (isPast ? '#4FA39B' : '#CCD1DE')}"/>
      <text x="0" y="18" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="${isActive ? '700' : '500'}" fill="${isActive ? '#5266EB' : '#6B7080'}">
        t = ${st.t}
      </text>
    `;
    stepGroup.appendChild(timeTick);

    g.appendChild(stepGroup);
  });

  // 5. Pulsos de información en la celda activa de vista desenrollada
  const activeCx = marginX + appState.currentStep * stepWidth;
  const activePulseIn = createSVGElement('circle', {
    id: 'unroll-pulse-in',
    r: '4',
    fill: '#5266EB',
    filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
  });
  g.appendChild(activePulseIn);

  if (activeStep.y !== null && activeStep.y !== '(Sin salida)') {
    const activePulseOut = createSVGElement('circle', {
      id: 'unroll-pulse-out',
      r: '4',
      fill: '#5266EB',
      filter: 'drop-shadow(0 0 3px rgba(82, 102, 235, 0.7))'
    });
    g.appendChild(activePulseOut);
  }

  // 6. Línea del Eje de Tiempo
  const axisLine = createSVGElement('path', {
    d: `M ${marginX - 40} 395 L ${totalSvgWidth - 30} 395`,
    class: 'svg-time-axis-line'
  });
  g.appendChild(axisLine);

  const axisLabel = createSVGElement('text', {
    x: totalSvgWidth - 25,
    y: 399,
    class: 'svg-time-label'
  });
  axisLabel.textContent = 'Tiempo →';
  g.appendChild(axisLabel);

  svg.appendChild(g);
}

/**
 * Centra el scroll en la celda activa en vista desenrollada
 */
function scrollToActiveCell() {
  if (!DOM.unrolledScroll) return;
  const activeElement = document.getElementById(`unroll-step-${appState.currentStep}`);
  if (activeElement) {
    const bbox = activeElement.getBBox();
    const scrollContainerWidth = DOM.unrolledScroll.clientWidth;
    const targetScrollLeft = bbox.x - (scrollContainerWidth / 2) + (bbox.width / 2);
    DOM.unrolledScroll.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    });
  }
}

// =============================================================================
// ANIMACIÓN CONTINUA DE PULSOS CON REQUESTANIMATIONFRAME
// =============================================================================
function startPulseAnimation() {
  function animatePulses(timestamp) {
    appState.pulseProgress = (timestamp % 1400) / 1400; // Ciclo periódico de 1.4s

    animateRolledPulses(appState.pulseProgress);
    animateUnrolledPulses(appState.pulseProgress);

    appState.animationFrameId = requestAnimationFrame(animatePulses);
  }

  appState.animationFrameId = requestAnimationFrame(animatePulses);
}

function animateRolledPulses(progress) {
  // 1. Entrada -> Celda
  const pulseIn = document.getElementById('rolled-pulse-in');
  if (pulseIn) {
    const cx = 320;
    const yStart = 326;
    const yEnd = 255;
    const curY = yStart + (yEnd - yStart) * progress;
    pulseIn.setAttribute('cx', cx);
    pulseIn.setAttribute('cy', curY);
    pulseIn.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  // 2. Bucle Recurrente
  const pulseLoop = document.getElementById('rolled-pulse-loop');
  const loopPath = document.getElementById('rolled-loop-path');
  if (pulseLoop && loopPath) {
    try {
      const pathLength = loopPath.getTotalLength();
      const pt = loopPath.getPointAtLength(progress * pathLength);
      pulseLoop.setAttribute('cx', pt.x);
      pulseLoop.setAttribute('cy', pt.y);
      pulseLoop.setAttribute('opacity', Math.sin(progress * Math.PI));
    } catch (e) {}
  }

  // 3. Celda -> Salida
  const pulseOut = document.getElementById('rolled-pulse-out');
  if (pulseOut) {
    const cx = 320;
    const yStart = 165;
    const yEnd = 94;
    const curY = yStart + (yEnd - yStart) * progress;
    pulseOut.setAttribute('cx', cx);
    pulseOut.setAttribute('cy', curY);
    pulseOut.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  // 4. Retroalimentación en One-to-Many
  const pulseFb = document.getElementById('rolled-pulse-fb');
  const fbPath = document.getElementById('rolled-fb-path');
  if (pulseFb && fbPath) {
    try {
      const pathLength = fbPath.getTotalLength();
      const pt = fbPath.getPointAtLength(progress * pathLength);
      pulseFb.setAttribute('cx', pt.x);
      pulseFb.setAttribute('cy', pt.y);
      pulseFb.setAttribute('opacity', Math.sin(progress * Math.PI));
    } catch (e) {}
  }

  // 5. Pulsos Encoder / Decoder
  const pEncIn = document.getElementById('enc-pulse-in');
  if (pEncIn) {
    const curY = 328 + (255 - 328) * progress;
    pEncIn.setAttribute('cx', 180);
    pEncIn.setAttribute('cy', curY);
    pEncIn.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  const pDecIn = document.getElementById('dec-pulse-in');
  if (pDecIn) {
    const curY = 328 + (255 - 328) * progress;
    pDecIn.setAttribute('cx', 460);
    pDecIn.setAttribute('cy', curY);
    pDecIn.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  const pDecOut = document.getElementById('dec-pulse-out');
  if (pDecOut) {
    const curY = 165 + (92 - 165) * progress;
    pDecOut.setAttribute('cx', 460);
    pDecOut.setAttribute('cy', curY);
    pDecOut.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  const pBridge = document.getElementById('bridge-pulse');
  if (pBridge) {
    const curX = 250 + (390 - 250) * progress;
    pBridge.setAttribute('cx', curX);
    pBridge.setAttribute('cy', 210);
    pBridge.setAttribute('opacity', Math.sin(progress * Math.PI));
  }
}

function animateUnrolledPulses(progress) {
  const stepWidth = 145;
  const marginX = 80;
  const activeCx = marginX + appState.currentStep * stepWidth;

  const pulseIn = document.getElementById('unroll-pulse-in');
  if (pulseIn) {
    const yStart = 310;
    const yEnd = 230;
    const curY = yStart + (yEnd - yStart) * progress;
    pulseIn.setAttribute('cx', activeCx);
    pulseIn.setAttribute('cy', curY);
    pulseIn.setAttribute('opacity', Math.sin(progress * Math.PI));
  }

  const pulseOut = document.getElementById('unroll-pulse-out');
  if (pulseOut) {
    const yStart = 160;
    const yEnd = 85;
    const curY = yStart + (yEnd - yStart) * progress;
    pulseOut.setAttribute('cx', activeCx);
    pulseOut.setAttribute('cy', curY);
    pulseOut.setAttribute('opacity', Math.sin(progress * Math.PI));
  }
}

// =============================================================================
// UTILIDADES AUXILIARES
// =============================================================================
function createSVGElement(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(attrs).forEach(key => {
    el.setAttribute(key, attrs[key]);
  });
  return el;
}

function truncateText(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
}
