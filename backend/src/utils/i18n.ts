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
