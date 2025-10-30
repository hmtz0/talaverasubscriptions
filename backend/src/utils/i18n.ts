export const translations = {
  en: {
    // Auth messages
    'auth.emailInUse': 'Email already in use',
    'auth.invalidCredentials': 'Invalid credentials',
    'auth.unauthorized': 'Unauthorized',
    'auth.invalidToken': 'Invalid token',
    'auth.invalidTokenSubject': 'Invalid token subject',

    // Project messages
    'project.notFound': 'Project not found',
    'project.forbidden': 'Forbidden: You do not own this project',
    'project.quotaExceeded': 'Free plan limit reached. Maximum {{limit}} projects allowed.',
    'project.invalidId': 'Invalid project ID',

    // Plan messages
    'plan.free.name': 'Free Plan',
    'plan.free.description': 'Perfect for getting started',
    'plan.free.feature1': 'Up to 3 projects',
    'plan.free.feature2': 'Basic support',
    'plan.free.feature3': 'Community access',
    'plan.pro.name': 'Pro Plan',
    'plan.pro.description': 'For professional developers',
    'plan.pro.feature1': 'Up to 10 projects',
    'plan.pro.feature2': 'Priority support',
    'plan.pro.feature3': 'Advanced features',

    // Subscription messages
    'subscription.notFound': 'No active subscription found',
    'subscription.alreadyActive': 'User already has an active subscription',
    'subscription.invalidPlan': 'Invalid plan selected',
    'subscription.created': 'Subscription created successfully',

    // General messages
    'general.success': 'Success',
    'general.created': 'Created successfully',
    'general.deleted': 'Deleted successfully',
    'general.updated': 'Updated successfully',
  },
  es: {
    // Auth messages
    'auth.emailInUse': 'El correo electrónico ya está en uso',
    'auth.invalidCredentials': 'Credenciales inválidas',
    'auth.unauthorized': 'No autorizado',
    'auth.invalidToken': 'Token inválido',
    'auth.invalidTokenSubject': 'Sujeto de token inválido',

    // Project messages
    'project.notFound': 'Proyecto no encontrado',
    'project.forbidden': 'Prohibido: No eres el propietario de este proyecto',
    'project.quotaExceeded':
      'Límite del plan gratuito alcanzado. Máximo {{limit}} proyectos permitidos.',
    'project.invalidId': 'ID de proyecto inválido',

    // Plan messages
    'plan.free.name': 'Plan Gratuito',
    'plan.free.description': 'Perfecto para empezar',
    'plan.free.feature1': 'Hasta 3 proyectos',
    'plan.free.feature2': 'Soporte básico',
    'plan.free.feature3': 'Acceso a la comunidad',
    'plan.pro.name': 'Plan Pro',
    'plan.pro.description': 'Para desarrolladores profesionales',
    'plan.pro.feature1': 'Hasta 10 proyectos',
    'plan.pro.feature2': 'Soporte prioritario',
    'plan.pro.feature3': 'Funciones avanzadas',

    // Subscription messages
    'subscription.notFound': 'No se encontró suscripción activa',
    'subscription.alreadyActive': 'El usuario ya tiene una suscripción activa',
    'subscription.invalidPlan': 'Plan inválido seleccionado',
    'subscription.created': 'Suscripción creada exitosamente',

    // General messages
    'general.success': 'Éxito',
    'general.created': 'Creado exitosamente',
    'general.deleted': 'Eliminado exitosamente',
    'general.updated': 'Actualizado exitosamente',
  },
};

export type Language = 'en' | 'es';
export type TranslationKey = keyof (typeof translations)['en'];

export function t(
  key: TranslationKey,
  lang: Language = 'en',
  params?: Record<string, string | number>
): string {
  let message = translations[lang][key] || translations.en[key] || key;

  // Replace {{param}} with values
  if (params) {
    Object.keys(params).forEach((param) => {
      message = message.replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
    });
  }

  return message;
}

// Helper to get language from request
export function getLanguageFromRequest(req: {
  headers: { 'accept-language'?: string | string[] };
}): Language {
  const acceptLanguage = req.headers['accept-language'];
  const lang = Array.isArray(acceptLanguage)
    ? acceptLanguage[0]?.split(',')[0]?.split('-')[0]
    : acceptLanguage?.split(',')[0]?.split('-')[0];
  return lang === 'es' ? 'es' : 'en';
}
