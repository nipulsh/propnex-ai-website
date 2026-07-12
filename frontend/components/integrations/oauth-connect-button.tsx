"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type OAuthConnectButtonProps = {
  onConnect: () => void;
  isConnecting: boolean;
  label?: string;
  disabled?: boolean;
};

export function OAuthConnectButton({
  onConnect,
  isConnecting,
  label = "Connect with Google",
  disabled,
}: OAuthConnectButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onConnect}
      disabled={disabled || isConnecting}
      className="gap-2"
    >
      {isConnecting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Connecting...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
