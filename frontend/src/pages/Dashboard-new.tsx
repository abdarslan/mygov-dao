import { 
  TLBalanceCard, 
  TotalDonationsCard, 
  ReservedTokensCard, 
  ProjectCountCard, 
  ActiveProjectsCard, 
  MyGovSupplyCard 
} from "@/components/dashboard/StatsCards";
import { DonationTrendsChart } from "@/components/dashboard/DonationTrendsChart";
import { ProjectActivityChart } from "@/components/dashboard/ProjectActivityChart";
import { MembersChart } from "@/components/dashboard/MembersChart";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useProjects } from "@/hooks/useProjects";
import { useToken } from "@/hooks/useToken";

export function Dashboard() {
  const { projects } = useProjects();
  const { tlTokenBalance, myGovTotalSupply } = useToken();

  // Filter projects based on funding status and vote deadline
  const activeProjects = projects?.filter(p => p.beingFunded) || [];
  const totalProjects = projects?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DAO Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your decentralized autonomous organization
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TLBalanceCard 
          balance={tlTokenBalance} 
        />
        <MyGovSupplyCard 
          supply={myGovTotalSupply} 
        />
        <ProjectCountCard 
          count={totalProjects} 
        />
        <ActiveProjectsCard 
          count={activeProjects.length} 
        />
        <TotalDonationsCard 
          amount="1,650 TL + 35 MYGOV" 
        />
        <ReservedTokensCard 
          amount="10,000" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <SummaryStats 
          totalMembers={35}
          totalDonations={1650}
          activeProjects={activeProjects.length}
          weeklyGrowth={12.5}
        />

        {/* Donation Trends Chart */}
        <DonationTrendsChart />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Activity Chart */}
        <ProjectActivityChart />

        {/* Members Growth Chart */}
        <MembersChart />

        {/* Empty space for future expansion */}
        <div className="backdrop-blur-sm bg-white/20 border-white/30 rounded-lg border p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-sm">Space for</div>
            <div className="text-sm">future features</div>
          </div>
        </div>
      </div>
    </div>
  );
}
