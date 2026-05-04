




import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Package, Truck, Smartphone,  ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = useMemo(() => [
    "Food on the way...",
    "Fresh veggies incoming...",
    "Stay safe, stay home...",
    "Your parcel is nearby...",
    "Quick delivery, just for you...",
  ], []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    const timer = setTimeout(() => setLoading(false), 3500);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, [loadingTexts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-600 text-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={currentText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-medium"
            >
              {loadingTexts[currentText]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Everything you need, <br />
            <span className="text-blue-200">delivered in minutes.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-50/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            From hot meals to fresh groceries and essential parcels. We connect you to your favorite local shops with lightning-fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-indigo-700 hover:bg-blue-50 font-bold px-8 shadow-lg">
              Download the App
            </Button>
            <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
              View Services
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Local Delivery?</h2>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <Package />, title: "Secure Packaging", desc: "Handled with care, from the store shelf to your doorstep." },
              { icon: <Truck />, title: "Real-Time Tracking", desc: "Follow your order live on the map as it navigates the city." },
              { icon: <Smartphone />, title: "Seamless Booking", desc: "One-tap ordering and secure digital payments via our mobile app." },
            ].map((f, i) => (
              <motion.div whileHover={{ y: -5 }} key={i}>
                <Card className="border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-gray-50">
                  <CardContent className="flex flex-col items-center text-center p-8">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl mb-6">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Hungry or out of groceries?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of happy customers and experience the fastest delivery service in your city.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-green-700 text-indigo-600 hover:bg-red-400 font-bold group px-10">
                Order Now 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full opacity-50" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-950 text-gray-400 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p className="mb-2">© {new Date().getFullYear()} Local Delivery. All rights reserved.</p>
          <p className="text-sm font-light">
            Designed & Developed by <span className="text-white font-medium italic">Md Sarfraaz Nasir</span>
          </p>
        </div>
      </footer>
    </div>
  );
}