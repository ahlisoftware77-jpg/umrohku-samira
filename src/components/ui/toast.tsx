"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertCircle, Info, Sparkles, Bell } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px] gap-2.5",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-3.5 overflow-hidden rounded-2xl border p-4 pr-9 shadow-2xl backdrop-blur-xl transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=open]:zoom-in-95",
  {
    variants: {
      variant: {
        default:
          "border-amber-400/30 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-primary/95 text-white shadow-emerald-950/20 ring-1 ring-amber-400/20",
        success:
          "border-emerald-500/40 bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-slate-900/90 text-white shadow-emerald-950/30 ring-1 ring-emerald-400/30",
        destructive:
          "border-rose-500/40 bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-rose-900/90 text-white shadow-rose-950/30 ring-1 ring-rose-400/30",
        info:
          "border-sky-500/40 bg-gradient-to-r from-sky-950/90 via-slate-900/95 to-slate-900/90 text-white shadow-sky-950/30 ring-1 ring-sky-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Dynamic Glowing Icon Container */}
        <div className="mt-0.5 shrink-0 rounded-xl p-2 bg-white/10 border border-white/15 backdrop-blur-md shadow-inner">
          {variant === "destructive" && <AlertCircle className="h-4 w-4 text-rose-400 animate-pulse" />}
          {variant === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          {variant === "info" && <Info className="h-4 w-4 text-sky-400" />}
          {(variant === "default" || !variant) && <Sparkles className="h-4 w-4 text-amber-300" />}
        </div>
        <div className="flex-1 grid gap-0.5">{children}</div>
      </div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold ring-offset-background transition-all hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2.5 top-2.5 rounded-full p-1 text-white/60 opacity-80 transition-all hover:text-white hover:bg-white/15 hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-xs font-headline font-bold tracking-wide text-white flex items-center gap-1.5", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-[11px] leading-relaxed text-slate-300 font-medium", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
