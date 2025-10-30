import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Name',
      'auth.logout': 'Logout',
      'auth.loginButton': 'Sign In',
      'auth.signupButton': 'Create Account',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.dontHaveAccount': "Don't have an account?",

      // Plans
      'plans.title': 'Choose Your Plan',
      'plans.free': 'Free',
      'plans.freePlan': 'Free Plan',
      'plans.pro': 'Pro',
      'plans.proPlan': 'Pro Plan',
      'plans.perMonth': '/month',
      'plans.selectPlan': 'Select Plan',
      'plans.currentPlan': 'Current Plan',
      'plans.upgradeToPro': 'Upgrade to Pro',

      // Projects
      'projects.title': 'My Projects',
      'projects.create': 'Create Project',
      'projects.name': 'Project Name',
      'projects.description': 'Description',
      'projects.delete': 'Delete',
      'projects.quota': 'Projects: {{count}} / {{limit}}',
      'projects.noProjects': 'No projects yet',
      'projects.createFirst': 'Create your first project!',

      // Subscription
      'subscription.current': 'Current Subscription',
      'subscription.cancel': 'Cancel Subscription',
      'subscription.cancelled': 'Cancelled',
      'subscription.active': 'Active',
      'subscription.noSubscription': 'No active subscription',

      // General
      'general.save': 'Save',
      'general.cancel': 'Cancel',
      'general.close': 'Close',
      'general.confirm': 'Confirm',
      'general.loading': 'Loading...',
      'general.error': 'An error occurred',
      'general.success': 'Success!',
    },
  },
  es: {
    translation: {
      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.signup': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.name': 'Nombre',
      'auth.logout': 'Cerrar Sesión',
      'auth.loginButton': 'Ingresar',
      'auth.signupButton': 'Crear Cuenta',
      'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
      'auth.dontHaveAccount': '¿No tienes una cuenta?',

      // Plans
      'plans.title': 'Elige Tu Plan',
      'plans.free': 'Gratuito',
      'plans.freePlan': 'Plan Gratuito',
      'plans.pro': 'Pro',
      'plans.proPlan': 'Plan Pro',
      'plans.perMonth': '/mes',
      'plans.selectPlan': 'Seleccionar Plan',
      'plans.currentPlan': 'Plan Actual',
      'plans.upgradeToPro': 'Actualizar a Pro',

      // Projects
      'projects.title': 'Mis Proyectos',
      'projects.create': 'Crear Proyecto',
      'projects.name': 'Nombre del Proyecto',
      'projects.description': 'Descripción',
      'projects.delete': 'Eliminar',
      'projects.quota': 'Proyectos: {{count}} / {{limit}}',
      'projects.noProjects': 'Aún no hay proyectos',
      'projects.createFirst': '¡Crea tu primer proyecto!',

      // Subscription
      'subscription.current': 'Suscripción Actual',
      'subscription.cancel': 'Cancelar Suscripción',
      'subscription.cancelled': 'Cancelada',
      'subscription.active': 'Activa',
      'subscription.noSubscription': 'Sin suscripción activa',

      // General
      'general.save': 'Guardar',
      'general.cancel': 'Cancelar',
      'general.close': 'Cerrar',
      'general.confirm': 'Confirmar',
      'general.loading': 'Cargando...',
      'general.error': 'Ocurrió un error',
      'general.success': '¡Éxito!',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
