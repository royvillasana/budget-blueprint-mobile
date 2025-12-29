import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  description?: string;
}

export function UpgradePrompt({ open, onOpenChange, feature, description }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            <span className="font-medium">{feature}</span> is a premium feature.
            {description && (
              <p className="mt-2">{description}</p>
            )}
            <p className="mt-3">
              Upgrade to <strong>Essential</strong> or <strong>Pro</strong> to unlock this feature and many more.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onOpenChange(false);
            navigate('/pricing');
          }}>
            View Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UsageLimitPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: number;
  limit: number;
  metric: string;
}

export function UsageLimitPrompt({ open, onOpenChange, current, limit, metric }: UsageLimitPromptProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-yellow-600" />
            </div>
            <AlertDialogTitle>Usage Limit Reached</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You've used <strong>{current} of {limit}</strong> {metric} this month.
            <p className="mt-3">
              Upgrade to <strong>Essential</strong> or <strong>Pro</strong> for unlimited usage (fair use policy applies).
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onOpenChange(false);
            navigate('/pricing');
          }}>
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
