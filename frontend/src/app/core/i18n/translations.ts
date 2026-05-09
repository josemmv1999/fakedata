import type { Locale } from '../../models/verification.types';

export const TRANSLATIONS = {
  en: {
    'app.kicker': 'Fact-check',
    'app.title': 'Verify what you read.',
    'app.subtitle':
      'Paste a URL or a headline. We pull the claims, search the open web, and return a sourced verdict.',

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

    'theme.system': 'Theme: system',
    'theme.light': 'Theme: light',
    'theme.dark': 'Theme: dark',

    'apiMode.real': 'Live',
    'apiMode.mock': 'Mock',
    'apiMode.toggle.real': 'Switch to mock backend (no tokens)',
    'apiMode.toggle.mock': 'Switch to live backend (uses tokens)',

    'cache.tooltip': 'Served from cache — no tokens spent on this request.',
    'cache.justNow': 'cached just now',
    'cache.minutesAgo': 'cached {n} min ago',
    'cache.hoursAgo': 'cached {n}h ago',
    'cache.daysAgo': 'cached {n}d ago',

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

    'footer.tagline':
      'Open-source AI fact-checker. Paste a URL, get sourced verdicts.',
    'footer.navLabel': 'Footer navigation',
    'footer.product': 'Product',
    'footer.legal': 'Legal',
    'footer.connect': 'Connect',
    'footer.tryIt': 'Try it',
    'footer.howItWorks': 'How it works',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.contact': 'Contact',
    'footer.rightsReserved': 'All rights reserved.',
    'footer.disclaimer':
      'AI-generated content. Always verify critical information against primary sources.',
  },

  es: {
    'app.kicker': 'Verificación',
    'app.title': 'Verifica lo que lees.',
    'app.subtitle':
      'Pega una URL o un titular. Extraemos las afirmaciones, buscamos en la web abierta y devolvemos un veredicto con fuentes.',

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

    'theme.system': 'Tema: sistema',
    'theme.light': 'Tema: claro',
    'theme.dark': 'Tema: oscuro',

    'apiMode.real': 'Real',
    'apiMode.mock': 'Mock',
    'apiMode.toggle.real': 'Cambiar a backend mock (no consume tokens)',
    'apiMode.toggle.mock': 'Cambiar a backend real (consume tokens)',

    'cache.tooltip': 'Servido desde caché — esta consulta no ha gastado tokens.',
    'cache.justNow': 'cacheado ahora',
    'cache.minutesAgo': 'cacheado hace {n} min',
    'cache.hoursAgo': 'cacheado hace {n}h',
    'cache.daysAgo': 'cacheado hace {n}d',

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

    'footer.tagline':
      'Verificador de noticias con IA, código abierto. Pega una URL, obtén veredictos con fuentes.',
    'footer.navLabel': 'Navegación del pie de página',
    'footer.product': 'Producto',
    'footer.legal': 'Legal',
    'footer.connect': 'Contacto',
    'footer.tryIt': 'Probar',
    'footer.howItWorks': 'Cómo funciona',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.contact': 'Escríbenos',
    'footer.rightsReserved': 'Todos los derechos reservados.',
    'footer.disclaimer':
      'Contenido generado por IA. Verifica siempre la información crítica con fuentes primarias.',
  },

  pt: {
    'app.kicker': 'Verificação',
    'app.title': 'Verifique o que você lê.',
    'app.subtitle':
      'Cole uma URL ou uma manchete. Extraímos as afirmações, buscamos na web aberta e devolvemos um veredicto com fontes.',

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

    'theme.system': 'Tema: sistema',
    'theme.light': 'Tema: claro',
    'theme.dark': 'Tema: escuro',

    'apiMode.real': 'Real',
    'apiMode.mock': 'Mock',
    'apiMode.toggle.real': 'Mudar para backend mock (sem tokens)',
    'apiMode.toggle.mock': 'Mudar para backend real (consome tokens)',

    'cache.tooltip': 'Servido a partir da cache — esta consulta não gastou tokens.',
    'cache.justNow': 'cacheado agora',
    'cache.minutesAgo': 'cacheado há {n} min',
    'cache.hoursAgo': 'cacheado há {n}h',
    'cache.daysAgo': 'cacheado há {n}d',

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

    'footer.tagline':
      'Verificador de notícias com IA, código aberto. Cole uma URL, obtenha veredictos com fontes.',
    'footer.navLabel': 'Navegação do rodapé',
    'footer.product': 'Produto',
    'footer.legal': 'Legal',
    'footer.connect': 'Contato',
    'footer.tryIt': 'Experimentar',
    'footer.howItWorks': 'Como funciona',
    'footer.privacy': 'Privacidade',
    'footer.terms': 'Termos',
    'footer.contact': 'Fale conosco',
    'footer.rightsReserved': 'Todos os direitos reservados.',
    'footer.disclaimer':
      'Conteúdo gerado por IA. Verifique sempre informações críticas com fontes primárias.',
  },

  fr: {
    'app.kicker': 'Vérification',
    'app.title': 'Vérifiez ce que vous lisez.',
    'app.subtitle':
      'Collez une URL ou un titre. Nous extrayons les affirmations, cherchons sur le web ouvert et rendons un verdict sourcé.',

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

    'theme.system': 'Thème : système',
    'theme.light': 'Thème : clair',
    'theme.dark': 'Thème : sombre',

    'apiMode.real': 'Réel',
    'apiMode.mock': 'Mock',
    'apiMode.toggle.real': 'Basculer vers le backend mock (sans tokens)',
    'apiMode.toggle.mock': 'Basculer vers le backend réel (consomme des tokens)',

    'cache.tooltip': 'Servi depuis le cache — cette requête n’a pas consommé de tokens.',
    'cache.justNow': 'mis en cache à l’instant',
    'cache.minutesAgo': 'mis en cache il y a {n} min',
    'cache.hoursAgo': 'mis en cache il y a {n}h',
    'cache.daysAgo': 'mis en cache il y a {n}j',

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

    'footer.tagline':
      'Vérificateur d’actualités par IA, open source. Collez une URL, obtenez un verdict sourcé.',
    'footer.navLabel': 'Navigation du pied de page',
    'footer.product': 'Produit',
    'footer.legal': 'Légal',
    'footer.connect': 'Contact',
    'footer.tryIt': 'Essayer',
    'footer.howItWorks': 'Comment ça marche',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',
    'footer.contact': 'Nous écrire',
    'footer.rightsReserved': 'Tous droits réservés.',
    'footer.disclaimer':
      'Contenu généré par IA. Vérifiez toujours les informations critiques auprès de sources primaires.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof TRANSLATIONS)['en'];
