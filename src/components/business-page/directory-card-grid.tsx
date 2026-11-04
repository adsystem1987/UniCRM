"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { PublicDirectoryPageItem } from "@/components/business-page/public-directory-view";

interface DirectoryCardGridProps {
  items: PublicDirectoryPageItem[];
}

export function DirectoryCardGrid({ items }: DirectoryCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((biz, idx) => (
        <motion.div
          key={biz.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={`/p/${biz.slug}`}
            className="group p-4 rounded-xl border border-border bg-card hover:border-emerald-500/60 transition-colors flex flex-col justify-between h-full shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {biz.title}
                </h3>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {biz.tagline && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {biz.tagline}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="truncate max-w-[160px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                {biz.address ? biz.address.split(",")[0] : "Pan-India"}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {biz.items.length} {biz.items.length === 1 ? "Offering" : "Offerings"}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
