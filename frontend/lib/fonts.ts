import localFont from "next/font/local";

export const roboto = localFont({
  src: [
    {
      path: "../public/assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../public/assets/fonts/Roboto/Roboto-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
});

export const robotoMono = localFont({
  src: [
    {
      path: "../public/assets/fonts/Roboto_Mono/RobotoMono-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../public/assets/fonts/Roboto_Mono/RobotoMono-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-roboto-mono",
  display: "swap",
});
