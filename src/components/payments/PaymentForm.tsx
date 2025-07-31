// Temporary stub to avoid build errors
interface PaymentFormProps {
  planId: string;
  planName: string;
  price: string;
  onSuccess: (result: { planName: string; subscriptionId: string }) => void;
  onError: (errorMessage: string) => void;
}

export default function PaymentForm(props: PaymentFormProps) {
  return <div>Payment form placeholder - {props.planName}</div>;
}