
export interface RACriterion {
  id: string;
  nomenclature: string;
  description: string;
  unit: string;
  weight: number; // Percentage weight
}

export interface LearningOutcome {
  id: number;
  title: string;
  weight: number; // Global weight of the RA
  criteria: RACriterion[];
}

export const LEARNING_OUTCOMES: LearningOutcome[] = [
  {
    id: 1,
    title: "Analizar y caracterizar las empresas del sector según su estructura organizativa y la naturaleza de sus productos o servicios.",
    weight: 11,
    criteria: [
      { id: "1a", nomenclature: "1.A", description: "Se han identificado los modelos empresariales más representativos del sector.", unit: "2. Diseño de la carta", weight: 3 },
      { id: "1b", nomenclature: "1.B", description: "Se ha descrito la estructura organizativa típica de estas empresas.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1c", nomenclature: "1.C", description: "Se han definido las funciones y características de los principales departamentos.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1d", nomenclature: "1.D", description: "Se ha especificado el rol y las responsabilidades de cada área funcional.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1e", nomenclature: "1.E", description: "Se ha evaluado el volumen de negocio en función de las demandas y necesidades del cliente.", unit: "1. Inicio y análisis del sector", weight: 3 },
      { id: "1f", nomenclature: "1.F", description: "Se ha diseñado una estrategia adecuada para responder a dichas demandas.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1g", nomenclature: "1.G", description: "Se ha valorado la dotación necesaria de recursos humanos y materiales.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1h", nomenclature: "1.H", description: "Se ha implementado un sistema de seguimiento de resultados acorde con la estrategia definida.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "1i", nomenclature: "1.I", description: "Se ha establecido la relación entre los productos/servicios ofrecidos y su posible aporte a los Objetivos de Desarrollo Sostenible (ODS).", unit: "1. Inicio y análisis del sector", weight: 3 },
    ]
  },
  {
    id: 2,
    title: "Proponer soluciones viables a las necesidades del sector, considerando costes y desarrollando un proyecto básico.",
    weight: 13,
    criteria: [
      { id: "2a", nomenclature: "2.A", description: "Se han detectado y priorizado las necesidades del sector.", unit: "1. Inicio y análisis del sector", weight: 3 },
      { id: "2b", nomenclature: "2.B", description: "Se han generado, en equipo, propuestas de solución.", unit: "1. Inicio y análisis del sector", weight: 1 },
      { id: "2c", nomenclature: "2.C", description: "Se han generado, en equipo, propuestas de solución.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2d", nomenclature: "2.D", description: "Se ha recopilado información relevante sobre las soluciones planteadas.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2e", nomenclature: "2.E", description: "Se han incorporado elementos innovadores con potencial de aplicación práctica.", unit: "1. Inicio y análisis del sector", weight: 1 },
      { id: "2f", nomenclature: "2.F", description: "Se han incorporado elementos innovadores con potencial de aplicación práctica.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2g", nomenclature: "2.G", description: "Se ha realizado un análisis de viabilidad técnica de las propuestas.", unit: "4. Elaboración práctica", weight: 1 },
      { id: "2h", nomenclature: "2.H", description: "Se han definido las partes esenciales que componen el proyecto.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2i", nomenclature: "2.I", description: "Se ha estimado la dotación de recursos humanos y materiales requeridos.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2j", nomenclature: "2.J", description: "Se ha elaborado un presupuesto económico detallado.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2k", nomenclature: "2.K", description: "Se ha redactado la documentación técnica necesaria para el diseño del proyecto.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2l", nomenclature: "2.L", description: "Se han considerado los aspectos de calidad inherentes al proyecto.", unit: "2. Diseño de la carta", weight: 1 },
      { id: "2m", nomenclature: "2.M", description: "Se ha presentado públicamente el contenido más relevante del proyecto propuesto.", unit: "5. Finalización y presentación", weight: 1 },
    ]
  },
  {
    id: 3,
    title: "Planificar la ejecución de las actividades derivadas de la solución propuesta, definiendo un plan de intervención y su documentación asociada.",
    weight: 10,
    criteria: [
      { id: "3a", nomenclature: "3.A", description: "Se ha establecido una cronología detallada para cada actividad.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3b", nomenclature: "3.B", description: "Se han asignado los recursos y la logística necesarios para cada fase.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3c", nomenclature: "3.C", description: "Se han identificado los permisos o autorizaciones obligatorios, en caso de requerirse.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3d", nomenclature: "3.D", description: "Se han detectado las actividades con riesgos potenciales durante su ejecución.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3e", nomenclature: "3.E", description: "Se ha integrado el plan de prevención de riesgos laborales y se han previsto los equipos de protección necesarios.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3f", nomenclature: "3.F", description: "Se han asignado recursos humanos y materiales específicos a cada tarea.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3g", nomenclature: "3.G", description: "Se ha contemplado posibles contingencias o imprevistos.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3h", nomenclature: "3.H", description: "Se han diseñado medidas correctivas para hacer frente a dichos imprevistos.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3i", nomenclature: "3.I", description: "Se ha elaborado toda la documentación técnica y administrativa requerida.", unit: "3. Entrega parcial y seguimiento", weight: 1 },
      { id: "3j", nomenclature: "3.J", description: "Se ha elaborado toda la documentación técnica y administrativa requerida.", unit: "5. Finalización y presentación", weight: 3 },
    ]
  },
  {
    id: 4,
    title: "Supervisar la ejecución de las actividades, asegurando el cumplimiento del plan establecido.",
    weight: 22,
    criteria: [
      { id: "4a", nomenclature: "4.A", description: "Se ha definido un procedimiento claro para el seguimiento de las actividades.", unit: "3. Entrega parcial y seguimiento", weight: 2 },
      { id: "4b", nomenclature: "4.B", description: "Se ha verificado que los resultados obtenidos cumplen con los estándares de calidad esperados.", unit: "4. Elaboración práctica", weight: 2 },
      { id: "4c", nomenclature: "4.C", description: "Se han detectado desviaciones respecto al plan inicial o a los resultados previstos.", unit: "4. Elaboración práctica", weight: 1 },
      { id: "4d", nomenclature: "4.D", description: "Se ha comunicado oportunamente cualquier desviación relevante a los responsables.", unit: "4. Elaboración práctica", weight: 1 },
      { id: "4e", nomenclature: "4.E", description: "Se han implementado y documentado las acciones correctivas necesarias.", unit: "4. Elaboración práctica", weight: 1 },
      { id: "4f", nomenclature: "4.F", description: "Se ha generado la documentación final para la evaluación integral de las actividades y del proyecto global.", unit: "5. Finalización y presentación", weight: 13 },
      { id: "4g", nomenclature: "4.G", description: "Se ha generado la documentación final para la evaluación integral de las actividades y del proyecto global.", unit: "4. Elaboración práctica", weight: 1 },
    ]
  },
  {
    id: 5,
    title: "Comunicar información de forma clara, ordenada y estructurada, tanto interna como externamente.",
    weight: 40,
    criteria: [
      { id: "5a", nomenclature: "5.A", description: "Se ha mantenido una actitud metódica y organizada en la transmisión de la información.", unit: "5. Finalización y presentación", weight: 8 },
      { id: "5b", nomenclature: "5.B", description: "Se ha facilitado comunicación verbal efectiva, tanto en horizontal (entre pares) como en vertical (con superiores o subordinados).", unit: "5. Finalización y presentación", weight: 10 },
      { id: "5c", nomenclature: "5.C", description: "Se ha facilitado comunicación verbal efectiva, tanto en horizontal (entre pares) como en vertical (con superiores o subordinados).", unit: "5. Finalización y presentación", weight: 8 },
      { id: "5d", nomenclature: "5.D", description: "Se ha utilizado herramientas informáticas para la comunicación interna en el equipo.", unit: "5. Finalización y presentación", weight: 8 },
      { id: "5e", nomenclature: "5.E", description: "Se ha adquirido familiaridad con la terminología técnica del sector en otros idiomas de uso internacional.", unit: "5. Finalización y presentación", weight: 8 },
    ]
  },
  {
    id: 6,
    title: "PRODUCTOS CULINARIOS - RA1. Organiza los procesos productivos y de servicio en cocina, interpretando información oral o escrita.",
    weight: 1,
    criteria: [
      { id: "6a", nomenclature: "6.A", description: "Se han identificado y caracterizado los distintos ámbitos de producción y servicio en cocina.", unit: "4. Elaboración práctica", weight: 1 },
    ]
  },
  {
    id: 7,
    title: "PRODUCTOS CULINARIOS - RA3. Elabora productos culinarios a partir de un conjunto de materias primas, evaluando alternativas creativas y funcionales.",
    weight: 1,
    criteria: [
      { id: "7a", nomenclature: "7.A", description: "Se ha valorado el aprovechamiento integral de los recursos disponibles (materias primas, tiempos, técnicas).", unit: "4. Elaboración práctica", weight: 1 },
    ]
  },
  {
    id: 8,
    title: "POSTRES EN RESTAURACIÓN - RA7. Presenta postres emplatados a partir de elaboraciones de pastelería y repostería, integrando criterios estéticos y funcionales.",
    weight: 1,
    criteria: [
      { id: "8a", nomenclature: "8.A", description: "Se han aplicado técnicas de presentación y decoración acordes a las características del producto final y al contexto de servicio, garantizando equilibrio visual, textural y conceptual.", unit: "4. Elaboración práctica", weight: 1 },
    ]
  },
  {
    id: 9,
    title: "OFERTAS GASTRONÓMICAS - RA4. Calcula el coste global de la oferta gastronómica, analizando y ponderando todas las variables que lo componen.",
    weight: 1,
    criteria: [
      { id: "9a", nomenclature: "9.A", description: "Se han calculado y valorado los costes asociados a cada elaboración de cocina y/o pastelería/repostería, incluyendo materias primas, mano de obra, desperdicios, energía y otros gastos indirectos, con el fin de garantizar la viabilidad económica de la oferta.", unit: "4. Elaboración práctica", weight: 1 },
    ]
  }
];
