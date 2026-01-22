import { PricingPlan } from "../lib/mockData";
import Button from "./Button";
import Card from "./Card";

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card
      className={`relative overflow-hidden h-full flex flex-col ${
        plan.highlighted
          ? "ring-2 ring-[#6B21A8] border-[#6B21A8] scale-105 shadow-2xl"
          : ""
      }`}
    >
      {plan.highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-to-br from-[#6B21A8] to-[#9333EA] text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
          POPULAR
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
            {plan.name}
          </h3>
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-[#0F172A]">
              ${plan.price}
            </span>
            <span className="text-[#64748B] text-lg"> / month</span>
          </div>
          {plan.highlighted && (
            <div className="w-16 h-1 gradient-purple rounded-full"></div>
          )}
        </div>
        <ul className="flex-1 space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[#6B21A8] mr-3 mt-1 text-xl font-bold">✓</span>
              <span className="text-[#64748B] text-lg">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          href="/collaborate"
          className="w-full"
          variant={plan.highlighted ? "primary" : "secondary"}
        >
          Start Collaboration
        </Button>
      </div>
    </Card>
  );
}
