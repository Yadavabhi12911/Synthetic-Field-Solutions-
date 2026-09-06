import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Star, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { HeroVideo } from '../components/landing/HeroVideo';
import { AmbientVideo } from '../components/landing/AmbientVideo';
import { Reveal } from '../components/landing/Reveal';
import { TiltSurface } from '../components/landing/TiltSurface';
import { cn } from '../lib/cn';

const steps = [
  {
    title: 'Browse fields',
    description: 'Search turfs by location and price. See photos, ratings, and open slots.',
  },
  {
    title: 'Pick a slot',
    description: 'Choose a date and hour that works. Availability updates as bookings come in.',
  },
  {
    title: 'Show up and play',
    description: 'Confirm your booking, pay at the venue, and rate your visit when done.',
  },
];

const LandingPage: React.FC = () => {
  const { user, userType } = useAuth();
  const isLoggedIn = user && (userType === 'user' || userType === 'admin');
  const playerHref = isLoggedIn && userType === 'user' ? '/dashboard' : '/register';
  const operatorHref = isLoggedIn && userType === 'admin' ? '/admin/dashboard' : '/admin/register';

  return (
    <div className="overflow-x-hidden">
      <section className="relative min-h-[100dvh] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgb(var(--color-primary)/0.18),transparent_52%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14 lg:pt-12 lg:pb-20">
          <div className="landing-enter text-left">
            <h1 className="type-display max-w-xl">
              Book Sports Fields by the hour
            </h1>
            <p className="type-body mt-5 max-w-[38ch] text-lg">
              Browse real turfs, check live slots, and manage bookings as a player or operator.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/turfs">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse fields
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Button>
              </Link>
              {!isLoggedIn ? (
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Create account
                  </Button>
                </Link>
              ) : (
                <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Go to dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="landing-enter landing-enter-delay-2">
            <HeroVideo />
          </div>
        </div>
      </section>

      <section className="border-y border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-xl text-left">
            <h2 className="type-title">
              How booking works
            </h2>
            <p className="type-body type-measure mt-3">
              Three steps from discovery to kickoff. Confirm online, settle at the field.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-0 md:grid-cols-3">
            {steps.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <article
                  className={cn(
                    'h-full px-0 py-6 md:px-8 md:py-2',
                    index > 0 && 'border-t border-border md:border-l md:border-t-0'
                  )}
                >
                  <p className="type-numeric text-4xl text-primary/70">{index + 1}</p>
                  <h3 className="type-subhead mt-4">{item.title}</h3>
                  <p className="type-body-sm mt-2 max-w-[36ch]">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-xl text-left">
            <h2 className="type-title">
              Built for players and operators
            </h2>
            <p className="type-body type-measure mt-3">Find a field, hold a slot, or run the venue from one place.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <TiltSurface innerClassName="h-full">
                <div className="flex min-h-[280px] flex-col justify-between p-7 text-left sm:p-8">
                  <div>
                    <h3 className="type-title max-w-[16ch]">
                      Hold an hour on the pitch
                    </h3>
                    <p className="type-body-sm mt-3 max-w-[48ch]">
                      Reserve a specific time with the price shown before you confirm. Slots update as
                      bookings are made or released.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {['6:00 PM', '7:00 PM', '8:00 PM'].map((slot, index) => (
                      <span
                        key={slot}
                        className={cn(
                          'rounded-full px-3 py-1.5 type-label',
                          index === 1
                            ? 'bg-primary text-white'
                            : 'border border-border text-muted'
                        )}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltSurface>
            </Reveal>

            <div className="grid gap-5">
              <Reveal delay={0.06}>
                <TiltSurface>
                  <div className="p-6 text-left">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="type-heading mt-4">Player accounts</h3>
                    <p className="type-body-sm mt-2">
                      Track bookings, cancel within policy, and rate visits after you play.
                    </p>
                  </div>
                </TiltSurface>
              </Reveal>
              <Reveal delay={0.1}>
                <TiltSurface>
                  <div className="p-6 text-left">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="type-heading mt-4">Operator console</h3>
                    <p className="type-body-sm mt-2">
                      Separate roles, protected routes, and tools to list fields and manage availability.
                    </p>
                  </div>
                </TiltSurface>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.08} className="mt-5">
            <div className="flex items-start gap-4 rounded-[1.25rem] border border-white/[0.08] bg-surface px-6 py-5 text-left">
              <Star className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="type-heading">Reviews after completed visits</h3>
                <p className="type-body-sm type-measure mt-1">
                  Ratings from people who actually played help the next booking feel less like a guess.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-left">
            <h2 className="type-title">
              Choose your path
            </h2>
            <p className="type-body mt-3">Same platform, tailored to each role.</p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal>
              <TiltSurface innerClassName="h-full border-primary/25">
                <div className="flex h-full min-h-[260px] flex-col p-7 text-left sm:p-8">
                  <h3 className="type-subhead">For players</h3>
                  <p className="type-body-sm mt-3 flex-1 max-w-[42ch]">
                    Discover turfs, book hourly slots, manage your schedule, and leave ratings after
                    completed visits.
                  </p>
                  <div className="mt-8">
                    <Link to={playerHref}>
                      <Button>
                        {isLoggedIn && userType === 'user' ? 'Open player dashboard' : 'Sign up as player'}
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </TiltSurface>
            </Reveal>

            <Reveal delay={0.06}>
              <TiltSurface innerClassName="h-full">
                <div className="flex h-full min-h-[260px] flex-col p-7 text-left sm:p-8">
                  <h3 className="type-subhead">For operators</h3>
                  <p className="type-body-sm mt-3 flex-1 max-w-[42ch]">
                    List fields, toggle slot availability, manage bookings and users, and track venue
                    performance.
                  </p>
                  <div className="mt-8">
                    <Link to={operatorHref}>
                      <Button variant="secondary">
                        {isLoggedIn && userType === 'admin' ? 'Open operator console' : 'List your field'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </TiltSurface>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative min-h-[78dvh] overflow-hidden">
        <AmbientVideo
          src="/athletes-on-turf.mp4"
          label="Athletes playing on turf"
          framed={false}
          className="absolute inset-0"
          overlayClassName="bg-gradient-to-t from-black/80 via-black/55 to-black/30"
        />
        <div className="relative z-10 mx-auto flex min-h-[78dvh] max-w-7xl items-center px-4 py-24 text-left sm:px-6">
          <Reveal>
            <h2 className="type-display max-w-[16ch]">
              Ready to get on the pitch?
            </h2>
            <p className="type-body mt-4 max-w-[42ch] text-white/80">
              Join as a player to book fields, or register as an operator to list your venue.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!isLoggedIn ? (
                <>
                  <Link to="/register">
                    <Button size="lg">Sign up as player</Button>
                  </Link>
                  <Link to="/admin/register">
                    <Button
                      size="lg"
                      className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                    >
                      List your field
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                    <Button size="lg">Open dashboard</Button>
                  </Link>
                  {userType === 'user' && (
                    <Link to="/turfs">
                      <Button
                        size="lg"
                        className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                      >
                        Book a field
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 type-body-sm sm:flex-row sm:items-center sm:px-6">
          <p>© {new Date().getFullYear()} Synthetic Field Solutions</p>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/turfs" className="transition-colors hover:text-foreground">
              Browse fields
            </Link>
            <Link to="/login" className="transition-colors hover:text-foreground">
              Player login
            </Link>
            <Link to="/admin/login" className="transition-colors hover:text-foreground">
              Operator login
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
