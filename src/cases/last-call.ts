import type { CaseData } from '../engine/types';
import { scene, option, say, flag, proof, feel, remember, locationDomain } from './helpers';
export const lastCall: CaseData = {
  id: 'ultima-llamada', number: '01', title: 'La última llamada', genre: 'DESAPARICIÓN · SUSPENSO', duration: '15–25 min', color: '#bc7959',
  description: 'Una llamada a las 02:13. Un registro borrado. Sos la última persona que escuchó su voz.',
  protagonist: 'vera', investigator: 'salvatierra', initialScene: 'arrival',
  initialKnowledge: { relationship: 'friend', location: 'workshop' },
  truth: { relationship: 'friend', contact: true, location: 'workshop', deleted: true, leftAlone: false, destination: 'north', voluntary: true },
  factLabels: { relationship: 'tu relación con Mateo', contact: 'la llamada de Mateo', location: 'tu ubicación a las 02:13', deleted: 'el borrado del registro', leftAlone: 'la salida del taller', destination: 'el lugar al que fue Mateo' },
  valueLabels: { friend: 'éramos amigos', stranger: 'no lo conocía', acquaintance: 'lo conocía de vista', workshop: 'estaba en el taller', home: 'estaba en mi casa', street: 'estaba en la calle', true: 'sí', false: 'no', north: 'depósito norte' },
  timeline: [
    { time: '01:42', event: 'Mateo copia las transferencias ilegales del comisario Borda. Su hermana Elena organiza una salida.' },
    { time: '01:58', event: 'Vera recibe a Mateo en su taller de restauración de audio. Él deja una tarjeta dentro de un grabador.' },
    { time: '02:13', event: 'Desde una cabina, Mateo llama a Vera: no debe revelar el muelle; Elena lo recogerá en el depósito norte.' },
    { time: '02:19', event: 'Vera borra la llamada para protegerlo. Una copia permanece en la central telefónica.' },
    { time: '02:31', event: 'Mateo sale del barrio con Elena. La matrícula del vehículo queda en una cámara.' }
  ],
  characters: [
    { id: 'vera', name: 'Vera Luna', role: 'Vos · restauradora de audio', description: 'Tenés una marca de auriculares detrás de la oreja y polvo de cinta en la manga.', personality: 'Observadora, protectora, capaz de sostener un silencio.', relationship: 'Amiga de Mateo desde hace ocho años.', knowledge: ['Mateo te pidió que borraras la llamada.', 'El grabador quedó en tu taller.'], secret: 'Aceptaste encubrir su salida sin conocer todavía la corrupción.', participation: 'Recibiste el material y borraste la llamada.' },
    { id: 'salvatierra', name: 'Inés Salvatierra', role: 'Inspectora · personas desaparecidas', description: 'No levanta la voz. Ordena los papeles por hora, no por importancia.', personality: 'Paciente y precisa; ofrece una oportunidad real de rectificar.', relationship: 'Busca a Mateo; desconfía de los informes de Borda.', knowledge: ['Hay un registro recuperado.', 'El vecino no es un testigo fiable.'], secret: 'Pidió apartar a Borda del expediente y se lo negaron.', participation: 'Dirige esta declaración fuera de la jurisdicción de Borda.' },
    { id: 'mateo', name: 'Mateo Rivas', role: 'Desaparecido · contable', description: 'En la foto de búsqueda parece a punto de decir algo.', personality: 'Metódico, ansioso, fiel a su hermana.', relationship: 'Te confió algo que no sabía proteger solo.', knowledge: ['Borda mueve dinero a través del puerto.'], secret: 'Su desaparición fue voluntaria.', participation: 'Copió las cuentas y escapó con Elena.' },
    { id: 'elena', name: 'Elena Rivas', role: 'Hermana de Mateo · enfermera', description: 'Lleva una camioneta prestada y una muda de ropa.', personality: 'Decidida, desconfiada de la policía.', relationship: 'Organizó la salida de su hermano.', knowledge: ['Mateo espera en el depósito norte.'], secret: 'El vehículo fue prestado por su hospital.', participation: 'Recogió a Mateo a las 02:31.' },
    { id: 'oscar', name: 'Óscar Leiva', role: 'Vecino · testigo', description: 'Mira por una ventana con vidrio esmerilado.', personality: 'Seguro de cosas que apenas vio.', relationship: 'Vive frente al taller.', knowledge: ['Vio dos siluetas bajo la lluvia.'], secret: 'Su reloj adelanta diecinueve minutos.', participation: 'Confundió el orden de llegada y salida.' },
    { id: 'borda', name: 'Raúl Borda', role: 'Comisario · sospechoso', description: 'Su firma aparece en todos los primeros informes.', personality: 'Controlador, cordial cuando alguien obedece.', relationship: 'Investigado por Mateo.', knowledge: ['Faltan copias de las cuentas.'], secret: 'Desvió fondos y trató de recuperar las pruebas.', participation: 'Presionó a Mateo antes de su desaparición.' }
  ],
  evidence: [
    { id: 'missing', caseId: 'ultima-llamada', title: 'Denuncia de desaparición', kind: 'document', description: 'Ingresada por Elena Rivas a las 06:10.', content: 'MATEO RIVAS · 34 años\nÚltimo contacto: madrugada del 17 de noviembre.\nLa denunciante solicita que se preserve la cadena de custodia fuera de la comisaría del puerto.', source: 'Mesa de entradas', time: '06:10', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'phone', caseId: 'ultima-llamada', title: 'Registro de las 02:13', kind: 'record', description: 'Una llamada eliminada del teléfono, conservada en la central.', content: '02:13:08 → VERA LUNA\nOrigen: cabina 7 / Puerto Oeste\nDuración: 48 segundos\nEstado: CONTESTADA\nBorrado local: 02:19:41', source: 'Central telefónica · copia certificada', time: '02:13', facts: { contact: true, deleted: true }, reliability: 'confirmed', possibleContradictions: ['contact', 'deleted'], visual: 'phone', challenge: { evidence: 'custody', reply: 'Esta es la certificación de la central. La firma de origen coincide; no dependemos del teléfono de Mateo.' } },
    { id: 'custody', caseId: 'ultima-llamada', title: 'Cadena de custodia', kind: 'document', description: 'El origen de los registros se puede verificar.', content: 'Copia sellada por la central a las 06:32.\nRecibida por I. Salvatierra a las 06:48.\nNo intervino la comisaría del puerto.', source: 'Unidad de pericias', time: '06:48', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'power', caseId: 'ultima-llamada', title: 'El taller encendido', kind: 'photo', description: 'Una imagen de la cámara de la farmacia.', content: '02:12:56 · Fotograma 184\nVera aparece junto a la ventana del taller. El reloj de la cámara fue contrastado con la central. La imagen no muestra qué ocurrió en el interior.', source: 'Farmacia Del Sur', time: '02:12', facts: { location: 'workshop' }, reliability: 'confirmed', possibleContradictions: ['location'], visual: 'workshop' },
    { id: 'neighbor', caseId: 'ultima-llamada', title: 'La ventana de enfrente', kind: 'testimony', description: 'Óscar dice haber visto salir a una sola persona.', content: '«La chica salió sola. Serían las dos y diez. O las dos menos diez. Desde mi ventana se ve bien cuando no llueve».\nObservación: lluvia intensa; reloj sin sincronizar.', source: 'Óscar Leiva', time: 'Hora discutida', facts: { leftAlone: true }, reliability: 'disputed', possibleContradictions: ['leftAlone'], visual: 'window' },
    { id: 'tape', caseId: 'ultima-llamada', title: 'Cuarenta y ocho segundos', kind: 'audio', description: 'La copia parcial de una llamada. Podés leer su transcripción completa.', content: '[lluvia] MATEO: No les des el muelle. No es ahí.\nVERA: ¿Y Elena?\nMATEO: Sabe. El norte, como cuando éramos chicos.\n[un golpe metálico, después silencio]\nNota: el golpe coincide con el cierre de la cabina; no permite inferir una agresión.', source: 'Grabador del taller', time: '02:13', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'accounts', caseId: 'ultima-llamada', title: 'La tarjeta bajo la cinta', kind: 'object', description: 'Copias de transferencias firmadas por Borda.', content: 'TARJETA 4 GB · carpeta PUERTO\nTres transferencias coinciden con los retiros de la fundación del comisario Borda. Mateo agregó una nota: «Si no salgo, que esto sí salga».', source: 'Doble fondo del grabador', time: '01:58', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'card' },
    { id: 'van', caseId: 'ultima-llamada', title: 'Una salida, dos pasajeros', kind: 'photo', description: 'La camioneta de Elena en dirección al acceso norte.', content: '02:31 · Acceso Norte\nElena conduce. Mateo aparece en el asiento del acompañante, con el cinturón puesto. No se observa coerción. La cámara no permite determinar su destino final.', source: 'Cámara de acceso', time: '02:31', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'van' }
  ],
  rules: [{ id: 'stranger-call', kind: 'relationship', facts: ['relationship', 'contact'], when: { all: [{ claim: 'relationship', eq: 'stranger' }, { claim: 'contact', eq: true }] }, description: 'Dijiste que no tuviste ningún contacto con Mateo, pero reconocés una conversación personal con él. Necesito entender esa relación.', rectification: { fact: 'relationship', value: 'friend' } }],
  scenes: [
    scene('arrival', 'I · El ruido de fondo', '07:04', 'El tubo de luz tarda un segundo en encender. Tenés las manos frías. Del otro lado de la mesa, una mujer deja un teléfono dentro de una bolsa transparente.\n«Soy Inés Salvatierra. Mateo Rivas no volvió a su casa. Antes de hablar de anoche, necesito saber qué era él para vos».', [
      option('friend', 'Mateo es mi amigo. Hace años.', 'contact', [say('relationship', 'friend')]),
      option('sight', 'Lo conocía de vista.', 'contact', [say('relationship', 'acquaintance')]),
      option('stranger', 'No sé quién es. No tuve ningún contacto con él.', 'contact', [say('relationship', 'stranger')]),
      option('quiet', 'Prefiero no hablar de eso.', 'contact', [{ type: 'declare', fact: 'relationship', value: 'silence', certainty: 'withheld' }])
    ], { aside: 'Todo lo que digas puede volver a esta mesa.', onEnter: [proof('missing')] }),
    scene('contact', 'I · El ruido de fondo', '07:08', 'Salvatierra no toca el teléfono.\n«Anoche alguien llamó a tu número desde una cabina del puerto. ¿Hablaste con Mateo?»', [
      option('yes', 'Sí. Tenía miedo. No dijo de quién.', 'location', [say('contact', true)]),
      option('no', 'No hablé con él.', 'location', [say('contact', false)]),
      option('correct', 'Antes quiero corregir algo: sí lo conocía. Y hablamos.', 'location', [say('relationship', 'friend'), say('contact', true), flag('voluntaryCorrection')], 'Cambiar tu versión conserva lo que dijiste antes.'),
      option('unsure', 'Recuerdo un teléfono sonando. Nada más.', 'location', [{ type: 'declare', fact: 'contact', value: 'unknown', certainty: 'uncertain' }])
    ]),
    scene('location', 'I · El ruido de fondo', '07:12', '«Las dos y trece de la madrugada. Concentrate en ese momento. ¿Dónde estabas?»\nEl segundero parece más fuerte cuando ella deja de hablar.', [option('skip', 'No voy a precisar un lugar.', 'record', [{ type: 'declare', fact: 'location', value: 'silence', certainty: 'withheld' }])], { input: locationDomain('location', 'record', [
      { id: 'home', label: 'Estaba en mi casa.', patterns: ['(en )?(mi )?casa', '(en )?(mi )?domicilio', 'no sali de (mi )?(casa|domicilio)'], negatedPatterns: ['no (estaba|estuve|fui|me quede) en (mi )?(casa|domicilio)'] },
      { id: 'workshop', label: 'Estaba en el taller.', patterns: ['(en )?(el |mi )?taller', '(en )?(el |mi )?trabajo'] },
      { id: 'street', label: 'Estaba en la calle.', patterns: ['(en )?la calle', 'caminando', '(en )?el puerto'] }
    ]) }),
    scene('record', 'II · Lo que queda', '07:17', 'Salvatierra desliza una hoja. Tu número está subrayado a mano.\n«Cuarenta y ocho segundos. Hay llamadas que duran menos y cambian más. Esta se borró seis minutos después. ¿La borraste vos?»', [
      option('admit', 'Sí. Me pidió que lo hiciera.', 'photograph', [say('deleted', true), flag('cooperated')]),
      option('deny', 'No borré nada.', 'photograph', [say('deleted', false)]),
      option('why', '¿Por qué tendría miedo de que vieran esa llamada?', 'photograph', [flag('askedFear')])
    ], { kind: 'evidence', onEnter: [proof('phone'), feel(0, 12)], variants: [{ when: { flag: 'voluntaryCorrection', eq: true }, text: '«Corregiste lo de Mateo antes de que te mostrara esto. Lo tengo en cuenta». Salvatierra desliza una hoja con tu número subrayado.\n«La llamada duró cuarenta y ocho segundos. Se borró seis minutos después. ¿La borraste vos?»' }] }),
    scene('photograph', 'II · Lo que queda', '07:23', 'La segunda hoja es una fotografía del taller. Reconocés la luz azul de tu equipo.\n«No te voy a pedir que recuerdes lo que una cámara ya registró. Quiero saber qué pasó adentro».', [
      option('recorder', 'Mateo dejó un grabador. Podemos escucharlo.', 'tape', [flag('offeredRecorder')]),
      option('neighbor', 'Pregúntenle al vecino. Él mira todo.', 'neighbor'),
      option('memory', 'Necesito un momento para recordar.', 'memory')
    ], { kind: 'evidence', onEnter: [proof('power')] }),
    scene('neighbor', 'II · Lo que queda', '07:29', 'Óscar Leiva declaró que te vio salir sola. Salvatierra lee su frase y señala la hora tachada.\n«El vidrio estaba mojado y su reloj adelanta. Su seguridad me interesa menos que sus condiciones para ver. ¿Saliste sola?»', [
      option('alone', 'Sí, sola.', 'memory', [say('leftAlone', true)]),
      option('two', 'No. Acompañé a Mateo hasta la esquina.', 'memory', [say('leftAlone', false)]),
      option('uncertain', 'No puedo ordenar ese recuerdo.', 'memory', [{ type: 'declare', fact: 'leftAlone', value: 'unknown', certainty: 'uncertain' }])
    ], { onEnter: [proof('neighbor')] }),
    scene('memory', 'III · La cinta', '07:34', 'Volvés a sentir el olor del taller: metal tibio y café. Mateo sostiene un cassette sin etiqueta.\n«Si preguntan por mí, esperá a escuchar esto».\nEn el recuerdo, vos asentís. No sabés si por entenderlo o para que deje de temblar.', [
      option('listen', 'Pedir que traigan el grabador.', 'tape'),
      option('withhold', 'Guardar ese recuerdo por ahora.', 'route', [flag('keptMemory')])
    ], { kind: 'memory', speaker: 'Tu recuerdo', onEnter: [remember('recorder', true, 'Mateo dejó un cassette sin etiqueta y pidió que lo escucharas antes de hablar.'), feel(0, 8)] }),
    scene('tape', 'III · La cinta', '07:41', 'La cinta arranca con un chasquido. «No les des el muelle. No es ahí». Después, tu propia voz pregunta por Elena.\nSalvatierra frena el grabador. «Eso no suena a una despedida. Suena a una instrucción».', [
      option('open', 'Revisar el grabador. Mateo escondía cosas debajo de las cintas.', 'card', [flag('searchedRecorder')]),
      option('north', 'El norte… Había un depósito donde jugábamos de chicos.', 'route', [flag('knowsNorth')]),
      option('protect', 'Quiero garantías antes de decir algo más.', 'trust', [flag('askedProtection')])
    ], { kind: 'evidence', onEnter: [proof('tape'), remember('destination', 'north', '«El norte, como cuando éramos chicos». El viejo depósito todavía existe.')] }),
    scene('card', 'III · La cinta', '07:47', 'Debajo de la espuma hay una tarjeta. No contiene una confesión. Contiene números, firmas y tres transferencias que terminan en la misma cuenta.\nReconocés el apellido antes de leer el cargo: Borda.', [
      option('share', 'Entregar la tarjeta a Salvatierra.', 'trust', [proof('accounts'), flag('sharedAccounts')]),
      option('hold', 'Conservar la tarjeta hasta saber en quién confiar.', 'trust', [proof('accounts', 'player')])
    ], { kind: 'revelation' }),
    scene('trust', 'IV · Fuera de la jurisdicción', '07:55', 'Salvatierra cierra la puerta.\n«Pedí apartar a Borda. Todavía no me respondieron. Puedo entregar material a fiscalía con una copia fuera del puerto. No puedo prometerte que nada vaya a salir mal».\nPor primera vez, parece tan cansada como vos.', [
      option('trust', 'Quiero una copia sellada y protección para los dos hermanos.', 'route', [flag('protection'), feel(-5, -8)]),
      option('distrust', 'No confío en nadie que use esa placa.', 'route', [flag('distrust')]),
      option('testify', 'Si queda registrado fuera del puerto, voy a declarar.', 'route', [flag('protection'), flag('testify')]),
      { ...option('continue-route', 'Mi posición ya quedó registrada. Sigamos con la ubicación.', 'route'), when: { visited: 'destination' }, repeatable: true }
    ], { presentation: { accounts: { reply: 'Estas firmas justifican intervenir fuera del puerto. Voy a sellar una copia ahora.', effects: [flag('sharedAccounts'), flag('protection'), proof('custody')] } } }),
    scene('route', 'IV · Fuera de la jurisdicción', '08:02', 'Un agente golpea una sola vez. Trae una imagen de la salida norte: Elena al volante, Mateo junto a ella. Está vivo en esa fotografía.\n«No sabemos dónde está ahora. Tu próximo dato puede ayudarnos a encontrarlo, o avisarles a quienes lo buscan».', [
      { ...option('find', 'Reconstruir el destino con la grabación.', 'destination'), when: { evidence: 'tape' } },
      option('tape-now', 'Todavía falta escuchar el grabador.', 'tape', [flag('lateTape')]),
      option('responsibility', 'Yo borré el registro. Quiero declarar por ese encubrimiento.', 'responsibility', [say('deleted', true)]),
      option('stop', 'No voy a aportar más información.', 'closing', [flag('decision', 'stop')])
    ], { kind: 'revelation', onEnter: [proof('van'), feel(-3, 10)] }),
    scene('destination', 'V · La última decisión', '08:09', 'Ahora encaja: el golpe era la puerta de la cabina. Elena no lo buscaba para traerlo de vuelta. Lo estaba esperando.\nEl depósito norte sigue teniendo una salida hacia la ruta. Si das su nombre, el tiempo empieza a correr para todos.', [
      { ...option('safe', 'Revelar el depósito bajo el protocolo de protección.', 'closing', [say('destination', 'north'), flag('decision', 'rescue')]), when: { flag: 'protection', eq: true } },
      option('conditions', 'Antes de dar la ubicación, acordar protección.', 'trust'),
      option('escape', 'No revelar el depósito. Darles tiempo para irse.', 'closing', [flag('decision', 'escape')]),
      option('sacrifice', 'Asumir el encubrimiento sin entregar a Mateo.', 'responsibility')
    ], { kind: 'decision', presentation: { accounts: { reply: 'Con esta tarjeta puedo pedir protección fuera de la jurisdicción de Borda.', effects: [flag('sharedAccounts'), flag('protection')] } } }),
    scene('responsibility', 'V · La última decisión', '08:13', '«Entendé lo que estás diciendo: borrar la llamada fue una decisión tuya. No voy a convertir eso en una confesión de asesinato. Pero una declaración formal sobre el encubrimiento sí tiene consecuencias».\nSalvatierra deja la lapicera sobre la mesa.', [
      option('sign', 'Firmar lo que hice. Proteger la ubicación de Mateo.', 'closing', [flag('decision', 'sacrifice'), say('deleted', true)]),
      option('reconsider', 'No firmar todavía. Volver a hablar de protección.', 'trust')
    ], { kind: 'decision' }),
    scene('closing', 'VI · Lo que queda escrito', '08:20', 'Salvatierra apaga el grabador. El silencio es mucho menos limpio de lo que esperabas.\n«Lo que falta en una declaración también deja una forma. Hoy tenemos una. Mañana veremos qué entra en ella».', [option('finish', 'Dejar constancia y salir de la sala.', '$ending')], { kind: 'revelation' })
  ],
  endings: [
    { id: 'alba', title: 'Al otro lado del amanecer', subtitle: 'MATEO ENCONTRADO · PROTECCIÓN SOLICITADA', when: { all: [{ flag: 'decision', eq: 'rescue' }, { flag: 'protection', eq: true }, { evidence: 'accounts', audience: 'investigator' }] }, text: 'El equipo de fiscalía llega al depósito antes que los hombres de Borda. Mateo no quiere subir al auto hasta ver la copia sellada. Elena la lee dos veces. Esa tarde, tu grabador vuelve dentro de una caja. Ya no tiene la tarjeta. En el fondo hay una nota: «Esta vez, gracias por no guardar silencio».', consequence: 'Tu ubicación permitió encontrarlos; las cuentas y la protección evitaron que la búsqueda volviera a manos de Borda.', reveals: ['La desaparición fue una huida voluntaria.', 'Las transferencias vinculaban a Borda con el dinero del puerto.'] },
    { id: 'fuga', title: 'Una línea que nadie atiende', subtitle: 'UBICACIÓN OCULTA · HUIDA CONSUMADA', when: { flag: 'decision', eq: 'escape' }, text: 'Al mediodía, el depósito está vacío. Tres días después recibís una llamada sin identificador. No escuchás una voz: solo tres golpes suaves, como la señal que usaban de chicos. Mateo y Elena están lejos. Borda sigue en su oficina. Conservaste a una persona, pero dejaste abierta la máquina de la que escapó.', consequence: 'Elegiste ocultar una ubicación que habías reconstruido. Los hermanos escaparon y la red perdió a su testigo principal.', reveals: ['Elena organizó la fuga de Mateo.', 'La desaparición no fue un secuestro.'] },
    { id: 'custodia', title: 'Tu nombre en el acta', subtitle: 'ENCUBRIMIENTO RECONOCIDO', when: { flag: 'decision', eq: 'sacrifice' }, text: 'Tu firma queda debajo de una frase pequeña: supresión deliberada del registro. Te trasladan a otra sala para formalizar la investigación, sin atribuirte una muerte que nadie ha probado. Desde el pasillo ves cómo Salvatierra aparta la carpeta de Borda. No sabés si fue suficiente. Lo que hiciste ya no tiene otro nombre.', consequence: 'El reconocimiento concreto del borrado abrió una causa por encubrimiento. No fue tu nivel de sospecha ni una contradicción aislada.', reveals: ['Borraste la llamada para proteger una salida organizada.'] },
    { id: 'eco', title: 'El teléfono sigue sonando', subtitle: 'DECLARACIÓN CERRADA · CASO ABIERTO', text: 'Te dejan ir. No hay una acusación suficiente para retenerte y todavía falta una pieza para proteger a Mateo. Esa noche, el teléfono del taller suena. Lo mirás hasta que se calla. El expediente sigue abierto; tu libertad no respondió la pregunta por su destino.', consequence: 'La investigación no reunió a la vez ubicación, pruebas de corrupción y garantías de protección.', reveals: [] }
  ]
};
