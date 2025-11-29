import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

// import { Button } from "./pages/components/ui/button";
import { Card, CardContent } from "../ui/card";
// import { Card, CardContent } from "./pages/components/ui/card";
import { Package, Truck, Smartphone, Star } from "lucide-react";
import SignupPage from "../authPages/SignupPage";
import { Link, NavLink } from "react-router-dom";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const loadingTexts = [
    "Food on the way…",
    "Stay safe, stay home…",
    "Your parcel is on the way…",
    "Quick delivery, just for you…",
  ];
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);

    const timer = setTimeout(() => setLoading(false), 4000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"
          ></motion.div>
          <p className="text-xl font-semibold">{loadingTexts[currentText]}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Fast & Reliable Local Delivery
        </motion.h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8">
          Order Food across your city with ease. Trusted by shops, businesses, and customers.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Download App
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: <Package className="w-10 h-10 text-blue-600" />, title: "Secure Packaging", desc: "Your parcels are handled with care and delivered safely." },
            { icon: <Truck className="w-10 h-10 text-blue-600" />, title: "Real-Time Tracking", desc: "Know where your package is at every moment." },
            { icon: <Smartphone className="w-10 h-10 text-blue-600" />, title: "Easy to Use", desc: "Book, pay, and track everything right from your phone." },
          ].map((f, i) => (
            <Card key={i} className="shadow-md rounded-2xl">
              <CardContent className="flex flex-col items-center text-center p-6">
                {f.icon}
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.desc}</p> 
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-16 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {["Super fast delivery!", "Very easy to use app.", "Reliable and affordable service."].map((quote, i) => (
            <Card key={i} className="rounded-2xl shadow-md">
              <CardContent className="p-6 text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="italic text-gray-700">“{quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Order delicious and Testy food Today</h2>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          <NavLink>
           <Link to="signup" className="link1" >Order Start Now</Link>
          </NavLink>
       
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-900 text-gray-300 text-center text-sm">
        © {new Date().getFullYear()} Local Delivery. All rights reserved.
        <p>Design And Developed By SDE Md Sarfraaz Nasir</p>
      </footer>
    </div>
  );
}
