'use client';



import Image from 'next/image';
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import {

  AlertTriangle,

  ArrowLeft,

  BadgeCheck,

  CalendarCheck,

  CheckCircle2,

  Clock3,

  CreditCard,

  Globe,

  MapPin,

  ShieldCheck,

  Star,

  Users

} from 'lucide-react';

import { useSearchParams } from 'next/navigation';



const recommendedReservation = {

  tourName: 'Tour guiado de lujo en Punta Cana',

  date: '12 de enero, 2026',

  time: '09:00 AM',

  adults: 2,

  children: 1,

  price: 598,

  imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c3?auto=format&fit=crop&w=600&q=80'

};



const paymentMethods = [

  { id: 'card', label: 'Tarjeta de crédito' },

  { id: 'paypal', label: 'PayPal' },

  { id: 'google', label: 'Google Pay' },

  { id: 'klarna', label: 'Klarna' }

];

const paymentLogos = [

  { alt: 'Visa', src: '/logos/visa.svg' },

  { alt: 'Mastercard', src: '/logos/mastercard.svg' },

  { alt: 'PayPal', src: '/logos/paypal.svg' },

  { alt: 'Google Pay', src: '/logos/google-pay.svg' },

  { alt: 'Klarna', src: '/logos/klarna.svg' }

];



const countries = ['Estados Unidos', 'Espaa', 'Mxico', 'Reino Unido', 'Colombia', 'Chile', 'Per', 'Canad', 'Brasil'];

const stepTitles = ['Datos de contacto', 'Detalles de la actividad', 'Informacin de pago'];



export default function CheckoutForm() {

  const [activeStep, setActiveStep] = useState(0);

  const [contactData, setContactData] = useState({ firstName: '', lastName: '', email: '', confirmEmail: '', phone: '' });

  const [travelerName, setTravelerName] = useState('');

  const [pickupPreference, setPickupPreference] = useState('pickup');

  const [language, setLanguage] = useState('Espaol / Ingls');

  const [specialRequirements, setSpecialRequirements] = useState('');

  const [paymentType, setPaymentType] = useState('card');

  const [paymentTiming, setPaymentTiming] = useState('pay-now');

  const [billingCountry, setBillingCountry] = useState(countries[0]);

  const [cardNumber, setCardNumber] = useState('');

  const [errors, setErrors] = useState({} as Record<string, string>);

  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const searchParams = useSearchParams();



  const summaryLabel = useMemo(() => {

    if (!contactData.firstName && !contactData.email) return '';

    const name = `${contactData.firstName} ${contactData.lastName}`.trim() || 'Viajer@ principal';

    return `${name}  ${contactData.email || 'sin email'}`;

  }, [contactData]);



  const guardTime = '28:56';



  const summaryState = useMemo(() => {

    const parsePositive = (raw: string | null, fallback: number) => {
      const value = parseInt(raw ?? '', 10);

      if (Number.isNaN(value)) return fallback;

      return Math.max(fallback, value);

    };



    const adultsCount = parsePositive(searchParams.get('adults'), 1);

    const youthCount = parsePositive(searchParams.get('youth'), 0);

    const childCount = parsePositive(searchParams.get('child'), 0);

    const dateValue = searchParams.get('date') || recommendedReservation.date;

    const timeValue = searchParams.get('time') || recommendedReservation.time;



    return {

      tourName: recommendedReservation.tourName,

      date: dateValue,

      time: timeValue,

      adults: adultsCount,

      children: youthCount + childCount

    };

  }, [searchParams]);



  const reservationSummary = useMemo(

    () => (

      <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl'>

        <div className='flex items-center gap-3 rounded-xl bg-pink-100 px-3 py-2 text-sm font-semibold text-rose-700'>

          <Clock3 className='h-4 w-4' />

          Te guardamos la plaza durante <span className='font-black'>{guardTime}</span> minutos

        </div>

        <div className='flex items-center gap-3 border-b border-slate-100 pb-4'>

          <Image

            src={recommendedReservation.imageUrl}

            alt={recommendedReservation.tourName}

            width={76}

            height={76}

            className='h-[76px] w-[76px] rounded-xl object-cover shadow'

            priority

          />

          <div>

            <p className='text-sm uppercase tracking-[0.4em] text-slate-400'>Tour</p>

            <p className='font-semibold text-slate-900'>{summaryState.tourName}</p>

          </div>

        </div>

        <div className='space-y-3 text-sm text-slate-600'>

          <div className='flex items-center justify-between'>

            <span className='flex items-center gap-2'>

              <Users className='h-5 w-5 text-slate-400' /> Personas

            </span>

            <strong>

              {summaryState.adults} adult{summaryState.adults > 1 ? 's' : ''} · {summaryState.children} niño{summaryState.children === 1 ? '' : 's'}

            </strong>

          </div>

          <div className='flex items-center justify-between'>

            <span className='flex items-center gap-2'>

              <CalendarCheck className='h-5 w-5 text-slate-400' /> Fecha

            </span>

            <strong>{summaryState.date}</strong>

          </div>

          <div className='flex items-center justify-between'>

            <span className='flex items-center gap-2'>

              <Clock3 className='h-5 w-5 text-slate-400' /> Hora

            </span>

            <strong>{summaryState.time}</strong>

          </div>

        </div>



        <div className='rounded-xl border border-emerald-500/20 bg-emerald-50 p-3 text-xs text-emerald-700'>

          <div className='flex items-center gap-2 text-[13px] font-semibold'>

            <BadgeCheck className='h-4 w-4' />

            <span className='flex items-center gap-1'>

              <Star className='h-4 w-4 text-amber-400' /> Trustpilot 5 estrellas

            </span>

          </div>

          <p className='text-[13px] text-emerald-700/80'>

            Flexibilidad excepcional  cancelacin gratuita hasta 24 h antes

          </p>

        </div>

        <div className='rounded-2xl border border-slate-100 bg-slate-950 p-4 text-white'>

          <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Precio total</p>

          <p className='text-3xl font-semibold'>${recommendedReservation.price.toFixed(2)}</p>

          <p className='mt-2 text-[13px] text-slate-300'>Incluye impuestos y tasas</p>

        </div>

        <div className='space-y-1 rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-500'>

          <div className='flex items-center gap-2'>

            <ShieldCheck className='h-4 w-4 text-emerald-500' /> Pagos verificados y protegidos

          </div>

          <div className='flex items-center gap-2'>

            <CheckCircle2 className='h-4 w-4 text-emerald-500' /> Soporte 24/7 en tu destino

          </div>

          <div className='flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-slate-400'>

            <Globe className='h-4 w-4 text-slate-400' /> Infraestructura global de cobros

          </div>

        </div>

      </div>

    ),

    [summaryState, guardTime]

  );



  const handleScrollToStep = (index: number) => {

    const ref = containerRefs[index]?.current;

    if (ref) {

      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });

    }

  };



  const handleContactChange = (field: keyof typeof contactData) => (event: ChangeEvent<HTMLInputElement>) => {

    setContactData((prev) => ({ ...prev, [field]: event.target.value }));

    setErrors((prev) => {

      const next = { ...prev };

      delete next[field];

      return next;

    });

  };



  const handleNext = (index: number) => {

    const newErrors: Record<string, string> = {};

    if (index === 0) {

      if (!contactData.firstName) newErrors.firstName = 'Ingresa tu nombre';

      if (!contactData.lastName) newErrors.lastName = 'Ingresa tu apellido';

      if (!contactData.email) newErrors.email = 'Ingresa un correo';

      if (!contactData.confirmEmail) newErrors.confirmEmail = 'Confirma tu correo';

      if (contactData.email && contactData.confirmEmail && contactData.email !== contactData.confirmEmail)

        newErrors.confirmEmail = 'Los correos deben coincidir';

      if (!contactData.phone) newErrors.phone = 'Ingresa un telfono';

    }

    if (index === 1 && !travelerName) {

      newErrors.travelerName = 'Ingresa el nombre del viajero';

    }

    if (index === 2 && !paymentType) {

      newErrors.paymentType = 'Elige un mtodo';

    }



    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {

      const nextStep = Math.min(stepTitles.length - 1, activeStep + 1);

      setActiveStep(nextStep);

      handleScrollToStep(nextStep);

    } else {

      const errorField = Object.keys(newErrors)[0];

      const target = document.getElementById(errorField);

      if (target) {

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      }

    }

  };



  const handlePaymentSubmit = (event: FormEvent) => {

    event.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!paymentType) newErrors.paymentType = 'Selecciona un mtodo';

    const normalizedCardNumber = cardNumber.split(' ').join('');

    if (paymentType === 'card' && normalizedCardNumber.length < 16)

      newErrors.cardNumber = 'Ingresa un nmero vlido';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {

      alert('Tu reserva ha sido procesada con xito.');

    }

  };



  return (
    <div className='min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8'>
    <div className='mx-auto grid max-w-6xl gap-8 lg:grid-cols-[2.2fr_1fr]'>

        <section className='space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl'>

          <header className='space-y-2'>

            <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Pasarela de pago</p>

            <h1 className='text-3xl font-semibold text-slate-900'>Verifica disponibilidad y reserva</h1>

            <p className='text-sm text-slate-500'>Completa los datos en cada paso. Puedes revisar tu reserva antes de confirmar.</p>

          </header>

          <div className='space-y-4'>

            {[0, 1, 2].map((stepIdx) => {

              const isActive = activeStep === stepIdx;

              return (

                <article key={stepIdx} className='overflow-hidden rounded-2xl border border-slate-200 transition-all duration-300'>

                  <button

                    className='flex w-full items-center justify-between bg-slate-100 px-5 py-4 text-left'

                    onClick={() => {

                      setActiveStep(stepIdx);

                      handleScrollToStep(stepIdx);

                    }}

                    type='button'

                  >

                    <div>

                      <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Paso {stepIdx + 1}</p>

                      <p className='text-lg font-semibold text-slate-900'>

                        {stepTitles[stepIdx]}

                        {stepIdx === 0 && activeStep > 0 && <span className='ml-2 text-sm font-normal text-slate-500'>{summaryLabel}</span>}

                      </p>

                    </div>

                    <span className='text-emerald-600'>{isActive ? 'Activo' : 'Revisar'}</span>

                  </button>

                  <div className={`${isActive ? 'max-h-[900px]' : 'max-h-0'} transition-[max-height] duration-500 bg-white px-5 pb-6 pt-0`} ref={containerRefs[stepIdx]}>

                    {isActive && (

                      <div className='space-y-5 pt-6'>

                        {stepIdx === 0 && (

                          <div className='space-y-4'>

                            {[

                              { label: 'Nombre', key: 'firstName', placeholder: 'Idelkis Maria' },

                              { label: 'Apellido', key: 'lastName', placeholder: 'Martnez' },

                              { label: 'Correo electrnico', key: 'email', placeholder: 'tucorreo@proactivitis.com' },

                              { label: 'Confirmar correo', key: 'confirmEmail', placeholder: 'Confirma tu correo' },

                              { label: 'Telfono', key: 'phone', placeholder: '+1 809 555 555' }

                            ].map((field) => (

                              <div key={field.key} className='space-y-1'>

                                <label htmlFor={field.key} className='text-xs uppercase tracking-[0.3em] text-slate-500'>

                                  {field.label}

                                </label>

                                <input

                                  id={field.key}

                                  type={field.key.includes('email') ? 'email' : field.key === 'phone' ? 'tel' : 'text'}

                                  value={contactData[field.key as keyof typeof contactData]}

                                  onChange={handleContactChange(field.key as keyof typeof contactData)}

                                  placeholder={field.placeholder}

                                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                                    errors[field.key] ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'

                                  }`}

                                />

                                {errors[field.key] && <p className='text-xs text-rose-500'>{errors[field.key]}</p>}

                              </div>

                            ))}

                            <div className='flex justify-end'>

                              <button

                                type='button'

                                onClick={() => handleNext(stepIdx)}

                                className='rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700'

                              >

                                Siguiente

                              </button>

                            </div>

                          </div>

                        )}

                        {stepIdx === 1 && (

                          <div className='space-y-4'>

                            <div className='space-y-2'>

                              <label className='text-xs uppercase tracking-[0.3em] text-slate-500'>Viajero principal</label>

                              <input

                                id='travelerName'

                                value={travelerName}

                                onChange={(event) => setTravelerName(event.target.value)}

                                placeholder='Nombre completo'

                                className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                                  errors.travelerName ? 'border-rose-500' : 'border-slate-200'

                                }`}

                              />

                              {errors.travelerName && <p className='text-xs text-rose-500'>{errors.travelerName}</p>}

                            </div>

                            <div className='grid gap-3 sm:grid-cols-2'>

                              <label className='flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm'>

                                <input

                                  type='radio'

                                  name='pickup'

                                  value='pickup'

                                  checked={pickupPreference === 'pickup'}

                                  onChange={() => setPickupPreference('pickup')}

                                />

                                Prefiero que me recojan

                              </label>

                              <label className='flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm'>

                                <input

                                  type='radio'

                                  name='pickup'

                                  value='later'

                                  checked={pickupPreference === 'later'}

                                  onChange={() => setPickupPreference('later')}

                                />

                                Lo decidir ms tarde

                              </label>

                            </div>

                            <div className='flex items-center gap-2 text-sm text-slate-500'>

                              <MapPin className='h-5 w-5 text-emerald-500' />

                              <span>Buscador de ubicaciones y punto de encuentro</span>

                            </div>

                            <div>

                              <label className='text-xs uppercase tracking-[0.3em] text-slate-500'>Idioma</label>

                              <select

                                value={language}

                                onChange={(event) => setLanguage(event.target.value)}

                                className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

                              >

                                <option>Espaol / Ingls</option>

                                <option>Espaol / Francs</option>

                                <option>Ingls / Portugus</option>

                              </select>

                            </div>

                            <div className='space-y-2'>

                              <label className='text-xs uppercase tracking-[0.3em] text-slate-500'>Requisitos especiales</label>

                              <textarea

                                value={specialRequirements}

                                onChange={(event) => setSpecialRequirements(event.target.value)}

                                rows={3}

                                className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

                              />

                            </div>

                            <div className='flex justify-between items-center'>

                              <button

                                type='button'

                                onClick={() => {

                                  setActiveStep(0);

                                  handleScrollToStep(0);

                                }}

                                className='flex items-center gap-2 text-sm font-semibold text-slate-600'

                              >

                                <ArrowLeft className='h-4 w-4' /> Regresar

                              </button>

                              <button

                                type='button'

                                onClick={() => handleNext(stepIdx)}

                                className='rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700'

                              >

                                Siguiente

                              </button>

                            </div>

                          </div>

                        )}

                        {stepIdx === 2 && (

                          <form onSubmit={handlePaymentSubmit} className='space-y-4'>

                            <div className='space-y-2'>

                              <p className='text-[11px] uppercase tracking-[0.4em] text-slate-400'>Pago</p>

                              <div className='flex items-center gap-3'>

                                {paymentMethods.map((method) => (

                                  <button

                                    key={method.id}

                                    type='button'

                                    className={`flex flex-1 items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${

                                      paymentType === method.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'

                                    }`}

                                    onClick={() => setPaymentType(method.id)}

                                  >

                                    <span className='flex items-center gap-2'>

                                      {method.label}

                                    </span>

                                    {method.label === 'Tarjeta de crédito' && (
                                      <span className='text-xs font-normal text-slate-400'>Visa · Mastercard</span>
                                    )}
                                  </button>

                                ))}

                              </div>

                              {errors.paymentType && <p className='text-xs text-rose-500'>{errors.paymentType}</p>}

                            </div>

                            {paymentType === 'card' && (

                              <div className='space-y-2'>

                                <label className='text-xs uppercase tracking-[0.3em] text-slate-500'>Nmero de tarjeta</label>

                                <input

                                  id='cardNumber'

                                  value={cardNumber}

                                  onChange={(event) => {

                                    const digitsOnly = Array.from(event.target.value)

                                      .filter((ch) => ch >= '0' && ch <= '9')

                                      .join('');

                                    setCardNumber(digitsOnly);

                                  }}

                                  placeholder='4111 1111 1111 1111'

                                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${

                                    errors.cardNumber ? 'border-rose-500' : 'border-slate-200'

                                  }`}

                                />

                                {errors.cardNumber && <p className='text-xs text-rose-500'>{errors.cardNumber}</p>}

                                <div className='flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>

                                  <CreditCard className='h-4 w-4 text-slate-400' />

                                  {paymentLogos.map((logo) => (

                                    <div key={logo.alt} className='h-8 w-16'>

                                      <Image src={logo.src} alt={logo.alt} width={64} height={24} className='h-full w-full object-contain' />

                                    </div>

                                  ))}

                                </div>

                              </div>

                            )}

                            <div className='space-y-2'>

                              <label className='text-xs uppercase tracking-[0.3em] text-slate-500'>Pas de facturacin</label>

                              <div className='relative'>

                                <input

                                  value={billingCountry}

                                  onChange={(event) => setBillingCountry(event.target.value)}

                                  list='country-options'

                                  className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

                                />

                                <datalist id='country-options'>

                                  {countries.map((country) => (

                                    <option key={country} value={country} />

                                  ))}

                                </datalist>

                              </div>

                            </div>

                            <div className='space-y-2'>

                              <p className='text-[11px] uppercase tracking-[0.4em] text-slate-400'>Cundo deseas pagar?</p>

                              <div className='flex items-center gap-4'>

                                <label className='flex items-center gap-2 text-sm'>

                                  <input

                                    type='radio'

                                    name='paymentTiming'

                                    value='pay-now'

                                    checked={paymentTiming === 'pay-now'}

                                    onChange={() => setPaymentTiming('pay-now')}

                                  />

                                  Pagar ahora

                                </label>

                                <label className='flex items-center gap-2 text-sm'>

                                  <input

                                    type='radio'

                                    name='paymentTiming'

                                    value='pay-later'

                                    checked={paymentTiming === 'pay-later'}

                                    onChange={() => setPaymentTiming('pay-later')}

                                  />

                                  Reservar ahora y pagar despus

                                </label>

                                <span className='flex items-center gap-2 text-xs text-amber-600'>

                                  <AlertTriangle className='h-4 w-4' />

                                  Disponible durante el periodo de proteccin de 24 h

                                </span>

                              </div>

                            </div>

                            <div className='flex justify-between'>

                              <button

                                type='button'

                                onClick={() => {

                                  setActiveStep(1);

                                  handleScrollToStep(1);

                                }}

                                className='flex items-center gap-2 text-sm font-semibold text-slate-600'

                              >

                                <ArrowLeft className='h-4 w-4' /> Regresar

                              </button>

                              <button

                                type='submit'

                                className='rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700'

                              >

                                Reservar ahora

                              </button>

                            </div>

                          </form>

                        )}

                      </div>

                    )}

                  </div>

                </article>

              );

            })}

          </div>

        </section>

        <aside className='space-y-4'>

          <div className='sticky top-10 space-y-6'>

            {reservationSummary}

          </div>

        </aside>

      </div>

    </div>
  );
}







