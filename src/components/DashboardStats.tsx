import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, ShoppingBag, Users, Package, Star } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, trend, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`text-xs flex items-center mt-1 ${
            trend === 'up' ? 'text-success' : 
            trend === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface VendorStatsProps {
  totalOrders: number;
  activeSuppliers: number;
  monthlySpending: number;
  avgDeliveryTime: string;
}

export const VendorStats = ({ totalOrders, activeSuppliers, monthlySpending, avgDeliveryTime }: VendorStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Orders"
        value={totalOrders}
        change="+12% from last month"
        trend="up"
        icon={<ShoppingBag className="h-4 w-4" />}
      />
      <StatCard
        title="Active Suppliers"
        value={activeSuppliers}
        change="+3 new this month"
        trend="up"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Monthly Spending"
        value={`₹${monthlySpending.toLocaleString()}`}
        change="-8% from last month"
        trend="down"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title="Avg. Delivery Time"
        value={avgDeliveryTime}
        change="-0.5 days improved"
        trend="up"
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
};

interface SupplierStatsProps {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  averageRating: number;
}

export const SupplierStats = ({ totalRevenue, totalOrders, activeProducts, averageRating }: SupplierStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        change="+15% from last month"
        trend="up"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title="Total Orders"
        value={totalOrders}
        change="+23 new this month"
        trend="up"
        icon={<ShoppingBag className="h-4 w-4" />}
      />
      <StatCard
        title="Active Products"
        value={activeProducts}
        change="2 products added"
        trend="up"
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Average Rating"
        value={averageRating}
        change="Based on 89 reviews"
        trend="neutral"
        icon={<Star className="h-4 w-4" />}
      />
    </div>
  );
};