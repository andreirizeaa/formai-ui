import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const i18n = new I18n({
  en: {
    loading: 'Loading...',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    next: 'Next',
    back: 'Back',
    welcome: {
      title: 'FormAI',
      subtitle: 'Transform your fitness journey with AI-powered form analysis',
    },
    language: {
      title: 'Language',
      subtitle: 'Choose your preferred language',
    },
    gender: {
      title: 'Biological gender',
      subtitle: 'This will be used to help our systems find the optimum biomechanic form for you',
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },
    goal: {
      title: 'What is your goal?',
      subtitle: 'This helps us generate a plan for your calorie intake.',
      loseWeight: 'Lose weight',
      maintain: 'Maintain',
      gainWeight: 'Gain weight',
    },
    discovery: {
      title: 'Where did you hear about us?',
      subtitle: 'Help us understand how you found FormAI',
    },
  },
  es: {
    loading: 'Cargando...',
    getStarted: 'Comenzar',
    signIn: 'Iniciar Sesión',
    next: 'Siguiente',
    back: 'Atrás',
    welcome: {
      title: 'FormAI',
      subtitle: 'Transforma tu viaje fitness con análisis de forma potenciado por IA',
    },
    language: {
      title: 'Idioma',
      subtitle: 'Elige tu idioma preferido',
    },
    gender: {
      title: 'Género biológico',
      subtitle: 'Esto se usará para ayudar a nuestros sistemas a encontrar la forma biomecánica óptima para ti',
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
    },
    goal: {
      title: '¿Cuál es tu objetivo?',
      subtitle: 'Esto nos ayuda a generar un plan para tu ingesta de calorías.',
      loseWeight: 'Perder peso',
      maintain: 'Mantener',
      gainWeight: 'Ganar peso',
    },
    discovery: {
      title: '¿Dónde nos conociste?',
      subtitle: 'Ayúdanos a entender cómo encontraste FormAI',
    },
  },
  zh: {
    loading: '加载中...',
    getStarted: '开始',
    signIn: '登录',
    next: '下一步',
    back: '返回',
    welcome: {
      title: 'FormAI',
      subtitle: '通过AI驱动的动作分析改变您的健身旅程',
    },
    language: {
      title: '语言',
      subtitle: '选择您的首选语言',
    },
    gender: {
      title: '生理性别',
      subtitle: '这将用于帮助我们的系统为您找到最佳的生物力学形式',
      male: '男性',
      female: '女性',
      other: '其他',
    },
    goal: {
      title: '您的目标是什么？',
      subtitle: '这有助于我们为您的卡路里摄入制定计划。',
      loseWeight: '减肥',
      maintain: '维持',
      gainWeight: '增重',
    },
    discovery: {
      title: '您是从哪里了解我们的？',
      subtitle: '帮助我们了解您是如何找到FormAI的',
    },
  },
  it: {
    loading: 'Caricamento...',
    getStarted: 'Inizia',
    signIn: 'Accedi',
    next: 'Avanti',
    back: 'Indietro',
    welcome: {
      title: 'FormAI',
      subtitle: 'Trasforma il tuo percorso fitness con analisi della forma alimentata da AI',
    },
    language: {
      title: 'Lingua',
      subtitle: 'Scegli la tua lingua preferita',
    },
    gender: {
      title: 'Sesso biologico',
      subtitle: 'Questo sarà usato per aiutare i nostri sistemi a trovare la forma biomeccanica ottimale per te',
      male: 'Maschio',
      female: 'Femmina',
      other: 'Altro',
    },
    goal: {
      title: 'Qual è il tuo obiettivo?',
      subtitle: 'Questo ci aiuta a generare un piano per la tua assunzione di calorie.',
      loseWeight: 'Perdere peso',
      maintain: 'Mantenere',
      gainWeight: 'Aumentare peso',
    },
    discovery: {
      title: 'Dove hai sentito parlare di noi?',
      subtitle: 'Aiutaci a capire come hai trovato FormAI',
    },
  },
  pt: {
    loading: 'Carregando...',
    getStarted: 'Começar',
    signIn: 'Entrar',
    next: 'Próximo',
    back: 'Voltar',
    welcome: {
      title: 'FormAI',
      subtitle: 'Transforme sua jornada fitness com análise de forma alimentada por IA',
    },
    language: {
      title: 'Idioma',
      subtitle: 'Escolha seu idioma preferido',
    },
    gender: {
      title: 'Sexo biológico',
      subtitle: 'Isso será usado para ajudar nossos sistemas a encontrar a forma biomecânica ideal para você',
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro',
    },
    goal: {
      title: 'Qual é seu objetivo?',
      subtitle: 'Isso nos ajuda a gerar um plano para sua ingestão de calorias.',
      loseWeight: 'Perder peso',
      maintain: 'Manter',
      gainWeight: 'Ganhar peso',
    },
    discovery: {
      title: 'Onde você ouviu falar sobre nós?',
      subtitle: 'Nos ajude a entender como você encontrou o FormAI',
    },
  },
  ro: {
    loading: 'Se încarcă...',
    getStarted: 'Începe',
    signIn: 'Conectează-te',
    next: 'Următorul',
    back: 'Înapoi',
    welcome: {
      title: 'FormAI',
      subtitle: 'Transformă-ți călătoria fitness cu analiză de formă alimentată de AI',
    },
    language: {
      title: 'Limba',
      subtitle: 'Alege limba preferată',
    },
    gender: {
      title: 'Sex biologic',
      subtitle: 'Aceasta va fi folosită pentru a ajuta sistemele noastre să găsească forma biomecanică optimă pentru tine',
      male: 'Masculin',
      female: 'Feminin',
      other: 'Altul',
    },
    goal: {
      title: 'Care este obiectivul tău?',
      subtitle: 'Aceasta ne ajută să generăm un plan pentru aportul tău caloric.',
      loseWeight: 'Să slăbesc',
      maintain: 'Să mențin',
      gainWeight: 'Să mă îngraș',
    },
    discovery: {
      title: 'De unde ai auzit despre noi?',
      subtitle: 'Ajută-ne să înțelegem cum ai găsit FormAI',
    },
  },
  de: {
    loading: 'Wird geladen...',
    getStarted: 'Loslegen',
    signIn: 'Anmelden',
    next: 'Weiter',
    back: 'Zurück',
    welcome: {
      title: 'FormAI',
      subtitle: 'Verwandle deine Fitness-Reise mit KI-gestützter Formanalyse',
    },
    language: {
      title: 'Sprache',
      subtitle: 'Wähle deine bevorzugte Sprache',
    },
    gender: {
      title: 'Biologisches Geschlecht',
      subtitle: 'Dies wird verwendet, um unseren Systemen zu helfen, die optimale biomechanische Form für dich zu finden',
      male: 'Männlich',
      female: 'Weiblich',
      other: 'Andere',
    },
    goal: {
      title: 'Was ist dein Ziel?',
      subtitle: 'Dies hilft uns, einen Plan für deine Kalorienaufnahme zu erstellen.',
      loseWeight: 'Abnehmen',
      maintain: 'Halten',
      gainWeight: 'Zunehmen',
    },
    discovery: {
      title: 'Wo hast du von uns gehört?',
      subtitle: 'Hilf uns zu verstehen, wie du FormAI gefunden hast',
    },
  },
  fr: {
    loading: 'Chargement...',
    getStarted: 'Commencer',
    signIn: 'Se connecter',
    next: 'Suivant',
    back: 'Retour',
    welcome: {
      title: 'FormAI',
      subtitle: 'Transformez votre parcours fitness avec une analyse de forme alimentée par IA',
    },
    language: {
      title: 'Langue',
      subtitle: 'Choisissez votre langue préférée',
    },
    gender: {
      title: 'Sexe biologique',
      subtitle: 'Ceci sera utilisé pour aider nos systèmes à trouver la forme biomécanique optimale pour vous',
      male: 'Masculin',
      female: 'Féminin',
      other: 'Autre',
    },
    goal: {
      title: 'Quel est votre objectif ?',
      subtitle: 'Cela nous aide à générer un plan pour votre apport calorique.',
      loseWeight: 'Perdre du poids',
      maintain: 'Maintenir',
      gainWeight: 'Prendre du poids',
    },
    discovery: {
      title: 'Où avez-vous entendu parler de nous ?',
      subtitle: 'Aidez-nous à comprendre comment vous avez trouvé FormAI',
    },
  },
  ar: {
    loading: 'جاري التحميل...',
    getStarted: 'ابدأ',
    signIn: 'تسجيل الدخول',
    next: 'التالي',
    back: 'رجوع',
    welcome: {
      title: 'FormAI',
      subtitle: 'حول رحلة اللياقة البدنية الخاصة بك مع تحليل الشكل المدعوم بالذكاء الاصطناعي',
    },
    language: {
      title: 'اللغة',
      subtitle: 'اختر لغتك المفضلة',
    },
    gender: {
      title: 'الجنس البيولوجي',
      subtitle: 'سيتم استخدام هذا لمساعدة أنظمتنا في العثور على الشكل البيوميكانيكي الأمثل لك',
      male: 'ذكر',
      female: 'أنثى',
      other: 'آخر',
    },
    goal: {
      title: 'ما هو هدفك؟',
      subtitle: 'يساعدنا هذا في إنشاء خطة لتناول السعرات الحرارية.',
      loseWeight: 'فقدان الوزن',
      maintain: 'الحفاظ',
      gainWeight: 'زيادة الوزن',
    },
    discovery: {
      title: 'أين سمعت عنا؟',
      subtitle: 'ساعدنا في فهم كيف وجدت FormAI',
    },
  },
});

// Set the locale from device settings or default to English
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';
i18n.enableFallback = true;

export default i18n; 