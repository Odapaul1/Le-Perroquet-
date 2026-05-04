import React, { useEffect, useState } from 'react';
import { gamificationAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await gamificationAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-muted rounded-lg" />
    ))}
  </div>;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-slate-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div 
              key={user._id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index === 0 ? 'bg-yellow-50/50 border-yellow-200' : 
                index === 1 ? 'bg-slate-50/50 border-slate-200' : 
                index === 2 ? 'bg-amber-50/50 border-amber-200' : 
                'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                  <Badge variant="outline" className="text-[10px] py-0">Level {user.level}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-primary">{user.points.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">XP</p>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users on the leaderboard yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
