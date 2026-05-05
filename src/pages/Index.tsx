import StatsCards from "@/components/dashboard/StatsCards";
import RecognitionFeed from "@/components/dashboard/RecognitionFeed";
import LeaderboardWidget from "@/components/dashboard/LeaderboardWidget";
import { useRecognitions } from "@/hooks/useApiData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();
  const { data: recognitions = [], isLoading } = useRecognitions({ status: "approved" });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your organization</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to="/appreciate"><Heart className="w-4 h-4 mr-2" /> Appreciate</Link>
          </Button>
          {(user?.userRole === "manager" || user?.userRole === "admin") && (
            <Button asChild variant="outline" className="border-gold/50 text-gold-foreground hover:bg-gold/10">
              <Link to="/nominations"><Award className="w-4 h-4 mr-2" /> Nominate</Link>
            </Button>
          )}
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading recognitions...</div>
          ) : (
            <RecognitionFeed items={recognitions} />
          )}
        </div>
        <div>
          <LeaderboardWidget />
        </div>
      </div>
    </div>
  );
}
