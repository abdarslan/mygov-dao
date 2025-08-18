import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DonationFormProps {
  tokenSymbol: string;
  tokenBalance: string | number;
  tokenIcon: string;
  onDonate: (amount: string) => Promise<void>;
  isLoading?: boolean;
  isPending?: boolean;
  isConfirming?: boolean;
  isConnected?: boolean;
  className?: string;
  color?: "purple" | "indigo" | "blue" | "green";
  step?: string;
}

const colorConfig = {
  purple: {
    text: "text-purple-600",
    border: "focus:border-purple-400 focus:ring-purple-400/20",
    gradient: "from-purple-500/80 to-pink-600/80 hover:from-purple-600/90 hover:to-pink-700/90",
    borderColor: "border-purple-400/30",
  },
  indigo: {
    text: "text-indigo-600", 
    border: "focus:border-indigo-400 focus:ring-indigo-400/20",
    gradient: "from-indigo-500/80 to-blue-600/80 hover:from-indigo-600/90 hover:to-blue-700/90",
    borderColor: "border-indigo-400/30",
  },
  blue: {
    text: "text-blue-600",
    border: "focus:border-blue-400 focus:ring-blue-400/20", 
    gradient: "from-blue-500/80 to-cyan-600/80 hover:from-blue-600/90 hover:to-cyan-700/90",
    borderColor: "border-blue-400/30",
  },
  green: {
    text: "text-green-600",
    border: "focus:border-green-400 focus:ring-green-400/20",
    gradient: "from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90", 
    borderColor: "border-green-400/30",
  },
};

export function DonationForm({
  tokenSymbol,
  tokenBalance,
  tokenIcon,
  onDonate,
  isLoading = false,
  isPending = false,
  isConfirming = false,
  isConnected = false,
  className = "",
  color = "purple",
  step = "1",
}: DonationFormProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const colors = colorConfig[color];

  // Helper function to format numbers to 2 decimal places
  const formatBalance = (balance: string | number): string => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const handleSubmit = async () => {
    if (!donationAmount) return;
    await onDonate(donationAmount);
    setDonationAmount("");
  };

  const isDisabled = !isConnected || !donationAmount || isLoading || isPending || isConfirming;

  return (
    <Card className={`backdrop-blur-sm bg-white/20 border-white/30 ${className}`}>
      <CardHeader>
        <CardTitle className={`text-xl font-semibold ${colors.text} flex items-center gap-2`}>
          {tokenIcon} Donate {tokenSymbol}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Support the {color === "purple" ? "DAO" : "community"} by donating your {tokenSymbol} tokens
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`donate${tokenSymbol}Amount`} className="text-sm font-medium text-gray-700">
              Amount to Donate
            </Label>
            <Input
              id={`donate${tokenSymbol}Amount`}
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder={step === "1" ? "0" : "0.0"}
              step={step}
              className={`backdrop-blur-sm bg-white/40 border-white/60 ${colors.border}`}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your balance: {formatBalance(tokenBalance)} {tokenSymbol}
            </p>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`w-full backdrop-blur-sm bg-gradient-to-r ${colors.gradient} text-white border ${colors.borderColor} shadow-lg transition-all duration-300 hover:scale-105`}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isPending ? "Confirming..." : "Processing..."}
              </>
            ) : (
              <>
                {tokenIcon} Donate {tokenSymbol}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
