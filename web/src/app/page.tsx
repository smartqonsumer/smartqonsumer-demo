import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HeroStepsStrip } from '@/components/HeroStepsStrip';
import { HowItWorks } from '@/components/HowItWorks';
import { ClubScan } from '@/components/ClubScan';
import { StoryTelling } from '@/components/StoryTelling';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { EmailAutomation } from '@/components/EmailAutomation';
import { PilotageDashboard } from '@/components/PilotageDashboard';
import { SecurityTrust } from '@/components/SecurityTrust';
import { Faq } from '@/components/Faq';
import { FinalCta } from '@/components/FinalCta';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <HeroStepsStrip />
        <HowItWorks />
        <ClubScan />
        <StoryTelling />
        <FeaturesGrid />
        <EmailAutomation />
        <PilotageDashboard />
        <SecurityTrust />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
