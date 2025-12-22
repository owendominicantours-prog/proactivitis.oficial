import Image from 'next/image';
import { BadgeCheck, CalendarCheck, Clock3, Globe, ShieldCheck, Star, Users } from 'lucide-react';
import { recommendedReservation } from '@/lib/checkout';

type Props = {
  params: { [key: string]: string | string[] | undefined };
};

const normalize = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value ?? '';
};

const parseNumber = (value: string | string[] | undefined, fallback = 0) => {
  const normalized = normalize(value);
  if (!normalized) return fallback;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export default function CheckoutSummary({ params }: Props) {
  const tourId = normalize(params.tourId);
  const tourName = normalize(params.tourTitle) || recommendedReservation.tourName;
  const dateValue = normalize(params.date) || recommendedReservation.date;
  const timeValue = normalize(params.time) || recommendedReservation.time;
  const imageUrl = normalize(params.tourImage) || recommendedReservation.imageUrl;
  const pricePerPerson = Number.parseFloat(normalize(params.tourPrice)) || recommendedReservation.price;
  const adults = parseNumber(params.adults, 1);
  const youth = parseNumber(params.youth, 0);
  const child = parseNumber(params.child, 0);
  const totalTravelers = Math.max(1, adults + youth + child);
  const totalPrice = totalTravelers * pricePerPerson;
  const missingTourId = !tourId;

  return (
    <div className='min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto grid max-w-6xl gap-8 lg:grid-cols-[2.2fr_1fr]'>
        <section className='space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl'>
          <header className='space-y-2'>
            <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Resumen</p>
            <h1 className='text-3xl font-semibold text-slate-900'>Confirma tu reserva</h1>
            <p className='text-sm text-slate-500'>
              Estamos preparando tu reserva para <strong>{tourName}</strong>. Verifica fecha, viajeros y precio antes
              de continuar.
            </p>
            {missingTourId && (
              <p className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
                No se identificó el código del tour; los datos funcionan con lo que seleccionaste, pero el
                identificador llegará cuando completes la reserva.
              </p>
            )}
          </header>
          <div className='space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5'>
            <div className='flex gap-4'>
              <Image
                src={imageUrl}
                alt={tourName}
                width={96}
                height={96}
                className='h-[96px] w-[96px] rounded-xl object-cover'
              />
              <div>
                <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Tour</p>
                <p className='text-xl font-semibold text-slate-900'>{tourName}</p>
                <p className='text-sm text-slate-500'>#{tourId}</p>
              </div>
            </div>
            <div className='grid gap-3 text-sm text-slate-600 sm:grid-cols-3'>
              <div className='flex items-center gap-2'>
                <CalendarCheck className='h-5 w-5 text-slate-400' />
                <span>{dateValue}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock3 className='h-5 w-5 text-slate-400' />
                <span>{timeValue}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-slate-400' />
                <span>
                  {adults} adulto{adults > 1 ? 's' : ''}, {youth} juventud, {child} niño{child === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-2 rounded-2xl border border-slate-200 bg-white/90 p-5'>
            <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Precio estimado</p>
            <div className='flex items-baseline justify-between'>
              <p className='text-3xl font-semibold text-slate-900'>${totalPrice.toFixed(2)}</p>
              <p className='text-sm text-slate-500'>${pricePerPerson.toFixed(2)} por persona</p>
            </div>
            <p className='text-xs text-slate-500'>Incluye soporte 24/7 y confirmación inmediata.</p>
          </div>
          <div className='space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-950 p-4 text-white'>
            <p className='text-[13px] uppercase tracking-[0.4em] text-slate-400'>Pago</p>
            <p className='text-sm text-slate-200'>
              Actualmente la pasarela de pago está temporalmente en mantenimiento. Por favor contáctanos a{' '}
              <strong>payments@proactivitis.com</strong> o llama al <strong>+1 809 394 9877</strong> para finalizar tu
              reserva.
            </p>
          </div>
        </section>
        <aside className='space-y-4'>
          <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-xl'>
            <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>¿Necesitas ayuda?</p>
            <p className='mt-2 text-sm text-slate-500'>
              Envía un email con tu número de reserva tentativa y te llamaremos en minutos para cerrar el pago.
            </p>
            <div className='mt-4 space-y-3 text-sm text-slate-700'>
              <div className='flex items-center gap-2 text-slate-500'>
                <ShieldCheck className='h-5 w-5' />
                Pago protegido
              </div>
              <div className='flex items-center gap-2 text-slate-500'>
                <Globe className='h-5 w-5' />
                Operamos globalmente
              </div>
              <div className='flex items-center gap-2 text-slate-500'>
                <BadgeCheck className='h-5 w-5' />
                Tours verificados
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
