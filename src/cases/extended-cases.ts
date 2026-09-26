import type { CaseData, Character, Evidence } from '../engine/types';
import { scene, option, say, flag, proof, feel, remember, locationDomain } from './helpers';

type EvidenceDraft = Omit<Evidence, 'caseId'>;

interface ExtendedCaseConfig {
  id: string;
  number: string;
  title: string;
  genre: string;
  description: string;
  duration: string;
  color: string;
  protagonist: string;
  investigator: string;
  relationship: string;
  relationshipLabel: string;
  location: string;
  locationLabel: string;
  otherLocations: { id: string; label: string; patterns: string[] }[];
  hook: string;
  contactQuestion: string;
  locationQuestion: string;
  accessQuestion: string;
  memory: string;
  recording: string;
  revelation: string;
  closing: string;
  timeline: CaseData['timeline'];
  characters: Character[];
  evidence: EvidenceDraft[];
  endings: CaseData['endings'];
}

function buildExtendedCase(config: ExtendedCaseConfig): CaseData {
  return {
    id: config.id,
    number: config.number,
    title: config.title,
    genre: config.genre,
    description: config.description,
    duration: config.duration,
    color: config.color,
    protagonist: config.protagonist,
    investigator: config.investigator,
    initialScene: 'arrival',
    initialKnowledge: { relationship: config.relationship, location: config.location },
    truth: { relationship: config.relationship, contact: true, location: config.location, concealed: true, helped: true },
    factLabels: {
      relationship: 'tu relación con la persona desaparecida',
      contact: 'el último contacto',
      location: 'tu ubicación durante los hechos',
      concealed: 'la alteración del registro',
      helped: 'la ayuda que prestaste'
    },
    valueLabels: {
      [config.relationship]: config.relationshipLabel,
      stranger: 'no la conocía',
      acquaintance: 'la conocía de vista',
      [config.location]: config.locationLabel,
      ...Object.fromEntries(config.otherLocations.map(place => [place.id, place.label.replace(/\.$/, '').toLowerCase()])),
      true: 'sí',
      false: 'no'
    },
    timeline: config.timeline,
    characters: config.characters,
    evidence: config.evidence.map(item => ({ ...item, caseId: config.id })),
    rules: [],
    scenes: [
      scene('arrival', 'I · La primera versión', '06:40', config.hook, [
        option('known', config.relationshipLabel.charAt(0).toUpperCase() + config.relationshipLabel.slice(1) + '.', 'contact', [say('relationship', config.relationship)]),
        option('acquaintance', 'La conocía, pero apenas de vista.', 'contact', [say('relationship', 'acquaintance')]),
        option('stranger', 'No la conocía.', 'contact', [say('relationship', 'stranger')]),
        option('withhold-relation', 'Prefiero no definir nuestra relación.', 'contact', [{ type: 'declare', fact: 'relationship', value: 'silence', certainty: 'withheld' }])
      ], { onEnter: [proof('notice')] }),
      scene('contact', 'I · La primera versión', '06:47', config.contactQuestion, [
        option('contact-yes', 'Sí. Hablamos esa noche.', 'location', [say('contact', true)]),
        option('contact-no', 'No tuve ningún contacto.', 'location', [say('contact', false)]),
        option('contact-unsure', 'No puedo asegurar que fuera esa persona.', 'location', [{ type: 'declare', fact: 'contact', value: 'unknown', certainty: 'uncertain' }]),
        option('contact-silence', 'No voy a responder todavía.', 'location', [{ type: 'declare', fact: 'contact', value: 'silence', certainty: 'withheld' }])
      ]),
      scene('location', 'II · El lugar exacto', '06:55', config.locationQuestion, [
        option('location-silence', 'Prefiero no precisar dónde estaba.', 'access', [{ type: 'declare', fact: 'location', value: 'silence', certainty: 'withheld' }])
      ], { input: locationDomain('location', 'access', [
        { id: config.location, label: config.locationLabel, patterns: [config.locationLabel.replace(/^Estaba /i, '').replace(/\.$/, '').toLowerCase(), config.location] },
        ...config.otherLocations
      ]) }),
      scene('access', 'II · Lo que registró la máquina', '07:03', config.accessQuestion, [
        option('conceal-admit', 'Sí. Alteré el registro para ganar tiempo.', 'memory', [say('concealed', true), flag('cooperated')]),
        option('conceal-deny', 'No cambié ningún registro.', 'memory', [say('concealed', false)]),
        option('conceal-unsure', 'Toqué el sistema, pero no sé qué quedó guardado.', 'memory', [{ type: 'declare', fact: 'concealed', value: 'unknown', certainty: 'uncertain' }])
      ], { kind: 'evidence', onEnter: [proof('access'), feel(0, 10)] }),
      scene('memory', 'III · Lo que vuelve', '07:14', config.memory, [
        option('help-admit', 'La ayudé. En ese momento creí que era lo correcto.', 'recording', [say('helped', true), flag('admittedHelp')]),
        option('help-deny', 'No hice nada para ayudarla.', 'recording', [say('helped', false)]),
        option('help-uncertain', 'Recuerdo fragmentos, no una decisión completa.', 'recording', [{ type: 'declare', fact: 'helped', value: 'unknown', certainty: 'uncertain' }])
      ], { kind: 'memory', speaker: 'Tu recuerdo', onEnter: [proof('alteration'), remember('helped', true, config.memory)] }),
      scene('recording', 'IV · La pieza que faltaba', '07:26', config.recording, [
        option('record-open', 'Incorporar todo al expediente.', 'decision', [flag('sharedRecord'), proof('recording', 'investigator')]),
        option('record-copy', 'Entregar una copia y conservar el original.', 'decision', [flag('keptCopy'), proof('recording', 'investigator')]),
        option('record-hold', 'No entregar todavía la grabación.', 'decision', [flag('withheldRecord')])
      ], { kind: 'revelation', onEnter: [proof('recording', 'player'), proof('object'), proof('report')] }),
      scene('decision', 'V · Lo que queda en el acta', '07:39', config.revelation, [
        option('rescue', 'Dar la ubicación y activar una búsqueda protegida.', 'closing', [flag('decision', 'rescue')]),
        option('expose', 'Hacer pública la prueba antes de que puedan borrarla.', 'closing', [flag('decision', 'expose')]),
        option('protect', 'Proteger a la persona implicada y asumir mi parte.', 'closing', [flag('decision', 'protect')]),
        option('silence', 'Cerrar la declaración sin aportar el dato final.', 'closing', [flag('decision', 'silence')])
      ], { kind: 'decision', onEnter: [proof('image'), feel(0, 12)] }),
      scene('closing', 'VI · Después de declarar', '07:48', config.closing, [
        option('finish', 'Firmar el acta y salir de la sala.', '$ending')
      ], { kind: 'revelation' })
    ],
    endings: config.endings
  };
}

export const emptyElevator = buildExtendedCase({
  id: 'ascensor-vacio', number: '06', title: 'El ascensor vacío', genre: 'DESAPARICIÓN · THRILLER HOSPITALARIO', duration: '25–35 min', color: '#81958c',
  description: 'Un cirujano bajó a un subsuelo que no figura en los planos. El ascensor volvió vacío y tu tarjeta abrió la puerta.',
  protagonist: 'lara', investigator: 'valdes', relationship: 'colleague', relationshipLabel: 'Éramos colegas', location: 'sublevel', locationLabel: 'Estaba en el subsuelo de servicio.',
  otherLocations: [
    { id: 'ward', label: 'Estaba en la guardia.', patterns: ['guardia', 'urgencias'] },
    { id: 'parking', label: 'Estaba en el estacionamiento.', patterns: ['estacionamiento', 'cochera'] }
  ],
  hook: 'El inspector Valdés coloca una tarjeta magnética sobre la mesa. «El doctor Esteban Mena desapareció a las 03:18. Antes de mirar los accesos, decime qué relación tenías con él».',
  contactQuestion: '«A las 03:06, Mena llamó desde el montacargas. El número marcado fue el tuyo. ¿Atendiste?»',
  locationQuestion: 'El plano oficial termina en B1, pero el ascensor conserva un botón gastado debajo. «¿Dónde estabas cuando la cabina descendió?»',
  accessQuestion: 'Una copia del sistema muestra tu tarjeta a las 03:11 y una corrección manual siete minutos después. «¿Borraste ese acceso?»',
  memory: 'Recordás el olor a desinfectante y óxido. Mena sostenía una lista de pacientes alterada. «Si me encuentran antes de llegar al túnel, esto desaparece conmigo». Vos abriste la puerta de mantenimiento.',
  recording: 'El dictáfono de Mena enumera operaciones desviadas hacia una clínica privada. La última frase es clara: «Lara no eligió la lista. Solo me dio una salida».',
  revelation: 'El túnel desemboca junto a un depósito clausurado. Una cámara térmica detectó movimiento hace nueve minutos. Valdés necesita decidir entre entrar en silencio, publicar la lista o preservar primero a los pacientes nombrados.',
  closing: 'La tarjeta queda dentro de una bolsa nueva. El ascensor vuelve a detenerse en la planta baja, como si nunca hubiera conocido otro piso.',
  timeline: [
    { time: '02:42', event: 'Mena copia una lista de cirugías alterada por la administración.' },
    { time: '03:06', event: 'Llama a Lara desde el montacargas y pide acceso al subsuelo.' },
    { time: '03:11', event: 'La tarjeta de Lara abre la puerta de mantenimiento.' },
    { time: '03:18', event: 'El ascensor regresa vacío; el registro se modifica.' },
    { time: '03:31', event: 'Mena llega al depósito conectado con el túnel antiguo.' }
  ],
  characters: [
    { id: 'lara', name: 'Lara Soria', role: 'Vos · enfermera nocturna', description: 'Conocés los pasillos que no aparecen en las visitas guiadas.', personality: 'Práctica y protectora.', relationship: 'Colega de Mena.', knowledge: ['Mena encontró una lista adulterada.', 'El subsuelo comunica con un depósito.'], secret: 'Borraste un acceso para darle tiempo.', participation: 'Abriste la puerta del túnel.' },
    { id: 'valdes', name: 'Bruno Valdés', role: 'Inspector · delitos complejos', description: 'Revisa los horarios con un lápiz verde.', personality: 'Directo y metódico.', relationship: 'Investiga al director del hospital.', knowledge: ['Tu tarjeta fue usada.', 'El subsuelo existe.'], secret: 'Fiscalía autorizó una entrada discreta.', participation: 'Dirige la búsqueda.' },
    { id: 'mena', name: 'Esteban Mena', role: 'Cirujano · desaparecido', description: 'Llevaba un dictáfono y una carpeta azul.', personality: 'Obstinado, cuidadoso.', relationship: 'Confió en Lara.', knowledge: ['La lista de pacientes fue manipulada.'], secret: 'Copió los registros antes de huir.', participation: 'Intentó denunciar el desvío de cirugías.' },
    { id: 'ferreyra', name: 'Nora Ferreyra', role: 'Directora administrativa', description: 'Su firma autoriza cada traslado nocturno.', personality: 'Serena bajo presión.', relationship: 'Supervisaba a Mena.', knowledge: ['La clínica privada pagaba por prioridad.'], secret: 'Ordenó sellar el subsuelo.', participation: 'Alteró la lista y buscó recuperar la copia.' }
  ],
  evidence: [
    { id: 'notice', title: 'Alerta interna', kind: 'document', description: 'La desaparición fue informada antes del amanecer.', content: 'ESTEBAN MENA · no localizado desde las 03:18. Preservar cámaras y accesos.', source: 'Seguridad hospitalaria', time: '04:02', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'access', title: 'Tarjeta en B2', kind: 'record', description: 'Un piso ausente de los planos públicos.', content: '03:11:22 · TARJETA L. SORIA · PUERTA B2\n03:18:09 · CORRECCIÓN MANUAL DEL EVENTO', source: 'Servidor de accesos', time: '03:11', facts: { contact: true, location: 'sublevel' }, reliability: 'confirmed', possibleContradictions: ['contact', 'location'], visual: 'file' },
    { id: 'alteration', title: 'Registro corregido', kind: 'document', description: 'La modificación conserva la firma técnica.', content: 'Terminal enfermería norte · usuario L.SORIA · evento ocultado, no eliminado.', source: 'Auditoría informática', time: '03:18', facts: { concealed: true }, reliability: 'confirmed', possibleContradictions: ['concealed'], visual: 'file' },
    { id: 'recording', title: 'La lista azul', kind: 'audio', description: 'El último registro de Mena.', content: 'MENA: «Las prioridades fueron vendidas. Lara solo me abrió el paso. La copia completa está conmigo».', source: 'Dictáfono recuperado', time: '03:16', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'object', title: 'Llave de mantenimiento', kind: 'object', description: 'Abre la reja final del túnel.', content: 'Llave 6-M · huellas de Lara y Mena · óxido reciente en el dentado.', source: 'Cuarto de insumos', time: '03:28', facts: { helped: true }, reliability: 'confirmed', possibleContradictions: ['helped'], visual: 'file' },
    { id: 'report', title: 'Pacientes desplazados', kind: 'document', description: 'Doce turnos cambiados sin criterio médico.', content: 'Coincidencia financiera entre pagos privados y cambios de prioridad.', source: 'Auditoría clínica', time: '05:50', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'image', title: 'Calor detrás del depósito', kind: 'photo', description: 'Una figura permanece dentro del edificio clausurado.', content: 'Imagen térmica: una persona viva junto a la salida del túnel.', source: 'Unidad de búsqueda', time: '07:36', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'hall' }
  ],
  endings: [
    { id: 'pulso', title: 'Pulso estable', subtitle: 'MENA RESCATADO · PACIENTES PROTEGIDOS', when: { flag: 'decision', eq: 'rescue' }, text: 'El equipo entra por el túnel y encuentra a Mena herido, todavía con la carpeta azul.', consequence: 'La lista queda bajo custodia judicial y las cirugías se revisan sin exponer a los pacientes.', reveals: ['El subsuelo era una ruta de traslados no registrados.', 'La administración vendía prioridades médicas.'] },
    { id: 'lista', title: 'La lista abierta', subtitle: 'PRUEBAS PUBLICADAS · INVESTIGACIÓN ABIERTA', when: { flag: 'decision', eq: 'expose' }, text: 'La copia llega a tres redacciones antes de que el hospital pueda negar su existencia.', consequence: 'La presión pública acelera la causa, aunque varios pacientes pierden privacidad.', reveals: ['Mena había preparado una denuncia completa.'] },
    { id: 'guardia', title: 'Guardia de silencio', subtitle: 'TESTIGO PROTEGIDO · RESPONSABILIDAD ASUMIDA', when: { flag: 'decision', eq: 'protect' }, text: 'Declarás el borrado y exigís que cada nombre médico quede fuera de la prensa.', consequence: 'Mena entra al programa de protección; vos quedás suspendida mientras investigan tu ayuda.', reveals: ['Tu alteración retrasó a quienes lo perseguían.'] },
    { id: 'clausurado', title: 'Piso clausurado', subtitle: 'DECLARACIÓN CERRADA · RASTRO PERDIDO', text: 'Cuando abren el depósito ya no queda nadie. Solo la carpeta vacía y una puerta lateral.', consequence: 'El hospital atribuye todo a un error técnico. La verdad vuelve a quedar bajo tierra.', reveals: ['La señal térmica era reciente.'] }
  ]
});

export const submergedHouse = buildExtendedCase({
  id: 'casa-sumergida', number: '07', title: 'La casa sumergida', genre: 'SECRETO FAMILIAR · MISTERIO FLUVIAL', duration: '25–35 min', color: '#64858a',
  description: 'La sequía dejó al descubierto una casa bajo el embalse. Adentro encontraron una radio encendida y una foto tuya.',
  protagonist: 'tomas', investigator: 'quiroga', relationship: 'family', relationshipLabel: 'Lucía es mi hermana', location: 'spillway', locationLabel: 'Estaba en el aliviadero.',
  otherLocations: [
    { id: 'dock', label: 'Estaba en el muelle.', patterns: ['muelle', 'embarcadero'] },
    { id: 'town', label: 'Estaba en el pueblo.', patterns: ['pueblo', 'centro'] }
  ],
  hook: 'Mara Quiroga deja una fotografía húmeda frente a vos. «La encontraron en una casa que debía llevar treinta años bajo el agua. ¿Quién es Lucía Roldán para vos?»',
  contactQuestion: '«Tu hermana descendió al embalse anoche. A las 22:14 recibió una llamada desde tu radio. ¿Hablaron?»',
  locationQuestion: 'El nivel bajó hasta revelar la vieja ruta. «¿Dónde estabas cuando se apagaron las balizas del aliviadero?»',
  accessQuestion: 'El panel registra que anulaste dos alarmas y cambiaste la lectura del caudal. «¿Lo hiciste para que Lucía pudiera entrar?»',
  memory: 'Lucía golpeó el mapa con un dedo. Bajo la casa estaba el archivo de las familias expulsadas por la represa. Vos apagaste las balizas durante nueve minutos.',
  recording: 'La radio reproduce una conversación entre el antiguo intendente y la empresa: hablan de firmas falsificadas y de una familia que nunca abandonó voluntariamente la zona.',
  revelation: 'Un sonar acaba de detectar una segunda cámara bajo la casa y una botella de aire casi agotada. También hay una copia digital del registro de expropiaciones lista para enviarse.',
  closing: 'Afuera comienza a llover sobre un embalse que todavía no sabe cuánto de su pasado va a devolver.',
  timeline: [
    { time: '21:48', event: 'Lucía entra al embalse con equipo de buceo.' },
    { time: '22:14', event: 'Habla con Tomás por la radio de mantenimiento.' },
    { time: '22:19', event: 'Las alarmas del aliviadero quedan anuladas nueve minutos.' },
    { time: '22:27', event: 'Lucía accede a la cámara inferior de la casa.' },
    { time: '22:31', event: 'La comunicación se corta mientras sube el caudal.' }
  ],
  characters: [
    { id: 'tomas', name: 'Tomás Roldán', role: 'Vos · ingeniero del embalse', description: 'Sabés cuánto tarda el agua en borrar una huella.', personality: 'Reservado y leal.', relationship: 'Hermano de Lucía.', knowledge: ['La casa ocultaba documentos.', 'Anulaste las alarmas.'], secret: 'Ayudaste a Lucía a entrar.', participation: 'Manipulaste el panel del aliviadero.' },
    { id: 'quiroga', name: 'Mara Quiroga', role: 'Fiscal · delitos ambientales', description: 'Trae barro seco en los zapatos y mapas plastificados.', personality: 'Calma, insistente.', relationship: 'Investiga las expropiaciones.', knowledge: ['El caudal fue alterado.', 'Lucía sigue bajo la estructura.'], secret: 'Tiene un equipo de rescate esperando una ubicación precisa.', participation: 'Coordina la búsqueda.' },
    { id: 'lucia', name: 'Lucía Roldán', role: 'Buzo documentalista · desaparecida', description: 'Fotografía lugares antes de que vuelvan a hundirse.', personality: 'Tenaz e impaciente.', relationship: 'Tu hermana menor.', knowledge: ['La empresa falsificó firmas.'], secret: 'Encontró una cámara no registrada.', participation: 'Recuperó el archivo sumergido.' },
    { id: 'vallejos', name: 'Ernesto Vallejos', role: 'Exintendente', description: 'Inauguró la represa y nunca volvió a visitar el valle.', personality: 'Ceremonial y evasivo.', relationship: 'Firmó las expropiaciones.', knowledge: ['Varias familias fueron obligadas a salir.'], secret: 'Ordenó ocultar el archivo original.', participation: 'Autorizó las firmas falsas.' }
  ],
  evidence: [
    { id: 'notice', title: 'Parte de inmersión', kind: 'document', description: 'Lucía no regresó a la hora acordada.', content: 'BUZO: LUCÍA ROLDÁN · ingreso 21:48 · retorno previsto 22:25.', source: 'Club náutico', time: '22:40', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'access', title: 'Panel del aliviadero', kind: 'record', description: 'Una sesión abierta con tu clave.', content: '22:19 · USUARIO T.ROLDÁN · balizas suspendidas · ubicación: aliviadero.', source: 'Control hidráulico', time: '22:19', facts: { contact: true, location: 'spillway' }, reliability: 'confirmed', possibleContradictions: ['contact', 'location'], visual: 'file' },
    { id: 'alteration', title: 'Nueve minutos sin alarma', kind: 'document', description: 'El caudal visible fue reemplazado por un valor fijo.', content: 'Lectura real: 41 m³/s. Lectura mostrada: 18 m³/s. Modificación manual confirmada.', source: 'Pericia de telemetría', time: '22:20', facts: { concealed: true }, reliability: 'confirmed', possibleContradictions: ['concealed'], visual: 'file' },
    { id: 'recording', title: 'Voces bajo el agua', kind: 'audio', description: 'Una cinta preservada en una caja estanca.', content: 'VALLEJOS: «Las firmas se completan después. La casa de los Roldán queda bajo la cota».', source: 'Radio de la casa', time: 'Archivo de 1994', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'object', title: 'Mapa impermeable', kind: 'object', description: 'Marcaste la entrada de la cámara inferior.', content: 'Trazo reciente con letra de Tomás. Ruta desde el aliviadero hasta la casa.', source: 'Bolsa de equipo de Lucía', time: '21:44', facts: { helped: true }, reliability: 'confirmed', possibleContradictions: ['helped'], visual: 'file' },
    { id: 'report', title: 'Expropiaciones corregidas', kind: 'document', description: 'Los originales contradicen el registro público.', content: 'Veintisiete firmas copiadas. Cuatro propietarios figuraban muertos antes de firmar.', source: 'Archivo sumergido', time: '1994', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'image', title: 'La cámara inferior', kind: 'photo', description: 'El sonar muestra un espacio con aire.', content: 'Eco compatible con una persona y una botella de emergencia.', source: 'Sonar de rescate', time: '07:34', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'hall' }
  ],
  endings: [
    { id: 'superficie', title: 'Volver a la superficie', subtitle: 'LUCÍA RESCATADA · ARCHIVO RECUPERADO', when: { flag: 'decision', eq: 'rescue' }, text: 'Los buzos atraviesan la cámara lateral y encuentran a Lucía respirando en una bolsa de aire.', consequence: 'La prueba sale con ella y queda bajo cadena de custodia.', reveals: ['La casa conservaba el archivo original de expropiaciones.'] },
    { id: 'cota-cero', title: 'Cota cero', subtitle: 'DOCUMENTOS PUBLICADOS · VALLE REABIERTO', when: { flag: 'decision', eq: 'expose' }, text: 'El archivo se replica antes de que el agua vuelva a cubrir la ruta.', consequence: 'Las familias inician una demanda colectiva; el rescate avanza bajo la mirada pública.', reveals: ['Vallejos conocía las firmas falsas.'] },
    { id: 'nombres', title: 'Los nombres del agua', subtitle: 'FAMILIAS PROTEGIDAS · AYUDA CONFESADA', when: { flag: 'decision', eq: 'protect' }, text: 'Reconocés la manipulación y entregás el mapa solo al equipo de rescate.', consequence: 'Lucía sobrevive y los testimonios se reservan hasta que las familias aceptan hablar.', reveals: ['Apagaste las alarmas para abrir una ventana segura.'] },
    { id: 'marea', title: 'Cuando suba el agua', subtitle: 'DECLARACIÓN CERRADA · ARCHIVO INALCANZABLE', text: 'La lluvia obliga a abrir compuertas. La casa desaparece otra vez bajo una lámina oscura.', consequence: 'La radio queda como única prueba y Lucía no aparece esa noche.', reveals: ['Había aire en la cámara inferior.'] }
  ]
});

export const blindCamera = buildExtendedCase({
  id: 'camara-ciega', number: '08', title: 'La cámara ciega', genre: 'MUERTE SOSPECHOSA · MISTERIO DE MUSEO', duration: '25–35 min', color: '#8c7969',
  description: 'Durante un apagón desapareció una pintura y murió el curador. Todas las cámaras fallaron menos la que vos cubriste.',
  protagonist: 'emilia', investigator: 'salcedo', relationship: 'colleague', relationshipLabel: 'Éramos compañeros de trabajo', location: 'gallery', locationLabel: 'Estaba en la galería oeste.',
  otherLocations: [
    { id: 'security', label: 'Estaba en la sala de seguridad.', patterns: ['seguridad', 'monitores'] },
    { id: 'courtyard', label: 'Estaba en el patio.', patterns: ['patio', 'jardin'] }
  ],
  hook: 'La subcomisaria Salcedo apoya una funda vacía sobre la mesa. «Leandro Costa apareció muerto junto al marco. Antes del apagón, ¿qué relación tenías con él?»',
  contactQuestion: '«A las 00:08, Costa usó el interno de restauración para llamarte. ¿Contestaste?»',
  locationQuestion: 'Solo una cámara conservó imagen: la lente está tapada por una tela de tu uniforme. «¿Dónde estabas durante esos seis minutos?»',
  accessQuestion: 'El sistema muestra un bucle de video cargado desde tu consola. «¿Dejaste ciegas las cámaras?»',
  memory: 'Costa te mostró el reverso del cuadro: debajo de una etiqueta reciente estaba el sello de una colección saqueada. Te pidió seis minutos sin cámaras para fotografiarlo.',
  recording: 'El micrófono de sala captó a la directora diciendo que el original debía salir antes de la auditoría. Después se oye a Costa caer y otra persona correr hacia el depósito.',
  revelation: 'La pintura robada sigue dentro del museo, oculta tras un panel móvil. Salcedo puede entrar, publicar el catálogo de piezas falsas o proteger primero a la restauradora que vio el golpe.',
  closing: 'Las luces del museo vuelven a encenderse una por una. En cada marco vacío queda un rectángulo más claro que la pared.',
  timeline: [
    { time: '23:52', event: 'Costa descubre un sello de procedencia oculto.' },
    { time: '00:08', event: 'Llama a Emilia y pide seis minutos sin cámaras.' },
    { time: '00:11', event: 'Emilia carga un bucle de video.' },
    { time: '00:14', event: 'Costa discute con la directora en la galería oeste.' },
    { time: '00:17', event: 'La pintura desaparece y Costa queda herido de muerte.' }
  ],
  characters: [
    { id: 'emilia', name: 'Emilia Funes', role: 'Vos · jefa de seguridad', description: 'Conocés cada ángulo muerto del museo.', personality: 'Disciplinada y desconfiada.', relationship: 'Compañera de Costa.', knowledge: ['El cuadro tenía un sello oculto.', 'Cargaste el bucle.'], secret: 'Aceptaste apagar las cámaras.', participation: 'Creaste la ventana usada durante el robo.' },
    { id: 'salcedo', name: 'Julia Salcedo', role: 'Subcomisaria · patrimonio cultural', description: 'Usa guantes incluso para mover una fotografía.', personality: 'Analítica y firme.', relationship: 'Investigaba ventas del museo.', knowledge: ['El video fue manipulado.', 'La pintura no salió del edificio.'], secret: 'Una restauradora aceptó declarar si la protegen.', participation: 'Dirige el registro del museo.' },
    { id: 'costa', name: 'Leandro Costa', role: 'Curador · víctima', description: 'Anotaba la procedencia de cada obra a lápiz.', personality: 'Minucioso, incapaz de ignorar una falsificación.', relationship: 'Confiaba en Emilia.', knowledge: ['Varias obras provenían de saqueos.'], secret: 'Fotografió el sello del cuadro.', participation: 'Intentó impedir una venta ilegal.' },
    { id: 'oribe', name: 'Clara Oribe', role: 'Directora del museo', description: 'Nunca aparece en una cámara sin mirar antes a la lente.', personality: 'Elegante y controladora.', relationship: 'Jefa de Costa y Emilia.', knowledge: ['El catálogo estaba adulterado.'], secret: 'Ordenó sustituir originales por copias.', participation: 'Mandó retirar la pintura durante el apagón.' }
  ],
  evidence: [
    { id: 'notice', title: 'Acta de la galería', kind: 'document', description: 'Costa fue hallado junto al marco vacío.', content: 'Víctima: Leandro Costa. Sin lesiones gráficas registradas en el informe público.', source: 'Policía científica', time: '00:29', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'access', title: 'La única cámara', kind: 'record', description: 'La tela deja visible parte de la galería.', content: '00:08 · llamada interna contestada por E. Funes. 00:12 · silueta de Emilia en galería oeste.', source: 'Cámara 12', time: '00:12', facts: { contact: true, location: 'gallery' }, reliability: 'confirmed', possibleContradictions: ['contact', 'location'], visual: 'file' },
    { id: 'alteration', title: 'Seis minutos repetidos', kind: 'document', description: 'El bucle salió de tu consola.', content: 'Archivo LOOP_6M cargado por EFUNES. La imagen repite el minuto 00:05.', source: 'Pericia de video', time: '00:11', facts: { concealed: true }, reliability: 'confirmed', possibleContradictions: ['concealed'], visual: 'file' },
    { id: 'recording', title: 'Micrófono de sala', kind: 'audio', description: 'El video falló; el audio continuó.', content: 'ORIBE: «El original sale hoy». COSTA: «Ya fotografié el sello». [golpe] [pasos hacia depósito]', source: 'Sensor ambiental', time: '00:14', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'object', title: 'Tela del uniforme', kind: 'object', description: 'La colocaste sobre la cámara 12.', content: 'Fibra y pliegue compatibles con el bolsillo de Emilia. Colocación deliberada.', source: 'Galería oeste', time: '00:10', facts: { helped: true }, reliability: 'confirmed', possibleContradictions: ['helped'], visual: 'file' },
    { id: 'report', title: 'Catálogo paralelo', kind: 'document', description: 'Veintidós obras tienen procedencia falsa.', content: 'Fotografías UV y números de lote contradicen el catálogo oficial.', source: 'Archivo de Costa', time: '23:58', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'image', title: 'Panel móvil', kind: 'photo', description: 'Una esquina del marco aparece tras la pared.', content: 'Escáner de densidad: objeto rectangular de 110 × 80 cm dentro del depósito.', source: 'Registro técnico', time: '07:31', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'portrait' }
  ],
  endings: [
    { id: 'luz', title: 'Luz de inventario', subtitle: 'OBRA RECUPERADA · TESTIGO A SALVO', when: { flag: 'decision', eq: 'rescue' }, text: 'El panel se abre frente a dos fiscales. La pintura y las fotografías de Costa quedan registradas juntas.', consequence: 'La restauradora declara y Oribe es apartada del museo.', reveals: ['La obra nunca abandonó el edificio.'] },
    { id: 'catalogo', title: 'Catálogo de ausencias', subtitle: 'RED DE VENTAS EXPUESTA', when: { flag: 'decision', eq: 'expose' }, text: 'El catálogo paralelo aparece en línea antes de la apertura del museo.', consequence: 'Colecciones de tres países reclaman piezas; también se conoce tu manipulación del video.', reveals: ['Había al menos veintidós procedencias falsas.'] },
    { id: 'restauracion', title: 'Restaurar la verdad', subtitle: 'TESTIGO PROTEGIDA · BUCLE CONFESADO', when: { flag: 'decision', eq: 'protect' }, text: 'Admitís el bucle y reservás el nombre de quien vio correr a Oribe.', consequence: 'La causa avanza más despacio, con una testigo viva y una copia segura.', reveals: ['Costa planeó documentar el sello, no robar el cuadro.'] },
    { id: 'marco', title: 'El marco vacío', subtitle: 'CASO SIN AUTOR · COLECCIÓN DISPERSA', text: 'La búsqueda empieza tarde. El panel ya está abierto y la pintura fue retirada por otra salida.', consequence: 'El museo reabre con una placa en memoria de Costa y ninguna explicación completa.', reveals: ['La grabación señalaba el depósito.'] }
  ]
});

export const kilometerSeventeen = buildExtendedCase({
  id: 'kilometro-diecisiete', number: '09', title: 'Kilómetro 17', genre: 'DESAPARICIÓN · THRILLER DE CARRETERA', duration: '25–35 min', color: '#7f8068',
  description: 'Un micro llegó con un asiento vacío y un boleto que no debía existir. Vos hiciste una parada fuera de ruta.',
  protagonist: 'andres', investigator: 'paredes', relationship: 'passenger', relationshipLabel: 'Era una pasajera de mi recorrido', location: 'mile17', locationLabel: 'Estaba en el kilómetro 17.',
  otherLocations: [
    { id: 'terminal', label: 'Estaba en la terminal.', patterns: ['terminal', 'anden'] },
    { id: 'service', label: 'Estaba en la estación de servicio.', patterns: ['estacion de servicio', 'gasolinera'] }
  ],
  hook: 'Lucía Paredes despliega un boleto sin destino impreso. «Micaela Soto subió a tu micro y no llegó a la terminal. ¿La conocías?»',
  contactQuestion: '«A las 01:22 ella se acercó a tu cabina. El micrófono de ruta registró una conversación. ¿Hablaste con Micaela?»',
  locationQuestion: 'El GPS tiene un hueco de once minutos durante la tormenta. «¿Dónde detuviste el micro?»',
  accessQuestion: 'Tu consola recibió una orden falsa de desvío y después borró la parada. «¿Modificaste la hoja de ruta?»',
  memory: 'Micaela te mostró una credencial y una foto de un camión policial. Dijo que la seguían desde la frontera. Vos apagaste el GPS y abriste la puerta en el kilómetro 17.',
  recording: 'El micrófono conserva su voz: «La camioneta azul lleva personas, no mercadería». Luego indica una capilla abandonada y agradece que no preguntes su nombre real.',
  revelation: 'Una patrulla no registrada acaba de tomar el camino a la capilla. Paredes puede enviar un equipo confiable, difundir la matrícula o sacar primero a Micaela sin revelar su identidad.',
  closing: 'La lluvia golpea la ventana. En el mapa, el kilómetro 17 es apenas una marca; esta noche contiene una vida entera.',
  timeline: [
    { time: '01:04', event: 'Micaela aborda con un boleto emitido fuera del sistema.' },
    { time: '01:22', event: 'Habla con Andrés y muestra pruebas de una red de traslados.' },
    { time: '01:31', event: 'El GPS queda fuera de línea.' },
    { time: '01:34', event: 'El micro se detiene en el kilómetro 17.' },
    { time: '01:42', event: 'Una camioneta policial pasa en dirección a la capilla.' }
  ],
  characters: [
    { id: 'andres', name: 'Andrés Ferreyra', role: 'Vos · conductor nocturno', description: 'Recordás rutas por el sonido del pavimento.', personality: 'Cauto y solidario.', relationship: 'Conductor de Micaela.', knowledge: ['Micaela huía de una patrulla.', 'La dejaste en el kilómetro 17.'], secret: 'Borraste la parada de la hoja.', participation: 'Le diste una oportunidad de escapar.' },
    { id: 'paredes', name: 'Lucía Paredes', role: 'Fiscal · trata de personas', description: 'Trae una radio propia y ningún uniforme cerca.', personality: 'Urgente y precisa.', relationship: 'Sigue la camioneta azul desde hace meses.', knowledge: ['La orden de desvío era falsa.', 'Hay agentes implicados.'], secret: 'Solo confía en un equipo fuera de la ruta provincial.', participation: 'Coordina el rescate.' },
    { id: 'micaela', name: 'Micaela Soto', role: 'Pasajera · testigo protegida', description: 'Su boleto no tiene destino y su nombre podría ser prestado.', personality: 'Atenta, decidida.', relationship: 'Te pidió una parada.', knowledge: ['Identificó la camioneta de la red.'], secret: 'Grabó matrículas y voces durante un traslado.', participation: 'Escapó con una copia de las pruebas.' },
    { id: 'sosa', name: 'Darío Sosa', role: 'Oficial de ruta', description: 'Firmó la orden de desvío sin estar de guardia.', personality: 'Afable y peligroso.', relationship: 'Buscaba a Micaela.', knowledge: ['La capilla es un punto de intercambio.'], secret: 'Protege los traslados clandestinos.', participation: 'Envió la patrulla tras el micro.' }
  ],
  evidence: [
    { id: 'notice', title: 'Asiento 24', kind: 'document', description: 'El equipaje llegó sin su dueña.', content: 'Pasajera: MICAELA SOTO · asiento 24 · destino sin imprimir.', source: 'Terminal central', time: '03:10', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'access', title: 'Hueco de GPS', kind: 'record', description: 'La última posición válida coincide con la parada.', content: '01:22 · audio de cabina activo. 01:34 · posición recuperada en km 17.', source: 'Telemetría del micro', time: '01:34', facts: { contact: true, location: 'mile17' }, reliability: 'confirmed', possibleContradictions: ['contact', 'location'], visual: 'file' },
    { id: 'alteration', title: 'Hoja reimpresa', kind: 'document', description: 'La parada fue retirada con tu clave.', content: 'Versión 2 elimina EVENTO KM17. Usuario: AFERREYRA.', source: 'Servidor de la empresa', time: '01:39', facts: { concealed: true }, reliability: 'confirmed', possibleContradictions: ['concealed'], visual: 'file' },
    { id: 'recording', title: 'La camioneta azul', kind: 'audio', description: 'La voz de Micaela quedó en el micrófono.', content: 'MICAELA: «Patente termina en 481. La capilla es el siguiente punto. Si llego a pie, puedo esperar».', source: 'Micrófono de cabina', time: '01:22', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'object', title: 'Boleto manual', kind: 'object', description: 'Lo emitiste sin registrar destino.', content: 'Talonario del conductor · letra de Andrés · asiento 24.', source: 'Equipaje recuperado', time: '01:03', facts: { helped: true }, reliability: 'confirmed', possibleContradictions: ['helped'], visual: 'file' },
    { id: 'report', title: 'Orden fuera de turno', kind: 'document', description: 'Sosa firmó mientras figuraba de licencia.', content: 'Desvío por tormenta · firma D. Sosa · certificado horario incompatible.', source: 'Policía caminera', time: '00:58', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'image', title: 'Luces en la capilla', kind: 'photo', description: 'Dos vehículos se acercan por caminos distintos.', content: 'Cámara rural: patrulla azul y vehículo fiscal sin identificación.', source: 'Estancia La Paz', time: '07:35', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'van' }
  ],
  endings: [
    { id: 'faro', title: 'Faros en la tormenta', subtitle: 'MICAELA RESCATADA · EQUIPO SEGURO', when: { flag: 'decision', eq: 'rescue' }, text: 'El equipo de Paredes llega sin sirenas y saca a Micaela por el camino de tierra.', consequence: 'Su grabación permite identificar dos vehículos de la red.', reveals: ['La patrulla provincial respondía a Sosa.'] },
    { id: 'ruta-publica', title: 'Ruta pública', subtitle: 'MATRÍCULA DIFUNDIDA · RED EXPUESTA', when: { flag: 'decision', eq: 'expose' }, text: 'La matrícula circula por radios y medios antes de que la camioneta llegue a la capilla.', consequence: 'La red pierde cobertura, pero el nombre usado por Micaela también queda bajo escrutinio.', reveals: ['El boleto sin destino fue una medida de protección.'] },
    { id: 'asiento', title: 'El asiento reservado', subtitle: 'TESTIGO PROTEGIDA · CONDUCTOR IMPUTADO', when: { flag: 'decision', eq: 'protect' }, text: 'Reconocés la parada clandestina y entregás la ubicación solo a Paredes.', consequence: 'Micaela entra a protección. Tu licencia queda suspendida mientras se evalúa tu intervención.', reveals: ['Borraste la parada para ocultarla de Sosa.'] },
    { id: 'banquina', title: 'La banquina vacía', subtitle: 'DECLARACIÓN CERRADA · DESTINO DESCONOCIDO', text: 'La patrulla llega primero. Cuando fiscalía entra a la capilla, solo encuentra el boleto húmedo.', consequence: 'La empresa corrige el recorrido oficial y niega que el micro se detuviera.', reveals: ['El audio daba una ubicación verificable.'] }
  ]
});

export const zeroArchive = buildExtendedCase({
  id: 'archivo-cero', number: '10', title: 'El archivo cero', genre: 'CONSPIRACIÓN · TERROR DOCUMENTAL', duration: '30–40 min', color: '#8a6d64',
  description: 'Diez expedientes fueron copiados antes de desaparecer del sistema. La última sesión abierta lleva tu nombre.',
  protagonist: 'noa', investigator: 'salvatierra', relationship: 'source', relationshipLabel: 'Era mi fuente dentro del archivo', location: 'vault', locationLabel: 'Estaba en la bóveda documental.',
  otherLocations: [
    { id: 'reading', label: 'Estaba en la sala de lectura.', patterns: ['sala de lectura', 'lectura'] },
    { id: 'street', label: 'Estaba fuera del edificio.', patterns: ['calle', 'fuera del edificio', 'afuera'] }
  ],
  hook: 'Inés Salvatierra reconoce tu nombre antes de sentarse. Entre ustedes hay diez carpetas sin carátula. «El técnico que te avisó, Julián Arce, no aparece. ¿Qué era él para vos?»',
  contactQuestion: '«A las 04:00, Arce llamó desde el servidor central y dijo una sola frase: “Están borrando los casos”. ¿Recibiste esa llamada?»',
  locationQuestion: 'La bóveda quedó abierta durante doce minutos. «¿Dónde estabas mientras desaparecían los originales?»',
  accessQuestion: 'El sistema registra una exportación con tu usuario y después un borrado remoto. «¿Creaste la copia clandestina?»',
  memory: 'Arce te entregó una llave y una lista de expedientes destinados a desaparecer. Reconociste nombres, horas y pruebas que nunca debían compartir una misma orden de borrado.',
  recording: 'El respaldo contiene la voz de Arce: «No buscan ocultar un culpable. Buscan que nadie pueda demostrar que los casos se conectan por las personas que controlan la evidencia».',
  revelation: 'La copia completa está dividida entre tres servidores. Salvatierra puede recuperarla, publicarla, separar los nombres vulnerables o dejar que el borrado automático termine en once minutos.',
  closing: 'Las carpetas permanecen cerradas. Por primera vez, el silencio de la sala parece venir de todos los archivos a la vez.',
  timeline: [
    { time: '03:41', event: 'Arce detecta una orden masiva de eliminación.' },
    { time: '04:00', event: 'Llama a Noa desde el servidor central.' },
    { time: '04:07', event: 'Noa entra a la bóveda y comienza una exportación.' },
    { time: '04:19', event: 'Los originales desaparecen del índice oficial.' },
    { time: '04:23', event: 'Arce abandona el edificio por una salida sin cámaras.' }
  ],
  characters: [
    { id: 'noa', name: 'Noa Vidal', role: 'Vos · archivista nocturna', description: 'Podés reconocer un expediente por el peso de la carpeta.', personality: 'Paciente y obstinada.', relationship: 'Fuente y amiga de Arce.', knowledge: ['Existía una orden de borrado.', 'Creaste una copia distribuida.'], secret: 'Guardaste el índice fuera del sistema.', participation: 'Evitaste que diez expedientes desaparecieran por completo.' },
    { id: 'salvatierra', name: 'Inés Salvatierra', role: 'Inspectora · unidad independiente', description: 'Trae su propio grabador y una copia sellada de una causa antigua.', personality: 'Precisa, más cansada que antes.', relationship: 'Reconoce patrones entre los expedientes.', knowledge: ['La orden llegó desde varias oficinas.', 'La copia sigue accesible.'], secret: 'Su investigación también estaba marcada para borrado.', participation: 'Intenta preservar el archivo fuera de la red comprometida.' },
    { id: 'arce', name: 'Julián Arce', role: 'Técnico de sistemas · desaparecido', description: 'Dejó su taza caliente junto al servidor.', personality: 'Irónico y minucioso.', relationship: 'Tu fuente dentro del archivo.', knowledge: ['Los borrados compartían una autorización maestra.'], secret: 'Dividió la clave de recuperación en tres partes.', participation: 'Alertó a Noa y huyó con una de las claves.' },
    { id: 'vega', name: 'Alicia Vega', role: 'Directora de custodia documental', description: 'Su firma digital no aparece nunca dos veces igual.', personality: 'Impenetrable y ordenada.', relationship: 'Supervisaba a Noa y Arce.', knowledge: ['Los diez casos comprometían a una red de funcionarios.'], secret: 'Ejecutó la orden de borrado.', participation: 'Intentó destruir originales y respaldos.' }
  ],
  evidence: [
    { id: 'notice', title: 'Diez lugares vacíos', kind: 'document', description: 'El inventario conserva números sin carpetas.', content: 'Ítems 01–10: estado NO LOCALIZADO. Última auditoría: 04:19.', source: 'Inventario físico', time: '05:02', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'access', title: 'Sesión NVidal', kind: 'record', description: 'La llamada y la entrada quedaron unidas por el mismo token.', content: '04:00 · llamada contestada. 04:07 · acceso a bóveda con usuario NVIDAL.', source: 'Servidor central', time: '04:07', facts: { contact: true, location: 'vault' }, reliability: 'confirmed', possibleContradictions: ['contact', 'location'], visual: 'file' },
    { id: 'alteration', title: 'Copia antes del borrado', kind: 'document', description: 'La exportación se inició desde tu terminal.', content: 'EXPORT_10 · 18,4 GB · destino fragmentado. Registro ocultado a las 04:20.', source: 'Auditoría forense', time: '04:19', facts: { concealed: true }, reliability: 'confirmed', possibleContradictions: ['concealed'], visual: 'file' },
    { id: 'recording', title: 'La voz de Arce', kind: 'audio', description: 'Un mensaje incrustado dentro del índice.', content: 'ARCE: «No borres la copia. Separá los nombres. La autorización maestra está en la carpeta cero».', source: 'Respaldo cifrado', time: '04:16', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'wave' },
    { id: 'object', title: 'Llave partida', kind: 'object', description: 'Una de las tres piezas quedó en tu casillero.', content: 'Fragmento criptográfico 2/3. Huellas de Noa y Arce.', source: 'Casillero 18', time: '04:25', facts: { helped: true }, reliability: 'confirmed', possibleContradictions: ['helped'], visual: 'file' },
    { id: 'report', title: 'Autorización maestra', kind: 'document', description: 'Una misma clave ordenó borrar archivos de oficinas distintas.', content: 'Certificado raíz: CUSTODIA-VEGA. Alcance: expedientes 01–10 y respaldos asociados.', source: 'Carpeta cero', time: '03:38', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'file' },
    { id: 'image', title: 'Salida sin cámara', kind: 'photo', description: 'Arce dejó una señal antes de desaparecer.', content: 'Reflejo en vidrio: Arce sube a un vehículo de fiscalía sin identificación.', source: 'Edificio contiguo', time: '04:23', facts: {}, reliability: 'confirmed', possibleContradictions: [], visual: 'van' }
  ],
  endings: [
    { id: 'custodia', title: 'La memoria bajo custodia', subtitle: 'ARCHIVO RECUPERADO · ARCE LOCALIZADO', when: { flag: 'decision', eq: 'rescue' }, text: 'Salvatierra activa los tres servidores desde una red aislada. La tercera clave llega desde el vehículo donde Arce espera.', consequence: 'Los diez expedientes vuelven a existir con una cadena de custodia nueva.', reveals: ['Arce huyó con ayuda de la unidad independiente.', 'Vega firmó la autorización maestra.'] },
    { id: 'todos', title: 'Todos los nombres', subtitle: 'ARCHIVO PUBLICADO · RED EXPUESTA', when: { flag: 'decision', eq: 'expose' }, text: 'La copia completa aparece en servidores de varios países antes de que termine la cuenta regresiva.', consequence: 'La red pierde el control de las pruebas, pero personas protegidas quedan expuestas junto a los responsables.', reveals: ['Los casos estaban conectados por la manipulación de evidencia.'] },
    { id: 'version', title: 'La versión protegida', subtitle: 'NOMBRES RESERVADOS · VERDAD PRESERVADA', when: { flag: 'decision', eq: 'protect' }, text: 'Admitís la exportación y entregás una copia sin identidades vulnerables.', consequence: 'La investigación empieza con menos ruido y suficientes pruebas para detener el borrado.', reveals: ['Separar nombres era la última instrucción de Arce.'] },
    { id: 'cero', title: 'Cero resultados', subtitle: 'BORRADO COMPLETO · MEMORIA PRIVADA', text: 'La cuenta llega a cero. En el sistema ya no queda ningún caso, solo lo que vos recordás.', consequence: 'Vega conserva su cargo. Salvatierra guarda una carpeta vacía como promesa de volver a empezar.', reveals: ['La copia podía recuperarse durante once minutos más.'] }
  ]
});
