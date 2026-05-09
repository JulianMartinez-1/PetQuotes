"use client";

import { Star } from "lucide-react";

export function ProofStatsSection({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-400 transition-all"
        >
          <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
          <p className="text-gray-700">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>
      <p className="text-gray-700 mb-4">{testimonial.text}</p>
      <p className="font-semibold text-gray-900">{testimonial.author}</p>
      <p className="text-sm text-gray-500">{testimonial.role}</p>
    </div>
  );
}

export function AnimatedFeatureCard({ feature }: { feature: any }) {
  const Icon = feature.icon;

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
      <div className="mb-4 inline-block p-3 bg-blue-100 rounded-lg">
        <Icon size={32} className="text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">{feature.text}</p>
    </div>
  );
}
