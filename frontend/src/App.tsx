import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Dashboard } from './pages/Dashboard.tsx'
import { ProjectPage } from './pages/ProjectPage.tsx'
import SurveyPage from './pages/SurveyPage.tsx'
import TokenPage from './pages/TokenPage.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function App() {
  return (
    <div className="app-background">
      {/* Background overlay for better contrast */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none z-0"></div>
      
      {/* Additional glass overlay for depth */}
      <div className="fixed inset-0 backdrop-blur-[1px] pointer-events-none z-0"></div>

      {/* Main container - centered content */}
      <div className="relative z-10 w-full flex justify-center min-h-screen">
        <div className="max-w-6xl w-full p-4">
        {/* Header with enhanced glass effect */}
        <Card className="mb-8 backdrop-blur-xl bg-white/80 border-white/30 shadow-2xl ring-1 ring-white/20">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
              MyGov DAO Frontend
            </h1>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </CardHeader>
        </Card>

        {/* Main content card with enhanced glass effect */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/30 shadow-2xl ring-1 ring-white/20">
          <CardContent className="p-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-transparent border-0 shadow-none rounded-xl p-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:shadow-md transition-all duration-300 rounded-lg font-medium shadow-sm backdrop-blur-sm bg-white/20"
                  style={{
                    color: '#1f2937'
                  }}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:shadow-md transition-all duration-300 rounded-lg font-medium shadow-sm backdrop-blur-sm bg-white/20"
                  style={{
                    color: '#1f2937'
                  }}
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="surveys"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:shadow-md transition-all duration-300 rounded-lg font-medium shadow-sm backdrop-blur-sm bg-white/20"
                  style={{
                    color: '#1f2937'
                  }}
                >
                  Surveys
                </TabsTrigger>
                <TabsTrigger 
                  value="tokens"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:shadow-md transition-all duration-300 rounded-lg font-medium shadow-sm backdrop-blur-sm bg-white/20"
                  style={{
                    color: '#1f2937'
                  }}
                >
                  Tokens
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-0">
                <div className="rounded-lg backdrop-blur-md bg-white/40 p-6 border border-white/30 shadow-lg">
                  <Dashboard />
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="mt-0">
                <div className="rounded-lg backdrop-blur-md bg-white/40 p-6 border border-white/30 shadow-lg">
                  <ProjectPage />
                </div>
              </TabsContent>
              
              <TabsContent value="surveys" className="mt-0">
                <div className="rounded-lg backdrop-blur-md bg-white/40 p-6 border border-white/30 shadow-lg">
                  <SurveyPage />
                </div>
              </TabsContent>
              
              <TabsContent value="tokens" className="mt-0">
                <div className="rounded-lg backdrop-blur-md bg-white/40 p-6 border border-white/30 shadow-lg">
                  <TokenPage />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default App
