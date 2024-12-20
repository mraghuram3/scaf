"use client";

import {ArrowRightIcon} from "@radix-ui/react-icons";
import {motion, useInView} from "framer-motion";
import {useRef} from "react";
import {Cover} from "@/components/ui/cover";
import {BackgroundLines} from "@/components/ui/background-lines";
import {RainbowButton} from "@/components/ui/rainbow-button";
import Link from "next/link";
import {cn} from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1];

export default function HeroSection(
    {
        className,
    }: {
        className?: string;
    }
) {
    const ref = useRef(null);
    const inView = useInView(ref, {once: true, margin: "-100px"});
    return (
        <section
            id="hero"
            className={cn("relative mx-auto max-w-[80rem] px-6 text-center md:px-8", className)}
        >
            <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
                <motion.h1
                    className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
                    initial={{filter: "blur(10px)", opacity: 0, y: 50}}
                    animate={{filter: "blur(0px)", opacity: 1, y: 0}}
                    transition={{
                        duration: 1,
                        ease,
                        staggerChildren: 0.2,
                    }}
                >
                    {/*<h1 className="">*/}
                    Bootstrap your next project
                    <br className="hidden md:block"/> with <Cover>Scaf CLI</Cover>
                    {/*</h1>*/}
                </motion.h1>
                <motion.div
                    className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.8, duration: 0.8, ease}}
                >
                    <Link href="/templates" className="mt-8">
                        <RainbowButton>
                            <span>Get Started</span>
                            <ArrowRightIcon
                                className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"/>
                        </RainbowButton>
                    </Link>
                </motion.div>
            </BackgroundLines>
        </section>
    );
}
