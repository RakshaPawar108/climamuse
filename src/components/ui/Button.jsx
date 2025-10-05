export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-5 text-lg",
  };
  const variants = {
    primary: "bg-primary text-white hover:shadow-md focus:ring-primary",
    secondary:
      "bg-secondary text-[#0B1320] hover:shadow-md focus:ring-secondary",
    tertiary: "bg-transparent text-primary hover:bg-white/60",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}
