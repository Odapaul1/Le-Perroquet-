import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface GamificationStatsProps {
  points: number;
  level: number;
  nextLevelXP: number;
  achievements: any[];
}

const GamificationStats: React.FC<GamificationStatsProps> = ({ points, level, nextLevelXP, achievements }) => {
  const progress = (points % 500) / 5; // Points to percentage (assuming 500 XP per level)
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Level</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Level {level}</div>
          <p className="text-xs text-muted-foreground">Keep learning to level up!</p>
          <Progress value={progress} className="mt-3 h-2" />
          <p className="mt-1 text-[10px] text-right text-muted-foreground">{points % 500} / 500 XP</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total XP</CardTitle>
          <Star className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points.toLocaleString()} XP</div>
          <p className="text-xs text-muted-foreground">Lifetime points earned</p>
          <div className="mt-4 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-[10px] text-green-500 font-medium">+50 from last lesson</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Achievements</CardTitle>
          <Badge variant="secondary" className="font-normal">{achievements.length} Unlocked</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mt-2">
            {achievements.slice(0, 5).map((a, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-secondary"
                title={a.description}
              >
                <span className="text-xl">{a.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold leading-tight">{a.title}</span>
                  <span className="text-[8px] text-muted-foreground leading-tight">{new Date(a.earnedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No achievements yet. Start learning!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationStats;
