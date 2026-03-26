import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn, formatCurrency, formatDate } from '@/lib/utils';
import * as orderService from '@/services/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_OPTIONS = [
  { value: 'placed', label: 'Placed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColorMap = {
  placed: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  preparing: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  'out-for-delivery': 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  delivered: 'bg-green-500/15 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/15 text-red-600 border-red-500/20',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
    onSuccess: (res) => {
      const order = res?.order || res?.data || res;
      if (order?.status) {
        setSelectedStatus(order.status);
      }
    },
  });

  const order = data?.order || data?.data || data;

  // Set selectedStatus once order loads
  if (order?.status && !selectedStatus) {
    setSelectedStatus(order.status);
  }

  const statusMutation = useMutation({
    mutationFn: (status) => orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update order status'
      );
    },
  });

  const handleSaveStatus = () => {
    if (selectedStatus && selectedStatus !== order?.status) {
      statusMutation.mutate(selectedStatus);
    }
  };

  const items = order?.items || order?.orderItems || [];
  const customer = order?.customer || order?.user || {};
  const address = order?.deliveryAddress || order?.address || {};
  const subtotal = order?.subtotal || order?.total || 0;
  const deliveryFee = order?.deliveryFee || order?.deliveryCharge || 0;
  const total = order?.total || order?.totalAmount || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          Order not found
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/orders')}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <Badge
              variant="outline"
              className={cn('capitalize', statusColorMap[order.status])}
            >
              {order.status?.replace(/-/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Status Update */}
        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={
              !selectedStatus ||
              selectedStatus === order.status ||
              statusMutation.isPending
            }
            onClick={handleSaveStatus}
          >
            {statusMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Order Items */}
        <div className="lg:col-span-3">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Items
              </CardTitle>
              <CardDescription>
                {items.length} item{items.length !== 1 ? 's' : ''} in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item._id || index}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          {item.pizza?.name || item.name || item.pizzaName || 'Pizza'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(item.size || item.selectedSize) && (
                            <span className="rounded-md bg-secondary px-2 py-0.5">
                              Size: {item.size || item.selectedSize}
                            </span>
                          )}
                          {(item.crust || item.selectedCrust) && (
                            <span className="rounded-md bg-secondary px-2 py-0.5">
                              Crust: {item.crust || item.selectedCrust}
                            </span>
                          )}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.toppings.map((topping, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                              >
                                {typeof topping === 'string'
                                  ? topping
                                  : topping.name || topping.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.price || item.totalPrice || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity || item.qty || 1}
                        </p>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No items in this order
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary + Address + Customer */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Summary */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryFee ? formatCurrency(deliveryFee) : 'Free'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {address && (Object.keys(address).length > 0 || typeof address === 'string') ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {typeof address === 'string'
                    ? address
                    : [
                        address.street || address.line1,
                        address.area || address.line2,
                        address.city,
                        address.state,
                        address.pincode || address.zip,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60">
                  No address provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.name && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.name}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}
              {(customer.phone || customer.mobile) && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone || customer.mobile}</span>
                </div>
              )}
              {!customer.name && !customer.email && (
                <p className="text-sm text-muted-foreground/60">
                  No customer information available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
