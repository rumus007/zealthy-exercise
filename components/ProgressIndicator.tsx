import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center mb-8", className)}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === currentStep
                ? "bg-blue-600 text-white"
                : step < currentStep
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {step < currentStep ? "✓" : step}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2 transition-colors",
                step < currentStep ? "bg-green-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}