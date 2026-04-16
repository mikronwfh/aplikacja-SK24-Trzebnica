import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/skauci-logo.png";

const Login = () => {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    nav("/", { replace: true });
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error("Nie udało się zalogować", { description: error });
    else {
      toast.success("Zalogowano");
      nav("/", { replace: true });
    }
  };

  return (
    <div className="container max-w-md py-10">
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="Logo Skautów Króla" className="h-16 w-16 mb-2" />
        <h1 className="text-2xl font-bold">Logowanie</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Konta przyznaje administrator. Brak publicznej rejestracji.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Logowanie…" : "Zaloguj"}</Button>
      </form>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Wróć do <Link className="underline" to="/">strony głównej</Link>.
      </p>
    </div>
  );
};

export default Login;
