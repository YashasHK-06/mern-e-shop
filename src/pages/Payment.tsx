import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const address = location.state?.address;

  if (!address || cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "cardNumber" && value.length > 16) return;
    if (name === "cvv" && value.length > 3) return;
    if (name === "expiryDate" && value.length > 5) return;
    
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error("Please fill all card details");
        return;
      }
      if (cardDetails.cardNumber.length < 16) {
        toast.error("Please enter a valid card number");
        return;
      }
      if (cardDetails.cvv.length !== 3) {
        toast.error("Please enter a valid CVV");
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to place order");
        navigate("/auth");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: "pending",
          payment_method: paymentMethod === "card" ? "Card" : "COD",
          address: address,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/checkout")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Address
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Debit/Credit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" />
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInput}
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      type="text"
                      placeholder="Name on card"
                      value={cardDetails.cardName}
                      onChange={handleCardInput}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInput}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={handleCardInput}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">
                  {address.fullName}<br />
                  {address.phone}<br />
                  {address.street}<br />
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;