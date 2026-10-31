import { useEffect, useRef, useState } from "react";

type Props = { onReveal: () => Promise<{ code: string; multiplier: number } | null>; disabled?: boolean };

/** Cartão raspável em canvas. Ao raspar ~35% chama o sorteio. */
export function ScratchCard({ onReveal, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<{ code: string; multiplier: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const drawing = useRef(false);
  const fired = useRef(false);

  function paint() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2;
    c.height = r.height * 2;
    ctx.scale(2, 2);
    const css = getComputedStyle(document.documentElement);
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, css.getPropertyValue("--primary").trim() || "#8b5cf6");
    g.addColorStop(1, css.getPropertyValue("--primary-glow").trim() || "#a78bfa");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = css.getPropertyValue("--primary-foreground").trim() || "#fff";
    ctx.font = "600 16px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(disabled ? "Sem bilhetes disponíveis" : "Raspe aqui ✦", r.width / 2, r.height / 2 + 5);
    ctx.globalCompositeOperation = "destination-out";
  }

  useEffect(() => {
    paint();
    fired.current = false;
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  function scratch(e: React.PointerEvent) {
    if (!drawing.current || disabled || busy || result) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2);
    ctx.fill();
    if (fired.current) return;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
    if (clear / (data.length / 64) > 0.35) {
      fired.current = true;
      setBusy(true);
      onReveal().then((res) => {
        setBusy(false);
        if (res) {
          setResult(res);
          ctx.clearRect(0, 0, c.width, c.height);
        } else {
          ctx.globalCompositeOperation = "source-over";
          paint();
          fired.current = false;
        }
      });
    }
  }

  return (
    <div className="relative h-44 w-full select-none overflow-hidden rounded-2xl border border-primary/40 bg-card">
      <div className="absolute inset-0 grid place-items-center text-center">
        {result ? (
          <div className="animate-in zoom-in-50 duration-500">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Bilhete {result.code}</p>
            <p className="font-display text-5xl font-bold text-gradient">{Number(result.multiplier).toFixed(1)}x</p>
            <p className="mt-1 text-xs text-muted-foreground">Válido por 5 dias</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{busy ? "Sorteando..." : "?"}</p>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: disabled ? "not-allowed" : "grab", opacity: result ? 0 : 1, transition: "opacity .5s" }}
        onPointerDown={(e) => { drawing.current = true; scratch(e); }}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
        onPointerMove={scratch}
      />
    </div>
  );
}
