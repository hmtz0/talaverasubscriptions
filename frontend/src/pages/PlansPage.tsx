import { useTranslation } from 'react-i18next';
import { usePlans, useCurrentSubscription, useCreateSubscription, useCancelSubscription } from '../hooks/useSubscriptions';

export default function PlansPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: currentSubscription } = useCurrentSubscription();
  const createSubscriptionMutation = useCreateSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleSelectPlan = async (planId: number) => {
    try {
      await createSubscriptionMutation.mutateAsync(planId);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm(t('subscription.cancel') + '?')) {
      return;
    }
    
    try {
      await cancelSubscriptionMutation.mutateAsync();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600" role="status" aria-live="polite">
          {t('general.loading')}
        </div>
      </div>
    );
  }

  // If no active subscription, user is on Free plan (plan id 1)
  const currentPlanId = currentSubscription?.planId || 1;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('plans.title')}</h1>
        {currentSubscription && currentSubscription.status === 'active' ? (
          <p className="text-lg text-gray-600">
            {t('subscription.current')}: <span className="font-semibold">{currentSubscription.plan.displayName}</span>
          </p>
        ) : (
          <p className="text-lg text-gray-600">
            {t('subscription.current')}: <span className="font-semibold">{t('plans.freePlan')}</span>
          </p>
        )}
      </div>

      {/* Current Subscription Info - Only show if active subscription exists */}
      {currentSubscription && currentSubscription.status === 'active' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{t('subscription.current')}</h3>
              <p className="text-blue-700 mt-1">
                {currentSubscription.plan.displayName} - ${(currentSubscription.plan.priceMonthly / 100).toFixed(2)}{t('plans.perMonth')}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {currentSubscription.plan.projectsQuota} projects quota
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel current subscription"
            >
              {cancelSubscriptionMutation.isPending ? t('general.loading') : t('subscription.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {plans?.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isFree = plan.priceMonthly === 0;

          return (
            <div
              key={plan.id}
              className={`relative border-2 rounded-lg p-8 ${
                isCurrentPlan
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
              role="article"
              aria-label={`${plan.displayName} plan`}
            >
              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white">
                    {t('plans.currentPlan')}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.displayName}</h2>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  {isFree ? t('plans.free') : `$${(plan.priceMonthly / 100).toFixed(2)}`}
                </span>
                {!isFree && (
                  <span className="text-gray-600 text-lg">{t('plans.perMonth')}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8" role="list">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-indigo-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan || createSubscriptionMutation.isPending}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCurrentPlan
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isCurrentPlan ? 'Current plan selected' : `Select ${plan.displayName} plan`}
              >
                {isCurrentPlan
                  ? t('plans.currentPlan')
                  : createSubscriptionMutation.isPending
                  ? t('general.loading')
                  : isFree
                  ? t('plans.selectPlan')
                  : t('plans.upgradeToPro')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error Messages */}
      {createSubscriptionMutation.isError && (
        <div
          className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {(createSubscriptionMutation.error as any)?.response?.data?.error || t('general.error')}
        </div>
      )}

      {cancelSubscriptionMutation.isError && (
        <div
          className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {(cancelSubscriptionMutation.error as any)?.response?.data?.error || t('general.error')}
        </div>
      )}
    </div>
  );
}
