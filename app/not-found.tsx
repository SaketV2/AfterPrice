import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export const metadata = {
  title: "Page not found",
  description: "The AfterPrice page you were looking for does not exist.",
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f6f6f3] px-5 py-8 text-[#0c0f14] sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] flex-col">
        <Logo />
        <div className="flex flex-1 items-center py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3258d4]">AfterPrice / 404</p>
            <h1 className="mt-5 font-editorial text-6xl leading-[0.95] tracking-[-0.04em] sm:text-8xl">Page not found</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#55616c]">That page is not part of the record. Return to AfterPrice or see the illustrative product demo.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#3258d4] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2448bd]">Back to AfterPrice <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="/demo" className="inline-flex min-h-11 items-center rounded-xl border border-[#cfd5dd] bg-white px-5 py-3 text-sm font-semibold text-[#0c0f14] transition-colors hover:border-[#3258d4] hover:text-[#2448bd]">View product demo</Link>
            </div>
          </div>
        </div>
        <p className="border-t border-[#dce2e6] pt-5 text-sm text-[#77838d]">Baseline → change → evidence → action.</p>
      </div>
    </main>
  );
}
