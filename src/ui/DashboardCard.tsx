import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, value, icon, className = '' }: DashboardCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
