import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Activity, AlertTriangle, Package, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';

export const StatsBento = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse bg-[#1E293B] h-32 rounded-xl" />;

  const cards = [
    {
      title: 'Active Disasters',
      value: stats.activeDisasters < 10 ? `0${stats.activeDisasters}` : stats.activeDisasters,
      subtitle: 'Requiring attention',
      icon: Activity,
      variant: 'accent' as const
    },
    {
      title: 'Critical Areas',
      value: stats.criticalAreas < 10 ? `0${stats.criticalAreas}` : stats.criticalAreas,
      subtitle: 'Priority 1 zones',
      icon: AlertTriangle,
      variant: 'critical' as const
    },
    {
      title: 'Resource Coverage',
      value: '69%',
      subtitle: 'Available vs Required',
      icon: Package,
      variant: 'warning' as const
    },
    {
      title: 'AI Confidence',
      value: '94%',
      subtitle: 'Allocation accuracy',
      icon: Brain,
      variant: 'accent' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={card.title}
        >
          <StatCard 
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            variant={card.variant}
          />
        </motion.div>
      ))}
    </div>
  );
};
