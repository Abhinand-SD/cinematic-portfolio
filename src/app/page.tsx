import VideoIntro from "@/components/VideoIntro/VideoIntro";
import ServicesSection from "@/components/portfolio/ServicesSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import AboutSection from "@/components/portfolio/AboutSection";
import ContactSection from "@/components/portfolio/ContactSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <VideoIntro nextSectionId="about" />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
