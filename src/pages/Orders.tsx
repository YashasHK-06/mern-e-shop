import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, ArrowLeft } from "lucide-react";
import FeedbackDialog from "@/components/FeedbackDialog";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  address: any;
  order_items: any[];
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to view orders");
        navigate("/auth");
        return;
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);
    } catch (error: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold">Payment Method:</span>
                        <span>{order.payment_method}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-lg">₹{order.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        onClick={() => setFeedbackOrderId(order.id)}
                        className="w-full"
                      >
                        Rate This Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {feedbackOrderId && (
          <FeedbackDialog
            orderId={feedbackOrderId}
            open={!!feedbackOrderId}
            onClose={() => setFeedbackOrderId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;