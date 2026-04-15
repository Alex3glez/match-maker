"use client";

import { useEffect } from "react";

interface NotificationUpdaterProps {
  link: string;
}

export default function NotificationUpdater({ link }: NotificationUpdaterProps) {
  useEffect(() => {
    // Dispatch custom event to update navbar notifications locally
    window.dispatchEvent(new CustomEvent("mark-notifications-read", {
      detail: { link }
    }));
  }, [link]);

  return null; // This component doesn't render anything
}