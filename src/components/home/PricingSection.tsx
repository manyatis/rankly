import PricingPlans from '@/components/pricing/PricingPlans';

interface PricingSectionProps {
  onCreateAccount: () => void;
  onPlanSelection: (planId: string) => void;
}

interface Plan {
  planId: string;
}

export default function PricingSection({ onCreateAccount, onPlanSelection }: PricingSectionProps) {
  const handlePlanSelect = (plan: Plan) => {
    if (plan.planId === 'free') {
      onCreateAccount();
    } else {
      onPlanSelection(plan.planId);
    }
  };

  return (
    <div id="pricing" className="bg-gray-800 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <PricingPlans
          onPlanSelect={handlePlanSelect}
          onCreateAccount={onCreateAccount}
          showFree={true}
          title="Start with 1 Site Analysis Free"
          subtitle="Get started immediately with one free site analysis. No credit card required. Upgrade for additional sites and advanced features."
          isSubscriptionFlow={false}
        />
      </div>
    </div>
  );
}