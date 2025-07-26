import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      text: "SourceMart helped me reduce my ingredient costs by 30% while maintaining quality. The suppliers are reliable and delivery is always on time.",
      author: "Priya Sharma",
      role: "Street Food Vendor",
      rating: 5
    },
    {
      id: 2,
      text: "As a supplier, SourceMart gave me access to hundreds of vendors. My business has grown 2x since joining the platform.",
      author: "Rajesh Kumar", 
      role: "Vegetable Supplier",
      rating: 5
    },
    {
      id: 3,
      text: "The chat feature makes communication so easy. I can coordinate with multiple suppliers effortlessly.",
      author: "Meera Patel",
      role: "Spice Vendor", 
      rating: 5
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">{t('whatUsersSay')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('thousandsTrust')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-card p-8 rounded-2xl shadow-soft border">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-lg leading-relaxed mb-6 text-muted-foreground italic">
                "{testimonial.text}"
              </blockquote>
              
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};