"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "./contact-dialog";
import { Mail, MessageCircle, Headphones } from "lucide-react";

interface ContactButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
  defaultTopic?: string;
  icon?: "mail" | "message" | "headphones";
}

export function ContactButton({
  variant = "outline",
  size = "default",
  className,
  children,
  defaultTopic = "General Inquiry",
  icon = "mail",
}: ContactButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {icon === "headphones" && <Headphones className="h-5 w-5 text-emerald-500 mr-2" />}
        {icon === "message" && <MessageCircle className="h-4 w-4 mr-2" />}
        {icon === "mail" && <Mail className="h-4 w-4 mr-2 text-emerald-500" />}
        {children || "Contact Support"}
      </Button>

      <ContactDialog
        open={open}
        onOpenChange={setOpen}
        defaultTopic={defaultTopic}
      />
    </>
  );
}
