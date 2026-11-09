/**
 * data.js
 * Simulación didáctica de Redes Neuronales Recurrentes (RNN).
 * Datos predefinidos ("quemados") sin dependencias de librerías de ML.
 */

const RNN_DATA = {
  // ---------------------------------------------------------------------------
  // 1. ONE-TO-MANY: Image Captioning
  // ---------------------------------------------------------------------------
  'one-to-many': {
    id: 'one-to-many',
    title: 'One-to-Many',
    subtitle: 'Una sola entrada genera una secuencia completa de salidas',
    tag: 'Arquitectura 1 → N',
    application: 'Generación de descripciones de imágenes (Image Captioning)',
    description: 'A partir de una única imagen inicial inyectada en t=0, la celda recurrente despliega una secuencia de palabras. En los pasos subsiguientes (t > 0), la palabra predicha en el paso anterior se retroalimenta como nueva entrada x_t, demostrando cómo un solo estímulo inicial guía toda una narración temporal.',
    formulaExplanation: 'h_t = tanh(W_xh · x_t + W_hh · h_{t-1} + b)',
    outputExplanation: 'y_t = softmax(W_hy · h_t + b_y)',
    examples: [
      {
        id: 'dog',
        name: 'Perro en el parque',
        icon: '🐶',
        inputLabel: 'Imagen: Perro corriendo en el césped',
        caption: 'Un perro corre en el parque <FIN>',
        steps: [
          {
            t: 0,
            x: '🐶 [Imagen]',
            xRaw: 'Vector CNN (2048)',
            xType: 'image',
            isFeedback: false,
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.68, -0.24, 0.77, 0.19],
            y: 'Un',
            yConfidence: '97.4%',
            explanation: 'En t=0 se inyecta únicamente el vector de la imagen 🐶. El estado oculto h₀ codifica el sujeto principal detectado y la red emite el primer artículo "Un".'
          },
          {
            t: 1,
            x: 'Un',
            xRaw: 'Token [482]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.68, -0.24, 0.77, 0.19],
            h_curr: [0.84, -0.12, 0.71, 0.45],
            y: 'perro',
            yConfidence: '95.8%',
            explanation: 'La palabra anterior "Un" se retroalimenta como entrada x₁. Al combinarse con h₀, la recurrencia identifica al sustantivo que realiza la acción: "perro".'
          },
          {
            t: 2,
            x: 'perro',
            xRaw: 'Token [1094]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.84, -0.12, 0.71, 0.45],
            h_curr: [0.49, 0.54, 0.63, -0.28],
            y: 'corre',
            yConfidence: '92.1%',
            explanation: 'Con "perro" como entrada y el contexto acumulado, la red predice la acción dinámica observada en la imagen: "corre".'
          },
          {
            t: 3,
            x: 'corre',
            xRaw: 'Token [720]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.49, 0.54, 0.63, -0.28],
            h_curr: [0.33, 0.28, 0.82, -0.39],
            y: 'en',
            yConfidence: '98.0%',
            explanation: 'La red genera la preposición espacial "en" para conectar la acción con el entorno donde ocurre.'
          },
          {
            t: 4,
            x: 'en',
            xRaw: 'Token [15]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.33, 0.28, 0.82, -0.39],
            h_curr: [0.30, 0.15, 0.78, -0.21],
            y: 'el',
            yConfidence: '98.7%',
            explanation: 'Genera el artículo determinado "el", preparando la introducción del lugar.'
          },
          {
            t: 5,
            x: 'el',
            xRaw: 'Token [18]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.30, 0.15, 0.78, -0.21],
            h_curr: [0.18, -0.61, 0.91, -0.09],
            y: 'parque',
            yConfidence: '94.2%',
            explanation: 'La memoria recurrente retiene la información de fondo verde de la imagen original y emite "parque".'
          },
          {
            t: 6,
            x: 'parque',
            xRaw: 'Token [2301]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.18, -0.61, 0.91, -0.09],
            h_curr: [0.04, -0.85, 0.15, -0.04],
            y: '<FIN>',
            yConfidence: '99.1%',
            explanation: 'La red concluye que la descripción es semánticamente completa y emite el token especial de terminación <FIN>.'
          }
        ]
      },
      {
        id: 'car',
        name: 'Auto en carretera',
        icon: '🚗',
        inputLabel: 'Imagen: Automóvil rojo en autopista',
        caption: 'Un auto rojo en la carretera <FIN>',
        steps: [
          {
            t: 0,
            x: '🚗 [Imagen]',
            xRaw: 'Vector CNN (2048)',
            xType: 'image',
            isFeedback: false,
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.55, 0.62, -0.31, 0.40],
            y: 'Un',
            yConfidence: '96.9%',
            explanation: 'En t=0 la red recibe los atributos visuales del vehículo 🚗. Se inicializa el estado y emite la palabra de apertura "Un".'
          },
          {
            t: 1,
            x: 'Un',
            xRaw: 'Token [482]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.55, 0.62, -0.31, 0.40],
            h_curr: [0.72, 0.58, -0.22, 0.51],
            y: 'auto',
            yConfidence: '94.5%',
            explanation: 'Retroalimenta "Un". La celda combina la sintaxis con los rasgos vehiculares de h₀ para generar "auto".'
          },
          {
            t: 2,
            x: 'auto',
            xRaw: 'Token [890]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.72, 0.58, -0.22, 0.51],
            h_curr: [0.88, 0.35, -0.47, 0.63],
            y: 'rojo',
            yConfidence: '91.8%',
            explanation: 'El color predominante de la imagen, preservado en el estado latente, se materializa en el adjetivo "rojo".'
          },
          {
            t: 3,
            x: 'rojo',
            xRaw: 'Token [1420]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.88, 0.35, -0.47, 0.63],
            h_curr: [0.41, 0.19, -0.55, 0.28],
            y: 'en',
            yConfidence: '97.6%',
            explanation: 'La red recurrente transiciona hacia el contexto de localización emitiendo "en".'
          },
          {
            t: 4,
            x: 'en',
            xRaw: 'Token [15]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.41, 0.19, -0.55, 0.28],
            h_curr: [0.38, 0.12, -0.48, 0.22],
            y: 'la',
            yConfidence: '98.3%',
            explanation: 'Predice el artículo femenino "la" en concordancia con el destino semántico.'
          },
          {
            t: 5,
            x: 'la',
            xRaw: 'Token [22]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.38, 0.12, -0.48, 0.22],
            h_curr: [0.25, -0.44, -0.81, 0.15],
            y: 'carretera',
            yConfidence: '93.7%',
            explanation: 'Recupera la característica de asfalto y carril vehicular de la imagen original para predecir "carretera".'
          },
          {
            t: 6,
            x: 'carretera',
            xRaw: 'Token [3105]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.25, -0.44, -0.81, 0.15],
            h_curr: [0.03, -0.89, -0.10, 0.02],
            y: '<FIN>',
            yConfidence: '99.4%',
            explanation: 'Se alcanza el límite natural de la oración y se produce el delimitador <FIN>.'
          }
        ]
      },
      {
        id: 'sunset',
        name: 'Atardecer en el mar',
        icon: '🌅',
        inputLabel: 'Imagen: Puesta de sol sobre el océano',
        caption: 'El sol se oculta sobre el mar <FIN>',
        steps: [
          {
            t: 0,
            x: '🌅 [Imagen]',
            xRaw: 'Vector CNN (2048)',
            xType: 'image',
            isFeedback: false,
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.31, 0.74, 0.42, -0.50],
            y: 'El',
            yConfidence: '98.1%',
            explanation: 'En t=0 ingresa el vector de la puesta de sol 🌅. El estado inicial activa la generación con "El".'
          },
          {
            t: 1,
            x: 'El',
            xRaw: 'Token [12]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.31, 0.74, 0.42, -0.50],
            h_curr: [0.45, 0.82, 0.38, -0.41],
            y: 'sol',
            yConfidence: '96.2%',
            explanation: 'Con "El" retroalimentado y el resplandor codificado en h₀, la red nombra al astro rey: "sol".'
          },
          {
            t: 2,
            x: 'sol',
            xRaw: 'Token [902]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.45, 0.82, 0.38, -0.41],
            h_curr: [0.20, 0.65, 0.59, -0.30],
            y: 'se',
            yConfidence: '94.0%',
            explanation: 'Genera el pronombre reflexivo "se" anticipando un verbo pronominal.'
          },
          {
            t: 3,
            x: 'se',
            xRaw: 'Token [54]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.20, 0.65, 0.59, -0.30],
            h_curr: [0.12, 0.51, 0.71, -0.22],
            y: 'oculta',
            yConfidence: '93.5%',
            explanation: 'La celda produce el verbo "oculta", describiendo con precisión la acción del atardecer.'
          },
          {
            t: 4,
            x: 'oculta',
            xRaw: 'Token [4102]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.12, 0.51, 0.71, -0.22],
            h_curr: [0.18, 0.32, 0.66, -0.19],
            y: 'sobre',
            yConfidence: '95.3%',
            explanation: 'Emite la preposición de relación espacial "sobre".'
          },
          {
            t: 5,
            x: 'sobre',
            xRaw: 'Token [88]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.18, 0.32, 0.66, -0.19],
            h_curr: [0.15, 0.20, 0.62, -0.15],
            y: 'el',
            yConfidence: '98.5%',
            explanation: 'Genera el artículo "el" para introducir el horizonte oceánico.'
          },
          {
            t: 6,
            x: 'el',
            xRaw: 'Token [18]',
            xType: 'token',
            isFeedback: true,
            h_prev: [0.15, 0.20, 0.62, -0.15],
            h_curr: [-0.10, -0.45, 0.85, 0.12],
            y: 'mar',
            yConfidence: '95.0%',
            explanation: 'Rescata la información del agua en la escena y produce la palabra "mar".'
          },
          {
            t: 7,
            x: 'mar',
            xRaw: 'Token [1560]',
            xType: 'token',
            isFeedback: true,
            h_prev: [-0.10, -0.45, 0.85, 0.12],
            h_curr: [0.01, -0.92, 0.08, -0.01],
            y: '<FIN>',
            yConfidence: '99.6%',
            explanation: 'Secuencia completa. Se genera el marcador final <FIN>.'
          }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 2. MANY-TO-ONE: Análisis de Sentimiento
  // ---------------------------------------------------------------------------
  'many-to-one': {
    id: 'many-to-one',
    title: 'Many-to-One',
    subtitle: 'Una secuencia completa converge en una única decisión final',
    tag: 'Arquitectura N → 1',
    application: 'Clasificación de Sentimiento en Texto (Sentiment Analysis)',
    description: 'La red procesa palabra por palabra la oración de entrada. Durante los pasos intermedios, las salidas no se emiten directamente sino que el estado oculto h_t va absorbiendo y acumulando la carga semántica de cada palabra. Únicamente en el último paso temporal se activa la capa densa de clasificación para emitir el veredicto con su nivel de confianza.',
    formulaExplanation: 'h_t = tanh(W_xh · x_t + W_hh · h_{t-1} + b)',
    outputExplanation: 'y_final = softmax(W_hy · h_T + b_y)',
    examples: [
      {
        id: 'pos-movie',
        name: '"Me encantó esta película"',
        label: 'Positivo 😊',
        sentimentType: 'positive',
        finalConfidence: '96.2%',
        steps: [
          {
            t: 0,
            x: 'Me',
            xRaw: 'Token [102]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.12, 0.05, 0.18, 0.09],
            sentimentScore: 0.10, // Neutral-positivo inicial
            y: null,
            explanation: 'Entra "Me". El estado oculto h₀ despierta con una carga semántica neutra; la salida intermedia se mantiene inactiva.'
          },
          {
            t: 1,
            x: 'encantó',
            xRaw: 'Token [4812]',
            h_prev: [0.12, 0.05, 0.18, 0.09],
            h_curr: [0.75, 0.68, 0.82, 0.59],
            sentimentScore: 0.88, // Salto fuerte a positivo
            y: null,
            explanation: '¡Palabra clave de alta valencia positiva! "encantó" eleva drásticamente los pesos positivos de h₁. La red memoriza esta fuerte emoción.'
          },
          {
            t: 2,
            x: 'esta',
            xRaw: 'Token [215]',
            h_prev: [0.75, 0.68, 0.82, 0.59],
            h_curr: [0.71, 0.64, 0.79, 0.55],
            sentimentScore: 0.85,
            y: null,
            explanation: '"esta" es un demostrativo neutral. Gracias a la recurrencia W_hh · h_{t-1}, el estado retiene la euforia acumulada del paso anterior.'
          },
          {
            t: 3,
            x: 'película',
            xRaw: 'Token [894]',
            h_prev: [0.71, 0.64, 0.79, 0.55],
            h_curr: [0.89, 0.78, 0.94, 0.72],
            sentimentScore: 0.96,
            y: 'Positivo 😊 (96.2%)',
            isFinal: true,
            explanation: 'Fin de la secuencia. Con "película", el estado oculto h₃ contiene el resumen semántico total. La capa de salida emite la clasificación final: Positivo 😊 con 96.2% de confianza.'
          }
        ]
      },
      {
        id: 'pos-service',
        name: '"El servicio fue excelente y rápido"',
        label: 'Positivo 😊',
        sentimentType: 'positive',
        finalConfidence: '94.8%',
        steps: [
          {
            t: 0,
            x: 'El',
            xRaw: 'Token [12]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.05, 0.08, 0.02, 0.10],
            sentimentScore: 0.05,
            y: null,
            explanation: 'Lectura del artículo inicial "El". Estado basal sin carga emocional.'
          },
          {
            t: 1,
            x: 'servicio',
            xRaw: 'Token [630]',
            h_prev: [0.05, 0.08, 0.02, 0.10],
            h_curr: [0.15, 0.22, 0.10, 0.18],
            sentimentScore: 0.15,
            y: null,
            explanation: '"servicio" define la entidad a evaluar. La red mantiene una expectativa neutral.'
          },
          {
            t: 2,
            x: 'fue',
            xRaw: 'Token [89]',
            h_prev: [0.15, 0.22, 0.10, 0.18],
            h_curr: [0.20, 0.26, 0.14, 0.22],
            sentimentScore: 0.20,
            y: null,
            explanation: 'Cópula verbal en pasado "fue". Conecta el sujeto con los calificadores venideros.'
          },
          {
            t: 3,
            x: 'excelente',
            xRaw: 'Token [3910]',
            h_prev: [0.20, 0.26, 0.14, 0.22],
            h_curr: [0.78, 0.70, 0.85, 0.67],
            sentimentScore: 0.90,
            y: null,
            explanation: 'El adjetivo "excelente" polariza de inmediato el vector recurrente hacia valores fuertemente positivos.'
          },
          {
            t: 4,
            x: 'y',
            xRaw: 'Token [8]',
            h_prev: [0.78, 0.70, 0.85, 0.67],
            h_curr: [0.75, 0.68, 0.81, 0.64],
            sentimentScore: 0.88,
            y: null,
            explanation: 'La conjunción "y" preserva el estado latente positivo en espera del segundo adjetivo.'
          },
          {
            t: 5,
            x: 'rápido',
            xRaw: 'Token [1240]',
            h_prev: [0.75, 0.68, 0.81, 0.64],
            h_curr: [0.86, 0.79, 0.92, 0.76],
            sentimentScore: 0.95,
            y: 'Positivo 😊 (94.8%)',
            isFinal: true,
            explanation: '"rápido" consolida la evaluación positiva. Como es la última palabra, se activa la salida global: Positivo 😊 (94.8%).'
          }
        ]
      },
      {
        id: 'neg-terrible',
        name: '"Fue una experiencia terrible"',
        label: 'Negativo 😞',
        sentimentType: 'negative',
        finalConfidence: '91.4%',
        steps: [
          {
            t: 0,
            x: 'Fue',
            xRaw: 'Token [89]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [-0.04, -0.08, -0.02, 0.06],
            sentimentScore: -0.05,
            y: null,
            explanation: 'Inicio de la oración con "Fue". Estado inicial cercano a cero.'
          },
          {
            t: 1,
            x: 'una',
            xRaw: 'Token [25]',
            h_prev: [-0.04, -0.08, -0.02, 0.06],
            h_curr: [-0.06, -0.10, -0.05, 0.08],
            sentimentScore: -0.08,
            y: null,
            explanation: 'Artículo indefinido "una", sin polaridad emocional.'
          },
          {
            t: 2,
            x: 'experiencia',
            xRaw: 'Token [1520]',
            h_prev: [-0.06, -0.10, -0.05, 0.08],
            h_curr: [-0.15, -0.21, -0.12, 0.12],
            sentimentScore: -0.16,
            y: null,
            explanation: 'Sustantivo central "experiencia". El estado se prepara para recibir la calificación.'
          },
          {
            t: 3,
            x: 'terrible',
            xRaw: 'Token [5201]',
            h_prev: [-0.15, -0.21, -0.12, 0.12],
            h_curr: [-0.85, -0.76, -0.92, -0.68],
            sentimentScore: -0.91,
            y: 'Negativo 😞 (91.4%)',
            isFinal: true,
            explanation: 'Palabra negativa contundente "terrible". El vector oculto se sumerge en valores fuertemente negativos y la salida final concluye: Negativo 😞 (91.4%).'
          }
        ]
      },
      {
        id: 'neg-product',
        name: '"No me gustó nada el producto"',
        label: 'Negativo 😞',
        sentimentType: 'negative',
        finalConfidence: '95.3%',
        steps: [
          {
            t: 0,
            x: 'No',
            xRaw: 'Token [4]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [-0.55, -0.42, -0.61, -0.38],
            sentimentScore: -0.50,
            y: null,
            explanation: 'La negación "No" al inicio predispone inmediatamente el estado oculto hacia la polaridad adversa.'
          },
          {
            t: 1,
            x: 'me',
            xRaw: 'Token [102]',
            h_prev: [-0.55, -0.42, -0.61, -0.38],
            h_curr: [-0.51, -0.39, -0.58, -0.33],
            sentimentScore: -0.48,
            y: null,
            explanation: '"me" indica afectación personal manteniendo la negación previa en memoria recurrente.'
          },
          {
            t: 2,
            x: 'gustó',
            xRaw: 'Token [810]',
            h_prev: [-0.51, -0.39, -0.58, -0.33],
            h_curr: [-0.68, -0.58, -0.72, -0.49],
            sentimentScore: -0.65,
            y: null,
            explanation: 'Aunque "gustó" aislado es positivo, la interacción W_hh · h₁ con la negación anterior genera un estado fuertemente adverso (no gustó).'
          },
          {
            t: 3,
            x: 'nada',
            xRaw: 'Token [312]',
            h_prev: [-0.68, -0.58, -0.72, -0.49],
            h_curr: [-0.88, -0.75, -0.90, -0.66],
            sentimentScore: -0.89,
            y: null,
            explanation: '"nada" funciona como intensificador negativo, acentuando el rechazo en el estado oculto.'
          },
          {
            t: 4,
            x: 'el',
            xRaw: 'Token [18]',
            h_prev: [-0.88, -0.75, -0.90, -0.66],
            h_curr: [-0.83, -0.71, -0.86, -0.61],
            sentimentScore: -0.85,
            y: null,
            explanation: 'Artículo transicional; el descontento se mantiene estable en el estado oculto.'
          },
          {
            t: 5,
            x: 'producto',
            xRaw: 'Token [1140]',
            h_prev: [-0.83, -0.71, -0.86, -0.61],
            h_curr: [-0.91, -0.82, -0.95, -0.74],
            sentimentScore: -0.95,
            y: 'Negativo 😞 (95.3%)',
            isFinal: true,
            explanation: 'Último token. La red emite el veredicto definitivo: Negativo 😞 (95.3% de confianza).'
          }
        ]
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 3. MANY-TO-MANY DESFASADA: Traducción Encoder-Decoder
  // ---------------------------------------------------------------------------
  'many-to-many': {
    id: 'many-to-many',
    title: 'Many-to-Many desfasada',
    subtitle: 'Procesa una secuencia de entrada y genera otra de longitud distinta',
    tag: 'Arquitectura N → M (Seq2Seq)',
    application: 'Traducción Automática (Arquitectura Encoder - Decoder)',
    description: 'Consta de dos redes RNN acopladas: el CODIFICADOR (Encoder) lee la frase en español paso a paso sin emitir salidas, comprimiendo todo el significado en un "Vector de Contexto" (su último estado oculto). Luego, el DECODIFICADOR (Decoder) toma este vector de contexto como estado inicial y despliega paso a paso la traducción en inglés, usando tokens de control <INICIO> y <FIN>.',
    formulaExplanation: 'Encoder: h_t = tanh(W_xh · x_t + W_hh · h_{t-1})  |  Decoder: s_t = tanh(W_ys · y_{t-1} + W_ss · s_{t-1})',
    outputExplanation: 'Contexto c = h_final  →  s_0 = c  →  y_t = softmax(W_so · s_t)',
    examples: [
      {
        id: 'coffee',
        name: '"Me gusta el café" → "I like coffee"',
        inputLength: 4,
        outputLength: 3,
        sourceSentence: 'Me gusta el café',
        targetSentence: 'I like coffee',
        contextVector: [0.62, -0.48, 0.79, 0.33],
        contextExplanation: 'El vector c = [0.62, -0.48, 0.79, 0.33] resume la semántica completa de la frase en español "Me gusta el café". Se transfiere intacto como el estado s₀ del decodificador.',
        steps: [
          // ENCODER (4 pasos)
          {
            t: 0,
            phase: 'encoder',
            phaseStep: 1,
            phaseTotal: 4,
            role: 'Codificador (Encoder)',
            x: 'Me',
            xRaw: 'ES Token [102]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.24, -0.12, 0.31, 0.15],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=0] Lee "Me". El codificador solo absorbe información hacia su estado oculto; no emite ninguna salida.'
          },
          {
            t: 1,
            phase: 'encoder',
            phaseStep: 2,
            phaseTotal: 4,
            role: 'Codificador (Encoder)',
            x: 'gusta',
            xRaw: 'ES Token [810]',
            h_prev: [0.24, -0.12, 0.31, 0.15],
            h_curr: [0.55, -0.30, 0.62, 0.28],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=1] Procesa el verbo "gusta", enriqueciendo el estado oculto con la noción de agrado o preferencia.'
          },
          {
            t: 2,
            phase: 'encoder',
            phaseStep: 3,
            phaseTotal: 4,
            role: 'Codificador (Encoder)',
            x: 'el',
            xRaw: 'ES Token [18]',
            h_prev: [0.55, -0.30, 0.62, 0.28],
            h_curr: [0.51, -0.34, 0.66, 0.25],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=2] Lee el artículo "el". Sigue actualizando la representación interna.'
          },
          {
            t: 3,
            phase: 'encoder',
            phaseStep: 4,
            phaseTotal: 4,
            role: 'Codificador (Encoder)',
            x: 'café',
            xRaw: 'ES Token [1940]',
            h_prev: [0.51, -0.34, 0.66, 0.25],
            h_curr: [0.62, -0.48, 0.79, 0.33],
            y: '(Vector de Contexto)',
            isContextTransition: true,
            explanation: '★ [Encoder t=3 - Fin de Entrada] Se procesa "café". Este estado h₃ final es el VECTOR DE CONTEXTO c: una cápsula matemática que contiene el significado completo de la oración en español.'
          },
          // DECODER (4 pasos con <INICIO> y <FIN>)
          {
            t: 4,
            phase: 'decoder',
            phaseStep: 1,
            phaseTotal: 4,
            role: 'Decodificador (Decoder)',
            x: '<INICIO>',
            xRaw: 'Token SOS [1]',
            h_prev: [0.62, -0.48, 0.79, 0.33], // Viene del Context Vector
            h_curr: [0.70, -0.41, 0.81, 0.40],
            y: 'I',
            yConfidence: '98.2%',
            isContextTransition: false,
            explanation: '[Decoder t=4] Se inicia el decodificador con el token <INICIO> y el vector de contexto transferido como s₀. Genera la primera palabra en inglés: "I".'
          },
          {
            t: 5,
            phase: 'decoder',
            phaseStep: 2,
            phaseTotal: 4,
            role: 'Decodificador (Decoder)',
            x: 'I',
            xRaw: 'EN Token [5]',
            h_prev: [0.70, -0.41, 0.81, 0.40],
            h_curr: [0.81, -0.35, 0.76, 0.52],
            y: 'like',
            yConfidence: '96.5%',
            explanation: '[Decoder t=5] La palabra "I" se retroalimenta al decodificador. Basándose en s₁ y el contexto, predice "like".'
          },
          {
            t: 6,
            phase: 'decoder',
            phaseStep: 3,
            phaseTotal: 4,
            role: 'Decodificador (Decoder)',
            x: 'like',
            xRaw: 'EN Token [820]',
            h_prev: [0.81, -0.35, 0.76, 0.52],
            h_curr: [0.65, -0.52, 0.88, 0.37],
            y: 'coffee',
            yConfidence: '94.8%',
            explanation: '[Decoder t=6] "like" ingresa como entrada. El estado decodifica el objeto directo "coffee" a partir de la memoria.'
          },
          {
            t: 7,
            phase: 'decoder',
            phaseStep: 4,
            phaseTotal: 4,
            role: 'Decodificador (Decoder)',
            x: 'coffee',
            xRaw: 'EN Token [1412]',
            h_prev: [0.65, -0.52, 0.88, 0.37],
            h_curr: [0.08, -0.91, 0.14, 0.02],
            y: '<FIN>',
            yConfidence: '99.5%',
            explanation: '[Decoder t=7] Con la traducción completada, el decodificador emite el delimitador <FIN>. La entrada tuvo 4 palabras y la salida generó 3 palabras más tokens de control.'
          }
        ]
      },
      {
        id: 'how-are-you',
        name: '"¿Cómo estás hoy?" → "How are you today?"',
        inputLength: 3,
        outputLength: 4,
        sourceSentence: '¿Cómo estás hoy?',
        targetSentence: 'How are you today?',
        contextVector: [-0.44, 0.71, 0.58, -0.29],
        contextExplanation: 'El vector c = [-0.44, 0.71, 0.58, -0.29] condensa la estructura interrogativa de saludo presente en la frase en español.',
        steps: [
          // ENCODER (3 pasos)
          {
            t: 0,
            phase: 'encoder',
            phaseStep: 1,
            phaseTotal: 3,
            role: 'Codificador (Encoder)',
            x: '¿Cómo',
            xRaw: 'ES Token [314]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [-0.31, 0.45, 0.22, -0.15],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=0] Registra la partícula interrogativa "¿Cómo". Sin salida externa.'
          },
          {
            t: 1,
            phase: 'encoder',
            phaseStep: 2,
            phaseTotal: 3,
            role: 'Codificador (Encoder)',
            x: 'estás',
            xRaw: 'ES Token [912]',
            h_prev: [-0.31, 0.45, 0.22, -0.15],
            h_curr: [-0.38, 0.62, 0.41, -0.22],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=1] Incorpora el verbo en segunda persona "estás".'
          },
          {
            t: 2,
            phase: 'encoder',
            phaseStep: 3,
            phaseTotal: 3,
            role: 'Codificador (Encoder)',
            x: 'hoy?',
            xRaw: 'ES Token [1205]',
            h_prev: [-0.38, 0.62, 0.41, -0.22],
            h_curr: [-0.44, 0.71, 0.58, -0.29],
            y: '(Vector de Contexto)',
            isContextTransition: true,
            explanation: '★ [Encoder t=2 - Fin de Entrada] Se procesa el temporal "hoy?". El vector resultante h₂ es el VECTOR DE CONTEXTO que viaja al decodificador.'
          },
          // DECODER (5 pasos con <INICIO> y <FIN>)
          {
            t: 3,
            phase: 'decoder',
            phaseStep: 1,
            phaseTotal: 5,
            role: 'Decodificador (Decoder)',
            x: '<INICIO>',
            xRaw: 'Token SOS [1]',
            h_prev: [-0.44, 0.71, 0.58, -0.29],
            h_curr: [-0.52, 0.78, 0.64, -0.35],
            y: 'How',
            yConfidence: '97.8%',
            isContextTransition: false,
            explanation: '[Decoder t=3] Se arranca la decodificación con <INICIO>. Basándose en el contexto interrogativo, emite "How".'
          },
          {
            t: 4,
            phase: 'decoder',
            phaseStep: 2,
            phaseTotal: 5,
            role: 'Decodificador (Decoder)',
            x: 'How',
            xRaw: 'EN Token [41]',
            h_prev: [-0.52, 0.78, 0.64, -0.35],
            h_curr: [-0.48, 0.81, 0.69, -0.31],
            y: 'are',
            yConfidence: '98.4%',
            explanation: '[Decoder t=4] "How" retroalimentado conduce al auxiliar "are".'
          },
          {
            t: 5,
            phase: 'decoder',
            phaseStep: 3,
            phaseTotal: 5,
            role: 'Decodificador (Decoder)',
            x: 'are',
            xRaw: 'EN Token [28]',
            h_prev: [-0.48, 0.81, 0.69, -0.31],
            h_curr: [-0.42, 0.76, 0.72, -0.25],
            y: 'you',
            yConfidence: '98.9%',
            explanation: '[Decoder t=5] Con "are" como entrada, la concordancia gramatical dicta "you".'
          },
          {
            t: 6,
            phase: 'decoder',
            phaseStep: 4,
            phaseTotal: 5,
            role: 'Decodificador (Decoder)',
            x: 'you',
            xRaw: 'EN Token [19]',
            h_prev: [-0.42, 0.76, 0.72, -0.25],
            h_curr: [-0.35, 0.65, 0.79, -0.18],
            y: 'today?',
            yConfidence: '95.1%',
            explanation: '[Decoder t=6] Se recupera el adverbio temporal "today?" del vector de contexto.'
          },
          {
            t: 7,
            phase: 'decoder',
            phaseStep: 5,
            phaseTotal: 5,
            role: 'Decodificador (Decoder)',
            x: 'today?',
            xRaw: 'EN Token [1420]',
            h_prev: [-0.35, 0.65, 0.79, -0.18],
            h_curr: [0.02, -0.88, 0.11, -0.01],
            y: '<FIN>',
            yConfidence: '99.7%',
            explanation: '[Decoder t=7] Oración concluida; la red emite <FIN>. Se ilustra cómo 3 palabras de entrada produjeron 4 palabras de salida.'
          }
        ]
      },
      {
        id: 'good-morning',
        name: '"Buenos días" → "Good morning"',
        inputLength: 2,
        outputLength: 2,
        sourceSentence: 'Buenos días',
        targetSentence: 'Good morning',
        contextVector: [0.78, 0.35, -0.22, 0.54],
        contextExplanation: 'El vector c = [0.78, 0.35, -0.22, 0.54] resume el saludo matutino.',
        steps: [
          // ENCODER (2 pasos)
          {
            t: 0,
            phase: 'encoder',
            phaseStep: 1,
            phaseTotal: 2,
            role: 'Codificador (Encoder)',
            x: 'Buenos',
            xRaw: 'ES Token [410]',
            h_prev: [0.00, 0.00, 0.00, 0.00],
            h_curr: [0.52, 0.21, -0.15, 0.32],
            y: '(Sin salida)',
            isContextTransition: false,
            explanation: '[Encoder t=0] Procesa el adjetivo "Buenos".'
          },
          {
            t: 1,
            phase: 'encoder',
            phaseStep: 2,
            phaseTotal: 2,
            role: 'Codificador (Encoder)',
            x: 'días',
            xRaw: 'ES Token [730]',
            h_prev: [0.52, 0.21, -0.15, 0.32],
            h_curr: [0.78, 0.35, -0.22, 0.54],
            y: '(Vector de Contexto)',
            isContextTransition: true,
            explanation: '★ [Encoder t=1 - Fin de Entrada] Procesa "días". El estado h₁ se convierte en el VECTOR DE CONTEXTO c que viaja al decodificador.'
          },
          // DECODER (3 pasos con <INICIO> y <FIN>)
          {
            t: 2,
            phase: 'decoder',
            phaseStep: 1,
            phaseTotal: 3,
            role: 'Decodificador (Decoder)',
            x: '<INICIO>',
            xRaw: 'Token SOS [1]',
            h_prev: [0.78, 0.35, -0.22, 0.54],
            h_curr: [0.82, 0.40, -0.18, 0.59],
            y: 'Good',
            yConfidence: '99.1%',
            isContextTransition: false,
            explanation: '[Decoder t=2] Comienza decodificación con <INICIO> y el vector de contexto transferido. Genera "Good".'
          },
          {
            t: 3,
            phase: 'decoder',
            phaseStep: 2,
            phaseTotal: 3,
            role: 'Decodificador (Decoder)',
            x: 'Good',
            xRaw: 'EN Token [210]',
            h_prev: [0.82, 0.40, -0.18, 0.59],
            h_curr: [0.75, 0.32, -0.25, 0.48],
            y: 'morning',
            yConfidence: '98.7%',
            explanation: '[Decoder t=3] Retroalimenta "Good". Completa el saludo con "morning".'
          },
          {
            t: 4,
            phase: 'decoder',
            phaseStep: 3,
            phaseTotal: 3,
            role: 'Decodificador (Decoder)',
            x: 'morning',
            xRaw: 'EN Token [540]',
            h_prev: [0.75, 0.32, -0.25, 0.48],
            h_curr: [0.05, -0.89, 0.09, -0.02],
            y: '<FIN>',
            yConfidence: '99.8%',
            explanation: '[Decoder t=4] Emite token de cierre <FIN>.'
          }
        ]
      }
    ]
  }
};

