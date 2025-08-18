import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, ExternalLink, Clock } from "lucide-react";

interface Donation {
  id: string;
  donor: string;
  amount: string;
  token: "TL" | "MYGOV";
  timestamp: Date;
  txHash?: string;
}

interface DonationListProps {
  donations: Donation[];
  isLoading?: boolean;
  showLimit?: number;
}

export function DonationList({ donations, isLoading = false, showLimit = 10 }: DonationListProps) {
  const displayDonations = donations.slice(0, showLimit);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const openEtherscan = (txHash: string) => {
    // Replace with actual network explorer URL
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Recent Donations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-20 h-4 bg-gray-300 rounded"></div>
                      <div className="w-16 h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayDonations.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No donations yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Be the first to contribute to the DAO!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {formatAddress(donation.donor)}
                      </span>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full text-white ${
                          donation.token === "TL" 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                            : "bg-gray-500"
                        }`}
                      >
                        {donation.token}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(donation.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {donation.amount} {donation.token}
                  </span>
                  {donation.txHash && (
                    <button
                      onClick={() => openEtherscan(donation.txHash!)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {donations.length > showLimit && (
              <div className="text-center pt-3">
                <p className="text-xs text-gray-600">
                  Showing {showLimit} of {donations.length} donations
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
