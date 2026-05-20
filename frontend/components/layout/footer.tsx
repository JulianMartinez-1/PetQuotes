"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";
import { DURATIONS } from "@/constants/animations";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "/clinics" as const, label: "Find Clinics" },
        { href: "/" as const, label: "Features" },
        { href: "/" as const, label: "Pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/" as const, label: "About" },
        { href: "/" as const, label: "Blog" },
        { href: "/" as const, label: "Press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/" as const, label: "Privacy" },
        { href: "/" as const, label: "Terms" },
        { href: "/" as const, label: "Contact" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-primary" },
    { icon: Github, href: "#", label: "GitHub", color: "hover:text-mint" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-secondary" },
    { icon: Mail, href: "mailto:contact@petquotes.com", label: "Email", color: "hover:text-accent" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
        transition: { duration: DURATIONS.base / 1000 },
    },
  };

  return (
    <footer className={cn(
      "relative bg-foreground border-t border-border/20",
      "overflow-hidden"
    )}>
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        "bg-gradient-to-t from-primary/20 via-transparent to-transparent"
      )} />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Link href="/">
              <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br",
                  "from-primary to-secondary flex items-center justify-center",
                  "text-white font-bold text-lg",
                  "shadow-lg shadow-primary/30 group-hover:shadow-primary/50",
                  "transition-all duration-300"
                )}>
                  PQ
                </div>
                <span className={cn(
                  "font-black text-2xl text-white"
                )}>
                  PetQuotes
                </span>
              </div>
            </Link>
            <p className="text-white font-medium text-base leading-relaxed mb-6">
              Making veterinary appointments seamless and effortless for pet owners everywhere.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg bg-surface border border-border/30",
                    "transition-all duration-300",
                    social.color,
                    "hover:bg-surface-light hover:border-secondary/50"
                  )}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="md:col-span-1"
            >
              <h3 className={cn(
                "font-black text-white mb-4",
                "text-base uppercase tracking-wider"
              )}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className={cn(
                        "text-white font-medium text-base",
                        "hover:text-primary transition-colors duration-300",
                        "relative group inline-block"
                      )}>
                        {link.label}
                        <span className={cn(
                          "absolute bottom-0 left-0 w-0 h-0.5 bg-primary",
                          "group-hover:w-full transition-all duration-300"
                        )} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-transparent via-secondary/30 to-transparent my-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />

        {/* Bottom Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <motion.p
            variants={itemVariants}
            className="text-white font-medium text-base text-center md:text-left flex items-center gap-2"
          >
            Made with <Heart size={16} className="text-accent animate-pulse" /> by Julian Martinez © {currentYear}
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-white font-medium text-base"
          >
            PetQuotes • Veterinary Appointments Made Simple
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}

