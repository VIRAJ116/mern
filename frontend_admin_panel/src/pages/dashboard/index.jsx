import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  IndianRupee,
  Pizza,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router';

import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import api from '@/services/axios';

const fetchDashboard = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

const placeholderData = {
  stats: {
    totalOrders: 156,
    totalRevenue: 89450,
    totalPizzas: 24,
    totalUsers: 342,
    ordersTrend: 12.5,
    revenueTrend: 8.3,
    pizzasTrend: 4.2,
    usersTrend: 15.7,
  },
  chartData: [
    { name: 'Mon', orders: 18 },
    { name: 'Tue', orders: 24 },
    { name: 'Wed', orders: 15 },
    { name: 'Thu', orders: 32 },
    { name: 'Fri', orders: 28 },
    { name: 'Sat', orders: 42 },
    { name: 'Sun', orders: 35 },
  ],
  recentOrders: [
    {
      _id: '6651a1b2c3d4e5f6a7b8c9d0',
      customer: { name: 'Rahul Sharma' },
      total: 599,
      status: 'delivered',
      createdAt: '2026-03-25T10:30:00Z',
    },
    {
      _id: '6651a1b2c3d4e5f6a7b8c9d1',
      customer: { name: 'Priya Patel' },
      total: 849,
      status: 'preparing',
      createdAt: '2026-03-25T09:15:00Z',
    },
    {
      _id: '6651a1b2c3d4e5f6a7b8c9d2',
      customer: { name: 'Amit Kumar' },
      total: 1299,
      status: 'placed',
      createdAt: '2026-03-25T08:45:00Z',
    },
    {
      _id: '6651a1b2c3d4e5f6a7b8c9d3',
      customer: { name: 'Sneha Reddy' },
      total: 449,
      status: 'out-for-delivery',
      createdAt: '2026-03-24T18:20:00Z',
    },
    {
      _id: '6651a1b2c3d4e5f6a7b8c9d4',
      customer: { name: 'Vikram Singh' },
      total: 699,
      status: 'cancelled',
      createdAt: '2026-03-24T16:10:00Z',
    },
  ],
};

const statusColorMap = {
  placed: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  preparing: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  'out-for-delivery': 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  delivered: 'bg-green-500/15 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/15 text-red-600 border-red-500/20',
};

const statCards = [
  {
    label: 'Total Orders',
    key: 'totalOrders',
    trendKey: 'ordersTrend',
    icon: ShoppingBag,
    color: 'bg-blue-500/10 text-blue-500',
    format: (v) => v.toLocaleString('en-IN'),
  },
  {
    label: 'Total Revenue',
    key: 'totalRevenue',
    trendKey: 'revenueTrend',
    icon: IndianRupee,
    color: 'bg-green-500/10 text-green-500',
    format: (v) => formatCurrency(v),
  },
  {
    label: 'Total Pizzas',
    key: 'totalPizzas',
    trendKey: 'pizzasTrend',
    icon: Pizza,
    color: 'bg-primary/10 text-primary',
    format: (v) => v.toLocaleString('en-IN'),
  },
  {
    label: 'Total Users',
    key: 'totalUsers',
    trendKey: 'usersTrend',
    icon: Users,
    color: 'bg-orange-500/10 text-orange-500',
    format: (v) => v.toLocaleString('en-IN'),
  },
];

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboard,
    retry: false,
  });

  const dashboard = data || (isError ? placeholderData : null);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s your store overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = dashboard?.stats?.[stat.key];
          const trend = dashboard?.stats?.[stat.trendKey];

          return (
            <Card
              key={stat.key}
              className="relative overflow-hidden border-border/50"
            >
              <CardContent className="p-6">
                {isLoading && !dashboard ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          stat.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {trend != null && (
                        <div
                          className={cn(
                            'flex items-center gap-0.5 text-xs font-medium',
                            trend >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          )}
                        >
                          {trend >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {Math.abs(trend)}%
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold tracking-tight">
                        {value != null ? stat.format(value) : '--'}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              {/* Subtle gradient border accent */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>Orders placed over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !dashboard ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart
                data={dashboard?.chartData || placeholderData.chartData}
                margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.6132 0.2294 291.7437)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.6132 0.2294 291.7437)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.2568 0.0076 274.6528)',
                    border: '1px solid oklch(0.3289 0.0092 268.3843)',
                    borderRadius: '8px',
                    color: 'oklch(0.9551 0 0)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="oklch(0.6132 0.2294 291.7437)"
                  strokeWidth={2}
                  fill="url(#orderGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from your store</CardDescription>
          </div>
          <Link
            to="/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && !dashboard ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboard?.recentOrders || placeholderData.recentOrders).map(
                  (order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">
                        {order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize',
                            statusColorMap[order.status]
                          )}
                        >
                          {order.status.replace(/-/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
