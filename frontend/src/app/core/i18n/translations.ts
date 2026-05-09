import type { Locale } from '../../models/verification.types';

export const TRANSLATIONS = {
  en: {
    'app.title': 'News fact-checker',
    'app.subtitle':
      'Paste a URL or a headline and verify claims against real sources.',

    'input.label': 'URL or headline to verify',
    'input.placeholder': 'https://… or paste a headline (min. 10 characters)',
    'input.submit': 'Verify',
    'input.submitBusy': 'Verifying…',

    'step.extract': 'Extract content',
    'step.claims': 'Identify claims',
    'step.search': 'Find evidence',
    'step.language': 'Analyze language',
    'step.verdict': 'Issue verdict',

    'error.prefix': 'Error',

    'verdict.label.true': 'True',
    'verdict.label.false': 'False',
    'verdict.label.partially_true': 'Partially true',
    'verdict.label.unverified': 'Insufficient evidence',
    'verdict.confidence': 'Confidence',
    'verdict.recommendation': 'Recommendation',
    'verdict.redFlags': 'Red flags',

    'claims.title': 'Claims',
    'claims.noSources': 'No sources found.',
    'claims.reasonLabel': 'Reason:',
    'claims.status.confirmed': 'Confirmed',
    'claims.status.refuted': 'Refuted',
    'claims.status.unverified': 'Unverified',

    'language.title': 'Language analysis',
    'language.score': 'Manipulation score',
    'language.noSignals': 'No manipulation signals detected.',
    'language.tone.neutral': 'Neutral',
    'language.tone.sensational': 'Sensational',
    'language.tone.propagandistic': 'Propagandistic',
    'language.tone.opinionated': 'Opinionated',
    'language.severity.low': 'Low',
    'language.severity.medium': 'Medium',
    'language.severity.high': 'High',

    'locale.label': 'Language',
    'locale.en': 'English',
    'locale.es': 'Español',
    'locale.pt': 'Português',
    'locale.fr': 'Français',

    'empty.howItWorks': 'How it works',
    'empty.step1': 'Paste a URL or a headline',
    'empty.step2': 'We extract claims and search the open web',
    'empty.step3': 'Calibrated verdict with linked sources',
    'empty.tryOne': 'Or try one of these',
    'empty.item1':
      'The James Webb Space Telescope was launched on December 25, 2021',
    'empty.item2':
      'Eating dark chocolate every day extends your lifespan by 5 years',
    'empty.item3':
      'NASA confirmed liquid water on the Moon for the first time in 2020',
  },

  es: {
    'app.title': 'Verificador de noticias',
    'app.subtitle':
      'Pega una URL o un titular y verifica las afirmaciones contra fuentes reales.',

    'input.label': 'URL o titular a verificar',
    'input.placeholder': 'https://… o pega un titular (mín. 10 caracteres)',
    'input.submit': 'Verificar',
    'input.submitBusy': 'Verificando…',

    'step.extract': 'Extraer contenido',
    'step.claims': 'Identificar afirmaciones',
    'step.search': 'Buscar evidencia',
    'step.language': 'Analizar lenguaje',
    'step.verdict': 'Emitir veredicto',

    'error.prefix': 'Error',

    'verdict.label.true': 'Verdadera',
    'verdict.label.false': 'Falsa',
    'verdict.label.partially_true': 'Parcialmente verdadera',
    'verdict.label.unverified': 'Sin evidencia suficiente',
    'verdict.confidence': 'Confianza',
    'verdict.recommendation': 'Recomendación',
    'verdict.redFlags': 'Banderas rojas',

    'claims.title': 'Afirmaciones',
    'claims.noSources': 'No se encontraron fuentes.',
    'claims.reasonLabel': 'Razón:',
    'claims.status.confirmed': 'Confirmada',
    'claims.status.refuted': 'Refutada',
    'claims.status.unverified': 'Sin evidencia',

    'language.title': 'Análisis de lenguaje',
    'language.score': 'Puntuación de manipulación',
    'language.noSignals': 'No se detectaron señales de manipulación.',
    'language.tone.neutral': 'Neutral',
    'language.tone.sensational': 'Sensacionalista',
    'language.tone.propagandistic': 'Propagandístico',
    'language.tone.opinionated': 'Opinativo',
    'language.severity.low': 'Baja',
    'language.severity.medium': 'Media',
    'language.severity.high': 'Alta',

    'locale.label': 'Idioma',
    'locale.en': 'English',
    'locale.es': 'Español',
    'locale.pt': 'Português',
    'locale.fr': 'Français',

    'empty.howItWorks': 'Cómo funciona',
    'empty.step1': 'Pega una URL o un titular',
    'empty.step2': 'Extraemos afirmaciones y buscamos fuentes en la web',
    'empty.step3': 'Veredicto calibrado con fuentes enlazadas',
    'empty.tryOne': 'O prueba con uno de estos',
    'empty.item1':
      'El telescopio espacial James Webb fue lanzado el 25 de diciembre de 2021',
    'empty.item2':
      'Comer chocolate negro cada día alarga la vida 5 años',
    'empty.item3':
      'La NASA confirmó por primera vez agua líquida en la Luna en 2020',
  },

  pt: {
    'app.title': 'Verificador de notícias',
    'app.subtitle':
      'Cole uma URL ou uma manchete e verifique as afirmações contra fontes reais.',

    'input.label': 'URL ou manchete a verificar',
    'input.placeholder':
      'https://… ou cole uma manchete (mín. 10 caracteres)',
    'input.submit': 'Verificar',
    'input.submitBusy': 'Verificando…',

    'step.extract': 'Extrair conteúdo',
    'step.claims': 'Identificar afirmações',
    'step.search': 'Buscar evidências',
    'step.language': 'Analisar linguagem',
    'step.verdict': 'Emitir veredicto',

    'error.prefix': 'Erro',

    'verdict.label.true': 'Verdadeira',
    'verdict.label.false': 'Falsa',
    'verdict.label.partially_true': 'Parcialmente verdadeira',
    'verdict.label.unverified': 'Evidências insuficientes',
    'verdict.confidence': 'Confiança',
    'verdict.recommendation': 'Recomendação',
    'verdict.redFlags': 'Sinais de alerta',

    'claims.title': 'Afirmações',
    'claims.noSources': 'Nenhuma fonte encontrada.',
    'claims.reasonLabel': 'Motivo:',
    'claims.status.confirmed': 'Confirmada',
    'claims.status.refuted': 'Refutada',
    'claims.status.unverified': 'Sem evidência',

    'language.title': 'Análise de linguagem',
    'language.score': 'Pontuação de manipulação',
    'language.noSignals': 'Nenhum sinal de manipulação detectado.',
    'language.tone.neutral': 'Neutro',
    'language.tone.sensational': 'Sensacionalista',
    'language.tone.propagandistic': 'Propagandístico',
    'language.tone.opinionated': 'Opinativo',
    'language.severity.low': 'Baixa',
    'language.severity.medium': 'Média',
    'language.severity.high': 'Alta',

    'locale.label': 'Idioma',
    'locale.en': 'English',
    'locale.es': 'Español',
    'locale.pt': 'Português',
    'locale.fr': 'Français',

    'empty.howItWorks': 'Como funciona',
    'empty.step1': 'Cole uma URL ou uma manchete',
    'empty.step2': 'Extraímos afirmações e buscamos fontes na web',
    'empty.step3': 'Veredicto calibrado com fontes referenciadas',
    'empty.tryOne': 'Ou experimente um destes',
    'empty.item1':
      'O Telescópio Espacial James Webb foi lançado em 25 de dezembro de 2021',
    'empty.item2':
      'Comer chocolate amargo todos os dias prolonga a vida em 5 anos',
    'empty.item3':
      'A NASA confirmou pela primeira vez água líquida na Lua em 2020',
  },

  fr: {
    'app.title': 'Vérificateur d’actualités',
    'app.subtitle':
      'Collez une URL ou un titre et vérifiez les affirmations face à des sources réelles.',

    'input.label': 'URL ou titre à vérifier',
    'input.placeholder':
      'https://… ou collez un titre (min. 10 caractères)',
    'input.submit': 'Vérifier',
    'input.submitBusy': 'Vérification…',

    'step.extract': 'Extraire le contenu',
    'step.claims': 'Identifier les affirmations',
    'step.search': 'Chercher des preuves',
    'step.language': 'Analyser le langage',
    'step.verdict': 'Rendre le verdict',

    'error.prefix': 'Erreur',

    'verdict.label.true': 'Vraie',
    'verdict.label.false': 'Fausse',
    'verdict.label.partially_true': 'Partiellement vraie',
    'verdict.label.unverified': 'Preuves insuffisantes',
    'verdict.confidence': 'Confiance',
    'verdict.recommendation': 'Recommandation',
    'verdict.redFlags': 'Signaux d’alerte',

    'claims.title': 'Affirmations',
    'claims.noSources': 'Aucune source trouvée.',
    'claims.reasonLabel': 'Raison :',
    'claims.status.confirmed': 'Confirmée',
    'claims.status.refuted': 'Réfutée',
    'claims.status.unverified': 'Sans preuve',

    'language.title': 'Analyse du langage',
    'language.score': 'Score de manipulation',
    'language.noSignals': 'Aucun signal de manipulation détecté.',
    'language.tone.neutral': 'Neutre',
    'language.tone.sensational': 'Sensationnaliste',
    'language.tone.propagandistic': 'Propagandiste',
    'language.tone.opinionated': 'Subjectif',
    'language.severity.low': 'Faible',
    'language.severity.medium': 'Moyenne',
    'language.severity.high': 'Élevée',

    'locale.label': 'Langue',
    'locale.en': 'English',
    'locale.es': 'Español',
    'locale.pt': 'Português',
    'locale.fr': 'Français',

    'empty.howItWorks': 'Comment ça marche',
    'empty.step1': 'Collez une URL ou un titre',
    'empty.step2': 'Nous extrayons les affirmations et cherchons des sources',
    'empty.step3': 'Verdict calibré avec sources référencées',
    'empty.tryOne': 'Ou essayez l’un de ces exemples',
    'empty.item1':
      'Le télescope spatial James Webb a été lancé le 25 décembre 2021',
    'empty.item2':
      'Manger du chocolat noir tous les jours allonge la vie de 5 ans',
    'empty.item3':
      'La NASA a confirmé pour la première fois la présence d’eau liquide sur la Lune en 2020',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof TRANSLATIONS)['en'];
