import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Code2,
  ShoppingBag,
  LayoutDashboard,
  Github,
  Linkedin,
  MessageCircle,
  Send,
  Menu,
  X,
  Lock,
  Trash2,
  Pencil,
  Plus,
  ExternalLink,
  LogOut,
  Sparkles,
  Eye,
  FolderKanban,
  Clock,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  Inbox,
  User as UserIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

// ---------- supabase project helpers ----------
type Project = {
  id: string;
  name: string;
  client: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  createdAt: string;
  thumbnail?: string;
};

async function loadProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    client: row.client as string,
    url: row.url as string,
    description: row.description as string,
    tags: (row.tags as string[]) || [],
    category: row.category as string,
    createdAt: row.created_at as string,
    thumbnail: (row.thumbnail as string) || undefined,
  }));
}

async function saveProject(
  form: Project,
  editingId: string | null,
  userId: string
): Promise<boolean> {
  const payload = {
    name: form.name,
    client: form.client,
    url: form.url,
    description: form.description,
    tags: form.tags,
    category: form.category,
    thumbnail: form.thumbnail || null,
    user_id: userId,
  };
  if (editingId) {
    const { error } = await supabase.from("projects").update(payload).eq("id", editingId);
    return !error;
  }
  const { error } = await supabase.from("projects").insert(payload);
  return !error;
}

async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return !error;
}

// ---------- supabase message helpers ----------
type Message = {
  id: string;
  name: string;
  email: string;
  website_description: string;
  message: string;
  created_at: string;
  read: boolean;
};

async function loadMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Message[];
}

async function sendMessage(name: string, email: string, websiteDescription: string, message: string): Promise<boolean> {
  const { error } = await supabase.from("messages").insert({
    name,
    email,
    website_description: websiteDescription,
    message,
  });
  return !error;
}

async function markMessageRead(id: string): Promise<void> {
  await supabase.from("messages").update({ read: true }).eq("id", id);
}

async function deleteMessage(id: string): Promise<boolean> {
  const { error } = await supabase.from("messages").delete().eq("id", id);
  return !error;
}

// ---------- particles ----------
function Particles() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const dots = useMemo(
    () =>
      Array.from({ length: isMobile ? 12 : 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        dur: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        hue: Math.random() > 0.5 ? "#3b82f6" : "#8b5cf6",
      })),
    [isMobile]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.hue,
            boxShadow: `0 0 ${d.size * 6}px ${d.hue}`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.12),_transparent_50%)]" />
    </div>
  );
}

// ---------- interactive cursor ----------
function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 120, damping: 18, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 120, damping: 18, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest("a,button,[data-cursor='hover']"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return (
    <>
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden -translate-x-1/2 -translate-y-1/2 md:block"
      >
        <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
      </motion.div>
      <motion.div
        style={{ x: rx, y: ry }}
        animate={{ scale: hovering ? 1.8 : 1, opacity: hovering ? 0.9 : 0.5 }}
        className="pointer-events-none fixed left-0 top-0 z-[99] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/60 backdrop-blur-sm md:block"
      />
    </>
  );
}

// ---------- floating tech icons ----------
function FloatingTech() {
  const techs = useMemo(
    () => [
      { label: "React", color: "#61DAFB", x: 8, y: 20 },
      { label: "TS", color: "#3178C6", x: 88, y: 18 },
      { label: "JS", color: "#F7DF1E", x: 14, y: 70 },
      { label: "Node", color: "#8CC84B", x: 84, y: 72 },
      { label: "Next", color: "#ffffff", x: 20, y: 42 },
      { label: "Tailwind", color: "#38BDF8", x: 78, y: 44 },
      { label: "Py", color: "#FFD43B", x: 6, y: 50 },
      { label: "SQL", color: "#F29111", x: 92, y: 58 },
      { label: "GraphQL", color: "#E535AB", x: 26, y: 82 },
      { label: "Docker", color: "#2496ED", x: 72, y: 84 },
    ],
    []
  );
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", on);
    return () => window.removeEventListener("mousemove", on);
  }, [mx, my]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
      {techs.map((t, i) => (
        <ParallaxChip key={t.label} tech={t} mx={mx} my={my} i={i} />
      ))}
    </div>
  );
}

function ParallaxChip({
  tech,
  mx,
  my,
  i,
}: {
  tech: { label: string; color: string; x: number; y: number };
  mx: ReturnType<typeof useMotionValue<number>>;
  my: ReturnType<typeof useMotionValue<number>>;
  i: number;
}) {
  const depth = 20 + (i % 4) * 10;
  const tx = useSpring(useMotionValue(0), { stiffness: 40, damping: 15 });
  const ty = useSpring(useMotionValue(0), { stiffness: 40, damping: 15 });
  useEffect(() => {
    const unsubX = mx.on("change", (v) => tx.set((v - 0.5) * depth));
    const unsubY = my.on("change", (v) => ty.set((v - 0.5) * depth));
    return () => {
      unsubX();
      unsubY();
    };
  }, [mx, my, tx, ty, depth]);
  return (
    <motion.div
      className="absolute"
      style={{ left: `${tech.x}%`, top: `${tech.y}%`, x: tx, y: ty }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -14, 0],
      }}
      transition={{
        opacity: { delay: 0.5 + i * 0.08, duration: 0.6 },
        scale: { delay: 0.5 + i * 0.08, duration: 0.6 },
        y: { duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
      }}
    >
      <div
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 shadow-2xl backdrop-blur-md"
        style={{ boxShadow: `0 8px 30px -8px ${tech.color}66` }}
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold"
          style={{ background: `${tech.color}22`, color: tech.color, border: `1px solid ${tech.color}55` }}
        >
          {tech.label.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{tech.label}</span>
      </div>
    </motion.div>
  );
}

// ---------- typewriter ----------
function Typewriter({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const current = words[i % words.length];
    const speed = del ? 40 : 90;
    const t = setTimeout(() => {
      if (!del && txt === current) {
        setTimeout(() => setDel(true), 1400);
        return;
      }
      if (del && txt === "") {
        setDel(false);
        setI((n) => n + 1);
        return;
      }
      setTxt(del ? current.slice(0, txt.length - 1) : current.slice(0, txt.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [txt, del, i, words]);
  return (
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {txt}
      </span>
      <span className="ml-1 h-6 w-[2px] animate-pulse bg-blue-400 md:h-8" />
    </span>
  );
}

// ---------- nav ----------
function Nav({ onAdmin }: { onAdmin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-[#0a0a0f]/70 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="group flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-lg shadow-blue-500/30">
              SM
            </div>
            <span className="hidden text-sm font-medium tracking-widest text-white/70 md:inline">
              SEBIHI.DEV
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={onAdmin}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-white/80 transition-all hover:border-blue-500/50 hover:text-white"
            >
              Admin
            </button>
          </nav>
          <button
            className="text-white md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 right-0 z-[60] w-72 border-l border-white/10 bg-[#0a0a0f]/95 p-6 backdrop-blur-xl md:hidden"
            >
              <div className="mb-8 flex justify-end">
                <button onClick={() => setOpen(false)} className="text-white p-2 -mr-2">
                  <X />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg text-white/80 hover:bg-white/5 hover:text-white active:bg-white/10 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setOpen(false);
                    onAdmin();
                  }}
                  className="mt-4 rounded-lg border border-white/10 px-4 py-3 text-left text-white/80 hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  Admin
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- hero ----------
function Hero() {
  const name = "Sebihi Mohamed";
  return (
    <section id="top" className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <Particles />
      <FloatingTech />
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur-md"
        >
          <Sparkles className="h-3 w-3 text-blue-400" />
          Available for freelance projects
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-8xl">
          {name.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.04, ease: "easeOut" }}
              className="inline-block"
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-6 text-lg font-light text-white/70 sm:text-xl md:text-3xl"
        >
          I'm a{" "}
          <Typewriter
            words={["Full Stack Developer", "React Expert", "Node.js Engineer", "UI/UX Craftsman"]}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mx-auto mt-6 max-w-xl text-base text-white/50"
        >
          Crafting premium digital experiences with modern web technologies. From concept to
          deployment.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#work"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 sm:px-8 sm:py-3.5 active:scale-95"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10 active:scale-95 sm:px-8 sm:py-3.5"
          >
            Hire Me
          </a>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-white/40 hidden sm:block"
      >
        Scroll to explore
      </motion.div>
    </section>
  );
}

// ---------- section wrapper ----------
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative border-t border-white/5 py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-blue-400">{eyebrow}</p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

// ---------- about ----------
const SKILLS = [
  { name: "React", level: 95 },
  { name: "Next.js", level: 92 },
  { name: "Node.js", level: 90 },
  { name: "MongoDB", level: 85 },
  { name: "PostgreSQL", level: 82 },
  { name: "Tailwind", level: 96 },
  { name: "TypeScript", level: 88 },
  { name: "REST APIs", level: 93 },
];

function SkillBar({ name, level }: { name: string; level: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <div ref={ref}>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/80">{name}</span>
        <span className="text-white/50">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
        />
      </div>
    </div>
  );
}

function About() {
  return (
    <Section id="about" eyebrow="About" title="Building the web, one pixel at a time.">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl" />
            <div className="relative grid h-48 w-48 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-[#111827] to-[#0a0a0f] shadow-2xl sm:h-64 sm:w-64">
              <div className="grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md sm:h-56 sm:w-56">
                <span className="bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
                  SM
                </span>
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-blue-500/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3, delay: i * 1, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg leading-relaxed text-white/70"
          >
            I'm a full stack developer obsessed with clean code and thoughtful design. For the past
            few years I've partnered with startups and agencies to ship products that feel as good
            as they look — fast, accessible, and built to scale.
          </motion.p>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {SKILLS.map((s) => (
              <SkillBar key={s.name} {...s} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ---------- services ----------
const SERVICES = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Fast, responsive marketing sites and web apps built with modern stacks.",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Solutions",
    desc: "Conversion-focused stores with seamless checkout and inventory tools.",
  },
  {
    icon: LayoutDashboard,
    title: "Custom Admin Dashboards",
    desc: "Bespoke internal tools with analytics, roles, and real-time data.",
  },
];

function Services() {
  return (
    <Section id="services" eyebrow="Services" title="What I do best.">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-blue-500/20 sm:p-8"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-6 inline-flex rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-3 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                <s.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ---------- work ----------
function Work({ projects }: { projects: Project[] }) {
  return (
    <Section id="work" eyebrow="Portfolio" title="Selected client projects.">
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
          <FolderKanban className="mx-auto mb-4 h-10 w-10 text-white/30" />
          <p className="text-white/50">No client projects yet — add from Admin Panel</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition-all hover:border-blue-500/40 active:scale-[0.98]"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-transparent">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)]" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="text-4xl font-bold text-white/20">{p.name.charAt(0)}</span>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
                    Visit Site <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  <span className="text-xs text-white/40">{p.category}</span>
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-white/60">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </Section>
  );
}

// ---------- contact ----------
function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [websiteDesc, setWebsiteDesc] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const ok = await sendMessage(name, email, websiteDesc, message);
    setSending(false);
    if (ok) {
      setSent(true);
      setName("");
      setEmail("");
      setWebsiteDesc("");
      setMessage("");
      setTimeout(() => setSent(false), 2500);
    }
  }

  return (
    <Section id="contact" eyebrow="Contact" title="Let's build something great.">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-lg text-white/70">
            Have a project in mind? Drop a message and I'll get back within 24 hours.
          </p>
          <div className="mt-8 flex gap-3">
            {[
              { icon: Github, href: "https://github.com" },
              { icon: Linkedin, href: "https://linkedin.com" },
              { icon: MessageCircle, href: "https://wa.me/" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:text-white"
              >
                <s.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md sm:p-6"
        >
          <input
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/60"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/60"
          />
          <textarea
            required
            rows={3}
            placeholder="Describe your website idea (what it should do, features, style...)"
            value={websiteDesc}
            onChange={(e) => setWebsiteDesc(e.target.value)}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/60"
          />
          <textarea
            rows={3}
            placeholder="Any additional notes... (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/60"
          />
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sent ? (
              <>
                <Check className="h-4 w-4" /> Sent!
              </>
            ) : (
              <>
                Send Message <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </Section>
  );
}

// ---------- admin ----------
function AdminGate({ onOk, onClose }: { onOk: () => void; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      onOk();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-lg"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl"
      >
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Admin Access</h2>
        <p className="mb-6 text-sm text-white/50">Sign in with your admin credentials.</p>
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/60"
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            required
            className={`w-full rounded-lg border bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none ${
              shake ? "border-red-500" : "border-white/10 focus:border-blue-500/60"
            }`}
          />
        </motion.div>
        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign In
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function AdminPanel({
  projects,
  messages,
  refresh,
  refreshMessages,
  onLogout,
  user,
}: {
  projects: Project[];
  messages: Message[];
  refresh: () => void;
  refreshMessages: () => void;
  onLogout: () => void;
  user: User;
}) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "messages">("dashboard");
  const [confirmDelMsg, setConfirmDelMsg] = useState<Message | null>(null);
  const empty: Project = {
    id: "",
    name: "",
    client: "",
    url: "",
    description: "",
    tags: [],
    category: "Web",
    createdAt: "",
  };
  const [form, setForm] = useState<Project>(empty);
  const [tagInput, setTagInput] = useState("");

  const stats = useMemo(
    () => ({
      total: projects.length,
      last: projects[0]?.name || "—",
      views: projects.length * 128 + 342,
    }),
    [projects]
  );

  async function save() {
    if (!form.name || !form.url) return;
    setSaving(true);
    const ok = await saveProject(form, editing?.id || null, user.id);
    setSaving(false);
    if (ok) {
      setForm(empty);
      setEditing(null);
      setTagInput("");
      refresh();
    }
  }

  async function del(id: string) {
    await deleteProject(id);
    setConfirmDel(null);
    refresh();
  }

  async function delMessage(id: string) {
    await deleteMessage(id);
    setConfirmDelMsg(null);
    refreshMessages();
  }

  async function openMessage(msg: Message) {
    if (!msg.read) {
      await markMessageRead(msg.id);
      refreshMessages();
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex bg-[#0a0a0f]">
      {/* mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[91] bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[92] flex w-64 flex-col border-r border-white/10 bg-[#0d0d14] p-6 transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
              SM
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Admin</div>
              <div className="text-xs text-white/40">Control Panel</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 text-sm">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-500/10 text-blue-400"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
            onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              activeTab === "messages"
                ? "bg-blue-500/10 text-blue-400"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
            onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }}
          >
            <Inbox className="h-4 w-4" /> Messages
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </div>
        </nav>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" /> Exit
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === "dashboard" ? "Dashboard" : "Messages"}
                </h1>
                <p className="text-sm text-white/50">
                  {activeTab === "dashboard" ? "Manage client projects" : `${messages.length} total, ${messages.filter((m) => !m.read).length} unread`}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 md:hidden"
            >
              Exit
            </button>
          </div>
        </div>

        {/* ===== DASHBOARD TAB ===== */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-3">
              {[
                { label: "Total Projects", value: stats.total, icon: FolderKanban },
                { label: "Last Added", value: stats.last, icon: Clock },
                { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-[#111827] p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/40">{s.label}</div>
                      <div className="mt-2 truncate text-2xl font-bold text-white">{s.value}</div>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* form */}
            <div className="p-4 sm:p-6">
              <div className="rounded-xl border border-white/10 bg-[#111827] p-4 shadow-lg sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <Plus className="h-4 w-4 text-blue-400" />
                  {editing ? "Edit Project" : "Add New Client Site"}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Site Name"
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                  />
                  <input
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    placeholder="Client Name"
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                  />
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="URL (https://...)"
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 sm:col-span-2"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                  >
                    {["Web", "E-commerce", "Dashboard", "Mobile", "Other"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          e.preventDefault();
                          setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                          setTagInput("");
                        }
                      }}
                      placeholder="Add tag + Enter"
                      className="flex-1 bg-transparent py-1 text-sm text-white outline-none"
                    />
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 sm:col-span-2"
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">
                      Project Thumbnail
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-blue-500/50 hover:text-white">
                        <ImagePlus className="h-4 w-4 text-blue-400" />
                        {form.thumbnail ? "Change image" : "Upload image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Image must be under 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () =>
                              setForm((f) => ({ ...f, thumbnail: reader.result as string }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {form.thumbnail && (
                        <div className="relative">
                          <img
                            src={form.thumbnail}
                            alt="preview"
                            className="h-20 w-32 rounded-md border border-white/10 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, thumbnail: undefined })}
                            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {form.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70"
                      >
                        {t}
                        <button
                          onClick={() =>
                            setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editing ? "Update" : "Save Project"}
                  </button>
                  {editing && (
                    <button
                      onClick={() => {
                        setEditing(null);
                        setForm(empty);
                      }}
                      className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* table - card view on mobile, table on md+ */}
            <div className="p-4 sm:p-6">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-lg">
                <div className="border-b border-white/10 p-4">
                  <h3 className="font-semibold text-white">Projects</h3>
                </div>

                {/* mobile card view */}
                <div className="divide-y divide-white/5 md:hidden">
                  {projects.length === 0 && (
                    <div className="p-8 text-center text-white/40">No projects yet</div>
                  )}
                  {projects.map((p) => (
                    <div key={p.id} className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium text-white">{p.name}</h4>
                          <p className="text-xs text-white/50">{p.client}</p>
                        </div>
                        <span className="ml-2 shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/50">
                          {p.category}
                        </span>
                      </div>
                      <p className="mb-3 line-clamp-2 text-xs text-white/40">{p.description}</p>
                      <div className="flex items-center justify-between">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditing(p);
                              setForm(p);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDel(p)}
                            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* desktop table view */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-black/20 text-left text-xs uppercase tracking-wider text-white/40">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">URL</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/40">
                            No projects yet
                          </td>
                        </tr>
                      )}
                      {projects.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 text-white/80 hover:bg-white/[0.02]">
                          <td className="p-3 font-medium text-white">{p.name}</td>
                          <td className="p-3">{p.client}</td>
                          <td className="p-3">
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                            >
                              Visit <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3 text-white/50">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditing(p);
                                  setForm(p);
                                }}
                                className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDel(p)}
                                className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== MESSAGES TAB ===== */}
        {activeTab === "messages" && (
          <div className="p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
                <Inbox className="mx-auto mb-4 h-10 w-10 text-white/30" />
                <p className="text-white/50">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border bg-[#111827] p-4 shadow-lg transition-colors ${
                      msg.read
                        ? "border-white/10"
                        : "border-blue-500/30 bg-blue-500/[0.03]"
                    }`}
                    onClick={() => openMessage(msg)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-sm font-bold text-blue-400">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{msg.name}</span>
                            {!msg.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                            )}
                          </div>
                          <span className="text-xs text-white/40">{msg.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-white/30">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelMsg(msg);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-white/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2 rounded-lg border border-white/5 bg-black/20 p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wider text-blue-400/70">Website Description</div>
                      <p className="text-sm leading-relaxed text-white/80">{msg.website_description}</p>
                    </div>
                    {msg.message && (
                      <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                        <div className="mb-1 text-[10px] uppercase tracking-wider text-white/30">Additional Notes</div>
                        <p className="text-sm text-white/60">{msg.message}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {confirmDel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6"
            >
              <h3 className="mb-2 font-semibold text-white">Delete project?</h3>
              <p className="mb-6 text-sm text-white/60">
                "{confirmDel.name}" will be permanently removed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => del(confirmDel.id)}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {confirmDelMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6"
            >
              <h3 className="mb-2 font-semibold text-white">Delete message?</h3>
              <p className="mb-6 text-sm text-white/60">
                Message from "{confirmDelMsg.name}" will be permanently removed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelMsg(null)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => delMessage(confirmDelMsg.id)}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- footer ----------
function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
      Sebihi Mohamed © 2025
    </footer>
  );
}

// ---------- main ----------
export default function Portfolio({ openAdmin = false }: { openAdmin?: boolean } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gate, setGate] = useState(openAdmin);
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setAdmin(true);
        setGate(false);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const items = await loadProjects();
    setProjects(items);
  };

  const refreshMessages = async () => {
    const items = await loadMessages();
    setMessages(items);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (admin) {
      refreshMessages();
    }
  }, [admin]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setAdmin(false);
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased [scrollbar-color:#3b82f6_#0a0a0f] [scrollbar-width:thin]">
      <CursorFollower />
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#3b82f6,#8b5cf6); border-radius: 10px; }
      `}</style>
      <Nav onAdmin={() => setGate(true)} />
      <main>
        <Hero />
        <About />
        <Services />
        <Work projects={projects} />
        <Contact />
      </main>
      <Footer />

      <button
        onClick={() => setGate(true)}
        aria-label="Admin access"
        className="fixed bottom-4 right-4 z-40 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/40 backdrop-blur-md transition-all hover:scale-110 hover:text-blue-400"
      >
        <Lock className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {gate && !admin && (
          <AdminGate
            onOk={() => {
              setGate(false);
              setAdmin(true);
            }}
            onClose={() => setGate(false)}
          />
        )}
        {admin && user && (
          <AdminPanel projects={projects} messages={messages} refresh={refresh} refreshMessages={refreshMessages} onLogout={handleLogout} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}