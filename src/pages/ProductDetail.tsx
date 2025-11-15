import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Link to="/products">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-accent-foreground bg-accent/10 rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-lg font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8">{product.description}</p>

            <div className="mb-8">
              <span className="text-4xl font-bold">${product.price}</span>
              <span
                className={`ml-4 text-sm ${
                  product.inStock ? "text-green-600" : "text-destructive"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full md:w-auto px-12"
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Product Features */}
            <div className="mt-12 space-y-4">
              <h3 className="text-xl font-semibold">Product Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Premium quality materials</li>
                <li>• Advanced technology</li>
                <li>• 1-year warranty included</li>
                <li>• Free shipping on orders over $50</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
