import { Link } from '@tanstack/react-router';

export function EstimationCTA() {
  return (
    <section className="py-14">
      <div className="max-w-[1240px] mx-auto px-10">
        <div className="bg-gray-bg rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-6 px-11 py-9">
          <div>
            <h2 className="text-[26px] font-bold text-head">Connaissez-vous la valeur de votre bien ?</h2>
            <p className="text-muted mt-1.5">Faites une estimation gratuite de votre bien par l'un de nos experts.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2.5 border-[1.5px] border-navy text-navy bg-white rounded-full px-7 py-4 text-[16px] font-semibold hover:bg-navy hover:text-white transition-colors whitespace-nowrap">
            Contactez-nous →
          </Link>
        </div>
      </div>
    </section>
  );
}
