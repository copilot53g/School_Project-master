import React, { useState, createContext, useContext } from "react";

// lightweight local UI primitives to avoid missing imports in this repo
const Card = ({ children, className = "" }) => (
  <div className={`shadow-sm rounded-lg overflow-hidden ${className}`.trim()}>
    {children}
  </div>
);

const Button = ({ children, className = "", variant, ...props }) => {
  const base = "px-4 py-2 rounded-md text-sm font-medium";
  const style =
    variant === "outline"
      ? "border border-current bg-transparent"
      : variant === "ghost"
      ? "bg-transparent"
      : variant === "secondary"
      ? "bg-gray-100"
      : "";
  return (
    <button className={`${base} ${style} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

const Input = (props) => (
  <input className="px-3 py-2 rounded-md border border-border w-full" {...props} />
);

const Badge = ({ children, className = "", variant }) => {
  const style =
    variant === "secondary" ? "bg-gray-100 text-sm px-2 py-1 rounded-full" : "bg-gray-200 px-2 py-1 rounded-full";
  return <span className={`${style} ${className}`.trim()}>{children}</span>;
};

// Simple Tabs implementation
const TabsContext = createContext({});
const Tabs = ({ defaultValue, children, className = "" }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};
const TabsList = ({ children, className = "" }) => <div className={`flex gap-2 p-2 ${className}`.trim()}>{children}</div>;
const TabsTrigger = ({ value, children }) => {
  const { value: current, setValue } = useContext(TabsContext);
  const active = current === value;
  return (
    <button
      onClick={() => setValue(value)}
      className={`px-3 py-2 rounded-md ${active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"} `}
      type="button"
    >
      {children}
    </button>
  );
};
const TabsContent = ({ value, children, className = "" }) => {
  const { value: current } = useContext(TabsContext);
  if (current !== value) return null;
  return <div className={className}>{children}</div>;
};

// Inline Logo / LogoIcon (simple SVG placeholders)
const Logo = ({ className = "", variant }) => (
  <svg
    className={className}
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="64" height="64" rx="12" fill={variant === "white" ? "#fff" : "#0f4c81"} />
    <text x="50%" y="54%" textAnchor="middle" fill={variant === "white" ? "#0f4c81" : "#fff"} fontSize="28" fontFamily="sans-serif" fontWeight="700">
      7V
    </text>
  </svg>
);

const LogoIcon = ({ className = "", variant }) => (
  <svg
    className={className}
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="48" height="48" rx="10" fill={variant === "white" ? "#fff" : "#ff6b35"} />
    <text x="50%" y="58%" textAnchor="middle" fill={variant === "white" ? "#ff6b35" : "#fff"} fontSize="20" fontFamily="sans-serif" fontWeight="700">
      7V
    </text>
  </svg>
);

// Main BrandGuide component (adapted original markup but uses local primitives)
export default function BrandGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-secondary/30 p-6">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <LogoIcon className="h-16 w-16" />
            <div>
              <h1 className="text-foreground text-4xl">7Veda Management</h1>
              <p className="text-muted-foreground text-xl">Complete Brand & Product Design System</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="logos" className="space-y-8">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-border rounded-md">
            <TabsTrigger value="logos">Logos & Icons</TabsTrigger>
            <TabsTrigger value="colors">Color System</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {/* Logos Tab */}
          <TabsContent value="logos" className="space-y-8">
            {/* Logo Variations */}
            <section className="space-y-6">
              <div>
                <h2 className="text-foreground text-2xl mb-2">Logo Variations</h2>
                <p className="text-muted-foreground">Official brand logos for different backgrounds</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-8 space-y-4 bg-white/80 backdrop-blur-sm border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Primary Logo</p>
                    <Badge variant="secondary">Light BG</Badge>
                  </div>
                  <div className="flex items-center justify-center h-32 bg-gray-50 rounded-xl border-2 border-dashed border-border">
                    <Logo className="h-16 w-auto" />
                  </div>
                </Card>

                <Card className="p-8 space-y-4 bg-gradient-to-br from-primary to-[#1a5a94] border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white">Primary Logo</p>
                    <Badge className="bg-white/20 text-white border-0">Dark BG</Badge>
                  </div>
                  <div className="flex items-center justify-center h-32 bg-white/10 rounded-xl border-2 border-dashed border-white/30">
                    <Logo className="h-16 w-auto" variant="white" />
                  </div>
                </Card>
              </div>
            </section>

            {/* App Icons */}
            <section className="space-y-6">
              <div>
                <h2 className="text-foreground text-2xl mb-2">App Icons</h2>
                <p className="text-muted-foreground">Application icons for different platforms</p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 space-y-4 bg-white/80 backdrop-blur-sm border-border">
                  <p className="text-muted-foreground text-sm">Default</p>
                  <div className="flex items-center justify-center">
                    <LogoIcon className="h-24 w-24 drop-shadow-lg" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">512x512px</p>
                </Card>

                <Card className="p-6 space-y-4 bg-gradient-to-br from-primary to-[#1a5a94] border-0">
                  <p className="text-white text-sm">White Variant</p>
                  <div className="flex items-center justify-center">
                    <LogoIcon className="h-24 w-24 drop-shadow-lg" variant="white" />
                  </div>
                  <p className="text-xs text-center text-white/80">512x512px</p>
                </Card>

                <Card className="p-6 space-y-4 bg-gradient-to-br from-accent to-accent/80 border-0">
                  <p className="text-white text-sm">Accent BG</p>
                  <div className="flex items-center justify-center">
                    <LogoIcon className="h-24 w-24 drop-shadow-lg" variant="white" />
                  </div>
                  <p className="text-xs text-center text-white/80">512x512px</p>
                </Card>

                <Card className="p-6 space-y-4 bg-white/80 backdrop-blur-sm border-2 border-primary">
                  <p className="text-muted-foreground text-sm">Bordered</p>
                  <div className="flex items-center justify-center">
                    <LogoIcon className="h-24 w-24" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">512x512px</p>
                </Card>
              </div>
            </section>

            {/* Usage Guidelines */}
            <section className="space-y-6">
              <h2 className="text-foreground text-2xl">Logo Usage Guidelines</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4 bg-green-50 border-green-200">
                  <h3 className="text-green-800 flex items-center gap-2">
                    <span className="text-xl">✓</span> Do's
                  </h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• Maintain minimum clear space around logo</li>
                    <li>• Use approved color variations only</li>
                    <li>• Keep aspect ratio locked when resizing</li>
                    <li>• Ensure sufficient contrast with background</li>
                    <li>• Use vector formats for scalability</li>
                  </ul>
                </Card>

                <Card className="p-6 space-y-4 bg-red-50 border-red-200">
                  <h3 className="text-red-800 flex items-center gap-2">
                    <span className="text-xl">✗</span> Don'ts
                  </h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• Don't distort, stretch, or skew the logo</li>
                    <li>• Don't alter colors or add gradients</li>
                    <li>• Don't add drop shadows or effects</li>
                    <li>• Don't rotate or flip the logo</li>
                    <li>• Don't place on busy backgrounds</li>
                  </ul>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* Colors Tab (condensed) */}
          <TabsContent value="colors" className="space-y-8">
            <section className="space-y-6">
              <div>
                <h2 className="text-foreground text-2xl mb-2">Primary Colors</h2>
                <p className="text-muted-foreground">Core brand colors used throughout the product</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-3 bg-white/80 backdrop-blur-sm border-border">
                  <div className="h-32 rounded-xl bg-primary shadow-lg" />
                  <div>
                    <p className="font-medium text-foreground">Primary Blue</p>
                    <p className="text-muted-foreground text-sm">#0F4C81</p>
                    <p className="text-muted-foreground text-xs">Main brand color</p>
                  </div>
                </Card>

                <Card className="p-6 space-y-3 bg-white/80 backdrop-blur-sm border-border">
                  <div className="h-32 rounded-xl bg-accent shadow-lg" />
                  <div>
                    <p className="font-medium text-foreground">Accent Orange</p>
                    <p className="text-muted-foreground text-sm">#FF6B35</p>
                    <p className="text-muted-foreground text-xs">CTAs & highlights</p>
                  </div>
                </Card>

                <Card className="p-6 space-y-3 bg-white/80 backdrop-blur-sm border-border">
                  <div className="h-32 rounded-xl bg-[#1a5a94] shadow-lg" />
                  <div>
                    <p className="font-medium text-foreground">Dark Blue</p>
                    <p className="text-muted-foreground text-sm">#1A5A94</p>
                    <p className="text-muted-foreground text-xs">Gradients & depth</p>
                  </div>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* Components Tab (condensed) */}
          <TabsContent value="components" className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-foreground text-2xl mb-2">Button Styles</h2>
              <p className="text-muted-foreground">Standard button variations</p>

              <Card className="p-8 bg-white/80 backdrop-blur-sm border-border">
                <div className="flex flex-wrap items-center gap-4">
                  <Button className="bg-primary text-white">Primary Button</Button>
                  <Button className="bg-accent text-white">Accent Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
              </Card>
            </section>
          </TabsContent>

          {/* Patterns Tab (condensed) */}
          <TabsContent value="patterns" className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-foreground text-2xl mb-2">Background Patterns</h2>
              <p className="text-muted-foreground">Decorative backgrounds for different sections</p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-8 border-0 bg-gradient-to-br from-muted via-background to-secondary/30 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
                  <div className="relative">
                    <h3 className="text-foreground mb-2">Light Pattern</h3>
                    <p className="text-muted-foreground text-sm">Subtle grid with gradient</p>
                  </div>
                </Card>

                <Card className="p-8 border-0 bg-gradient-to-br from-primary via-primary to-[#1a5a94] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="relative text-white">
                    <h3 className="mb-2">Dark Pattern</h3>
                    <p className="text-white/80 text-sm">Gradient with glowing orbs</p>
                  </div>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <footer className="pt-12 pb-6 text-center space-y-2">
          <p className="text-muted-foreground">© 2025 7Veda Management. All rights reserved.</p>
          <p className="text-muted-foreground text-sm">
            For brand usage questions, contact: <span className="text-primary">brand@7veda.com</span>
          </p>
        </footer>
      </div>
    </div>
  );
}