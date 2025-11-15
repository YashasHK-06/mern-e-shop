import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  const featuredProducts = products.slice(0, 3);
  const discountedProducts = products.filter(p => p.discount && p.discount >= 10).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
        <img
          src={heroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Elevate Your Tech Experience
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
            Discover premium products that blend innovation with style
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-lg text-muted-foreground">
            Handpicked selection of our most popular items
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/products">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Discount Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Up to 30% Off</h2>
          <p className="text-lg text-muted-foreground">
            Limited time offers on selected products
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-lg text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {["Laptops", "Mobiles", "Cameras", "Speakers", "Smartwatches"].map((category) => (
              <Link
                key={category}
                to="/products"
                className="bg-card p-8 rounded-lg text-center transition-all duration-300 group hover:shadow-xl hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
