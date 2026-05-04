// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "../ui/button";

// // import { Button } from "./pages/components/ui/button";
// import { Card, CardContent } from "../ui/card";
// // import { Card, CardContent } from "./pages/components/ui/card";
// import { Package, Truck, Smartphone, Star } from "lucide-react";
// import { Link, NavLink } from "react-router-dom";

// export default function LandingPage() {
//   const [loading, setLoading] = useState(true);
//   const loadingTexts = [
//     "Food on the way…",
//     "veggies on the way",
//     "Stay safe, stay home…",
//     "Your parcel is on the way…",
//     "Quick delivery, just for you…",
//   ];
//   const [currentText, setCurrentText] = useState(0);

//   useEffect(() => {
//     const textInterval = setInterval(() => {
//       setCurrentText((prev) => (prev + 1) % loadingTexts.length);
//     }, 2000);

//     const timer = setTimeout(() => setLoading(false), 4000);

//     return () => {
//       clearInterval(textInterval);
//       clearTimeout(timer);
//     };
//   }, [loadingTexts.length]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//           className="text-center"
//         >
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//             className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"
//           ></motion.div>
//           <p className="text-xl font-semibold">{loadingTexts[currentText]}</p>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Hero Section */}
//       <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-4xl md:text-6xl font-bold mb-6"
//         >
//           Fast & Reliable Local Delivery
//         </motion.h1>
//         <p className="text-lg md:text-xl max-w-2xl mb-8">
//           Order Food, Vegetables and other  across your city with ease. Trusted by shops, businesses, and customers.
//         </p>
//         <div className="flex gap-4">
//           <Button size="lg" className="bg-black text-blue-600 hover:bg-blue-600">
//             Download App
//           </Button>
//           <Button size="lg" variant="outline" className="border-white text-white">
//             Learn More
//           </Button>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-20 bg-gray-50 px-6 md:px-16">
//         <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
//         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {[
//             { icon: <Package className="w-10 h-10 text-blue-600" />, title: "Secure Packaging", desc: "Your parcels are handled with care and delivered safely." },
//             { icon: <Truck className="w-10 h-10 text-blue-600" />, title: "Real-Time Tracking", desc: "Know where your package is at every moment." },
//             { icon: <Smartphone className="w-10 h-10 text-blue-600" />, title: "Easy to Use", desc: "Book, pay, and track everything right from your phone." },
//           ].map((f, i) => (
//             <Card key={i} className="shadow-md rounded-2xl">
//               <CardContent className="flex flex-col items-center text-center p-6">
//                 {f.icon}
//                 <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
//                 <p className="mt-2 text-gray-600">{f.desc}</p> 
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 px-6 md:px-16 bg-white">
//         <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Customers Say</h2>
//         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {["Super fast delivery!", "Very easy to use app.", "Reliable and affordable service."].map((quote, i) => (
//             <Card key={i} className="rounded-2xl shadow-md">
//               <CardContent className="p-6 text-center">
//                 <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
//                 <p className="italic text-gray-700">“{quote}”</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* Call to Action */}
//       <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
//         <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Order delicious and Testy food or Fresh vaggies and other Today</h2>
//         <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
//           <NavLink>
//            <Link to="signup" className="link1" >Order Start Now</Link>
//           </NavLink>
       
//         </Button>
//       </section>

//       {/* Footer */}
//       <footer className="py-6 bg-gray-900 text-gray-300 text-center text-sm">
//         © {new Date().getFullYear()} Local Delivery. All rights reserved.
//         <p>Design And Developed By SDE Md Sarfraaz Nasir</p>
//       </footer>
//     </div>
//   );
// }




import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Package, Truck, Smartphone, Star, ArrowRight } from "lucide-react";
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