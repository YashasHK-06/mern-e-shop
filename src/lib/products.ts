import { Product } from "@/types/product";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    description: "High-fidelity audio with active noise cancellation. Premium comfort for all-day wear.",
    image: product1,
    category: "Audio",
    rating: 4.8,
    reviews: 328,
    inStock: true,
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    price: 399.99,
    description: "Advanced fitness tracking with heart rate monitor and GPS. Stay connected on the go.",
    image: product2,
    category: "Wearables",
    rating: 4.6,
    reviews: 542,
    inStock: true,
  },
  {
    id: "3",
    name: "Ultra-Thin Laptop",
    price: 1299.99,
    description: "Powerful performance in a sleek design. Perfect for professionals and creators.",
    image: product3,
    category: "Computers",
    rating: 4.9,
    reviews: 876,
    inStock: true,
  },
  {
    id: "4",
    name: "Flagship Smartphone",
    price: 899.99,
    description: "Stunning display with professional-grade cameras. The future in your pocket.",
    image: product4,
    category: "Mobile",
    rating: 4.7,
    reviews: 1205,
    inStock: true,
  },
  {
    id: "5",
    name: "Wireless Earbuds",
    price: 179.99,
    description: "Crystal clear sound with long battery life. Perfect for music and calls.",
    image: product5,
    category: "Audio",
    rating: 4.5,
    reviews: 643,
    inStock: true,
  },
  {
    id: "6",
    name: "Pro Tablet",
    price: 699.99,
    description: "Versatile tablet with desktop-class performance. Create, work, and play anywhere.",
    image: product6,
    category: "Tablets",
    rating: 4.8,
    reviews: 412,
    inStock: false,
  },
];
