import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackDialogProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

const FeedbackDialog = ({ orderId, open, onClose }: FeedbackDialogProps) => {
  const [itemRating, setItemRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!itemRating || !serviceRating || !deliveryRating) {
      toast.error("Please provide all ratings");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("feedback").insert({
        order_id: orderId,
        user_id: user.id,
        item_rating: itemRating,
        service_rating: serviceRating,
        delivery_rating: deliveryRating,
        comment: comment || null,
      });

      if (error) throw error;
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You have already submitted feedback for this order");
      } else {
        toast.error("Failed to submit feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  const RatingStars = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-8 w-8 ${
              star <= value ? "fill-accent text-accent" : "text-muted-foreground"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Order</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your experience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-2 block">Product Quality</Label>
            <RatingStars value={itemRating} onChange={setItemRating} />
          </div>
          <div>
            <Label className="mb-2 block">Customer Service</Label>
            <RatingStars value={serviceRating} onChange={setServiceRating} />
          </div>
          <div>
            <Label className="mb-2 block">Delivery Experience</Label>
            <RatingStars value={deliveryRating} onChange={setDeliveryRating} />
          </div>
          <div>
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share more about your experience..."
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;