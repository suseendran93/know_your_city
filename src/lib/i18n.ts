import messages from "@/locales/en.json";

export type Messages = typeof messages;

export function getMessages() {
  return messages;
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}
