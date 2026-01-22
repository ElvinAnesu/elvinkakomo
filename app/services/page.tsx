// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import Card from "../components/Card";
// export default function Services() {
//   const serviceIcons = ["🚀", "💼", "📈"];

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#FAFAFA]">
//       <Navbar />
//       <main className="flex-1">
//         <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
//           {/* Background decoration */}
//           <div className="absolute inset-0 -z-10">
//             <div className="absolute top-20 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
//             <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-15"></div>
//           </div>

//           <div className="text-center mb-20">
//             <div className="inline-block mb-6 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
//               <span className="text-sm font-semibold gradient-text">What I Offer</span>
//             </div>
//             <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-6">
//               Services That{" "}
//               <span className="gradient-text">Deliver</span>
//             </h1>
//             <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto">
//               Three core ways I help startups and SMEs build and grow their
//               products.
//             </p>
//           </div>

//           <div className="space-y-24">
//             {services.map((service, index) => (
//               <div
//                 key={service.id}
//                 className={`flex flex-col ${
//                   index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
//                 } gap-12 items-center`}
//               >
//                 <div className="flex-1">
//                   <Card className="relative overflow-hidden group">
//                     <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                     <div className="relative">
//                       <div className="text-6xl mb-6">{serviceIcons[index]}</div>
//                       <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">
//                         {service.title}
//                       </h2>
//                       <ul className="space-y-4 mb-8">
//                         {service.description.map((item, idx) => (
//                           <li key={idx} className="flex items-start">
//                             <span className="text-[#6B21A8] mr-3 mt-1 text-xl">✓</span>
//                             <span className="text-[#64748B] text-lg">{item}</span>
//                           </li>
//                         ))}
//                       </ul>
//                       <div className="pt-6 border-t border-[#E5E7EB]">
//                         <p className="text-xl font-semibold text-[#0F172A] italic gradient-text">
//                           {service.outcome}
//                         </p>
//                       </div>
//                     </div>
//                   </Card>
//                 </div>
//                 <div className="flex-1">
//                   <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-16 h-full flex items-center justify-center shadow-lg">
//                     <div className="text-center">
//                       <div className="w-32 h-32 gradient-purple rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-5xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
//                         {serviceIcons[index]}
//                       </div>
//                       <div className="w-24 h-1 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full mx-auto"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </main>
//       <Footer />
//     </div>
//   );
// }
