import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TokenBalanceProps {
  myGovBalance: string | number;
  myGovSymbol: string;
  tlTokenBalance: string | number;
  tlTokenSymbol: string;
  title?: string;
  icon?: string;
  isLoading?: boolean;
  className?: string;
}

export function TokenBalance({
  myGovBalance,
  myGovSymbol,
  tlTokenBalance,
  tlTokenSymbol,
  title = "Token Balances",
  icon = "💰",
  isLoading = false,
  className = "",
}: TokenBalanceProps) {
  // Helper function to format numbers to 2 decimal places
  const formatBalance = (balance: string | number): string => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <Card className={`backdrop-blur-sm bg-white/20 border-white/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* MyGov Token Balance */}
          <div className="text-center p-3 rounded-lg bg-blue-50/50">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                formatBalance(myGovBalance)
              )}
            </div>
            <p className="text-sm text-gray-600">{myGovSymbol} Tokens</p>
          </div>
          
          {/* TL Token Balance */}
          <div className="text-center p-3 rounded-lg bg-green-50/50">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                formatBalance(tlTokenBalance)
              )}
            </div>
            <p className="text-sm text-gray-600">{tlTokenSymbol} Tokens</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
