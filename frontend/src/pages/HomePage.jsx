import { Link } from 'react-router-dom';
import { showcaseItems } from '../data/showcaseItems';

const steps = [
  {
    icon: 'text_snippet',
    title: '1. Paste text',
    description: 'Drop in your curriculum notes, a paragraph from a textbook, or a specific lesson objective.',
    iconClass: 'bg-primary-fixed text-on-primary-fixed',
    footer: (
      <div className="mt-8 pt-8 border-t border-outline-variant/30">
        <div className="bg-surface-container-high h-2 w-full rounded-full overflow-hidden">
          <div className="bg-primary h-full w-1/3 transition-all duration-1000" />
        </div>
      </div>
    ),
  },
  {
    icon: 'palette',
    title: '2. Pick style',
    description: 'Choose from diagrams, historical illustrations, or abstract models designed for student clarity.',
    iconClass: 'bg-secondary-container text-on-secondary-container',
    footer: (
      <div className="mt-8 pt-8 border-t border-outline-variant/30 flex gap-2">
        <div className="w-8 h-8 rounded bg-primary/20" />
        <div className="w-8 h-8 rounded bg-secondary/20" />
        <div className="w-8 h-8 rounded bg-tertiary/20" />
      </div>
    ),
  },
  {
    icon: 'magic_button',
    title: '3. Generate',
    description: 'Our AI analyzes your curriculum and outputs high-fidelity visuals ready for your next slide.',
    iconClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    footer: (
      <div className="mt-8 pt-8 border-t border-outline-variant/30">
        <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
          Ready to present <span className="material-symbols-outlined">check_circle</span>
        </div>
      </div>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-pattern -z-10" />
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface max-w-xl">
              Turn Curriculum Text into Classroom Visuals <span className="text-primary">Instantly</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Bridge the gap between complex lesson plans and student engagement. Nalarupa AI helps educators create
              high-quality, pedagogically sound visuals directly from their teaching materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/generator"
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 w-fit"
              >
                Go to Generator
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                to="/gallery"
                className="border border-primary text-primary px-8 py-4 rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all inline-flex items-center justify-center gap-2 w-fit"
              >
                View Showcase
              </Link>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk1AWoJwY5dpNsjd13dHIw0N_SAFX8Q7fK7rkq3rgalFWin7OuuXdWLvLTaYSvCIVvUd0oWeV3oKrdqZX0UrF261boPQFzQHBMp4VtMRCr-wMU0qr8U1FvrNtnFVHUg7wh1tlc4iT9eNnvrbtMGSiw85LA9LVLuFsF29PTyZUQ4DxgoSS_ewlLaCcopSYLx0krgCnfUBQx8swD9L0RjGYduv-oT1jeJtYrl8lMmpUpDuWhJuCMQw9BXxzKdeg6k5YnIAMOPMHNqGLk"
                    alt="Teacher portrait"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8qQwb7ARETezaNueyLxuCISNqLEZHsV3zA4pEa05_bUjcyPqGs3nt2MP_C8hK4spbjeT8abmBPzen0nIMZJAxaAvUltDlTmq5TqipRCsuSRWQWHBpxZd9TQRjZmazlo1OTpN4wDpozeWUooHhqzBv4vGWPQrSZZUyT7nkuaVKQtbtqcVfPZBAwUQUwLVKOhkGENwj5IFMqC4Q2SnGVVMf_VtAfZ8nw0RFHJ3mn69_WpweRX5mMGajto4isMchXF04o8DsvsuR646B"
                    alt="Teacher portrait"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4pBZzhWi4Y4HtCPzJpDUO2AqV0SFLlf5MuM3JHwJmM6iH4XOYedElkSOyX3WoE7gCbUVnCs1YqgTyqhIyt6J_tfKqLEGYmJB0riZ8b2c_3fD0e9wziZ5Gvj-mq-EwJu1pd67NuozM-Wpl_3JXycdW0LbB5w_HxVtGBlnec5Nq6miXkGstfp1aGKse3EmU_YApGKsmWzkJmxe-lODc8Wro-O1n7fjDAzN9ljp8At_Ja5T3wWBARKUpiGWQw77KMtYaWk_XwYoUx6h4"
                    alt="Teacher portrait"
                  />
                </div>
              </div>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Trusted by 2,000+ Educators worldwide</p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-sm rotate-1 relative z-10">
              <img
                className="w-full h-auto rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCshNXtXvMO6mbs40GKYBELVM89aLHYHTKibtyO719drjcM2VurmQa3wLomv3vAHbyVUwgY5slM6HryBjnPbLeEEOeAI0TtRtqMb6LxE_i0WKJee0jWeNCX-v5JeYxXntCDcuojixO15qzntel2fL-3VkQ1Gp0S8SvIiJA7a2cNW9iDOoxKq6RMjUQ5oTYrbFuoy9CETrr1ztiX8Sbb3LzU0ERhv7Tf0dOWU21Ah4frQAHVeBOdMEfPvgPb2NTWL4k_rR-4WY9Ifk8N"
                alt="Teacher using a tablet in the classroom"
              />
            </div>
            {/* <div className="absolute -top-6 -right-6 bg-secondary-container text-on-secondary-container p-4 rounded-lg shadow-md -rotate-3 z-20 hidden md:block">
              <p className="font-label-md text-label-md flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                Generated in 4.2s
              </p>
            </div> */}
            {/* <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" /> */}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Academic Workflows Made Simple</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Focus on teaching, let our AI handle the design. Three steps to transform your curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {steps.map((step) => (
              <div
                key={step.title}
                className="md:col-span-4 bg-surface border border-outline-variant rounded-xl p-8 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 ${step.iconClass} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{step.description}</p>
                {step.footer}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Built for Every Subject</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                See how teachers are using Nalarupa to enhance their lessons.
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors" aria-label="Previous showcase items">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button type="button" className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors" aria-label="Next showcase items">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {showcaseItems.map((item) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group bg-surface border border-outline-variant rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.image}
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <span className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm text-label-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download
                    </span>
                    <span className="bg-white text-on-surface px-4 py-2 rounded font-label-sm text-label-sm">Quick Assign</span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{item.title}</h4>
                  <div className="flex items-center gap-4 mt-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-full text-label-sm font-label-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-primary-container text-on-primary-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-8">
              <h2 className="font-display-lg text-headline-md md:text-display-lg max-w-3xl mx-auto">
                Ready to visualize your next lesson?
              </h2>
              <p className="font-body-lg text-body-lg text-primary-fixed max-w-xl mx-auto opacity-90">
                Join thousands of educators saving hours of design time while creating more impactful classroom
                experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  to="/generator"
                  className="bg-white text-primary px-10 py-5 rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-xl inline-flex items-center justify-center"
                >
                  Start Generating Now
                </Link>
              </div>
              <div className="text-label-sm font-label-sm pt-4 flex items-center justify-center gap-6 opacity-80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Academic Integrity
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  FERPA Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
